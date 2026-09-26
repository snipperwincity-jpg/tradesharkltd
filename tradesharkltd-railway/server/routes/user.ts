import { Router } from 'express';
import multer from 'multer';
import { db, newId } from '../db';
import { requireUser } from '../auth';
import {
  userState, submitDeposit, submitWithdrawal, submitKyc, createMessage, markMessageRead,
  openPosition, closePosition, startCopy, stopCopy, HttpError, audit,
} from '../services';

export const userRouter = Router();
userRouter.use(requireUser);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^(image\/(png|jpe?g|webp|heic|heif)|application\/pdf)$/.test(file.mimetype);
    if (ok) cb(null, true); else cb(new Error('Only PNG, JPG, WEBP, HEIC or PDF files are accepted.') as any);
  },
});

const wrap = (fn: (req: any, res: any) => Promise<any>) => (req: any, res: any) =>
  fn(req, res).catch((e: any) => {
    if (e instanceof HttpError) return res.status(e.status).json({ error: e.message });
    console.error(e);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  });

const fresh = (req: any) => db.get<any>('users', req.user.id);

userRouter.get('/state', (req: any, res) => res.json(userState(req.user.id)));

userRouter.post('/deposits', wrap(async (req, res) => {
  const { amount, method, note } = req.body || {};
  const tx = await submitDeposit(fresh(req), Number(amount), String(method || 'Bank Wire'), note);
  res.json({ transaction: tx, state: userState(req.user.id) });
}));

userRouter.post('/withdrawals', wrap(async (req, res) => {
  const { amount, method, destination } = req.body || {};
  const tx = await submitWithdrawal(fresh(req), Number(amount), String(method || 'Bank Wire'), String(destination || ''));
  res.json({ transaction: tx, state: userState(req.user.id) });
}));

userRouter.post('/kyc/upload/:kind', (req: any, res) => {
  const kind = req.params.kind;
  if (!['front', 'back', 'proof', 'selfie'].includes(kind)) return res.status(400).json({ error: 'Unknown document type.' });
  upload.single('file')(req, res, async (err: any) => {
    if (err) return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'File is larger than 10MB.' : err.message });
    if (!req.file) return res.status(400).json({ error: 'No file received.' });
    try {
      const id = newId('FILE', 10).replace(/[^A-Za-z0-9_-]/g, '');
      const saved = await db.saveFile({
        id,
        ownerId: req.user.id,
        kind,
        filename: req.file.originalname.slice(0, 120),
        mime: req.file.mimetype,
        size: req.file.size,
      }, req.file.buffer);
      const u = fresh(req);
      await db.update('users', u.id, { kycFiles: { ...(u.kycFiles || {}), [kind]: saved.id } });
      res.json({ file: { id: saved.id, filename: saved.filename, kind, size: saved.size, mime: saved.mime } });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Upload failed. Please try again.' });
    }
  });
});

userRouter.get('/files/:id', wrap(async (req, res) => {
  const f = await db.getFile(req.params.id);
  if (!f || f.meta.ownerId !== req.user.id) return res.status(404).end();
  res.setHeader('Content-Type', f.meta.mime);
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(f.meta.filename)}"`);
  res.setHeader('Cache-Control', 'private, max-age=300');
  res.send(f.data);
}));

userRouter.post('/kyc/submit', wrap(async (req, res) => {
  await submitKyc(fresh(req), req.body || {});
  res.json({ state: userState(req.user.id) });
}));

userRouter.post('/messages', wrap(async (req, res) => {
  const { subject, body, category } = req.body || {};
  if (!String(subject || '').trim() || !String(body || '').trim()) throw new HttpError(400, 'Please enter a subject and message.');
  const msg = await createMessage({
    userId: req.user.id,
    subject: String(subject).slice(0, 200),
    body: String(body).slice(0, 5000),
    category: (['KYC', 'FUNDING', 'ACCOUNT', 'TRADING', 'SUPPORT'].includes(category) ? category : 'SUPPORT'),
    direction: 'inbound',
  });
  res.json({ message: msg, state: userState(req.user.id) });
}));

userRouter.post('/messages/:id/read', wrap(async (req, res) => {
  const e = db.get<any>('emails', req.params.id);
  if (!e || (e.userId !== req.user.id && e.userId !== 'ALL')) throw new HttpError(404, 'Message not found.');
  await markMessageRead(e.id, req.user.id);
  res.json({ ok: true });
}));

userRouter.post('/positions', wrap(async (req, res) => {
  const { symbol, type, amount, leverage } = req.body || {};
  const position = await openPosition(fresh(req), { symbol, type: type === 'SELL' ? 'SELL' : 'BUY', amount: Number(amount), leverage: Number(leverage) });
  res.json({ position, state: userState(req.user.id) });
}));

userRouter.post('/positions/:id/close', wrap(async (req, res) => {
  const result = await closePosition(req.params.id, { name: `Client (${req.user.name})` }, req.user.id);
  res.json({ ...result, state: userState(req.user.id) });
}));

userRouter.post('/copies', wrap(async (req, res) => {
  const copy = await startCopy(fresh(req), req.body || {});
  res.json({ copy, state: userState(req.user.id) });
}));

userRouter.post('/copies/:id/stop', wrap(async (req, res) => {
  const result = await stopCopy(fresh(req), req.params.id);
  res.json({ result, state: userState(req.user.id) });
}));

userRouter.post('/practice/reset', wrap(async (req, res) => {
  const { config } = await import('../config');
  await db.update('users', req.user.id, { virtualBalance: config.practiceBalance });
  await audit(`Client (${req.user.name})`, 'Practice Account Reset', 'Virtual balance restored to default.', 'USER_MGMT', req.user.id);
  res.json({ state: userState(req.user.id) });
}));

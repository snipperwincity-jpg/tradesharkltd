import { Router, Request } from 'express';
import { db, newId } from '../db';
import { config } from '../config';
import {
  hashPassword, checkPassword, issueUserSession, issueAdminSession, clearUserSession, clearAdminSession,
  getUserFromReq, getAdminFromReq, requireUser, randomToken, sha256, publicAdmin, AdminRecord,
} from '../auth';
import { audit, baseUserRecord, findUserByEmail, findUserByLogin, notifyAdmins, publicUser, createMessage } from '../services';
import { queueMail } from '../mailer';
import { rateLimit } from '../rateLimit';

export const authRouter = Router();

const clientIp = (req: Request) => (req.ip || '').replace('::ffff:', '');
const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

export async function createToken(type: 'reset' | 'verify' | 'setup', userId: string, ttlHours: number) {
  // invalidate previous tokens of the same type
  for (const t of db.filter<any>('tokens', t => t.userId === userId && t.type === type)) await db.remove('tokens', t.id);
  const raw = randomToken();
  await db.put('tokens', { id: sha256(raw), type, userId, expires: Date.now() + ttlHours * 3600000 });
  return raw;
}

async function consumeToken(raw: string, types: string[]) {
  const t = db.get<any>('tokens', sha256(String(raw || '')));
  if (!t || !types.includes(t.type) || t.expires < Date.now()) return null;
  await db.remove('tokens', t.id);
  return t;
}

export async function sendVerificationEmail(user: any) {
  const token = await createToken('verify', user.id, 72);
  queueMail({
    to: user.email,
    subject: `Verify your ${config.brand.appName} email address`,
    fromName: 'Accounts',
    text: `Hi ${user.name},\n\nPlease confirm that this is your email address so we can keep your account secure and send you important notifications.\n\nThis link expires in 72 hours.`,
    cta: { label: 'Verify email address', url: `${config.appUrl}/verify-email?token=${token}` },
  });
}

// ---------------- USER ----------------
authRouter.post('/register', rateLimit('register', 10, 3600), async (req, res) => {
  const { name, email, password, phone, country, remember, ref } = req.body || {};
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!String(name || '').trim()) return res.status(400).json({ error: 'Please enter your full name.' });
  if (!emailOk(cleanEmail)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (String(password || '').length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  if (findUserByEmail(cleanEmail)) return res.status(409).json({ error: 'An account with this email already exists. Please log in instead.' });

  const referrer = ref ? db.get<any>('users', String(ref).toUpperCase()) : null;
  const user: any = baseUserRecord({
    name, email: cleanEmail, passwordHash: await hashPassword(password), phone, country, referredBy: referrer?.id,
  });
  user.lastIp = clientIp(req);
  user.referralCode = user.id;
  await db.put('users', user);
  await audit('Self-Registration', 'Account Created', `New client ${user.name} (${user.email}) registered online from ${user.country || 'unknown country'}.`, 'USER_MGMT', `${user.id} (${user.name})`);

  await createMessage({
    userId: user.id,
    category: 'ACCOUNT',
    direction: 'outbound',
    subject: `Welcome to ${config.brand.appName}, ${user.name.split(' ')[0]}!`,
    body: `Dear ${user.name},\n\nWelcome to ${config.brand.appName}. Your trading account ${user.id} is ready.\n\nNext steps:\n1. Verify your email address (we sent you a separate link).\n2. Complete identity verification (KYC) in the Verification Centre.\n3. Fund your account and start trading - or practise first with your ${'$'}${config.practiceBalance.toLocaleString()} virtual account.\n\nIf you have any questions, reply to this email or contact ${config.brand.supportEmail}.\n\nThe ${config.brand.appName} Team`,
    cta: { label: 'Open your client portal', url: `${config.appUrl}/dashboard` },
  });
  await sendVerificationEmail(user);
  notifyAdmins(`New registration: ${user.name}`, `${user.name} (${user.email}) just registered.\nAccount: ${user.id}\nCountry: ${user.country || '-'}\nPhone: ${user.phone || '-'}${referrer ? `\nReferred by: ${referrer.name} (${referrer.id})` : ''}`, { label: 'Open admin console', url: `${config.appUrl}/admin` });

  const expiresAt = issueUserSession(res, user.id, remember !== false);
  res.json({ user: publicUser(user), expiresAt });
});

authRouter.post('/login', rateLimit('login', 20, 900), async (req, res) => {
  const { identifier, email, password, remember } = req.body || {};
  const user = findUserByLogin(String(identifier || email || ''));
  if (!user || !(await checkPassword(String(password || ''), user.passwordHash))) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }
  if (user.status === 'Suspended') {
    return res.status(403).json({ error: `This account is suspended. Please contact ${config.brand.supportEmail}.` });
  }
  if (config.requireEmailVerification && !user.emailVerified) {
    await sendVerificationEmail(user);
    return res.status(403).json({ error: 'Please verify your email address first. We just sent you a new verification link.' });
  }
  const ip = clientIp(req);
  await db.update('users', user.id, { lastIp: ip, lastLogin: new Date().toISOString() });
  if (config.mail.loginAlerts) {
    queueMail({
      to: user.email,
      subject: `New sign-in to your ${config.brand.appName} account`,
      fromName: 'Security',
      text: `Hi ${user.name},\n\nWe noticed a new sign-in to your account.\n\nTime: ${new Date().toUTCString()}\nIP address: ${ip}\n\nIf this was you, no action is needed. If not, reset your password immediately and contact ${config.brand.supportEmail}.`,
      cta: { label: 'Reset password', url: `${config.appUrl}/forgot-password` },
    });
  }
  const expiresAt = issueUserSession(res, user.id, !!remember);
  res.json({ user: publicUser(db.get('users', user.id)), expiresAt });
});

authRouter.post('/logout', (_req, res) => {
  clearUserSession(res);
  res.json({ ok: true });
});

authRouter.get('/me', (req, res) => {
  const s = getUserFromReq(req);
  if (!s) return res.json({ user: null });
  res.json({ user: publicUser(s.user), expiresAt: s.expiresAt });
});

authRouter.post('/forgot-password', rateLimit('forgot', 5, 900), async (req, res) => {
  const user = findUserByEmail(String(req.body?.email || ''));
  if (user) {
    const token = await createToken('reset', user.id, 1);
    queueMail({
      to: user.email,
      subject: `Reset your ${config.brand.appName} password`,
      fromName: 'Security',
      text: `Hi ${user.name},\n\nWe received a request to reset the password for your account. Click the button below to choose a new password. This link expires in 1 hour.\n\nIf you did not request this, you can safely ignore this email - your password will not change.`,
      cta: { label: 'Reset password', url: `${config.appUrl}/reset-password?token=${token}` },
    });
  }
  // Always respond the same way to avoid revealing which emails are registered.
  res.json({ ok: true, message: 'If an account exists for that email, a password reset link has been sent.' });
});

authRouter.post('/reset-password', rateLimit('reset', 10, 900), async (req, res) => {
  const { token, password } = req.body || {};
  if (String(password || '').length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  const t = await consumeToken(token, ['reset', 'setup']);
  if (!t) return res.status(400).json({ error: 'This link is invalid or has expired. Please request a new one.' });
  const user = db.get<any>('users', t.userId);
  if (!user) return res.status(400).json({ error: 'Account not found.' });
  await db.update('users', user.id, { passwordHash: await hashPassword(password), emailVerified: true });
  queueMail({
    to: user.email,
    subject: `Your ${config.brand.appName} password was changed`,
    fromName: 'Security',
    text: `Hi ${user.name},\n\nThe password for your account was just changed. If you did not do this, contact ${config.brand.supportEmail} immediately.`,
  });
  const expiresAt = issueUserSession(res, user.id, false);
  res.json({ ok: true, user: publicUser(db.get('users', user.id)), expiresAt });
});

authRouter.post('/verify-email', async (req, res) => {
  const t = await consumeToken(req.body?.token, ['verify']);
  if (!t) return res.status(400).json({ error: 'This verification link is invalid or has expired.' });
  await db.update('users', t.userId, { emailVerified: true });
  res.json({ ok: true });
});

authRouter.post('/resend-verification', requireUser, rateLimit('resend', 5, 3600), async (req, res) => {
  const user = (req as any).user;
  if (user.emailVerified) return res.json({ ok: true, message: 'Your email is already verified.' });
  await sendVerificationEmail(user);
  res.json({ ok: true, message: `Verification link sent to ${user.email}.` });
});

authRouter.post('/change-password', requireUser, async (req, res) => {
  const user = (req as any).user;
  const { currentPassword, newPassword } = req.body || {};
  if (!(await checkPassword(String(currentPassword || ''), user.passwordHash))) return res.status(400).json({ error: 'Current password is incorrect.' });
  if (String(newPassword || '').length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  await db.update('users', user.id, { passwordHash: await hashPassword(newPassword) });
  queueMail({
    to: user.email,
    subject: `Your ${config.brand.appName} password was changed`,
    fromName: 'Security',
    text: `Hi ${user.name},\n\nThe password for your account was just changed from your client portal. If you did not do this, contact ${config.brand.supportEmail} immediately.`,
  });
  res.json({ ok: true });
});

authRouter.post('/profile', requireUser, async (req, res) => {
  const user = (req as any).user;
  const { phone, country, streetAddress, city, postalCode } = req.body || {};
  const patch: any = {};
  if (typeof phone === 'string') patch.phone = phone.trim();
  if (typeof country === 'string') patch.country = country.trim();
  if (typeof streetAddress === 'string') patch.streetAddress = streetAddress.trim();
  if (typeof city === 'string') patch.city = city.trim();
  if (typeof postalCode === 'string') patch.postalCode = postalCode.trim();
  await db.update('users', user.id, patch);
  res.json({ user: publicUser(db.get('users', user.id)) });
});

// ---------------- ADMIN ----------------
authRouter.post('/admin/login', rateLimit('admin-login', 10, 900), async (req, res) => {
  const { username, password, remember } = req.body || {};
  const u = String(username || '').trim().toLowerCase();
  const admin = db.find<AdminRecord>('admins', a => a.username === u || a.email.toLowerCase() === u);
  if (!admin || !(await checkPassword(String(password || ''), admin.passwordHash))) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }
  const expiresAt = issueAdminSession(res, admin.id, !!remember);
  await audit(`${admin.name} (${admin.role})`, 'Admin Sign-in', `Back-office session opened from ${clientIp(req)}.`, 'COMPLIANCE');
  res.json({ admin: publicAdmin(admin), expiresAt });
});

authRouter.post('/admin/logout', (_req, res) => {
  clearAdminSession(res);
  res.json({ ok: true });
});

authRouter.get('/admin/me', (req, res) => {
  const s = getAdminFromReq(req);
  if (!s) return res.json({ admin: null });
  res.json({ admin: publicAdmin(s.admin), expiresAt: s.expiresAt });
});

authRouter.post('/admin/change-password', async (req, res) => {
  const s = getAdminFromReq(req);
  if (!s) return res.status(401).json({ error: 'Not signed in.' });
  const { currentPassword, newPassword } = req.body || {};
  if (!(await checkPassword(String(currentPassword || ''), s.admin.passwordHash))) return res.status(400).json({ error: 'Current password is incorrect.' });
  if (String(newPassword || '').length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  await db.update('admins', s.admin.id, { passwordHash: await hashPassword(newPassword) });
  res.json({ ok: true, note: 'Password changed. Note: if this account is configured via environment variables, the env value is re-applied on the next restart.' });
});

export { newId };

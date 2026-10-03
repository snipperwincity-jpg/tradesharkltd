import { Router, Request } from 'express';
import { db, newId } from '../db';
import { config } from '../config';
import {
  hashPassword, checkPassword, issueUserSession, issueAdminSession, clearUserSession, clearAdminSession,
  getUserFromReq, getAdminFromReq, requireUser, randomToken, sha256, publicAdmin, AdminRecord,
} from '../auth';
import { audit, baseUserRecord, findUserByEmail, findUserByLogin, notifyAdmins, publicUser, createMessage } from '../services';
import { queueMail, sendMail, mailProvider } from '../mailer';
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

export async function createOtpToken(userId: string, email: string): Promise<string> {
  const cleanEmail = email.trim().toLowerCase();
  for (const t of db.filter<any>('tokens', t => (t.userId === userId || t.email === cleanEmail) && t.type === 'otp')) {
    await db.remove('tokens', t.id);
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const id = sha256(`otp:${cleanEmail}:${otp}`);
  await db.put('tokens', { id, type: 'otp', userId, email: cleanEmail, otp, expires: Date.now() + 15 * 60 * 1000 });
  return otp;
}

async function consumeToken(raw: string, types: string[]) {
  const t = db.get<any>('tokens', sha256(String(raw || '')));
  if (!t || !types.includes(t.type) || t.expires < Date.now()) return null;
  await db.remove('tokens', t.id);
  return t;
}

export async function sendVerificationEmail(user: any, otpCode?: string) {
  const token = await createToken('verify', user.id, 72);
  const otp = otpCode || (await createOtpToken(user.id, user.email));
  queueMail({
    to: user.email,
    subject: `Your ${config.brand.appName} Verification Code: ${otp}`,
    fromName: 'Security Desk',
    otp,
    text: `Hi ${user.name},\n\nThank you for choosing ${config.brand.appName} Ltd.\n\nYour One-Time Passcode (OTP) is:\n\n[ ${otp} ]\n\nThis 6-digit code is valid for 15 minutes. Enter this code on the verification screen to activate your account.\n\nAlternatively, you can verify your email address directly by clicking the link below:\n${config.appUrl}/verify-email?token=${token}\n\nIf you did not register for a TradeShark account, please ignore this email.`,
    cta: { label: 'Verify email address', url: `${config.appUrl}/verify-email?token=${token}` },
  });
  return { token, otp };
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

  const { otp } = await sendVerificationEmail(user);

  await createMessage({
    userId: user.id,
    category: 'ACCOUNT',
    direction: 'outbound',
    subject: `Welcome to ${config.brand.appName}, ${user.name.split(' ')[0]}! Verification OTP: ${otp}`,
    body: `Dear ${user.name},\n\nWelcome to ${config.brand.appName}. Your trading account ${user.id} is ready.\n\nYour One-Time Passcode (OTP) is: ${otp}\n(Valid for 15 minutes)\n\nNext steps:\n1. Verify your email with the 6-digit OTP code.\n2. Complete identity verification (KYC) in the Verification Centre.\n3. Fund your account and start trading - or practise first with your $${config.practiceBalance.toLocaleString()} virtual account.\n\nIf you have any questions, reply to this email or contact ${config.brand.supportEmail}.\n\nThe ${config.brand.appName} Team`,
    cta: { label: 'Open your client portal', url: `${config.appUrl}/dashboard` },
  });

  notifyAdmins(`New registration: ${user.name}`, `${user.name} (${user.email}) just registered.\nAccount: ${user.id}\nCountry: ${user.country || '-'}\nPhone: ${user.phone || '-'}${referrer ? `\nReferred by: ${referrer.name} (${referrer.id})` : ''}`, { label: 'Open admin console', url: `${config.appUrl}/admin` });

  const expiresAt = issueUserSession(res, user.id, remember !== false);
  const provider = mailProvider();
  res.json({
    user: publicUser(user),
    expiresAt,
    requireOtp: true,
    otpEmail: cleanEmail,
    debugOtp: provider === 'log' || !config.isProd ? otp : undefined
  });
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

authRouter.post('/verify-otp', rateLimit('verify-otp', 15, 900), async (req, res) => {
  const { email, otp } = req.body || {};
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanOtp = String(otp || '').trim().replace(/\s+/g, '');
  if (!cleanEmail || !cleanOtp) {
    return res.status(400).json({ error: 'Email and 6-digit OTP code are required.' });
  }
  const id = sha256(`otp:${cleanEmail}:${cleanOtp}`);
  const t = db.get<any>('tokens', id);
  if (!t || t.type !== 'otp' || t.expires < Date.now()) {
    return res.status(400).json({ error: 'Invalid or expired OTP code. Please check your code or click "Resend code".' });
  }
  await db.remove('tokens', id);
  const user = db.get<any>('users', t.userId) || findUserByEmail(cleanEmail);
  if (!user) {
    return res.status(404).json({ error: 'User account not found.' });
  }
  await db.update('users', user.id, { emailVerified: true });
  await audit('Email Verified', 'OTP Verification', `Client ${user.name} (${user.email}) successfully verified account email via 6-digit OTP.`, 'USER_MGMT', `${user.id} (${user.name})`);
  const updatedUser = db.get<any>('users', user.id);
  const expiresAt = issueUserSession(res, user.id, true);
  res.json({ ok: true, message: 'Email successfully verified! Welcome to TradeShark.', user: publicUser(updatedUser), expiresAt });
});

authRouter.post('/resend-otp', rateLimit('resend-otp', 10, 900), async (req, res) => {
  const { email } = req.body || {};
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail) return res.status(400).json({ error: 'Email address is required.' });
  const user = findUserByEmail(cleanEmail);
  if (!user) {
    return res.json({ ok: true, message: 'If an account exists for that email, a verification code has been dispatched.' });
  }
  const otp = await createOtpToken(user.id, cleanEmail);
  await sendVerificationEmail(user, otp);
  const provider = mailProvider();
  res.json({
    ok: true,
    message: `A new 6-digit OTP verification code has been sent to ${cleanEmail}.`,
    debugOtp: provider === 'log' || !config.isProd ? otp : undefined
  });
});

authRouter.post('/request-email-otp', requireUser, rateLimit('req-otp', 10, 900), async (req, res) => {
  const user = (req as any).user;
  const otp = await createOtpToken(user.id, user.email);
  await sendVerificationEmail(user, otp);
  const provider = mailProvider();
  res.json({
    ok: true,
    message: `A new 6-digit OTP verification code has been sent to ${user.email}.`,
    debugOtp: provider === 'log' || !config.isProd ? otp : undefined
  });
});

authRouter.post('/resend-verification', requireUser, rateLimit('resend', 5, 3600), async (req, res) => {
  const user = (req as any).user;
  if (user.emailVerified) return res.json({ ok: true, message: 'Your email is already verified.' });
  await sendVerificationEmail(user);
  res.json({ ok: true, message: `Verification link and OTP code sent to ${user.email}.` });
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

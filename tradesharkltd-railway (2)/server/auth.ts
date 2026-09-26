import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { config } from './config';
import { db } from './db';

export const USER_COOKIE = 'ts_user';
export const ADMIN_COOKIE = 'ts_admin';

export type AdminRole = 'Super-Admin' | 'Compliance Officer' | 'Treasury Desk';

export interface AdminRecord {
  id: string;
  username: string;
  name: string;
  email: string;
  role: AdminRole;
  passwordHash: string;
  createdAt: string;
}

export const hashPassword = (p: string) => bcrypt.hash(p, 10);
export const checkPassword = (p: string, hash?: string) => (hash ? bcrypt.compare(p, hash) : Promise.resolve(false));

const cookieOpts = (maxAgeMs?: number) => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: config.isProd,
  path: '/',
  ...(maxAgeMs ? { maxAge: maxAgeMs } : {}),
});

export function issueUserSession(res: Response, userId: string, remember: boolean) {
  const ttl = remember ? 30 * 24 * 3600 : 12 * 3600;
  const token = jwt.sign({ sub: userId, typ: 'user' }, config.jwtSecret, { expiresIn: ttl });
  // "remember me" → persistent cookie; otherwise browser-session cookie (JWT still expires in 12h)
  res.cookie(USER_COOKIE, token, cookieOpts(remember ? ttl * 1000 : undefined));
  return Date.now() + ttl * 1000;
}

export function issueAdminSession(res: Response, adminId: string, remember: boolean) {
  const ttl = remember ? 24 * 3600 : 8 * 3600;
  const token = jwt.sign({ sub: adminId, typ: 'admin' }, config.jwtSecret, { expiresIn: ttl });
  res.cookie(ADMIN_COOKIE, token, cookieOpts(remember ? ttl * 1000 : undefined));
  return Date.now() + ttl * 1000;
}

export const clearUserSession = (res: Response) => res.clearCookie(USER_COOKIE, cookieOpts());
export const clearAdminSession = (res: Response) => res.clearCookie(ADMIN_COOKIE, cookieOpts());

const readToken = (req: Request, cookie: string, typ: string): { sub: string; exp: number } | null => {
  const raw = req.cookies?.[cookie];
  if (!raw) return null;
  try {
    const p = jwt.verify(raw, config.jwtSecret) as any;
    if (p.typ !== typ) return null;
    return { sub: p.sub, exp: p.exp * 1000 };
  } catch {
    return null;
  }
};

export const getUserFromReq = (req: Request) => {
  const t = readToken(req, USER_COOKIE, 'user');
  if (!t) return null;
  const user = db.get('users', t.sub);
  if (!user) return null;
  return { user, expiresAt: t.exp };
};

export const getAdminFromReq = (req: Request) => {
  const t = readToken(req, ADMIN_COOKIE, 'admin');
  if (!t) return null;
  const admin = db.get<AdminRecord>('admins', t.sub);
  if (!admin) return null;
  return { admin, expiresAt: t.exp };
};

export function requireUser(req: Request, res: Response, next: NextFunction) {
  const s = getUserFromReq(req);
  if (!s) return res.status(401).json({ error: 'Please sign in to continue.' });
  if (s.user.status === 'Suspended') {
    clearUserSession(res);
    return res.status(403).json({ error: `This account is suspended. Contact ${config.brand.supportEmail}.` });
  }
  (req as any).user = s.user;
  next();
}

const ROLE_PERMS: Record<AdminRole, string[]> = {
  'Super-Admin': ['*'],
  'Compliance Officer': ['users.read', 'kyc', 'aml', 'emails', 'audit', 'status'],
  'Treasury Desk': ['users.read', 'funding', 'balance', 'emails', 'audit'],
};

export const requireAdmin = (perm?: string) => (req: Request, res: Response, next: NextFunction) => {
  const s = getAdminFromReq(req);
  if (!s) return res.status(401).json({ error: 'Admin session expired. Please sign in again.' });
  if (perm) {
    const perms = ROLE_PERMS[s.admin.role] || [];
    if (!perms.includes('*') && !perms.includes(perm)) {
      return res.status(403).json({ error: `Your role (${s.admin.role}) is not permitted to perform this action.` });
    }
  }
  (req as any).admin = s.admin;
  next();
};

export const randomToken = () => crypto.randomBytes(32).toString('hex');
export const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

export const publicAdmin = (a: AdminRecord) => ({ id: a.id, username: a.username, name: a.name, email: a.email, role: a.role });

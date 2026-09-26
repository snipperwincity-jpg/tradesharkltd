import crypto from 'crypto';
import { db, newId } from './db';
import { config } from './config';
import { hashPassword, checkPassword, AdminRecord, AdminRole } from './auth';

/** Admin passwords actually in effect (used only for the optional demo-logins directory). */
export const effectiveAdminPasswords: Record<string, string> = {};

async function upsertAdmin(username: string, role: AdminRole, name: string, email: string, password: string) {
  const existing = db.find<AdminRecord>('admins', a => a.username === username);
  if (existing) {
    // Environment is the source of truth: keep the stored hash in sync with the configured password.
    if (!(await checkPassword(password, existing.passwordHash))) {
      await db.put('admins', { ...existing, passwordHash: await hashPassword(password), role, name, email });
    }
  } else {
    await db.put('admins', {
      id: newId('ADM'),
      username,
      role,
      name,
      email,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    });
  }
  effectiveAdminPasswords[username] = password;
}

export async function ensureSystemSecrets() {
  if (config.jwtFromEnv) return;
  const sys = db.get<any>('settings', 'system');
  if (sys?.jwtSecret) {
    (config as any).jwtSecret = sys.jwtSecret;
  } else {
    await db.put('settings', { ...(sys || {}), id: 'system', jwtSecret: config.jwtSecret, createdAt: new Date().toISOString() });
    console.log('[seed] Generated and stored a session secret (set JWT_SECRET to override).');
  }
}

export async function seedAdmins() {
  let adminPassword = config.admin.password;
  if (!adminPassword) {
    if (config.enableDemoLogins || !config.isProd) {
      adminPassword = 'admin123';
      console.warn('[seed] ADMIN_PASSWORD not set - using demo password "admin123". Set ADMIN_PASSWORD before going live.');
    } else {
      const existing = db.find<AdminRecord>('admins', a => a.username === config.admin.username);
      if (existing) return; // keep whatever was set previously
      adminPassword = crypto.randomBytes(9).toString('base64url');
      console.warn(`[seed] ADMIN_PASSWORD not set - generated one-time admin password for "${config.admin.username}": ${adminPassword}  (set ADMIN_PASSWORD in Railway variables to control it)`);
    }
  }
  await upsertAdmin(config.admin.username, 'Super-Admin', config.admin.name, config.admin.email, adminPassword);

  const compliance = config.admin.compliancePassword || (config.enableDemoLogins ? 'compliance123' : '');
  if (compliance) await upsertAdmin('compliance', 'Compliance Officer', 'Compliance Desk', config.brand.complianceEmail, compliance);

  const treasury = config.admin.treasuryPassword || (config.enableDemoLogins ? 'treasury123' : '');
  if (treasury) await upsertAdmin('treasury', 'Treasury Desk', 'Treasury Operator', config.admin.email, treasury);
}

export async function seedDemoData() {
  if (!config.seedDemoData || db.all('users').length > 0) return;
  console.log('[seed] Seeding demo data (SEED_DEMO_DATA=true)');
  const userPw = await hashPassword(config.demo.userPassword);
  const vipPw = await hashPassword(config.demo.vipPassword);
  const now = Date.now();

  const users = [
    { id: 'USR-891', name: 'Alex Mercer', email: 'alex.m@gmail.com', passwordHash: userPw, demoPassword: 'user', phone: '+44 7700 900142', country: 'United Kingdom', tier: 'Tier 2 - Verified Pro', realBalance: 104850.25, virtualBalance: 100000, kycStatus: 'Approved', kycDocType: 'Passport', kycDocNumber: 'GB-94821039', kycSubmittedDate: '2026-08-14 10:20', kycExpiryDate: '2032-05-11', facialMatchScore: 99.2, amlRisk: 'Low', status: 'Active', role: 'Trader', leverage: 100, allowTrading: true, allowShorting: true, allowCrypto: true, maxPositionLimit: 250000, joinedDate: '2026-07-10', lastIp: '185.122.4.92', accountManager: 'David Sterling' },
    { id: 'USR-892', name: 'Sarah Jenkins', email: 'sjenkins@techcorp.io', passwordHash: vipPw, demoPassword: 'vip', phone: '+1 415 555 0198', country: 'United States', tier: 'Tier 3 - VIP Institutional', realBalance: 423000, virtualBalance: 250000, kycStatus: 'Approved', kycDocType: 'National ID', kycDocNumber: 'US-ID-992014', kycSubmittedDate: '2026-06-22 14:40', kycExpiryDate: '2030-10-18', facialMatchScore: 98.6, amlRisk: 'Low', status: 'Active', role: 'Pro Investor', leverage: 400, allowTrading: true, allowShorting: true, allowCrypto: true, maxPositionLimit: 1000000, joinedDate: '2026-05-15', lastIp: '64.104.22.10', accountManager: 'Victoria Sterling (VIP Desk)' },
    { id: 'USR-893', name: 'Liam Chen', email: 'liam.chen@outlook.com', passwordHash: userPw, demoPassword: 'user', phone: '+65 6789 0123', country: 'Singapore', tier: 'Tier 1 - Standard', realBalance: 15820, virtualBalance: 50000, kycStatus: 'Pending', kycDocType: 'Drivers License', kycDocNumber: 'SG-DL-882910', kycSubmittedDate: '2026-09-09 14:15', kycExpiryDate: '2029-01-30', facialMatchScore: 97.4, amlRisk: 'Low', status: 'Active', role: 'Trader', leverage: 30, allowTrading: true, allowShorting: false, allowCrypto: true, maxPositionLimit: 50000, joinedDate: '2026-09-08', lastIp: '118.189.34.12', accountManager: 'Michael Wong' },
    { id: 'USR-894', name: 'Elena Rostov', email: 'e.rostov@proton.me', passwordHash: userPw, demoPassword: 'user', phone: '+49 151 2345678', country: 'Germany', tier: 'Tier 1 - Standard', currency: 'EUR', realBalance: 8450, virtualBalance: 10000, kycStatus: 'Under Review', kycDocType: 'Proof of Address', kycDocNumber: 'DE-POA-98124', kycSubmittedDate: '2026-09-08 09:30', facialMatchScore: 94.1, amlRisk: 'Medium', status: 'Trading Frozen', role: 'Trader', leverage: 30, allowTrading: false, allowShorting: false, allowCrypto: false, maxPositionLimit: 25000, joinedDate: '2026-09-07', lastIp: '194.12.88.5', accountManager: 'David Sterling', kycNotes: 'Proof of residence utility bill older than 90 days. Awaiting refreshed copy.' },
    { id: 'USR-895', name: 'Tariq Al-Mansoor', email: 't.mansoor@gulfcap.ae', passwordHash: vipPw, demoPassword: 'vip', phone: '+971 4 888 9012', country: 'United Arab Emirates', tier: 'Tier 3 - VIP Institutional', realBalance: 850000, virtualBalance: 500000, kycStatus: 'Approved', kycDocType: 'Passport', kycDocNumber: 'AE-P-440192', kycSubmittedDate: '2026-04-10 11:00', kycExpiryDate: '2031-12-04', facialMatchScore: 99.8, amlRisk: 'Low', status: 'Active', role: 'VIP Client', leverage: 400, allowTrading: true, allowShorting: true, allowCrypto: true, maxPositionLimit: 2500000, joinedDate: '2026-04-01', lastIp: '86.96.229.1', accountManager: 'Victoria Sterling (VIP Desk)' },
  ];
  for (const [i, u] of users.entries()) {
    await db.put('users', {
      currency: 'USD', pepWatchlistHit: false, emailVerified: true, referralCode: '', referredBy: '', kycFiles: {},
      demo: true, createdAt: new Date(now - (i + 1) * 86400000).toISOString(), ...u,
    });
  }

  const txs = [
    { userId: 'USR-893', userName: 'Liam Chen', type: 'Deposit', amount: 25000, method: 'Bank Wire', status: 'Pending Approval', reference: 'WIRE-SG-99214', adminNote: 'Incoming SWIFT transfer. Client requested tier upgrade.' },
    { userId: 'USR-892', userName: 'Sarah Jenkins', type: 'Deposit', amount: 50000, method: 'Crypto (USDT/BTC)', status: 'Pending Approval', reference: 'TX-USDT-0x89fa41c9', adminNote: 'USDT on-chain deposit. Awaiting AML screening.' },
    { userId: 'USR-894', userName: 'Elena Rostov', type: 'Withdrawal', amount: 5000, method: 'SEPA Wire', status: 'Pending Approval', reference: 'WD-SEPA-81092', destination: 'IBAN: DE89 3704 0044 0532 0130 00', adminNote: 'Trading frozen; withdrawal to original source of funds.' },
    { userId: 'USR-891', userName: 'Alex Mercer', type: 'Deposit', amount: 10000, method: 'Faster Payments', status: 'Approved / Settled', reference: 'FPS-UK-28471', adminNote: 'Auto-cleared.' },
    { userId: 'USR-895', userName: 'Tariq Al-Mansoor', type: 'Deposit', amount: 250000, method: 'Bank Wire', status: 'Approved / Settled', reference: 'WIRE-ENBD-7718', adminNote: 'Wire cleared. VIP credit.' },
  ];
  for (const [i, t] of txs.entries()) {
    const ts = now - i * 3600000;
    await db.put('transactions', { id: newId('TX'), ts, date: new Date(ts).toISOString().replace('T', ' ').slice(0, 16), ...t });
  }

  const positions = [
    { userId: 'USR-891', symbol: 'NVDA', name: 'NVIDIA Corp', type: 'BUY', units: '45.8', entryPrice: 195.4, category: 'stocks' },
    { userId: 'USR-891', symbol: 'BTC', name: 'Bitcoin', type: 'BUY', units: '0.42', entryPrice: 88200, category: 'crypto' },
    { userId: 'USR-891', symbol: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'BUY', units: '30.0', entryPrice: 480, category: 'etfs' },
  ];
  for (const p of positions) {
    await db.put('positions', {
      id: newId('POS'), ...p, currentPrice: p.entryPrice, profit: 0, profitPercent: 0,
      openDate: new Date(now - 5 * 86400000).toISOString().slice(0, 10), invested: p.entryPrice * parseFloat(p.units), leverage: 1, ts: now,
    });
  }

  await db.put('emails', {
    id: newId('EML'), from: `${config.brand.appName} Compliance Desk <${config.mail.fromAddress}>`, to: 'alex.m@gmail.com',
    userId: 'USR-891', userName: 'Alex Mercer', subject: 'Verification Certified: Your Account is Now Tier 2 Verified Pro',
    body: `Dear Alex Mercer,\n\nYour identity documents and proof of address have been fully verified. Your account has been elevated to Tier 2 - Verified Pro.\n\n${config.brand.appName} Compliance Desk`,
    category: 'KYC', priority: 'High', date: new Date(now - 86400000).toISOString().replace('T', ' ').slice(0, 16), ts: now - 86400000,
    read: false, readBy: [], direction: 'outbound', delivery: 'seed',
  });
  await db.put('emails', {
    id: newId('EML'), from: 'Elena Rostov <e.rostov@proton.me>', to: `${config.brand.appName} Client Desk <${config.brand.supportEmail}>`,
    userId: 'USR-894', userName: 'Elena Rostov', subject: 'Re-uploading my updated residence registration',
    body: 'Hello Compliance Team,\n\nMy trading was frozen because my utility bill was over 90 days old. I have a new registration certificate - can I upload it through the portal KYC tab?\n\nThank you,\nElena Rostov',
    category: 'KYC', priority: 'Normal', date: new Date(now - 7200000).toISOString().replace('T', ' ').slice(0, 16), ts: now - 7200000,
    read: false, readBy: [], direction: 'inbound', replyEmail: 'e.rostov@proton.me', delivery: 'seed',
  });

  await db.put('auditLogs', {
    id: newId('LOG'), timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19), ts: now,
    adminUser: 'System', action: 'Demo Data Seeded', details: 'Demo accounts, transactions and positions were created because SEED_DEMO_DATA=true.', type: 'COMPLIANCE',
  });
}

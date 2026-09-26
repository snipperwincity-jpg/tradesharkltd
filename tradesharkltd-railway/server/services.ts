import { db, newId, nowStamp, shortNumericId } from './db';
import { config } from './config';
import { queueMail, sendMail } from './mailer';
import { INSTRUMENTS, POPULAR_INVESTORS } from '../src/data/mockData';

// ------------------------------------------------------------------
// Types (server-side records extend the shared client types)
// ------------------------------------------------------------------
export type Category = 'KYC' | 'FUNDING' | 'ACCOUNT' | 'TRADING' | 'MARKET_ALERT' | 'SUPPORT';
export type Priority = 'Normal' | 'High' | 'Urgent';

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

const money = (n: number) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const brand = () => config.brand.appName;
const portalUrl = (tab?: string) => `${config.appUrl}/dashboard${tab ? `?tab=${tab}` : ''}`;
const adminUrl = (tab?: string) => `${config.appUrl}/admin${tab ? `?tab=${tab}` : ''}`;

const DEPT: Record<Category, string> = {
  KYC: 'Compliance Desk',
  FUNDING: 'Treasury Desk',
  ACCOUNT: 'Client Services',
  TRADING: 'Trading Desk',
  MARKET_ALERT: 'Research Desk',
  SUPPORT: 'Support',
};
export const deptFrom = (c: Category) => `${brand()} ${DEPT[c] || 'Support'} <${config.mail.fromAddress}>`;
export const deskAddress = () => `${brand()} Client Desk <${config.brand.supportEmail}>`;

// ------------------------------------------------------------------
// Users
// ------------------------------------------------------------------
const PRIVATE_USER_FIELDS = ['passwordHash', 'password', 'kycFiles'];

export function publicUser(u: any) {
  if (!u) return null;
  const out: any = { ...u };
  PRIVATE_USER_FIELDS.forEach(k => delete out[k]);
  out.kycFileIds = u.kycFiles || {};
  return out;
}

export const findUserByEmail = (email: string) =>
  db.find<any>('users', u => u.email.toLowerCase() === email.trim().toLowerCase());

export const findUserByLogin = (identifier: string) => {
  const s = identifier.trim().toLowerCase();
  return db.find<any>('users', u => u.email.toLowerCase() === s || u.id.toLowerCase() === s);
};

export const newUserId = () => shortNumericId('USR', id => !!db.get('users', id));

export function baseUserRecord(input: {
  name: string; email: string; passwordHash?: string; phone?: string; country?: string; referredBy?: string;
}) {
  return {
    id: newUserId(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    passwordHash: input.passwordHash,
    phone: input.phone?.trim() || '',
    country: input.country || '',
    tier: 'Tier 1 - Standard',
    currency: 'USD',
    realBalance: Math.max(0, config.signupBonus),
    virtualBalance: config.practiceBalance,
    kycStatus: 'Action Required',
    kycDocType: 'Passport',
    kycDocNumber: '',
    kycSubmittedDate: '',
    kycNotes: 'Complete identity verification to unlock deposits, withdrawals and full trading.',
    amlRisk: 'Low',
    pepWatchlistHit: false,
    status: 'Active',
    role: 'Trader',
    leverage: 30,
    allowTrading: true,
    allowShorting: false,
    allowCrypto: true,
    maxPositionLimit: 50000,
    joinedDate: nowStamp(10),
    lastIp: '',
    accountManager: config.brand.defaultAccountManager,
    emailVerified: false,
    referralCode: '',
    referredBy: input.referredBy || '',
    kycFiles: {},
    createdAt: new Date().toISOString(),
  };
}

// ------------------------------------------------------------------
// Audit
// ------------------------------------------------------------------
export async function audit(actor: string, action: string, details: string, type: 'USER_MGMT' | 'FUNDING' | 'KYC' | 'MARKET' | 'COMPLIANCE', targetUser?: string) {
  await db.put('auditLogs', {
    id: newId('LOG'),
    timestamp: nowStamp(19),
    adminUser: actor,
    action,
    details,
    type,
    targetUser,
    ts: Date.now(),
  });
}

// ------------------------------------------------------------------
// Messages (portal inbox) + real email delivery
// ------------------------------------------------------------------
export interface MessageInput {
  userId: string;            // user id, 'ALL', or 'GUEST'
  subject: string;
  body: string;
  category: Category;
  priority?: Priority;
  direction: 'outbound' | 'inbound';
  toEmail?: string;          // guests / explicit address
  fromDisplay?: string;
  userName?: string;
  cta?: { label: string; url: string };
  sendEmail?: boolean;       // default true
}

export async function createMessage(input: MessageInput) {
  const user = input.userId !== 'ALL' && input.userId !== 'GUEST' ? db.get<any>('users', input.userId) : null;
  const isBroadcast = input.userId === 'ALL';
  const msg: any = {
    id: newId('EML'),
    from: input.direction === 'outbound'
      ? (input.fromDisplay || deptFrom(input.category))
      : (input.fromDisplay || (user ? `${user.name} <${user.email}>` : `${input.userName || 'Guest'} <${input.toEmail || ''}>`)),
    to: input.direction === 'outbound'
      ? (isBroadcast ? 'All Clients' : (user?.email || input.toEmail || ''))
      : deskAddress(),
    userId: input.userId,
    userName: isBroadcast ? 'All Clients' : (user?.name || input.userName || 'Guest'),
    subject: input.subject,
    body: input.body,
    category: input.category,
    priority: input.priority || 'Normal',
    date: nowStamp(16),
    ts: Date.now(),
    read: false,
    readBy: [],
    direction: input.direction,
    replyEmail: input.direction === 'inbound' ? (user?.email || input.toEmail || '') : undefined,
    delivery: 'pending',
  };
  await db.put('emails', msg);

  if (input.sendEmail === false) {
    await db.update('emails', msg.id, { delivery: 'portal-only' });
    return msg;
  }

  if (input.direction === 'outbound') {
    const cta = input.cta || (user || isBroadcast ? { label: 'Open your client portal', url: portalUrl('inbox') } : undefined);
    if (isBroadcast) {
      // Deliver in the background, one by one, to all active clients.
      const recipients = db.filter<any>('users', u => u.status !== 'Suspended').map(u => u.email);
      (async () => {
        let sent = 0;
        for (const to of recipients) {
          const r = await sendMail({ to, subject: input.subject, text: input.body, fromName: DEPT[input.category], cta });
          if (r.ok) sent++;
          await new Promise(res => setTimeout(res, 120));
        }
        await db.update('emails', msg.id, { delivery: `sent ${sent}/${recipients.length}` });
      })().catch(e => console.error('[broadcast]', e));
    } else {
      const to = user?.email || input.toEmail;
      if (to) {
        sendMail({ to, subject: input.subject, text: input.body, fromName: DEPT[input.category], cta })
          .then(r => db.update('emails', msg.id, { delivery: r.ok ? `sent (${r.provider})` : `failed: ${r.error}` }))
          .catch(() => undefined);
      }
    }
  } else {
    // inbound: notify the back office
    notifyAdmins(
      `[${input.category}] ${input.subject}`,
      `New message from ${msg.userName} (${msg.replyEmail || 'no email'})${user ? ` - account ${user.id}` : ''}:\n\n${input.body}`,
      { label: 'Open admin inbox', url: adminUrl('emails') },
      msg.replyEmail
    );
    await db.update('emails', msg.id, { delivery: 'received' });
  }
  return msg;
}

export function notifyAdmins(subject: string, text: string, cta?: { label: string; url: string }, replyTo?: string) {
  const to = config.admin.notifyEmail;
  if (!to) return;
  queueMail({ to, subject: `${brand()} Admin: ${subject}`, text, fromName: 'System', cta, replyTo });
}

export function messagesForUser(userId: string) {
  return db
    .filter<any>('emails', e => e.userId === userId || e.userId === 'ALL')
    .map(e => (e.userId === 'ALL' ? { ...e, read: (e.readBy || []).includes(userId) } : e))
    .sort((a, b) => (b.ts || 0) - (a.ts || 0));
}

export async function markMessageRead(msgId: string, userId?: string) {
  const e = db.get<any>('emails', msgId);
  if (!e) return;
  if (e.userId === 'ALL' && userId) {
    const readBy = Array.from(new Set([...(e.readBy || []), userId]));
    await db.update('emails', msgId, { readBy });
  } else {
    await db.update('emails', msgId, { read: true, isRead: true });
  }
}

// ------------------------------------------------------------------
// Market engine (simulated live prices with random walk)
// ------------------------------------------------------------------
const prices = new Map<string, { price: number; open: number; name: string; category: string }>();
INSTRUMENTS.forEach(i => prices.set(i.symbol, { price: i.price, open: i.price / (1 + i.deltaPercent / 100), name: i.name, category: i.category }));

export function startMarketEngine() {
  setInterval(() => {
    for (const [sym, p] of prices) {
      const vol = p.category === 'crypto' ? 0.004 : p.category === 'currencies' ? 0.0006 : 0.0015;
      const drift = (p.open - p.price) / p.open * 0.02; // mean-revert gently toward open
      const next = p.price * (1 + drift + (Math.random() - 0.5) * 2 * vol);
      p.price = Number(next.toFixed(p.price < 10 ? 5 : 2));
    }
  }, 10000);
}

export const getQuote = (symbol: string) => prices.get(symbol);

export function marketSnapshot() {
  return Array.from(prices.entries()).map(([symbol, p]) => ({
    symbol,
    price: p.price,
    deltaPercent: Number((((p.price - p.open) / p.open) * 100).toFixed(2)),
  }));
}

const CATEGORY_LABEL: Record<string, string> = {
  stocks: 'Stocks', etfs: 'ETFs', crypto: 'Crypto', commodities: 'Commodities', indices: 'Indices', currencies: 'Currencies',
};

export function getMarketSettings(): Record<string, { halted?: boolean; spread?: string }> {
  return db.get<any>('settings', 'market')?.assets || {};
}

export function marketAssets() {
  const s = getMarketSettings();
  return Array.from(prices.entries()).map(([symbol, p]) => ({
    symbol,
    name: p.name,
    category: CATEGORY_LABEL[p.category] || p.category,
    price: p.price,
    spread: s[symbol]?.spread || (p.category === 'crypto' ? '0.30%' : p.category === 'currencies' ? '0.01%' : '0.02%'),
    halted: !!s[symbol]?.halted,
    status: s[symbol]?.halted ? 'Halted' : 'Active',
  }));
}

export async function setAssetHalt(symbol: string, halted: boolean, actor: string) {
  const current = db.get<any>('settings', 'market') || { id: 'market', assets: {} };
  current.assets = { ...current.assets, [symbol]: { ...(current.assets[symbol] || {}), halted } };
  await db.put('settings', current);
  await audit(actor, halted ? 'Trading Halted' : 'Trading Resumed', `${symbol} trading ${halted ? 'halted' : 'resumed'} by risk desk.`, 'MARKET');
}

// ------------------------------------------------------------------
// Positions
// ------------------------------------------------------------------
export function valuePosition(p: any) {
  const q = getQuote(p.symbol);
  const currentPrice = q ? q.price : p.currentPrice;
  const units = parseFloat(p.units);
  const dir = p.type === 'BUY' ? 1 : -1;
  const lev = p.leverage || 1;
  const profit = (currentPrice - p.entryPrice) * units * dir * lev;
  const invested = p.invested ?? p.entryPrice * units;
  return {
    ...p,
    currentPrice,
    profit: Number(profit.toFixed(2)),
    profitPercent: invested ? Number(((profit / invested) * 100).toFixed(2)) : 0,
  };
}

export async function openPosition(user: any, input: { symbol: string; type: 'BUY' | 'SELL'; amount: number; leverage?: number }) {
  const q = getQuote(input.symbol);
  if (!q) throw new HttpError(400, 'Unknown instrument.');
  if (getMarketSettings()[input.symbol]?.halted) throw new HttpError(409, `${input.symbol} trading is temporarily halted by the risk desk.`);
  if (!user.allowTrading || user.status === 'Trading Frozen') throw new HttpError(403, 'Trading is currently restricted on your account.');
  if (q.category === 'crypto' && !user.allowCrypto) throw new HttpError(403, 'Crypto trading is not enabled on your account.');
  if (input.type === 'SELL' && !user.allowShorting) throw new HttpError(403, 'Short selling is not enabled on your account.');
  const amount = Number(input.amount);
  if (!(amount > 0)) throw new HttpError(400, 'Enter a valid amount.');
  if (amount > user.realBalance) throw new HttpError(400, `Insufficient balance. Available: ${money(user.realBalance)}.`);
  if (amount > user.maxPositionLimit) throw new HttpError(400, `Maximum position size is ${money(user.maxPositionLimit)}.`);
  const leverage = Math.max(1, Math.min(Number(input.leverage) || 1, user.leverage || 1));

  const units = amount / q.price;
  const pos = {
    id: newId('POS'),
    userId: user.id,
    symbol: input.symbol,
    name: q.name,
    type: input.type,
    units: units.toFixed(6),
    entryPrice: q.price,
    currentPrice: q.price,
    profit: 0,
    profitPercent: 0,
    category: q.category,
    openDate: nowStamp(10),
    invested: amount,
    leverage,
    ts: Date.now(),
  };
  await db.put('positions', pos);
  await db.update('users', user.id, { realBalance: Number((user.realBalance - amount).toFixed(2)) });
  await audit(`Client (${user.name})`, 'Position Opened', `${input.type} ${pos.units} ${input.symbol} @ ${money(q.price)} (x${leverage}) - ${money(amount)} allocated.`, 'MARKET', `${user.id} (${user.name})`);

  if (config.mail.tradeConfirmations) {
    await createMessage({
      userId: user.id,
      category: 'TRADING',
      direction: 'outbound',
      subject: `Trade Confirmation: ${input.type} ${input.symbol}`,
      body: `Dear ${user.name},\n\nYour order has been executed.\n\nInstrument: ${q.name} (${input.symbol})\nSide: ${input.type}\nUnits: ${pos.units}\nExecution price: ${money(q.price)}\nAmount allocated: ${money(amount)}\nLeverage: x${leverage}\nReference: ${pos.id}\n\nYou can monitor or close this position from the Positions tab of your client portal.\n\n${brand()} Trading Desk`,
    });
  }
  return valuePosition(pos);
}

export async function closePosition(posId: string, actor: { name: string; isAdmin?: boolean }, ownerId?: string) {
  const raw = db.get<any>('positions', posId);
  if (!raw || (ownerId && raw.userId !== ownerId)) throw new HttpError(404, 'Position not found.');
  const p = valuePosition(raw);
  const user = db.get<any>('users', p.userId);
  const invested = p.invested ?? p.entryPrice * parseFloat(p.units);
  const credit = Math.max(0, invested + p.profit);
  await db.remove('positions', posId);
  if (user) await db.update('users', user.id, { realBalance: Number((user.realBalance + credit).toFixed(2)) });
  await audit(actor.name, 'Position Closed', `Closed ${p.units} ${p.symbol} at ${money(p.currentPrice)}. Realized P&L: ${money(p.profit)}. Credited ${money(credit)}.`, 'MARKET', user ? `${user.id} (${user.name})` : p.userId);

  if (user && config.mail.tradeConfirmations) {
    await createMessage({
      userId: user.id,
      category: 'TRADING',
      direction: 'outbound',
      subject: `Position Closed: ${p.symbol} (${p.profit >= 0 ? '+' : ''}${money(p.profit)})`,
      body: `Dear ${user.name},\n\nYour ${p.type} position in ${p.name} (${p.symbol}) has been closed${actor.isAdmin ? ' by our trading desk' : ''}.\n\nEntry price: ${money(p.entryPrice)}\nExit price: ${money(p.currentPrice)}\nRealized P&L: ${money(p.profit)} (${p.profitPercent}%)\nAmount credited to balance: ${money(credit)}\n\n${brand()} Trading Desk`,
    });
  }
  return { credit, profit: p.profit };
}

// ------------------------------------------------------------------
// CopyTrader
// ------------------------------------------------------------------
export function valueCopy(c: any) {
  const inv = POPULAR_INVESTORS.find(i => String(i.id) === String(c.investorId));
  const days = Math.max(0, (Date.now() - c.startedTs) / 86400000);
  const dailyRate = inv ? inv.return24M / 100 / 730 : 0;
  const wobble = Math.sin((c.startedTs % 1000) + days) * 0.004;
  const growth = days * dailyRate + (days > 0.01 ? wobble : 0);
  const currentValue = Number((c.allocated * (1 + growth)).toFixed(2));
  const profit = Number((currentValue - c.allocated).toFixed(2));
  return {
    ...c,
    currentValue,
    profit,
    profitPercent: c.allocated ? Number(((profit / c.allocated) * 100).toFixed(2)) : 0,
  };
}

export async function startCopy(user: any, input: { investorId: string; amount: number; stopLossPercent?: number; copyOpenTrades?: boolean }) {
  const inv = POPULAR_INVESTORS.find(i => String(i.id) === String(input.investorId));
  if (!inv) throw new HttpError(404, 'Investor not found.');
  if (!user.allowTrading || user.status !== 'Active') throw new HttpError(403, 'Trading is currently restricted on your account.');
  const amount = Number(input.amount);
  if (!(amount >= 200)) throw new HttpError(400, 'Minimum CopyTrader allocation is $200.');
  if (amount > user.realBalance) throw new HttpError(400, `Insufficient balance. Available: ${money(user.realBalance)}.`);
  if (db.find<any>('copies', c => c.userId === user.id && String(c.investorId) === String(inv.id) && c.status === 'Active')) {
    throw new HttpError(409, `You are already copying ${inv.name}.`);
  }
  const copy = {
    id: newId('CPY'),
    userId: user.id,
    investorId: String(inv.id),
    name: inv.name,
    handle: inv.handle,
    riskScore: inv.riskScore,
    allocated: amount,
    stopLossPercent: input.stopLossPercent ?? 60,
    copyOpenTrades: input.copyOpenTrades ?? true,
    status: 'Active',
    startedTs: Date.now(),
    startedDate: nowStamp(10),
  };
  await db.put('copies', copy);
  await db.update('users', user.id, { realBalance: Number((user.realBalance - amount).toFixed(2)) });
  await audit(`Client (${user.name})`, 'CopyTrader Started', `Allocated ${money(amount)} to copy ${inv.name} (${inv.handle}).`, 'MARKET', `${user.id} (${user.name})`);
  await createMessage({
    userId: user.id,
    category: 'TRADING',
    direction: 'outbound',
    subject: `CopyTrader Activated: You are now copying ${inv.name}`,
    body: `Dear ${user.name},\n\nYou are now copying ${inv.name} (${inv.handle}) with ${money(amount)}.\n\nCopy stop-loss: ${copy.stopLossPercent}% of allocation\nCopy open trades: ${copy.copyOpenTrades ? 'Yes' : 'No'}\n\nYou can stop copying at any time from the CopyTrader tab of your portal. Past performance is not an indication of future results.\n\n${brand()} Trading Desk`,
  });
  return valueCopy(copy);
}

export async function stopCopy(user: any, copyId: string) {
  const c = db.get<any>('copies', copyId);
  if (!c || c.userId !== user.id || c.status !== 'Active') throw new HttpError(404, 'Copy portfolio not found.');
  const v = valueCopy(c);
  await db.update('copies', copyId, { status: 'Stopped', stoppedTs: Date.now(), finalValue: v.currentValue });
  const fresh = db.get<any>('users', user.id);
  await db.update('users', user.id, { realBalance: Number((fresh.realBalance + v.currentValue).toFixed(2)) });
  await audit(`Client (${user.name})`, 'CopyTrader Stopped', `Stopped copying ${c.name}. Returned ${money(v.currentValue)} (P&L ${money(v.profit)}).`, 'MARKET', `${user.id} (${user.name})`);
  await createMessage({
    userId: user.id,
    category: 'TRADING',
    direction: 'outbound',
    subject: `CopyTrader Stopped: ${c.name}`,
    body: `Dear ${user.name},\n\nYou have stopped copying ${c.name}. ${money(v.currentValue)} has been returned to your available balance (P&L ${money(v.profit)}).\n\n${brand()} Trading Desk`,
  });
  return v;
}

// ------------------------------------------------------------------
// Funding
// ------------------------------------------------------------------
export async function submitDeposit(user: any, amount: number, method: string, note?: string) {
  if (!(amount >= config.minDeposit)) throw new HttpError(400, `Minimum deposit is ${money(config.minDeposit)}.`);
  if (config.requireEmailVerification && !user.emailVerified) throw new HttpError(403, 'Please verify your email address before funding your account.');
  const tx = {
    id: newId('TX'),
    userId: user.id,
    userName: user.name,
    type: 'Deposit',
    amount,
    method,
    status: 'Pending Approval',
    reference: shortNumericId('DEP', id => !!db.find<any>('transactions', t => t.reference === id)),
    date: nowStamp(16),
    ts: Date.now(),
    adminNote: note ? `Client note: ${note}` : 'Client initiated deposit. Awaiting funds clearance.',
  };
  await db.put('transactions', tx);
  await audit(`Client (${user.name})`, 'Deposit Submitted', `Client requested deposit of ${money(amount)} via ${method}. Added to approval queue.`, 'FUNDING', `${user.id} (${user.name})`);

  const pay = getPaymentSettings();
  const instructions = paymentInstructionsText(method, pay, tx.reference);
  await createMessage({
    userId: user.id,
    category: 'FUNDING',
    direction: 'outbound',
    subject: `Deposit Request Received: ${money(amount)} via ${method}`,
    body: `Dear ${user.name},\n\nWe have received your deposit request of ${money(amount)} via ${method}.\n\nReference: ${tx.reference}\n\n${instructions}\n\nYour balance will be credited as soon as our treasury desk confirms receipt of funds. You will receive another email when this happens.\n\n${brand()} Treasury Desk`,
  });
  notifyAdmins(`New deposit request ${money(amount)}`, `${user.name} (${user.email}, ${user.id}) submitted a deposit of ${money(amount)} via ${method}.\nReference: ${tx.reference}`, { label: 'Review funding queue', url: adminUrl('funding') });
  return tx;
}

export async function submitWithdrawal(user: any, amount: number, method: string, destination: string) {
  if (!(amount >= config.minWithdrawal)) throw new HttpError(400, `Minimum withdrawal is ${money(config.minWithdrawal)}.`);
  if (amount > user.realBalance) throw new HttpError(400, `Insufficient available balance (${money(user.realBalance)}).`);
  if (!destination?.trim()) throw new HttpError(400, 'Enter a destination account or wallet.');
  if (user.kycStatus !== 'Approved') throw new HttpError(403, 'Identity verification (KYC) must be approved before withdrawals can be processed.');
  if (user.status === 'Suspended' || user.status === 'AML Flagged') throw new HttpError(403, 'Withdrawals are restricted on this account. Please contact compliance.');

  await db.update('users', user.id, { realBalance: Number((user.realBalance - amount).toFixed(2)) });
  const tx = {
    id: newId('TX'),
    userId: user.id,
    userName: user.name,
    type: 'Withdrawal',
    amount,
    method,
    status: 'Pending Approval',
    reference: shortNumericId('WD', id => !!db.find<any>('transactions', t => t.reference === id)),
    date: nowStamp(16),
    ts: Date.now(),
    destination: destination.trim(),
    adminNote: 'Client requested withdrawal. Funds reserved in escrow.',
  };
  await db.put('transactions', tx);
  await audit(`Client (${user.name})`, 'Withdrawal Requested', `Client requested withdrawal of ${money(amount)} to ${tx.destination}. Funds reserved pending release.`, 'FUNDING', `${user.id} (${user.name})`);
  await createMessage({
    userId: user.id,
    category: 'FUNDING',
    direction: 'outbound',
    subject: `Withdrawal Request Received: ${money(amount)}`,
    body: `Dear ${user.name},\n\nWe have received your withdrawal request.\n\nAmount: ${money(amount)}\nMethod: ${method}\nDestination: ${tx.destination}\nReference: ${tx.reference}\n\nThe amount has been reserved from your available balance while our treasury desk processes the request. If you did not make this request, contact ${config.brand.supportEmail} immediately.\n\n${brand()} Treasury Desk`,
    priority: 'High',
  });
  notifyAdmins(`New withdrawal request ${money(amount)}`, `${user.name} (${user.email}, ${user.id}) requested a withdrawal of ${money(amount)} via ${method}.\nDestination: ${tx.destination}\nReference: ${tx.reference}`, { label: 'Review funding queue', url: adminUrl('funding') });
  return tx;
}

export async function approveFunding(txId: string, actor: string) {
  const tx = db.get<any>('transactions', txId);
  if (!tx || tx.status !== 'Pending Approval') throw new HttpError(404, 'Pending transaction not found.');
  const user = db.get<any>('users', tx.userId);
  await db.update('transactions', txId, { status: 'Approved / Settled', settledBy: actor, settledTs: Date.now() });
  if (tx.type === 'Deposit' && user) {
    await db.update('users', user.id, { realBalance: Number((user.realBalance + tx.amount).toFixed(2)) });
  }
  await audit(actor, tx.type === 'Deposit' ? 'Deposit Cleared' : 'Withdrawal Authorized',
    tx.type === 'Deposit'
      ? `Approved deposit of ${money(tx.amount)} via ${tx.method} for ${tx.userName}. Funds credited.`
      : `Released disbursement of ${money(tx.amount)} to [${tx.destination || tx.method}] for ${tx.userName}.`,
    'FUNDING', tx.userName);
  if (user) {
    await createMessage({
      userId: user.id,
      category: 'FUNDING',
      direction: 'outbound',
      subject: tx.type === 'Deposit' ? `Funds Credited: Deposit of ${money(tx.amount)} Settled` : `Withdrawal Dispatched: ${money(tx.amount)} Released`,
      body: tx.type === 'Deposit'
        ? `Dear ${user.name},\n\nYour deposit of ${money(tx.amount)} via ${tx.method} has cleared and has been credited to your live balance.\n\nReference: ${tx.reference}\n\nHappy trading,\n${brand()} Treasury Desk`
        : `Dear ${user.name},\n\nYour withdrawal of ${money(tx.amount)} via ${tx.method} has been authorized and dispatched to:\n${tx.destination || tx.method}\n\nReference: ${tx.reference}\n\nDepending on your bank or network, funds usually arrive within 1-3 business days.\n\n${brand()} Treasury Desk`,
    });
  }
}

export async function rejectFunding(txId: string, reason: string, actor: string) {
  const tx = db.get<any>('transactions', txId);
  if (!tx || tx.status !== 'Pending Approval') throw new HttpError(404, 'Pending transaction not found.');
  const user = db.get<any>('users', tx.userId);
  if (tx.type === 'Withdrawal' && user) {
    await db.update('users', user.id, { realBalance: Number((user.realBalance + tx.amount).toFixed(2)) });
  }
  await db.update('transactions', txId, { status: 'Rejected', adminNote: reason });
  await audit(actor, 'Funding Rejected', `Declined ${tx.type} request of ${money(tx.amount)}. Reason: ${reason}`, 'FUNDING', tx.userName);
  if (user) {
    await createMessage({
      userId: user.id,
      category: 'FUNDING',
      direction: 'outbound',
      priority: 'High',
      subject: `${tx.type} Request Declined: ${money(tx.amount)}`,
      body: `Dear ${user.name},\n\nYour ${tx.type.toLowerCase()} request of ${money(tx.amount)} (reference ${tx.reference}) could not be processed.\n\nReason: ${reason}\n${tx.type === 'Withdrawal' ? '\nThe reserved amount has been returned to your available balance.\n' : ''}\nPlease contact ${config.brand.supportEmail} if you need assistance.\n\n${brand()} Treasury Desk`,
    });
  }
}

export async function manualAdjustment(userId: string, amount: number, type: 'Admin Credit' | 'Admin Debit' | 'Bonus', note: string, actor: string, notify = true) {
  const user = db.get<any>('users', userId);
  if (!user) throw new HttpError(404, 'User not found.');
  if (!(amount > 0)) throw new HttpError(400, 'Enter a valid amount.');
  const delta = type === 'Admin Debit' ? -amount : amount;
  const newBalance = Number(Math.max(0, user.realBalance + delta).toFixed(2));
  await db.update('users', userId, { realBalance: newBalance });
  await db.put('transactions', {
    id: newId('TX'),
    userId,
    userName: user.name,
    type,
    amount,
    method: 'Internal Transfer',
    status: 'Approved / Settled',
    reference: shortNumericId('ADJ', id => !!db.find<any>('transactions', t => t.reference === id)),
    date: nowStamp(16),
    ts: Date.now(),
    adminNote: note,
  });
  await audit(actor, `Balance ${type}`, `Applied ${type} of ${money(amount)} to ${user.name}. Previous: ${money(user.realBalance)}, New: ${money(newBalance)}. Reason: ${note}`, 'FUNDING', user.name);
  if (notify) {
    await createMessage({
      userId,
      category: 'FUNDING',
      direction: 'outbound',
      subject: type === 'Admin Debit' ? `Account Debit: ${money(amount)}` : type === 'Bonus' ? `Bonus Credited: ${money(amount)}` : `Account Credit: ${money(amount)}`,
      body: `Dear ${user.name},\n\nA ${type === 'Admin Debit' ? 'debit' : 'credit'} of ${money(amount)} has been applied to your account.\n\nNote: ${note}\nNew available balance: ${money(newBalance)}\n\n${brand()} Treasury Desk`,
    });
  }
}

// ------------------------------------------------------------------
// Payment settings (admin editable, seeded from env)
// ------------------------------------------------------------------
export function getPaymentSettings() {
  const saved = db.get<any>('settings', 'payments');
  return { ...config.payments, ...(saved || {}), id: undefined };
}

export async function savePaymentSettings(patch: Record<string, string>, actor: string) {
  const allowed = Object.keys(config.payments);
  const clean: Record<string, string> = {};
  for (const k of allowed) if (typeof patch[k] === 'string') clean[k] = patch[k].trim();
  const existing = db.get<any>('settings', 'payments') || { id: 'payments' };
  await db.put('settings', { ...existing, ...clean, id: 'payments' });
  await audit(actor, 'Payment Settings Updated', `Updated deposit instructions: ${Object.keys(clean).join(', ')}`, 'FUNDING');
  return getPaymentSettings();
}

export function paymentInstructionsText(method: string, p: any, reference: string) {
  const lines: string[] = [];
  if (method.includes('Crypto')) {
    if (p.usdtTrc20) lines.push(`USDT (TRC20): ${p.usdtTrc20}`);
    if (p.usdtErc20) lines.push(`USDT (ERC20): ${p.usdtErc20}`);
    if (p.btcAddress) lines.push(`Bitcoin (BTC): ${p.btcAddress}`);
    if (p.ethAddress) lines.push(`Ethereum (ETH): ${p.ethAddress}`);
  } else if (method.includes('Card')) {
    if (p.cardPaymentUrl) lines.push(`Complete your card payment here: ${p.cardPaymentUrl}`);
  } else {
    if (p.bankName) lines.push(`Bank: ${p.bankName}`);
    if (p.bankAccountName) lines.push(`Account name: ${p.bankAccountName}`);
    if (p.bankAccountNumber) lines.push(`Account number: ${p.bankAccountNumber}`);
    if (p.bankSortCode) lines.push(`Sort code / routing: ${p.bankSortCode}`);
    if (p.bankIban) lines.push(`IBAN: ${p.bankIban}`);
    if (p.bankSwift) lines.push(`SWIFT/BIC: ${p.bankSwift}`);
  }
  if (!lines.length) return `Our treasury desk will contact you with payment instructions for ${method}. Please quote reference ${reference}.`;
  return `Payment instructions:\n${lines.join('\n')}\nPayment reference: ${reference}\n\n${p.instructions || ''}`.trim();
}

// ------------------------------------------------------------------
// KYC
// ------------------------------------------------------------------
export async function submitKyc(user: any, payload: any) {
  const files = user.kycFiles || {};
  if (!files.front) throw new HttpError(400, 'Please upload the front of your identity document.');
  if (!files.proof) throw new HttpError(400, 'Please upload a proof of address document.');
  if (!files.selfie) throw new HttpError(400, 'Please complete the selfie / liveness step.');
  const required = ['fullName', 'dateOfBirth', 'nationality', 'streetAddress', 'city', 'docType', 'docNumber'];
  for (const k of required) if (!String(payload[k] || '').trim()) throw new HttpError(400, `Missing field: ${k}`);

  await db.update('users', user.id, {
    name: payload.fullName.trim(),
    dateOfBirth: payload.dateOfBirth,
    country: payload.nationality,
    streetAddress: payload.streetAddress,
    city: payload.city,
    postalCode: payload.postalCode || '',
    kycStatus: 'Pending',
    kycDocType: payload.docType,
    kycDocNumber: payload.docNumber,
    kycExpiryDate: payload.docExpiryDate || '',
    kycDocFrontName: payload.docFrontName || '',
    kycDocBackName: payload.docBackName || '',
    kycProofAddressName: payload.proofAddressName || '',
    kycSelfieVerified: true,
    kycSubmittedDate: nowStamp(16),
    kycNotes: 'Documents submitted via client portal - awaiting compliance review.',
  });
  await audit(`Client (${user.name})`, 'KYC Application Submitted', `Client uploaded ${payload.docType} (#${payload.docNumber}), proof of address and selfie.`, 'KYC', `${user.id} (${payload.fullName})`);
  await createMessage({
    userId: user.id,
    category: 'KYC',
    direction: 'outbound',
    subject: 'KYC Documents Received & In Verification Queue',
    body: `Dear ${payload.fullName},\n\nThank you for submitting your verification details.\n\nDocuments received:\n- Identity document: ${payload.docType} (#${payload.docNumber})\n- Proof of address: ${payload.proofAddressName || 'uploaded'}\n- Selfie / liveness check: uploaded\n\nOur compliance team will review your file shortly and you will be notified by email of the outcome.\n\n${brand()} Compliance Desk`,
  });
  notifyAdmins(`KYC submitted by ${payload.fullName}`, `${payload.fullName} (${user.email}, ${user.id}) submitted KYC documents for review.`, { label: 'Open KYC desk', url: adminUrl('kyc') });
}

export async function approveKyc(userId: string, actor: string, promotedTier?: string) {
  const u = db.get<any>('users', userId);
  if (!u) throw new HttpError(404, 'User not found.');
  const nextTier = promotedTier || (u.tier === 'Tier 1 - Standard' ? 'Tier 2 - Verified Pro' : u.tier);
  await db.update('users', userId, {
    kycStatus: 'Approved',
    tier: nextTier,
    allowTrading: true,
    status: u.status === 'Trading Frozen' ? 'Active' : u.status,
    kycNotes: '',
  });
  await audit(actor, 'KYC Certified', `Identity verified. KYC APPROVED. Tier set to ${nextTier}.`, 'KYC', u.name);
  await createMessage({
    userId,
    category: 'KYC',
    direction: 'outbound',
    priority: 'High',
    subject: `Identity Verified: Welcome to ${nextTier}`,
    body: `Dear ${u.name},\n\nCongratulations! Your identity documents and address verification have been approved.\n\nYour account is now ${nextTier}. Deposits, withdrawals and full market access are active.\n\n${brand()} Compliance Desk`,
  });
}

export async function rejectKyc(userId: string, reason: string, actor: string) {
  const u = db.get<any>('users', userId);
  if (!u) throw new HttpError(404, 'User not found.');
  await db.update('users', userId, { kycStatus: 'Rejected', kycNotes: reason });
  await audit(actor, 'KYC Rejected', `Verification documents declined. Reason: ${reason}`, 'KYC', u.name);
  await createMessage({
    userId,
    category: 'KYC',
    direction: 'outbound',
    priority: 'Urgent',
    subject: 'KYC Verification Notice: Application Declined',
    body: `Dear ${u.name},\n\nOur compliance officer reviewed your submitted identification and was unable to approve it for the following reason:\n\n${reason}\n\nPlease make sure your documents are valid, unexpired and clearly legible. Contact ${config.brand.complianceEmail} if you believe this is an error.\n\n${brand()} Compliance Desk`,
    cta: { label: 'Open verification centre', url: portalUrl('kyc') },
  });
}

export async function requestKycResubmit(userId: string, note: string, actor: string) {
  const u = db.get<any>('users', userId);
  if (!u) throw new HttpError(404, 'User not found.');
  await db.update('users', userId, { kycStatus: 'Action Required', kycNotes: note });
  await audit(actor, 'KYC Action Required', `Requested resubmission: ${note}`, 'KYC', u.name);
  await createMessage({
    userId,
    category: 'KYC',
    direction: 'outbound',
    priority: 'Urgent',
    subject: 'Action Required: KYC Verification Update Needed',
    body: `Dear ${u.name},\n\nWe need an updated or clearer document to complete your verification:\n\nCompliance note: ${note}\n\nPlease log in to your client portal and upload the revised file in the Verification Centre.\n\n${brand()} Compliance Desk`,
    cta: { label: 'Upload documents', url: portalUrl('kyc') },
  });
}

// ------------------------------------------------------------------
// State projections
// ------------------------------------------------------------------
const byTsDesc = (a: any, b: any) => (b.ts || 0) - (a.ts || 0);

export function userState(userId: string) {
  const user = db.get<any>('users', userId);
  return {
    user: publicUser(user),
    transactions: db.filter<any>('transactions', t => t.userId === userId).sort(byTsDesc),
    positions: db.filter<any>('positions', p => p.userId === userId).map(valuePosition).sort(byTsDesc),
    emails: messagesForUser(userId),
    copies: db.filter<any>('copies', c => c.userId === userId && c.status === 'Active').map(valueCopy),
    payments: getPaymentSettings(),
  };
}

export function adminState() {
  return {
    users: db.all<any>('users').sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).map(publicUser),
    transactions: db.all<any>('transactions').sort(byTsDesc),
    auditLogs: db.all<any>('auditLogs').sort(byTsDesc).slice(0, 500),
    positions: db.all<any>('positions').map(valuePosition).sort(byTsDesc),
    emails: db.all<any>('emails').sort(byTsDesc),
    copies: db.filter<any>('copies', c => c.status === 'Active').map(valueCopy),
    marketAssets: marketAssets(),
    payments: getPaymentSettings(),
    submissions: db.all<any>('submissions').sort(byTsDesc).slice(0, 200),
  };
}

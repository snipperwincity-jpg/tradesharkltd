import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { db, newId, nowStamp } from '../db';
import { config } from '../config';
import { mailProvider, queueMail } from '../mailer';
import { createMessage, marketSnapshot, getQuote, getMarketSettings } from '../services';
import { rateLimit } from '../rateLimit';
import { INSTRUMENTS, POPULAR_INVESTORS } from '../../src/data/mockData';

export const publicRouter = Router();

publicRouter.get('/health', async (_req, res) => {
  const ok = await db.ping();
  res.status(ok ? 200 : 503).json({ ok, storage: db.mode, mail: mailProvider(), time: new Date().toISOString() });
});

publicRouter.get('/config', (_req, res) => {
  const b = config.brand;
  res.json({
    appName: b.appName,
    legalName: b.legalName,
    tagline: b.tagline,
    appUrl: config.appUrl,
    supportEmail: b.supportEmail,
    complianceEmail: b.complianceEmail,
    pressEmail: b.pressEmail,
    careersEmail: b.careersEmail,
    supportPhone: b.supportPhone,
    whatsapp: b.whatsapp,
    address: b.address,
    companyNumber: b.companyNumber,
    regulatoryText: b.regulatoryText,
    social: b.social,
    apps: b.apps,
    liveChatScript: b.liveChatScript,
    minDeposit: config.minDeposit,
    minWithdrawal: config.minWithdrawal,
    practiceBalance: config.practiceBalance,
    features: {
      demoLogins: config.enableDemoLogins,
      showAdminLink: config.showAdminLink,
      ai: !!config.ai.geminiKey,
      emailVerificationRequired: config.requireEmailVerification,
    },
  });
});

publicRouter.get('/market', (_req, res) => {
  const halted = getMarketSettings();
  res.json({ quotes: marketSnapshot().map(q => ({ ...q, halted: !!halted[q.symbol]?.halted })), time: Date.now() });
});

publicRouter.get('/demo/accounts', (_req, res) => res.json({ enabled: false, admins: [], users: [] }));

// ---------------- Public forms (contact, careers, press, affiliates, newsletter ...) ----------------
const FORM_TYPES: Record<string, { label: string; category: 'SUPPORT' | 'ACCOUNT' | 'MARKET_ALERT'; ack: string }> = {
  contact: { label: 'Contact / Support request', category: 'SUPPORT', ack: 'Our support team has received your message and will reply within one business day.' },
  careers: { label: 'Careers application', category: 'ACCOUNT', ack: 'Thank you for your interest in joining us. Our talent team reviews every application and will be in touch if there is a match.' },
  press: { label: 'Press enquiry', category: 'SUPPORT', ack: 'Our communications team has received your enquiry and will respond shortly.' },
  investors: { label: 'Investor relations enquiry', category: 'SUPPORT', ack: 'Our investor relations team has received your enquiry.' },
  affiliates: { label: 'Affiliate programme application', category: 'ACCOUNT', ack: 'Thanks for applying to our affiliate programme. A partnership manager will review your application within 3 business days.' },
  pro: { label: 'Pro Investor programme application', category: 'ACCOUNT', ack: 'Thanks for applying to the Pro Investor programme. We will review your trading history and get back to you.' },
  club: { label: 'Club membership enquiry', category: 'ACCOUNT', ack: 'Thanks for your interest in the Club. A relationship manager will contact you.' },
  callback: { label: 'Callback request', category: 'SUPPORT', ack: 'A member of our team will call you back at the requested time.' },
  newsletter: { label: 'Newsletter subscription', category: 'MARKET_ALERT', ack: 'You are subscribed to the Daily Digest. You can unsubscribe at any time by replying "unsubscribe".' },
};

publicRouter.post('/forms/:type', rateLimit('forms', 12, 3600), async (req, res) => {
  const type = req.params.type;
  const def = FORM_TYPES[type];
  if (!def) return res.status(404).json({ error: 'Unknown form.' });
  const b = req.body || {};
  if (b.website) return res.json({ ok: true }); // honeypot
  const email = String(b.email || '').trim().toLowerCase();
  const name = String(b.name || '').trim().slice(0, 120) || 'Guest';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });

  if (type === 'newsletter') {
    if (!db.find<any>('subscribers', s => s.email === email)) {
      await db.put('subscribers', { id: newId('SUB'), email, name, createdAt: new Date().toISOString() });
    }
    queueMail({ to: email, subject: `You're subscribed to the ${config.brand.appName} Daily Digest`, fromName: 'Research Desk', text: `Hi ${name === 'Guest' ? 'there' : name},\n\n${def.ack}\n\nThe ${config.brand.appName} Research Desk` });
    return res.json({ ok: true, message: def.ack });
  }

  const fields = Object.entries(b)
    .filter(([k, v]) => !['website'].includes(k) && typeof v === 'string' && v.trim())
    .map(([k, v]) => `${k}: ${String(v).slice(0, 3000)}`)
    .join('\n');
  const submission = { id: newId('SUBM'), type, label: def.label, name, email, fields: b, createdAt: new Date().toISOString(), ts: Date.now(), date: nowStamp(16) };
  await db.put('submissions', submission);

  // Show in the admin inbound inbox (admin can reply straight from the console) + email the back office.
  await createMessage({
    userId: 'GUEST',
    userName: name,
    toEmail: email,
    subject: `${def.label}: ${String(b.subject || b.role || b.company || name).slice(0, 120)}`,
    body: fields,
    category: def.category === 'MARKET_ALERT' ? 'SUPPORT' : def.category,
    direction: 'inbound',
  });
  queueMail({
    to: email,
    subject: `We received your ${def.label.toLowerCase()}`,
    fromName: 'Support',
    text: `Hi ${name === 'Guest' ? 'there' : name},\n\n${def.ack}\n\nReference: ${submission.id}\n\nFor urgent matters you can reach us at ${config.brand.supportEmail}${config.brand.supportPhone ? ` or ${config.brand.supportPhone}` : ''}.\n\nThe ${config.brand.appName} Team`,
  });
  res.json({ ok: true, message: def.ack, reference: submission.id });
});

// ---------------- Shark AI ----------------
let ai: GoogleGenAI | null = null;
const getAi = () => {
  if (!config.ai.geminiKey) return null;
  if (!ai) ai = new GoogleGenAI({ apiKey: config.ai.geminiKey });
  return ai;
};

const symbolsIn = (text: string) => {
  const upper = ` ${text.toUpperCase()} `;
  const found = INSTRUMENTS.find(i => upper.includes(` ${i.symbol.toUpperCase()} `) || upper.includes(`(${i.symbol.toUpperCase()})`) || text.toLowerCase().includes(i.name.toLowerCase().split(' ')[0].toLowerCase()) && i.name.length > 4);
  return found?.symbol;
};

function fallbackReply(q: string) {
  const lower = q.toLowerCase();
  const sym = symbolsIn(q);
  if (sym) {
    const quote = getQuote(sym)!;
    const inst = INSTRUMENTS.find(i => i.symbol === sym)!;
    return { reply: `${inst.name} (${sym}) is trading at $${quote.price.toLocaleString()} on ${config.brand.appName} right now. You can open a commission-free position, set a stop-loss, or add it to a watchlist from the trade ticket. Remember that prices can move quickly - only invest what you can afford to lose.`, symbol: sym };
  }
  if (lower.includes('copy') || lower.includes('investor')) {
    const top = [...POPULAR_INVESTORS].sort((a, b) => b.return24M - a.return24M)[0];
    return { reply: `CopyTrader lets you automatically mirror a Popular Investor's trades in proportion to the amount you allocate (minimum $200). The highest 24-month return on our leaderboard right now is ${top.name} (${top.handle}) at +${top.return24M}% with a risk score of ${top.riskScore}/10. Past performance is not a reliable indicator of future results.` };
  }
  if (lower.includes('fee') || lower.includes('cost') || lower.includes('commission')) {
    return { reply: `${config.brand.appName} offers commission-free stock and ETF investing, tight spreads on crypto (from 0.30%), and no account management fees. Overnight financing applies to leveraged positions. See the full fee schedule at ${config.appUrl}/fees.` };
  }
  if (lower.includes('deposit') || lower.includes('fund')) {
    return { reply: `You can fund your account by bank wire, local faster payments, card or crypto from the Deposit tab of your client portal. The minimum deposit is $${config.minDeposit}. Deposits are credited as soon as our treasury desk confirms receipt.` };
  }
  if (lower.includes('kyc') || lower.includes('verify') || lower.includes('verification')) {
    return { reply: 'To verify your account, open the Verification Centre in your client portal and upload a government-issued ID, a proof of address dated within 90 days, and a quick selfie. Most applications are reviewed within one business day.' };
  }
  return { reply: `I can help with market prices, CopyTrader, fees, deposits and account verification on ${config.brand.appName}. Try asking about a specific ticker such as NVDA, BTC or EUR/USD.` };
}

publicRouter.post('/ai/chat', rateLimit('ai', 40, 600), async (req, res) => {
  const message = String(req.body?.message || '').slice(0, 1500);
  const history = Array.isArray(req.body?.history) ? req.body.history.slice(-10) : [];
  if (!message.trim()) return res.status(400).json({ error: 'Empty message.' });

  const client = getAi();
  if (!client) return res.json({ ...fallbackReply(message), source: 'builtin' });

  try {
    const quotes = marketSnapshot().map(q => `${q.symbol}: $${q.price} (${q.deltaPercent >= 0 ? '+' : ''}${q.deltaPercent}%)`).join(', ');
    const investors = POPULAR_INVESTORS.map(i => `${i.name} ${i.handle} +${i.return24M}% 24M, risk ${i.riskScore}/10, ${i.copiers} copiers`).join('; ');
    const systemInstruction = `You are Shark AI, the assistant for ${config.brand.appName} (${config.appUrl}), a multi-asset trading platform (stocks, ETFs, crypto, commodities, indices, currencies, CopyTrader).
Be concise (max ~120 words), friendly and factual. Never promise returns or give personalised financial advice; add a brief risk reminder when discussing specific trades.
Current platform prices: ${quotes}.
Popular investors: ${investors}.
Platform facts: commission-free stocks & ETFs, crypto spreads from 0.30%, minimum deposit $${config.minDeposit}, practice account with $${config.practiceBalance.toLocaleString()} virtual funds, support email ${config.brand.supportEmail}.`;
    const contents = [
      ...history.map((h: any) => ({ role: h.sender === 'user' ? 'user' : 'model', parts: [{ text: String(h.text || '').slice(0, 1500) }] })),
      { role: 'user', parts: [{ text: message }] },
    ];
    const out = await client.models.generateContent({ model: config.ai.model, contents, config: { systemInstruction, temperature: 0.5 } });
    const reply = (out.text || '').trim() || fallbackReply(message).reply;
    res.json({ reply, symbol: symbolsIn(message) || symbolsIn(reply), source: 'gemini' });
  } catch (e: any) {
    console.error('[ai] gemini error', e?.message || e);
    res.json({ ...fallbackReply(message), source: 'builtin' });
  }
});

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  UserAccount,
  FundingTransaction,
  AuditLog,
  UserPosition,
  UserTier,
  AccountStatus,
  EmailMessage,
  KycSubmissionPayload,
  Instrument,
} from '../types';
import { api, errMsg } from '../lib/api';
import { INSTRUMENTS } from '../data/mockData';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
export interface SiteConfig {
  appName: string;
  legalName: string;
  tagline: string;
  appUrl: string;
  supportEmail: string;
  complianceEmail: string;
  pressEmail: string;
  careersEmail: string;
  supportPhone: string;
  whatsapp: string;
  address: string;
  companyNumber: string;
  regulatoryText: string;
  social: Record<'facebook' | 'instagram' | 'linkedin' | 'x' | 'youtube' | 'telegram', string>;
  apps: { ios: string; android: string };
  liveChatScript: string;
  minDeposit: number;
  minWithdrawal: number;
  practiceBalance: number;
  features: { demoLogins: boolean; showAdminLink: boolean; ai: boolean; emailVerificationRequired: boolean };
}

export interface AdminSession {
  id: string;
  username: string;
  role: string;
  name: string;
  email: string;
  expiresAt: number;
}

export interface CopyPortfolio {
  id: string;
  userId: string;
  investorId: string;
  name: string;
  handle: string;
  riskScore: number;
  allocated: number;
  currentValue: number;
  profit: number;
  profitPercent: number;
  stopLossPercent: number;
  status: string;
  startedDate: string;
}

export interface MarketAsset {
  symbol: string;
  name: string;
  category: string;
  price: number;
  spread: string;
  status: string;
  halted: boolean;
}

export type PaymentSettings = Record<string, string>;

export interface Toast { id: number; text: string; type: 'success' | 'error' | 'info' }

const DEFAULT_CONFIG: SiteConfig = {
  appName: 'TradeShark',
  legalName: 'TradeShark Ltd',
  tagline: 'Trade and invest in stocks, crypto, ETFs and more',
  appUrl: typeof window !== 'undefined' ? window.location.origin : '',
  supportEmail: '',
  complianceEmail: '',
  pressEmail: '',
  careersEmail: '',
  supportPhone: '',
  whatsapp: '',
  address: '',
  companyNumber: '',
  regulatoryText: '',
  social: { facebook: '', instagram: '', linkedin: '', x: '', youtube: '', telegram: '' },
  apps: { ios: '', android: '' },
  liveChatScript: '',
  minDeposit: 100,
  minWithdrawal: 50,
  practiceBalance: 100000,
  features: { demoLogins: false, showAdminLink: true, ai: false, emailVerificationRequired: false },
};

interface BrokerageContextType {
  ready: boolean;
  config: SiteConfig;
  instruments: Instrument[];
  users: UserAccount[];
  currentUser: UserAccount | null;
  adminSession: AdminSession | null;
  transactions: FundingTransaction[];
  auditLogs: AuditLog[];
  positions: UserPosition[];
  emails: EmailMessage[];
  copies: CopyPortfolio[];
  marketAssets: MarketAsset[];
  payments: PaymentSettings;
  toasts: Toast[];
  notify: (text: string, type?: Toast['type']) => void;
  refresh: () => Promise<void>;

  // Auth
  loginUser: (identifier: string, password: string, remember: boolean) => Promise<UserAccount>;
  registerUser: (data: { name: string; email: string; password: string; phone?: string; country?: string; ref?: string }) => Promise<UserAccount>;
  logoutUser: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: () => Promise<string>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateProfile: (patch: Partial<UserAccount>) => Promise<void>;
  loginAdmin: (username: string, password: string, remember: boolean) => Promise<AdminSession>;
  logoutAdmin: () => Promise<void>;

  // Admin: users
  setCurrentUserId: (id: string) => void; // admin impersonation
  createUser: (userData: Omit<UserAccount, 'id' | 'joinedDate' | 'lastIp'>) => Promise<UserAccount>;
  updateUser: (id: string, updates: Partial<UserAccount>, reason?: string) => Promise<void>;
  setUserStatus: (id: string, status: AccountStatus, reason?: string) => void;
  toggleTradingPermission: (id: string, permission: 'allowTrading' | 'allowShorting' | 'allowCrypto') => void;
  updateUserTier: (id: string, tier: UserTier) => void;
  updateUserLeverage: (id: string, leverage: number) => void;
  sendPasswordReset: (id: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // KYC
  approveKyc: (id: string, promotedTier?: UserTier) => void;
  rejectKyc: (id: string, reason: string) => void;
  requestKycResubmit: (id: string, note: string) => void;
  updateAmlRisk: (id: string, risk: 'Low' | 'Medium' | 'High') => void;
  uploadKycFile: (kind: 'front' | 'back' | 'proof' | 'selfie', file: File | Blob, filename?: string) => Promise<{ id: string; filename: string }>;
  submitKycApplication: (payload: KycSubmissionPayload) => Promise<void>;

  // Funding
  approveFunding: (txId: string) => void;
  rejectFunding: (txId: string, reason: string) => void;
  manualBalanceAdjustment: (userId: string, amount: number, type: 'Admin Credit' | 'Admin Debit' | 'Bonus', note: string) => void;
  submitDeposit: (amount: number, method: FundingTransaction['method'], note?: string) => Promise<FundingTransaction>;
  submitWithdrawal: (amount: number, method: FundingTransaction['method'], destination: string) => Promise<FundingTransaction>;
  savePayments: (patch: PaymentSettings) => Promise<void>;

  // Messaging
  sendEmail: (email: Omit<EmailMessage, 'id' | 'date' | 'read'> & { replyToId?: string }) => Promise<EmailMessage>;
  markEmailAsRead: (emailId: string) => void;
  deleteEmail: (emailId: string) => void;

  // Trading
  closePosition: (posId: string) => void;
  openPosition: (symbol: string, type: 'BUY' | 'SELL', amount: number, leverage?: number) => Promise<UserPosition>;
  startCopy: (investorId: string | number, amount: number, stopLossPercent: number, copyOpenTrades: boolean) => Promise<void>;
  stopCopy: (copyId: string) => Promise<void>;
  toggleAssetHalt: (symbol: string, halted: boolean) => void;
  resetPractice: () => Promise<void>;
}

const BrokerageContext = createContext<BrokerageContextType | undefined>(undefined);

export const BrokerageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [adminData, setAdminData] = useState<any>(null);
  const [quotes, setQuotes] = useState<Record<string, { price: number; deltaPercent: number; halted: boolean }>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const notify = useCallback((text: string, type: Toast['type'] = 'success') => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, []);

  const applyUserState = (s: any) => {
    if (!s) return;
    setUserData(s);
    if (s.user) setCurrentUser(s.user);
  };

  const loadUser = useCallback(async () => {
    try {
      const s = await api.get('/api/me/state');
      applyUserState(s);
    } catch (e: any) {
      if (e?.status === 401 || e?.status === 403) { setCurrentUser(null); setUserData(null); }
    }
  }, []);

  const loadAdmin = useCallback(async () => {
    try {
      const s = await api.get('/api/admin/state');
      setAdminData(s);
    } catch (e: any) {
      if (e?.status === 401) { setAdminSession(null); setAdminData(null); }
    }
  }, []);

  const loadQuotes = useCallback(async () => {
    try {
      const r = await api.get('/api/market');
      const map: Record<string, any> = {};
      for (const q of r.quotes) map[q.symbol] = q;
      setQuotes(map);
    } catch { /* offline */ }
  }, []);

  // Boot
  useEffect(() => {
    (async () => {
      try {
        const [cfg, me, adm] = await Promise.all([
          api.get('/api/config').catch(() => null),
          api.get('/api/auth/me').catch(() => ({ user: null })),
          api.get('/api/auth/admin/me').catch(() => ({ admin: null })),
        ]);
        if (cfg) {
          setConfig({ ...DEFAULT_CONFIG, ...cfg });
          document.title = `${cfg.appName} | ${cfg.tagline}`;
        }
        if (me?.user) {
          setCurrentUser(me.user);
          await loadUser();
        }
        if (adm?.admin) {
          setAdminSession({ ...adm.admin, expiresAt: adm.expiresAt });
          await loadAdmin();
        }
        await loadQuotes();
      } finally {
        setReady(true);
      }
    })();
  }, [loadUser, loadAdmin, loadQuotes]);

  const refresh = useCallback(async () => {
    await Promise.all([currentUser ? loadUser() : Promise.resolve(), adminSession ? loadAdmin() : Promise.resolve(), loadQuotes()]);
  }, [currentUser, adminSession, loadUser, loadAdmin, loadQuotes]);

  // Background polling keeps balances, approvals and prices in sync across portals.
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, 15000);
    return () => clearInterval(t);
  }, [refresh]);

  // ------------------------------------------------------------------
  // Derived collections: admin view is a superset of the client view.
  // ------------------------------------------------------------------
  const src = adminData || userData || {};
  const users: UserAccount[] = adminData?.users || (currentUser ? [currentUser] : []);
  const transactions: FundingTransaction[] = src.transactions || [];
  const auditLogs: AuditLog[] = adminData?.auditLogs || [];
  const positions: UserPosition[] = src.positions || [];
  const copies: CopyPortfolio[] = src.copies || [];
  const marketAssets: MarketAsset[] = adminData?.marketAssets || [];
  const payments: PaymentSettings = src.payments || {};
  // Clients need per-user read flags on broadcasts, so the client inbox always uses the client projection.
  const emails: EmailMessage[] = useMemo(() => {
    if (adminData && userData) {
      const own = new Map((userData.emails || []).map((e: any) => [e.id, e]));
      return (adminData.emails || []).map((e: any) => own.get(e.id) || e);
    }
    return src.emails || [];
  }, [adminData, userData]);

  const instruments: Instrument[] = useMemo(
    () => INSTRUMENTS.map(i => (quotes[i.symbol] ? { ...i, price: quotes[i.symbol].price, deltaPercent: quotes[i.symbol].deltaPercent } : i)),
    [quotes]
  );

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------
  const adminAct = (fn: () => Promise<any>, success?: string) => {
    fn()
      .then((r: any) => {
        if (r?.state) setAdminData(r.state);
        else loadAdmin();
        if (currentUser) loadUser();
        if (success) notify(success);
      })
      .catch(e => notify(errMsg(e), 'error'));
  };

  // ------------------------------------------------------------------
  // Auth
  // ------------------------------------------------------------------
  const loginUser = async (identifier: string, password: string, remember: boolean) => {
    const r = await api.post('/api/auth/login', { identifier, password, remember });
    setCurrentUser(r.user);
    await loadUser();
    return r.user as UserAccount;
  };

  const registerUser: BrokerageContextType['registerUser'] = async (data) => {
    const ref = data.ref || new URLSearchParams(window.location.search).get('ref') || sessionStorageSafeGet('ts_ref') || undefined;
    const r = await api.post('/api/auth/register', { ...data, ref, remember: true });
    setCurrentUser(r.user);
    await loadUser();
    return r.user as UserAccount;
  };

  const logoutUser = async () => {
    await api.post('/api/auth/logout').catch(() => undefined);
    setCurrentUser(null);
    setUserData(null);
  };

  const requestPasswordReset = async (email: string) => {
    const r = await api.post('/api/auth/forgot-password', { email });
    return r.message as string;
  };

  const resetPassword = async (token: string, password: string) => {
    const r = await api.post('/api/auth/reset-password', { token, password });
    if (r.user) { setCurrentUser(r.user); await loadUser(); }
  };

  const verifyEmail = async (token: string) => {
    await api.post('/api/auth/verify-email', { token });
    if (currentUser) await loadUser();
  };

  const resendVerification = async () => (await api.post('/api/auth/resend-verification')).message as string;

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await api.post('/api/auth/change-password', { currentPassword, newPassword });
  };

  const updateProfile = async (patch: Partial<UserAccount>) => {
    const r = await api.post('/api/auth/profile', patch);
    setCurrentUser(r.user);
    await loadUser();
  };

  const loginAdmin = async (username: string, password: string, remember: boolean) => {
    const r = await api.post('/api/auth/admin/login', { username, password, remember });
    const session = { ...r.admin, expiresAt: r.expiresAt } as AdminSession;
    setAdminSession(session);
    await loadAdmin();
    return session;
  };

  const logoutAdmin = async () => {
    await api.post('/api/auth/admin/logout').catch(() => undefined);
    setAdminSession(null);
    setAdminData(null);
  };

  // ------------------------------------------------------------------
  // Admin: users
  // ------------------------------------------------------------------
  const setCurrentUserId = (id: string) => {
    if (!adminSession) return;
    api.post(`/api/admin/users/${id}/impersonate`)
      .then(async (r) => {
        setCurrentUser(r.user);
        await loadUser();
        notify(`Client portal opened as ${r.user.name}`, 'info');
      })
      .catch(e => notify(errMsg(e), 'error'));
  };

  const createUser = async (userData: Omit<UserAccount, 'id' | 'joinedDate' | 'lastIp'>) => {
    const r = await api.post('/api/admin/users', userData);
    setAdminData(r.state);
    return r.user as UserAccount;
  };

  const updateUser = async (id: string, updates: Partial<UserAccount>, reason?: string) => {
    const r = await api.patch(`/api/admin/users/${id}`, { ...updates, reason });
    setAdminData(r.state);
    if (currentUser?.id === id) loadUser();
  };

  const patchUser = (id: string, updates: Partial<UserAccount>, success?: string, reason?: string) =>
    adminAct(() => api.patch(`/api/admin/users/${id}`, { ...updates, reason }), success);

  const setUserStatus = (id: string, status: AccountStatus, reason?: string) => patchUser(id, { status }, undefined, reason);
  const toggleTradingPermission = (id: string, permission: 'allowTrading' | 'allowShorting' | 'allowCrypto') => {
    const u = users.find(x => x.id === id);
    if (!u) return;
    patchUser(id, { [permission]: !u[permission] } as any);
  };
  const updateUserTier = (id: string, tier: UserTier) => patchUser(id, { tier });
  const updateUserLeverage = (id: string, leverage: number) => patchUser(id, { leverage });
  const updateAmlRisk = (id: string, amlRisk: 'Low' | 'Medium' | 'High') => patchUser(id, { amlRisk });

  const sendPasswordReset = async (id: string) => {
    await api.post(`/api/admin/users/${id}/password-reset`);
    notify('Password reset link emailed to the client');
  };

  const deleteUser = async (id: string) => {
    const r = await api.del(`/api/admin/users/${id}`);
    setAdminData(r.state);
  };

  // ------------------------------------------------------------------
  // KYC
  // ------------------------------------------------------------------
  const approveKyc = (id: string, promotedTier?: UserTier) => adminAct(() => api.post(`/api/admin/users/${id}/kyc/approve`, { tier: promotedTier }));
  const rejectKyc = (id: string, reason: string) => adminAct(() => api.post(`/api/admin/users/${id}/kyc/reject`, { reason }));
  const requestKycResubmit = (id: string, note: string) => adminAct(() => api.post(`/api/admin/users/${id}/kyc/resubmit`, { note }));

  const uploadKycFile: BrokerageContextType['uploadKycFile'] = async (kind, file, filename) => {
    const r = await api.upload(`/api/me/kyc/upload/${kind}`, file, filename);
    return r.file;
  };

  const submitKycApplication = async (payload: KycSubmissionPayload) => {
    const r = await api.post('/api/me/kyc/submit', payload);
    applyUserState(r.state);
    if (adminSession) loadAdmin();
  };

  // ------------------------------------------------------------------
  // Funding
  // ------------------------------------------------------------------
  const approveFunding = (txId: string) => adminAct(() => api.post(`/api/admin/transactions/${txId}/approve`));
  const rejectFunding = (txId: string, reason: string) => adminAct(() => api.post(`/api/admin/transactions/${txId}/reject`, { reason }));
  const manualBalanceAdjustment = (userId: string, amount: number, type: 'Admin Credit' | 'Admin Debit' | 'Bonus', note: string) =>
    adminAct(() => api.post(`/api/admin/users/${userId}/adjust`, { amount, type, note }));

  const submitDeposit = async (amount: number, method: FundingTransaction['method'], note?: string) => {
    const r = await api.post('/api/me/deposits', { amount, method, note });
    applyUserState(r.state);
    if (adminSession) loadAdmin();
    return r.transaction as FundingTransaction;
  };

  const submitWithdrawal = async (amount: number, method: FundingTransaction['method'], destination: string) => {
    const r = await api.post('/api/me/withdrawals', { amount, method, destination });
    applyUserState(r.state);
    if (adminSession) loadAdmin();
    return r.transaction as FundingTransaction;
  };

  const savePayments = async (patch: PaymentSettings) => {
    const r = await api.put('/api/admin/settings/payments', patch);
    setAdminData(r.state);
  };

  // ------------------------------------------------------------------
  // Messaging
  // ------------------------------------------------------------------
  const sendEmail: BrokerageContextType['sendEmail'] = async (email) => {
    if (email.direction === 'inbound') {
      const r = await api.post('/api/me/messages', { subject: email.subject, body: email.body, category: email.category });
      applyUserState(r.state);
      if (adminSession) loadAdmin();
      return r.message;
    }
    const angle = /<([^>]+)>/.exec(email.to || '');
    const r = await api.post('/api/admin/messages', {
      userId: email.userId,
      subject: email.subject,
      body: email.body,
      category: email.category,
      priority: email.priority,
      replyToId: email.replyToId,
      toEmail: angle ? angle[1] : (email.to && email.to.includes('@') ? email.to : undefined),
    });
    setAdminData(r.state);
    if (currentUser) loadUser();
    return r.message;
  };

  const markEmailAsRead = (emailId: string) => {
    const e = emails.find(x => x.id === emailId);
    const asClient = currentUser && e && (e.userId === currentUser.id || e.userId === 'ALL') && e.direction === 'outbound';
    const url = asClient ? `/api/me/messages/${emailId}/read` : `/api/admin/messages/${emailId}/read`;
    // optimistic update
    setUserData((d: any) => d ? { ...d, emails: d.emails.map((m: any) => m.id === emailId ? { ...m, read: true } : m) } : d);
    setAdminData((d: any) => d && !asClient ? { ...d, emails: d.emails.map((m: any) => m.id === emailId ? { ...m, read: true } : m) } : d);
    api.post(url).catch(() => undefined);
  };

  const deleteEmail = (emailId: string) => adminAct(() => api.del(`/api/admin/messages/${emailId}`));

  // ------------------------------------------------------------------
  // Trading
  // ------------------------------------------------------------------
  const closePosition = (posId: string) => {
    const own = userData?.positions?.some((p: any) => p.id === posId);
    const req = own ? api.post(`/api/me/positions/${posId}/close`) : api.post(`/api/admin/positions/${posId}/close`);
    req
      .then((r: any) => {
        if (own) applyUserState(r.state); else setAdminData(r.state);
        if (own && adminSession) loadAdmin();
        if (!own && currentUser) loadUser();
        const profit = r.profit ?? 0;
        notify(own ? `Position closed. Realized P&L: ${profit >= 0 ? '+' : ''}$${Number(profit).toFixed(2)}` : 'Position closed');
      })
      .catch(e => notify(errMsg(e), 'error'));
  };

  const openPosition = async (symbol: string, type: 'BUY' | 'SELL', amount: number, leverage = 1) => {
    const r = await api.post('/api/me/positions', { symbol, type, amount, leverage });
    applyUserState(r.state);
    if (adminSession) loadAdmin();
    return r.position as UserPosition;
  };

  const startCopy = async (investorId: string | number, amount: number, stopLossPercent: number, copyOpenTrades: boolean) => {
    const r = await api.post('/api/me/copies', { investorId: String(investorId), amount, stopLossPercent, copyOpenTrades });
    applyUserState(r.state);
  };

  const stopCopy = async (copyId: string) => {
    const r = await api.post(`/api/me/copies/${copyId}/stop`);
    applyUserState(r.state);
  };

  const toggleAssetHalt = (symbol: string, halted: boolean) =>
    adminAct(() => api.post(`/api/admin/markets/${encodeURIComponent(symbol)}/halt`, { halted }), `${symbol} trading ${halted ? 'halted' : 'resumed'}`);

  const resetPractice = async () => {
    const r = await api.post('/api/me/practice/reset');
    applyUserState(r.state);
  };

  return (
    <BrokerageContext.Provider value={{
      ready, config, instruments, users, currentUser, adminSession, transactions, auditLogs, positions, emails, copies,
      marketAssets, payments, toasts, notify, refresh,
      loginUser, registerUser, logoutUser, requestPasswordReset, resetPassword, verifyEmail, resendVerification,
      changePassword, updateProfile, loginAdmin, logoutAdmin,
      setCurrentUserId, createUser, updateUser, setUserStatus, toggleTradingPermission, updateUserTier, updateUserLeverage,
      sendPasswordReset, deleteUser,
      approveKyc, rejectKyc, requestKycResubmit, updateAmlRisk, uploadKycFile, submitKycApplication,
      approveFunding, rejectFunding, manualBalanceAdjustment, submitDeposit, submitWithdrawal, savePayments,
      sendEmail, markEmailAsRead, deleteEmail,
      closePosition, openPosition, startCopy, stopCopy, toggleAssetHalt, resetPractice,
    }}>
      {children}
    </BrokerageContext.Provider>
  );
};

function sessionStorageSafeGet(k: string) {
  try { return sessionStorage.getItem(k); } catch { return null; }
}

export const useBrokerage = (): BrokerageContextType => {
  const context = useContext(BrokerageContext);
  if (!context) throw new Error('useBrokerage must be used within a BrokerageProvider');
  return context;
};

export const useSiteConfig = () => useBrokerage().config;

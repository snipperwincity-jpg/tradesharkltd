import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  Users, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  FileText, 
  RefreshCw, 
  Search, 
  Lock, 
  Unlock,
  ArrowUpRight, 
  ArrowDownLeft,
  Database, 
  BarChart3, 
  Edit2, 
  DollarSign, 
  UserPlus, 
  PlusCircle, 
  Check, 
  Filter, 
  AlertCircle,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Building,
  Key,
  Copy,
  Mail,
  Zap,
  Server,
  Sparkles,
  LogOut,
  Clock
} from 'lucide-react';
import { TradeSharkLogo } from './TradeSharkLogo';
import { useBrokerage } from '../context/BrokerageContext';
import { UserAccount, UserTier, AccountStatus, FundingTransaction } from '../types';
import { AdminSidebar, AdminTab } from './AdminPortal/AdminSidebar';
import { AdminEmailsTab } from './AdminPortal/AdminEmailsTab';
import { AdminKycInspectorModal } from './AdminPortal/AdminKycInspectorModal';
import { AdminLoginGate, AdminSession } from './AdminPortal/AdminLoginGate';

interface AdminPortalModalProps {
  isOpen: boolean;
  initialTab?: string;
  onClose: () => void;
  onSwitchToUserDashboard?: () => void;
}

const ADMIN_TABS: AdminTab[] = ['overview', 'users', 'setup', 'kyc', 'funding', 'emails', 'markets', 'audit', 'settings'];

export const AdminPortalModal: React.FC<AdminPortalModalProps> = (props) =>
  props.isOpen ? <AdminPortalInner {...props} /> : null;

const AdminPortalInner: React.FC<AdminPortalModalProps> = ({ 
  initialTab,
  onClose,
  onSwitchToUserDashboard
}) => {
  const {
    users,
    currentUser,
    setCurrentUserId,
    transactions,
    auditLogs,
    emails,
    positions,
    marketAssets,
    payments,
    createUser,
    setUserStatus,
    toggleTradingPermission,
    updateUserTier,
    updateUserLeverage,
    approveKyc,
    rejectKyc,
    requestKycResubmit,
    updateAmlRisk,
    approveFunding,
    rejectFunding,
    manualBalanceAdjustment,
    adminSession: ctxAdmin,
    logoutAdmin,
    toggleAssetHalt,
    savePayments,
    sendPasswordReset,
    deleteUser,
    closePosition,
    refresh,
    notify
  } = useBrokerage();

  const [activeTab, setActiveTab] = useState<AdminTab>(() => (ADMIN_TABS.includes(initialTab as AdminTab) ? initialTab as AdminTab : 'overview'));
  const [notification, setNotification] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AccountStatus>('ALL');
  const [copiedLink, setCopiedLink] = useState(false);

  // Admin session comes from the server (HTTP-only cookie)
  const adminSession: AdminSession | null = ctxAdmin
    ? { username: ctxAdmin.username, role: ctxAdmin.role, name: ctxAdmin.name, loginTime: Date.now(), expiresAt: ctxAdmin.expiresAt, sessionType: '24h', token: 'cookie' }
    : null;
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);

  React.useEffect(() => {
    if (!ctxAdmin) return;
    const interval = setInterval(() => {
      if (Date.now() >= ctxAdmin.expiresAt) handleLogout(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [ctxAdmin]);

  const handleLogout = async (wasExpired = false) => {
    await logoutAdmin();
    if (wasExpired) setSessionExpiredNotice(true);
  };

  // Selected User for Deep Account Control
  const [inspectingUser, setInspectingUser] = useState<UserAccount | null>(null);

  // Selected User for KYC Document Vault Inspector
  const [selectedKycInspectorUser, setSelectedKycInspectorUser] = useState<UserAccount | null>(null);

  // Manual Balance Adjustment Modal
  const [balanceModalUser, setBalanceModalUser] = useState<UserAccount | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('1000');
  const [adjustType, setAdjustType] = useState<'Admin Credit' | 'Admin Debit' | 'Bonus'>('Admin Credit');
  const [adjustNote, setAdjustNote] = useState('Administrative balance adjustment authorized by treasury');

  // KYC Rejection / Resubmit Modal
  const [kycActionModal, setKycActionModal] = useState<{
    user: UserAccount;
    mode: 'reject' | 'resubmit';
  } | null>(null);
  const [kycReason, setKycReason] = useState('Document expired or unreadable text');

  // New User Setup Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserCountry, setNewUserCountry] = useState('United Kingdom');
  const [newUserTier, setNewUserTier] = useState<UserTier>('Tier 2 - Verified Pro');
  const [newUserCurrency, setNewUserCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [newUserBalance, setNewUserBalance] = useState('25000');
  const [newUserLeverage, setNewUserLeverage] = useState('100');
  const [newUserDocType, setNewUserDocType] = useState<UserAccount['kycDocType']>('Passport');
  const [newUserDocNum, setNewUserDocNum] = useState('GB-7718290');
  const [newUserAutoVerify, setNewUserAutoVerify] = useState(true);
  const [newUserAllowTrading, setNewUserAllowTrading] = useState(true);
  const [newUserAllowShorting, setNewUserAllowShorting] = useState(true);
  const [newUserAllowCrypto, setNewUserAllowCrypto] = useState(true);
  const [newUserAccountManager, setNewUserAccountManager] = useState('David Sterling');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const toggleHalt = (symbol: string) => {
    const asset = marketAssets.find(a => a.symbol === symbol);
    if (asset) toggleAssetHalt(symbol, !asset.halted);
  };

  // Pending counts
  const pendingKycCount = users.filter(u => u.kycStatus === 'Pending' || u.kycStatus === 'Under Review').length;
  const pendingFundingCount = transactions.filter(t => t.status === 'Pending Approval').length;

  // Handle New User Creation
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    let created: UserAccount;
    try {
    created = await createUser({
      name: newUserName,
      email: newUserEmail,
      phone: newUserPhone,
      country: newUserCountry,
      tier: newUserTier,
      currency: newUserCurrency,
      realBalance: parseFloat(newUserBalance) || 0,
      virtualBalance: 100000,
      kycStatus: newUserAutoVerify ? 'Approved' : 'Pending',
      kycDocType: newUserDocType,
      kycDocNumber: newUserDocNum || 'DOC-AUTO-GEN',
      kycSubmittedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      amlRisk: 'Low',
      pepWatchlistHit: false,
      status: 'Active',
      role: newUserTier.includes('VIP') ? 'VIP Client' : 'Trader',
      leverage: parseInt(newUserLeverage, 10) || 100,
      allowTrading: newUserAllowTrading,
      allowShorting: newUserAllowShorting,
      allowCrypto: newUserAllowCrypto,
      maxPositionLimit: newUserTier.includes('VIP') ? 1000000 : 250000,
      accountManager: newUserAccountManager
    });
    } catch (err: any) {
      showToast(err?.message || 'Could not create account');
      return;
    }

    showToast(`Account provisioned for ${created.name} (${created.id}). A set-password email has been sent.`);
    // Reset form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserBalance('25000');
    setActiveTab('users');
  };

  // Handle Manual Balance Adjustment
  const handleExecuteBalanceAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceModalUser) return;
    const amt = parseFloat(adjustAmount);
    if (isNaN(amt) || amt <= 0) return;

    manualBalanceAdjustment(balanceModalUser.id, amt, adjustType, adjustNote);
    showToast(`Successfully executed ${adjustType} of $${amt.toLocaleString()} for ${balanceModalUser.name}`);
    setBalanceModalUser(null);
  };

  // Handle KYC Action submit
  const handleExecuteKycAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycActionModal) return;

    if (kycActionModal.mode === 'reject') {
      rejectKyc(kycActionModal.user.id, kycReason);
      showToast(`KYC Rejected for ${kycActionModal.user.name}`);
    } else {
      requestKycResubmit(kycActionModal.user.id, kycReason);
      showToast(`Requested KYC Resubmission from ${kycActionModal.user.name}`);
    }
    setKycActionModal(null);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const unreadInquiriesCount = emails.filter(
    e => !e.read && !e.isRead && (e.userId !== 'ALL' && !e.to.includes('All'))
  ).length;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/admin`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const tabTitles: Record<AdminTab, { title: string; subtitle: string }> = {
    overview: { title: 'Executive Overview & Broker Operations', subtitle: 'Global order flow, liquidity matching, and institutional capital tracking' },
    users: { title: 'User Account Registry & Permissions', subtitle: 'Real-time trader governance, balance adjustments, and risk tiers' },
    setup: { title: 'Setup & Provision Account', subtitle: 'Direct onboarding for institutional, VIP, and accredited retail traders' },
    kyc: { title: 'KYC & Biometrics Verification Desk', subtitle: 'Passport, ID, address and selfie verification audit' },
    funding: { title: 'Funding Approvals & Capital Queue', subtitle: 'Treasury desk clearance for deposits and withdrawals' },
    emails: { title: 'Email Dispatch & Client Communications', subtitle: 'Automated compliance notices, margin calls, and broadcast announcements' },
    markets: { title: 'Market Trading & Risk Controls', subtitle: 'Dynamic spread overrides, circuit breaker halting, and slippage management' },
    audit: { title: 'Regulatory Compliance Audit Trail', subtitle: 'Immutable administrative logs with millisecond timestamps' },
    settings: { title: 'Payment & Deposit Settings', subtitle: 'Bank and crypto details shown to clients and included in deposit emails' }
  };

  if (!adminSession) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
        onClick={onClose}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <AdminLoginGate
            onLoginSuccess={(newSession) => {
              setSessionExpiredNotice(false);
              setNotification(`Authenticated as ${newSession.name} (${newSession.role})`);
              setTimeout(() => setNotification(null), 4000);
            }}
            onClose={onClose}
            sessionExpiredNotice={sessionExpiredNotice}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-7xl h-[94vh] bg-[#10120a] border border-[#6dff8a]/40 rounded-3xl shadow-2xl flex overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dedicated Admin Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingKycCount={pendingKycCount}
          pendingFundingCount={pendingFundingCount}
          unreadInquiriesCount={unreadInquiriesCount}
          usersCount={users.length}
          adminSession={adminSession}
          onLogout={() => handleLogout(false)}
          onSwitchToUserPortal={onSwitchToUserDashboard}
          onClose={onClose}
        />

        {/* Right Main Body Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#10120a]">
          {/* Top Notification Toast */}
          {notification && (
            <div className="bg-[#1b2b18] border-b border-[#6dff8a]/40 text-white px-4 py-2.5 text-xs text-center flex items-center justify-center gap-2 animate-fadeIn">
              <span className="w-2 h-2 rounded-full bg-[#6dff8a] animate-ping" />
              <span className="font-semibold">{notification}</span>
            </div>
          )}

          {/* Header Bar */}
          <div className="p-4 sm:p-5 border-b border-white/10 bg-[#161a0f] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {tabTitles[activeTab]?.title || 'Back-Office & User Control Suite'}
                </h2>
                <span className="text-[10px] bg-yellow-400 text-black font-mono px-2 py-0.5 rounded font-bold uppercase">
                  /#admin
                </span>
              </div>
              <p className="text-xs text-[#a3a89e]">
                {tabTitles[activeTab]?.subtitle || 'TradeShark Super-Admin Terminal'}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Operator Badge */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                <span className="w-2 h-2 rounded-full bg-[#6dff8a] animate-pulse" />
                <span className="text-white/60">Operator:</span>
                <strong className="text-white font-medium">{adminSession.name}</strong>
                <span className="text-[10px] font-mono text-[#6dff8a] bg-[#6dff8a]/15 px-1.5 py-0.5 rounded">
                  @{adminSession.username}
                </span>
              </div>

              {/* Copy URL Button */}
              <button
                onClick={handleCopyLink}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-semibold border border-white/10 transition-colors"
                title="Copy admin portal direct link"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#6dff8a]" />
                    <span className="text-[#6dff8a]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-white/60" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              {/* Quick Link to launch User Dashboard with chosen user */}
              {onSwitchToUserDashboard && (
                <button
                  onClick={onSwitchToUserDashboard}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#6dff8a]/20 text-white/80 hover:text-[#6dff8a] border border-white/10 text-xs font-semibold transition-colors"
                  title="Switch to Client Portal (/#user)"
                >
                  <Eye className="w-3.5 h-3.5 text-[#6dff8a]" />
                  <span>Client View</span>
                </button>
              )}

              {/* Quick Provision Account Button */}
              <button
                onClick={() => setActiveTab('setup')}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl bg-[#6dff8a] text-[#15170f] text-xs font-bold hover:bg-[#5ce077] transition-colors shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Setup User</span>
              </button>

              {/* Sign Out / Lock Button */}
              <button
                onClick={() => handleLogout(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors"
                title="Sign out & lock administrative terminal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* System Telemetry & Pending Queues Ribbon */}
          <div className="px-6 py-2.5 bg-[#14160d] border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-white/70">
              <span className="flex items-center gap-1.5 text-[#6dff8a]">
                <span className="w-2 h-2 rounded-full bg-[#6dff8a] animate-pulse" />
                Engine: LD4 London (1.2ms)
              </span>
              <span className="hidden sm:inline text-white/40">|</span>
              <span className="hidden sm:inline">Total Client Funds: <strong className="text-white">$842,610,940</strong></span>
              <span className="hidden md:inline text-white/40">|</span>
              <span className="hidden md:inline">Registered Accounts: <strong className="text-white">{users.length}</strong></span>
            </div>

            <div className="flex items-center gap-3">
              {pendingKycCount > 0 && (
                <button
                  onClick={() => setActiveTab('kyc')}
                  className="flex items-center gap-1.5 bg-yellow-400/15 border border-yellow-400/40 text-yellow-400 px-2.5 py-1 rounded-full font-bold text-[11px] hover:bg-yellow-400/25 transition-colors"
                >
                  <AlertCircle className="w-3 h-3" />
                  <span>{pendingKycCount} KYC Pending</span>
                </button>
              )}

              {pendingFundingCount > 0 && (
                <button
                  onClick={() => setActiveTab('funding')}
                  className="flex items-center gap-1.5 bg-[#6dff8a]/15 border border-[#6dff8a]/40 text-[#6dff8a] px-2.5 py-1 rounded-full font-bold text-[11px] hover:bg-[#6dff8a]/25 transition-colors"
                >
                  <DollarSign className="w-3 h-3" />
                  <span>{pendingFundingCount} Funding Requests</span>
                </button>
              )}
            </div>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

            {/* TAB 0: EXECUTIVE OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 4 Top KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-xs text-white/50 block">Custody Client Capital</span>
                    <span className="text-2xl font-bold text-white font-mono">$842,610,940</span>
                    <div className="text-[11px] text-[#6dff8a] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Client funds kept separate</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-xs text-white/50 block">24h Institutional Turnover</span>
                    <span className="text-2xl font-bold text-[#6dff8a] font-mono">$3,184,290,000</span>
                    <div className="text-[11px] text-white/60">Across 5,000+ CFD &amp; Stock books</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-xs text-white/50 block">Active Trader Accounts</span>
                    <span className="text-2xl font-bold text-white font-mono">{users.length} Traders</span>
                    <div className="text-[11px] text-yellow-400">
                      {users.filter(u => u.status === 'Active').length} Active • {users.filter(u => u.status !== 'Active').length} Restricted
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-xs text-white/50 block">Compliance Action Required</span>
                    <span className="text-2xl font-bold text-yellow-400 font-mono">
                      {pendingKycCount + pendingFundingCount} Queued
                    </span>
                    <div className="text-[11px] text-white/60">
                      {pendingKycCount} KYC • {pendingFundingCount} Fundings
                    </div>
                  </div>
                </div>

                {/* Operations Quick Hub */}
                <div className="p-5 rounded-3xl bg-gradient-to-r from-white/[0.04] to-white/[0.01] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm sm:text-base">Administrative Quick Actions</h3>
                      <p className="text-xs text-[#a3a89e]">Instant operational execution across user accounts, treasury, and compliance</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#6dff8a]/10 border border-[#6dff8a]/30 text-[#6dff8a] text-xs font-bold">
                      Compliance Desk
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <button
                      onClick={() => setActiveTab('setup')}
                      className="p-4 rounded-2xl bg-[#161a0f] hover:bg-[#1f2515] border border-white/10 text-left space-y-2 group transition-all"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#6dff8a]/20 border border-[#6dff8a]/40 flex items-center justify-center text-[#6dff8a]">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white group-hover:text-[#6dff8a] transition-colors">
                          Provision New Trader
                        </div>
                        <div className="text-[11px] text-white/50">Setup user profile, balance &amp; leverage</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('kyc')}
                      className="p-4 rounded-2xl bg-[#161a0f] hover:bg-[#1f2515] border border-white/10 text-left space-y-2 group transition-all"
                    >
                      <div className="w-9 h-9 rounded-xl bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white group-hover:text-yellow-400 transition-colors">
                          Inspect KYC Vault ({pendingKycCount})
                        </div>
                        <div className="text-[11px] text-white/50">Biometrics, ID verification &amp; AML score</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('funding')}
                      className="p-4 rounded-2xl bg-[#161a0f] hover:bg-[#1f2515] border border-white/10 text-left space-y-2 group transition-all"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-400/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                          Clear Fundings ({pendingFundingCount})
                        </div>
                        <div className="text-[11px] text-white/50">Approve deposits &amp; release withdrawals</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('emails')}
                      className="p-4 rounded-2xl bg-[#161a0f] hover:bg-[#1f2515] border border-white/10 text-left space-y-2 group transition-all"
                    >
                      <div className="w-9 h-9 rounded-xl bg-purple-400/20 border border-purple-400/40 flex items-center justify-center text-purple-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white group-hover:text-purple-400 transition-colors">
                          Dispatch Email Notice
                        </div>
                        <div className="text-[11px] text-white/50">Custom emails &amp; global dispatches</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Infrastructure Telemetry */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Server className="w-4 h-4 text-[#6dff8a]" />
                      <span>Trading Engine Infrastructure</span>
                    </h4>
                    <div className="space-y-2 text-white/70">
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span>Matching Engine Location:</span>
                        <strong className="text-white font-mono">LD4 Equinix Slough (London)</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span>Direct Market Access Gateways:</span>
                        <strong className="text-white">LSE, NYSE, NASDAQ, CME Group</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span>Average Roundtrip Execution:</span>
                        <strong className="text-[#6dff8a] font-mono">1.2ms (Zero Requotes)</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-yellow-400" />
                      <span>Compliance &amp; Segregation Status</span>
                    </h4>
                    <div className="space-y-2 text-white/70">
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span>Regulatory Authorities:</span>
                        <strong className="text-white">KYC / AML</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span>Client Money Protection:</span>
                        <strong className="text-[#6dff8a]">Separate client funds</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span>Automated Email Clearance:</span>
                        <strong className="text-white">ENABLED (Real-time dispatch)</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: EMAILING SYSTEM */}
            {activeTab === 'emails' && (
              <AdminEmailsTab onNotify={showToast} />
            )}

          {/* TAB 1: ACCOUNTS & CONTROLS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Filter & Search Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                  <div className="relative w-full max-w-sm">
                    <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search trader by ID, name, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#6dff8a]"
                    />
                  </div>

                  <div className="flex items-center gap-1 text-xs">
                    {(['ALL', 'Active', 'Trading Frozen', 'Suspended'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          statusFilter === st 
                            ? 'bg-[#6dff8a] text-[#15170f]' 
                            : 'bg-white/5 text-white/60 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-white/60">
                  Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> accounts
                </div>
              </div>

              {/* Users Table */}
              <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/20">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#181b11] text-white/50 uppercase border-b border-white/10 font-mono text-[10px]">
                      <tr>
                        <th className="p-3.5">Trader ID &amp; Name</th>
                        <th className="p-3.5">Tier &amp; Role</th>
                        <th className="p-3.5">Real Balance</th>
                        <th className="p-3.5">KYC Status</th>
                        <th className="p-3.5">Account State</th>
                        <th className="p-3.5">Trading Privileges</th>
                        <th className="p-3.5 text-right">Back-Office Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredUsers.map((u) => {
                        const isCurrent = currentUser?.id === u.id;
                        return (
                          <tr key={u.id} className={`hover:bg-white/[0.02] transition-colors ${isCurrent ? 'bg-[#6dff8a]/[0.03]' : ''}`}>
                            {/* User Info */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center font-bold text-xs text-white shrink-0">
                                  {u.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-white flex items-center gap-1.5">
                                    <span>{u.name}</span>
                                    {isCurrent && (
                                      <span className="text-[9px] bg-[#6dff8a]/20 text-[#6dff8a] px-1.5 rounded font-mono font-bold">
                                        ACTIVE TESTER
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-white/40">{u.id} • {u.email}</div>
                                </div>
                              </div>
                            </td>

                            {/* Tier */}
                            <td className="p-3.5">
                              <span className="text-white font-semibold block">{u.tier}</span>
                              <span className="text-[10px] text-white/50 font-mono">Lev: 1:{u.leverage} • {u.country}</span>
                            </td>

                            {/* Balance */}
                            <td className="p-3.5">
                              <span className="font-mono font-bold text-sm text-white block">
                                ${u.realBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                              <span className="text-[10px] text-[#6dff8a] font-mono">
                                Demo: ${u.virtualBalance.toLocaleString()}
                              </span>
                            </td>

                            {/* KYC */}
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                                u.kycStatus === 'Approved' 
                                  ? 'bg-[#6dff8a]/20 text-[#6dff8a]' 
                                  : u.kycStatus === 'Pending' || u.kycStatus === 'Under Review'
                                  ? 'bg-yellow-400/20 text-yellow-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {u.kycStatus}
                              </span>
                              <span className="block text-[10px] text-white/40 mt-0.5">{u.kycDocType}</span>
                            </td>

                            {/* Status */}
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                                u.status === 'Active' 
                                  ? 'bg-[#6dff8a]/20 text-[#6dff8a]' 
                                  : u.status === 'Trading Frozen'
                                  ? 'bg-orange-500/20 text-orange-300'
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {u.status}
                              </span>
                            </td>

                            {/* Privileges Toggles */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => toggleTradingPermission(u.id, 'allowTrading')}
                                  title="Trade Execution"
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                                    u.allowTrading ? 'bg-[#6dff8a]/20 text-[#6dff8a]' : 'bg-white/10 text-white/30 line-through'
                                  }`}
                                >
                                  TRADE
                                </button>
                                <button
                                  onClick={() => toggleTradingPermission(u.id, 'allowShorting')}
                                  title="Short Selling"
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                                    u.allowShorting ? 'bg-[#6dff8a]/20 text-[#6dff8a]' : 'bg-white/10 text-white/30 line-through'
                                  }`}
                                >
                                  SHORT
                                </button>
                                <button
                                  onClick={() => toggleTradingPermission(u.id, 'allowCrypto')}
                                  title="Crypto Trading"
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                                    u.allowCrypto ? 'bg-[#6dff8a]/20 text-[#6dff8a]' : 'bg-white/10 text-white/30 line-through'
                                  }`}
                                >
                                  CRYPTO
                                </button>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="p-3.5 text-right space-x-1.5">
                              {/* Adjust Funds Button */}
                              <button
                                onClick={() => {
                                  setBalanceModalUser(u);
                                  setAdjustAmount('2500');
                                }}
                                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-[#6dff8a]/20 hover:text-[#6dff8a] text-white/80 text-[11px] font-semibold transition-colors"
                                title="Credit, Debit, or Bonus adjustments"
                              >
                                Adjust Funds
                              </button>

                              {/* Inspect Full Controls */}
                              <button
                                onClick={() => setInspectingUser(u)}
                                className="px-2.5 py-1 rounded-lg bg-[#6dff8a]/20 hover:bg-[#6dff8a] text-[#6dff8a] hover:text-[#15170f] text-[11px] font-bold transition-colors"
                              >
                                Control Panel
                              </button>

                              {/* Switch Active User */}
                              <button
                                onClick={() => {
                                  setCurrentUserId(u.id);
                                }}
                                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                                  isCurrent 
                                    ? 'bg-[#6dff8a] text-[#15170f]' 
                                    : 'bg-white/5 hover:bg-white/15 text-white/60 hover:text-white'
                                }`}
                                title="Switch current client perspective"
                              >
                                {isCurrent ? 'Active' : 'Impersonate'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FUNDINGS & APPROVALS */}
          {activeTab === 'funding' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-xs text-white/50 block">Pending Deposit Approvals</span>
                  <span className="text-2xl font-bold text-[#6dff8a] font-mono">
                    ${transactions.filter(t => t.type === 'Deposit' && t.status === 'Pending Approval')
                      .reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
                  </span>
                  <span className="text-[11px] text-white/60">
                    {transactions.filter(t => t.type === 'Deposit' && t.status === 'Pending Approval').length} requests in queue
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-xs text-white/50 block">Pending Withdrawal Releases</span>
                  <span className="text-2xl font-bold text-yellow-400 font-mono">
                    ${transactions.filter(t => t.type === 'Withdrawal' && t.status === 'Pending Approval')
                      .reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
                  </span>
                  <span className="text-[11px] text-white/60">
                    {transactions.filter(t => t.type === 'Withdrawal' && t.status === 'Pending Approval').length} requests in queue
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-xs text-white/50 block">Total Settled (24h)</span>
                  <span className="text-2xl font-bold text-white font-mono">
                    ${transactions.filter(t => t.status === 'Approved / Settled')
                      .reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
                  </span>
                  <span className="text-[11px] text-[#6dff8a]">Cleared by treasury desk</span>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">Client Funding Requests &amp; Approvals</h4>
                  <span className="text-xs text-white/40">1-click approve will immediately balance-sync with user account</span>
                </div>

                <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/20">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#181b11] text-white/50 uppercase border-b border-white/10 font-mono text-[10px]">
                      <tr>
                        <th className="p-3.5">Ref / Date</th>
                        <th className="p-3.5">Client</th>
                        <th className="p-3.5">Type &amp; Method</th>
                        <th className="p-3.5">Amount ($USD)</th>
                        <th className="p-3.5">Destination / Note</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Cashier Approval</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/[0.02]">
                          <td className="p-3.5 font-mono">
                            <div className="text-white font-bold">{tx.reference}</div>
                            <div className="text-white/40 text-[10px]">{tx.date}</div>
                          </td>

                          <td className="p-3.5">
                            <div className="text-white font-semibold">{tx.userName}</div>
                            <div className="text-white/40 text-[10px] font-mono">{tx.userId}</div>
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                tx.type === 'Deposit' ? 'bg-[#6dff8a]/20 text-[#6dff8a]' : 'bg-yellow-400/20 text-yellow-400'
                              }`}>
                                {tx.type}
                              </span>
                              <span className="text-white/80">{tx.method}</span>
                            </div>
                          </td>

                          <td className="p-3.5 font-mono font-bold text-white text-sm">
                            ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>

                          <td className="p-3.5 text-white/60 text-xs max-w-xs truncate">
                            {tx.destination || tx.adminNote || 'Standard clearing rail'}
                          </td>

                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.status === 'Approved / Settled'
                                ? 'bg-[#6dff8a]/20 text-[#6dff8a]'
                                : tx.status === 'Pending Approval'
                                ? 'bg-yellow-400/20 text-yellow-400 animate-pulse'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {tx.status}
                            </span>
                          </td>

                          <td className="p-3.5 text-right space-x-2">
                            {tx.status === 'Pending Approval' ? (
                              <>
                                <button
                                  onClick={() => {
                                    approveFunding(tx.id);
                                    showToast(`Approved ${tx.type} of $${tx.amount.toLocaleString()} for ${tx.userName}`);
                                  }}
                                  className="px-3 py-1 rounded-lg bg-[#6dff8a] hover:bg-[#5ce077] text-[#15170f] font-bold text-xs shadow-sm transition-all"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt('Enter rejection reason:');
                                    if (reason) {
                                      rejectFunding(tx.id, reason);
                                      showToast(`Rejected ${tx.type} for ${tx.userName}`);
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white font-semibold text-xs transition-colors"
                                >
                                  Decline
                                </button>
                              </>
                            ) : (
                              <span className="text-[11px] text-white/40 font-mono">Complete</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KYC & VERIFICATION DESK */}
          {activeTab === 'kyc' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">KYC Document Inspection &amp; Approval Desk</h3>
                  <p className="text-xs text-[#a3a89e]">Verify passport, national ID, and residence proofs with biometric MRZ validation.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map((u) => (
                  <div key={u.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#6dff8a]/20 border border-[#6dff8a]/40 flex items-center justify-center font-bold text-white text-sm">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{u.name}</h4>
                          <span className="text-xs text-white/50">{u.id} • {u.country}</span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        u.kycStatus === 'Approved'
                          ? 'bg-[#6dff8a]/20 text-[#6dff8a]'
                          : u.kycStatus === 'Pending' || u.kycStatus === 'Under Review'
                          ? 'bg-yellow-400/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {u.kycStatus}
                      </span>
                    </div>

                    {/* Document Details Card */}
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-white/40 block text-[10px]">Document Type</span>
                          <span className="font-bold text-white">{u.kycDocType}</span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[10px]">Document Reference</span>
                          <span className="font-mono text-white">{u.kycDocNumber}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                        <div>
                          <span className="text-white/40 block text-[10px]">Biometric Match</span>
                          <span className="font-mono font-bold text-[#6dff8a]">{u.facialMatchScore || 98.4}% Match</span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[10px]">AML Risk Profile</span>
                          <span className={`font-bold ${u.amlRisk === 'High' ? 'text-red-400' : 'text-white'}`}>
                            {u.amlRisk} Risk {u.pepWatchlistHit ? '(PEP Match)' : '(Clean)'}
                          </span>
                        </div>
                      </div>

                      {u.kycNotes && (
                        <div className="p-2 rounded bg-yellow-400/10 border border-yellow-400/20 text-[11px] text-yellow-300">
                          <strong>Admin Note:</strong> {u.kycNotes}
                        </div>
                      )}
                    </div>

                    {/* Approval & Rejection Buttons */}
                    <div className="flex items-center justify-between pt-1 gap-2">
                      <div className="flex items-center gap-1.5">
                        <select
                          value={u.amlRisk}
                          onChange={(e) => updateAmlRisk(u.id, e.target.value as any)}
                          className="bg-black/40 border border-white/15 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none"
                        >
                          <option value="Low">Low Risk</option>
                          <option value="Medium">Medium Risk</option>
                          <option value="High">High Risk</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedKycInspectorUser(u)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/40 text-xs font-semibold transition-colors flex items-center gap-1"
                          title="Inspect uploaded passport, ID, and liveness scans"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Vault</span>
                        </button>

                        {u.kycStatus !== 'Approved' && (
                          <button
                            onClick={() => {
                              approveKyc(u.id);
                              showToast(`KYC Approved for ${u.name}. Upgraded to Tier 2 Verified!`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#6dff8a] hover:bg-[#5ce077] text-[#15170f] font-bold text-xs transition-colors"
                          >
                            Approve
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setKycActionModal({ user: u, mode: 'resubmit' });
                          }}
                          className="px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 text-xs font-semibold transition-colors"
                        >
                          Re-upload
                        </button>

                        {u.kycStatus !== 'Rejected' && (
                          <button
                            onClick={() => {
                              setKycActionModal({ user: u, mode: 'reject' });
                            }}
                            className="px-2 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white text-xs font-semibold transition-colors"
                          >
                            Decline
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SETUP NEW ACCOUNT (FULL PROVISIONING) */}
          {activeTab === 'setup' && (
            <div className="max-w-3xl mx-auto space-y-6 py-2">
              <div className="space-y-1 text-center">
                <h3 className="text-xl font-bold text-white">Full User Account Provisioning</h3>
                <p className="text-xs text-[#a3a89e]">
                  Setup a complete client account with custom tiers, leverage, starting funded balance, and compliance checks.
                </p>
              </div>

              <form onSubmit={handleCreateUserSubmit} className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/70 block">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jonathan Hayes"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#6dff8a]"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/70 block">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. jhayes@hedgefund.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#6dff8a]"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/70 block">Phone Number</label>
                    <input
                      type="text"
                      value={newUserPhone}
                      onChange={(e) => setNewUserPhone(e.target.value)}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#6dff8a]"
                    />
                  </div>

                  {/* Country */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/70 block">Country of Residence</label>
                    <input
                      type="text"
                      value={newUserCountry}
                      onChange={(e) => setNewUserCountry(e.target.value)}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#6dff8a]"
                    />
                  </div>

                  {/* Account Tier */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/70 block">Account Tier</label>
                    <select
                      value={newUserTier}
                      onChange={(e) => setNewUserTier(e.target.value as UserTier)}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#6dff8a]"
                    >
                      <option value="Tier 1 - Standard">Tier 1 - Standard (Retail)</option>
                      <option value="Tier 2 - Verified Pro">Tier 2 - Verified Pro</option>
                      <option value="Tier 3 - VIP Institutional">Tier 3 - VIP Institutional</option>
                    </select>
                  </div>

                  {/* Leverage */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/70 block">Max Leverage Allocation</label>
                    <select
                      value={newUserLeverage}
                      onChange={(e) => setNewUserLeverage(e.target.value)}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#6dff8a]"
                    >
                      <option value="30">1:30 (Standard retail)</option>
                      <option value="100">1:100 (Pro Investor)</option>
                      <option value="200">1:200 (Experienced Trader)</option>
                      <option value="400">1:400 (VIP Institutional)</option>
                    </select>
                  </div>

                  {/* Initial Deposit Balance */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/70 block">Initial Funded Balance ($USD)</label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-[#6dff8a] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={newUserBalance}
                        onChange={(e) => setNewUserBalance(e.target.value)}
                        className="w-full bg-black/50 border border-white/15 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-[#6dff8a]"
                      />
                    </div>
                  </div>

                  {/* Account Manager */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/70 block">Assigned Account Manager</label>
                    <select
                      value={newUserAccountManager}
                      onChange={(e) => setNewUserAccountManager(e.target.value)}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#6dff8a]"
                    >
                      <option value="David Sterling">David Sterling (Senior Desk)</option>
                      <option value="Victoria Sterling (VIP Desk)">Victoria Sterling (VIP Desk)</option>
                      <option value="Michael Wong">Michael Wong (APAC Desk)</option>
                      <option value="Sarah Jenkins">Sarah Jenkins (Crypto Desk)</option>
                    </select>
                  </div>
                </div>

                {/* Identity & Privileges Toggles */}
                <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Permissions &amp; Verification Flags
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newUserAutoVerify}
                        onChange={(e) => setNewUserAutoVerify(e.target.checked)}
                        className="rounded border-white/20 text-[#6dff8a] focus:ring-0"
                      />
                      <span className="text-white/90">Auto-Approve KYC (Instant Verified Status)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newUserAllowTrading}
                        onChange={(e) => setNewUserAllowTrading(e.target.checked)}
                        className="rounded border-white/20 text-[#6dff8a] focus:ring-0"
                      />
                      <span className="text-white/90">Enable Market Trading Privileges</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newUserAllowShorting}
                        onChange={(e) => setNewUserAllowShorting(e.target.checked)}
                        className="rounded border-white/20 text-[#6dff8a] focus:ring-0"
                      />
                      <span className="text-white/90">Enable Short Selling Privileges</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newUserAllowCrypto}
                        onChange={(e) => setNewUserAllowCrypto(e.target.checked)}
                        className="rounded border-white/20 text-[#6dff8a] focus:ring-0"
                      />
                      <span className="text-white/90">Enable Crypto Derivative Trading</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#6dff8a] hover:bg-[#5ce077] text-[#15170f] font-bold text-sm shadow-[0_0_25px_rgba(109,255,138,0.25)] transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Provision Account &amp; Release Initial Funds</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: MARKET CONTROLS */}
          {activeTab === 'markets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Market Asset Administration</h3>
                  <p className="text-xs text-[#a3a89e]">Emergency halt trading, adjust spreads, and inspect liquidity feeds.</p>
                </div>
                <button
                  onClick={() => { refresh(); showToast('Prices and data refreshed.'); }}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#6dff8a]" />
                  <span>Sync Feeds</span>
                </button>
              </div>

              <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/20">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#181b11] text-white/50 uppercase border-b border-white/10 font-mono text-[10px]">
                    <tr>
                      <th className="p-3.5">Asset</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Live Price</th>
                      <th className="p-3.5">Spread Markup</th>
                      <th className="p-3.5">Trading Status</th>
                      <th className="p-3.5 text-right">Emergency Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {marketAssets.map((asset) => (
                      <tr key={asset.symbol} className="hover:bg-white/[0.02]">
                        <td className="p-3.5 font-bold text-white flex items-center gap-2">
                          <span>{asset.symbol}</span>
                          <span className="text-white/40 font-normal">{asset.name}</span>
                        </td>
                        <td className="p-3.5 text-white/70">{asset.category}</td>
                        <td className="p-3.5 font-mono font-bold text-white">${asset.price.toLocaleString()}</td>
                        <td className="p-3.5 font-mono text-[#6dff8a]">{asset.spread}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            asset.halted ? 'bg-[#ff5c5c]/20 text-[#ff5c5c]' : 'bg-[#6dff8a]/20 text-[#6dff8a]'
                          }`}>
                            {asset.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => toggleHalt(asset.symbol)}
                            className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                              asset.halted 
                                ? 'bg-[#6dff8a] text-[#15170f]' 
                                : 'bg-[#ff5c5c]/20 hover:bg-[#ff5c5c] text-[#ff5c5c] hover:text-white'
                            }`}
                          >
                            {asset.halted ? 'Resume Trading' : 'Halt Trading'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <PaymentSettingsTab payments={payments} onSave={async (p) => {
              try { await savePayments(p); showToast('Payment settings saved. New deposits will show these details.'); }
              catch (err: any) { showToast(err?.message || 'Could not save settings'); }
            }} />
          )}

          {/* TAB 6: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Immutable Regulatory Audit Trail</h3>
                  <p className="text-xs text-[#a3a89e]">Real-time system events, administrative balance changes, and KYC decisions.</p>
                </div>
                <div className="flex gap-2">
                  <a href="/api/admin/users.csv" data-native className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold text-xs">
                    Export Clients CSV
                  </a>
                  <a href="/api/admin/audit.csv" data-native className="px-4 py-2 rounded-xl bg-[#6dff8a] text-[#15170f] font-bold text-xs">
                    Export CSV Logs
                  </a>
                </div>
              </div>

              <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/40 p-4 space-y-2 max-h-[60vh] overflow-y-auto font-mono text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 hover:border-white/10">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#6dff8a] font-bold">[{log.timestamp}] {log.action}</span>
                      <span className="text-white/40">{log.adminUser} • {log.type}</span>
                    </div>
                    <div className="text-white/80">{log.details}</div>
                    {log.targetUser && (
                      <div className="text-white/40 text-[10px]">Target Account: {log.targetUser}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* MODAL 1: DEEP ACCOUNT CONTROL PANEL (INSPECTING USER) */}
      {/* ========================================================= */}
      {inspectingUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#171a10] border border-[#6dff8a]/40 rounded-3xl p-6 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#6dff8a]/20 border border-[#6dff8a]/40 flex items-center justify-center font-bold text-white text-sm">
                  {inspectingUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{inspectingUser.name}</h3>
                  <p className="text-xs text-white/50">{inspectingUser.id} • {inspectingUser.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setInspectingUser(null)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Status Control */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-white/40 block text-[10px]">Account State</span>
                <select
                  value={inspectingUser.status}
                  onChange={(e) => {
                    setUserStatus(inspectingUser.id, e.target.value as AccountStatus, 'Admin override');
                    setInspectingUser(prev => prev ? { ...prev, status: e.target.value as AccountStatus } : null);
                    showToast(`Status updated to ${e.target.value}`);
                  }}
                  className="w-full mt-1 bg-black/40 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                >
                  <option value="Active">Active</option>
                  <option value="Trading Frozen">Trading Frozen</option>
                  <option value="Suspended">Suspended</option>
                  <option value="AML Flagged">AML Flagged</option>
                </select>
              </div>

              <div>
                <span className="text-white/40 block text-[10px]">Account Tier</span>
                <select
                  value={inspectingUser.tier}
                  onChange={(e) => {
                    updateUserTier(inspectingUser.id, e.target.value as UserTier);
                    setInspectingUser(prev => prev ? { ...prev, tier: e.target.value as UserTier } : null);
                    showToast(`Tier updated to ${e.target.value}`);
                  }}
                  className="w-full mt-1 bg-black/40 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                >
                  <option value="Tier 1 - Standard">Tier 1 - Standard</option>
                  <option value="Tier 2 - Verified Pro">Tier 2 - Verified Pro</option>
                  <option value="Tier 3 - VIP Institutional">Tier 3 - VIP Institutional</option>
                </select>
              </div>

              <div>
                <span className="text-white/40 block text-[10px]">Leverage Limit</span>
                <select
                  value={inspectingUser.leverage}
                  onChange={(e) => {
                    const lev = parseInt(e.target.value, 10);
                    updateUserLeverage(inspectingUser.id, lev);
                    setInspectingUser(prev => prev ? { ...prev, leverage: lev } : null);
                    showToast(`Leverage updated to 1:${lev}`);
                  }}
                  className="w-full mt-1 bg-black/40 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                >
                  <option value="30">1:30</option>
                  <option value="50">1:50</option>
                  <option value="100">1:100</option>
                  <option value="200">1:200</option>
                  <option value="400">1:400</option>
                </select>
              </div>

              <div>
                <span className="text-white/40 block text-[10px]">AML Risk</span>
                <select
                  value={inspectingUser.amlRisk}
                  onChange={(e) => {
                    updateAmlRisk(inspectingUser.id, e.target.value as any);
                    setInspectingUser(prev => prev ? { ...prev, amlRisk: e.target.value as any } : null);
                  }}
                  className="w-full mt-1 bg-black/40 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                >
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                </select>
              </div>
            </div>

            {/* Trading Restrictions Toggle Bar */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Trading Privileges &amp; Risk Boundaries
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    toggleTradingPermission(inspectingUser.id, 'allowTrading');
                    setInspectingUser(prev => prev ? { ...prev, allowTrading: !prev.allowTrading } : null);
                  }}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition-colors ${
                    inspectingUser.allowTrading
                      ? 'bg-[#6dff8a]/15 border-[#6dff8a]/40 text-[#6dff8a]'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}
                >
                  {inspectingUser.allowTrading ? 'Trading: ALLOWED' : 'Trading: BLOCKED'}
                </button>

                <button
                  onClick={() => {
                    toggleTradingPermission(inspectingUser.id, 'allowShorting');
                    setInspectingUser(prev => prev ? { ...prev, allowShorting: !prev.allowShorting } : null);
                  }}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition-colors ${
                    inspectingUser.allowShorting
                      ? 'bg-[#6dff8a]/15 border-[#6dff8a]/40 text-[#6dff8a]'
                      : 'bg-white/5 border-white/10 text-white/40'
                  }`}
                >
                  {inspectingUser.allowShorting ? 'Shorting: ENABLED' : 'Shorting: DISABLED'}
                </button>

                <button
                  onClick={() => {
                    toggleTradingPermission(inspectingUser.id, 'allowCrypto');
                    setInspectingUser(prev => prev ? { ...prev, allowCrypto: !prev.allowCrypto } : null);
                  }}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition-colors ${
                    inspectingUser.allowCrypto
                      ? 'bg-[#6dff8a]/15 border-[#6dff8a]/40 text-[#6dff8a]'
                      : 'bg-white/5 border-white/10 text-white/40'
                  }`}
                >
                  {inspectingUser.allowCrypto ? 'Crypto: ENABLED' : 'Crypto: DISABLED'}
                </button>
              </div>
            </div>

            {/* Account Manager & Balance Adjustment Quick Link */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setBalanceModalUser(inspectingUser);
                  setInspectingUser(null);
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-[#6dff8a] hover:text-[#15170f] text-white text-xs font-bold transition-all"
              >
                💵 Manual Credit / Debit Adjustment
              </button>

              <button
                onClick={() => {
                  showToast(`Sent 2FA reset & session termination to ${inspectingUser.email}`);
                  setInspectingUser(null);
                }}
                className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white text-xs font-semibold transition-colors"
              >
                Force Session Reset &amp; Invalidate Keys
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: MANUAL BALANCE ADJUSTMENT MODAL */}
      {/* ========================================================= */}
      {balanceModalUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#181b11] border border-[#6dff8a]/40 rounded-3xl p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Manual Balance Adjustment</h3>
                <p className="text-xs text-white/50">{balanceModalUser.name} • Balance: ${balanceModalUser.realBalance.toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setBalanceModalUser(null)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteBalanceAdjustment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-white/70 block">Adjustment Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Admin Credit', 'Admin Debit', 'Bonus'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAdjustType(t)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        adjustType === t 
                          ? 'bg-[#6dff8a] text-[#15170f]' 
                          : 'bg-white/5 text-white/70 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-white/70 block">Amount ($USD)</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-[#6dff8a] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl pl-9 pr-4 py-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-[#6dff8a]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-white/70 block">Internal Audit Note &amp; Reason</label>
                <input
                  type="text"
                  required
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#6dff8a]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#6dff8a] hover:bg-[#5ce077] text-[#15170f] font-bold text-xs shadow-lg transition-all"
              >
                Execute {adjustType} of ${adjustAmount}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: KYC REJECTION / RESUBMIT REASON MODAL */}
      {/* ========================================================= */}
      {kycActionModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#181b11] border border-white/20 rounded-3xl p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  {kycActionModal.mode === 'reject' ? 'Decline KYC Verification' : 'Request Document Re-upload'}
                </h3>
                <p className="text-xs text-white/50">{kycActionModal.user.name}</p>
              </div>
              <button 
                onClick={() => setKycActionModal(null)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteKycAction} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-white/70 block">Reason for Client</label>
                <select
                  value={kycReason}
                  onChange={(e) => setKycReason(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="Document expired or unreadable text">Document expired or unreadable text</option>
                  <option value="Proof of address older than 90 days">Proof of address older than 90 days</option>
                  <option value="Name spelling does not match legal bank records">Name spelling does not match legal bank records</option>
                  <option value="Four corners of identity document cut off">Four corners of identity document cut off</option>
                  <option value="High AML risk jurisdiction discrepancy">High AML risk jurisdiction discrepancy</option>
                </select>
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-xl font-bold text-xs transition-all ${
                  kycActionModal.mode === 'reject'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-yellow-400 hover:bg-yellow-500 text-black'
                }`}
              >
                Confirm {kycActionModal.mode === 'reject' ? 'Rejection' : 'Resubmit Request'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* KYC Inspector Modal */}
      {selectedKycInspectorUser && (
        <AdminKycInspectorModal
          isOpen={true}
          user={users.find(u => u.id === selectedKycInspectorUser.id) || selectedKycInspectorUser}
          onClose={() => setSelectedKycInspectorUser(null)}
          onApprove={(userId) => {
            approveKyc(userId);
            showToast(`KYC Approved for ${selectedKycInspectorUser.name}!`);
            setSelectedKycInspectorUser(null);
          }}
          onReject={(userId, reason) => {
            rejectKyc(userId, reason);
            showToast(`KYC Rejected for ${selectedKycInspectorUser.name}.`);
            setSelectedKycInspectorUser(null);
          }}
          onRequestResubmit={(userId, reason) => {
            requestKycResubmit(userId, reason);
            showToast(`Re-submission requested for ${selectedKycInspectorUser.name}.`);
            setSelectedKycInspectorUser(null);
          }}
        />
      )}

    </div>
  );
};

// ------------------------------------------------------------------
// Payment settings (bank / crypto details for deposits)
// ------------------------------------------------------------------
const PAYMENT_FIELDS: { key: string; label: string; group: string; placeholder?: string }[] = [
  { key: 'bankName', label: 'Bank name', group: 'Bank transfer' },
  { key: 'bankAccountName', label: 'Account name', group: 'Bank transfer' },
  { key: 'bankAccountNumber', label: 'Account number', group: 'Bank transfer' },
  { key: 'bankSortCode', label: 'Sort code / routing number', group: 'Bank transfer' },
  { key: 'bankIban', label: 'IBAN', group: 'Bank transfer' },
  { key: 'bankSwift', label: 'SWIFT / BIC', group: 'Bank transfer' },
  { key: 'usdtTrc20', label: 'USDT (TRC20) address', group: 'Crypto' },
  { key: 'usdtErc20', label: 'USDT (ERC20) address', group: 'Crypto' },
  { key: 'btcAddress', label: 'Bitcoin address', group: 'Crypto' },
  { key: 'ethAddress', label: 'Ethereum address', group: 'Crypto' },
  { key: 'cardPaymentUrl', label: 'Card payment link (Stripe/Paystack/Flutterwave checkout URL)', group: 'Card', placeholder: 'https://' },
  { key: 'instructions', label: 'Extra instructions shown to clients', group: 'General' },
];

const PaymentSettingsTab: React.FC<{ payments: Record<string, string>; onSave: (p: Record<string, string>) => Promise<void> }> = ({ payments, onSave }) => {
  const [form, setForm] = useState<Record<string, string>>(() => ({ ...payments }));
  const [saving, setSaving] = useState(false);
  const groups = Array.from(new Set(PAYMENT_FIELDS.map(f => f.group)));
  return (
    <form
      className="space-y-6 max-w-3xl"
      onSubmit={async e => { e.preventDefault(); setSaving(true); await onSave(form); setSaving(false); }}
    >
      <p className="text-xs text-white/50">
        These details appear on the client Deposit tab and in every deposit confirmation email. Leave a field empty to hide it.
        Initial values come from the DEPOSIT_* Railway variables.
      </p>
      {groups.map(g => (
        <div key={g} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
          <h4 className="text-sm font-bold text-white">{g}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PAYMENT_FIELDS.filter(f => f.group === g).map(f => (
              <label key={f.key} className={`space-y-1 ${f.key === 'instructions' || f.key === 'cardPaymentUrl' ? 'sm:col-span-2' : ''}`}>
                <span className="text-[11px] text-white/50">{f.label}</span>
                <input
                  value={form[f.key] || ''}
                  placeholder={f.placeholder}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#6dff8a]"
                />
              </label>
            ))}
          </div>
        </div>
      ))}
      <button disabled={saving} className="px-6 py-2.5 rounded-xl bg-[#6dff8a] text-[#15170f] font-bold text-xs disabled:opacity-60">
        {saving ? 'Saving...' : 'Save payment settings'}
      </button>
    </form>
  );
};

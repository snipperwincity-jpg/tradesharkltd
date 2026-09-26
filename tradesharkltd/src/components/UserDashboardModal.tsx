import React, { useState } from 'react';
import { 
  X, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  User, 
  Settings, 
  DollarSign,
  PlusCircle,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  Building,
  CreditCard,
  Lock,
  FileText,
  Copy,
  Check,
  ShieldAlert,
  LogOut
} from 'lucide-react';
import { TradeSharkLogo } from './TradeSharkLogo';
import { useBrokerage } from '../context/BrokerageContext';
import { FundingTransaction } from '../types';
import { UserSidebar, UserTab } from './UserPortal/UserSidebar';
import { UserKycTab } from './UserPortal/UserKycTab';
import { UserInboxTab } from './UserPortal/UserInboxTab';
import { UserLoginGate } from './UserPortal/UserLoginGate';
import { errMsg } from '../lib/api';

interface UserDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  onOpenTrade: (symbol: string) => void;
  onOpenAdminPortal?: () => void;
}

const TAB_IDS: UserTab[] = ['portfolio', 'positions', 'markets', 'deposit', 'withdraw', 'kyc', 'inbox', 'copy', 'history', 'settings'];

export const UserDashboardModal: React.FC<UserDashboardModalProps> = (props) => {
  const { currentUser, ready } = useBrokerage();
  if (!props.isOpen || !ready) return null;
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
        <UserLoginGate onLoginSuccess={() => undefined} onClose={props.onClose} />
      </div>
    );
  }
  return <UserDashboardInner {...props} />;
};

const UserDashboardInner: React.FC<UserDashboardModalProps> = ({
  onClose,
  initialTab,
  onOpenTrade,
  onOpenAdminPortal
}) => {
  const {
    currentUser: maybeUser,
    transactions,
    positions,
    emails,
    copies,
    payments,
    config,
    closePosition,
    submitDeposit,
    submitWithdrawal,
    stopCopy,
    logoutUser,
    notify,
    changePassword,
    updateProfile,
    resendVerification,
    resetPractice
  } = useBrokerage();
  const currentUser = maybeUser!;

  const handleLogout = async () => {
    await logoutUser();
    notify('You have been signed out', 'info');
    onClose();
  };

  const [activeTab, setActiveTab] = useState<UserTab>(() => (TAB_IDS.includes(initialTab as UserTab) ? initialTab as UserTab : 'portfolio'));
  React.useEffect(() => { if (initialTab && TAB_IDS.includes(initialTab as UserTab)) setActiveTab(initialTab as UserTab); }, [initialTab]);
  const [accountType, setAccountType] = useState<'real' | 'virtual'>('real');
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Deposit form state
  const [depositAmount, setDepositAmount] = useState(String(Math.max(config.minDeposit, 1000)));
  const [lastDeposit, setLastDeposit] = useState<FundingTransaction | null>(null);
  const [busy, setBusy] = useState(false);
  const [depositMethod, setDepositMethod] = useState<FundingTransaction['method']>('Bank Wire');
  const [depositNotice, setDepositNotice] = useState<string | null>(null);

  // Withdrawal form state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<FundingTransaction['method']>('Bank Wire');
  const [withdrawDestination, setWithdrawDestination] = useState('');
  const [withdrawNotice, setWithdrawNotice] = useState<string | null>(null);

  const copiedInvestors = copies.filter(c => c.userId === currentUser.id);

  const userPositions = positions.filter(p => p.userId === currentUser.id);
  const userTransactions = transactions.filter(t => t.userId === currentUser.id);
  const totalPositionsProfit = userPositions.reduce((acc, p) => acc + p.profit, 0);

  const unreadEmailsCount = emails.filter(
    e => (!e.read && !e.isRead) && (e.userId === currentUser.id || e.userId === 'ALL' || e.to.includes('All'))
  ).length;

  const activeBalance = accountType === 'real' ? currentUser.realBalance : currentUser.virtualBalance;

  const handleCopyLink = () => {
    const url = `${config.appUrl || window.location.origin}/dashboard`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;
    setBusy(true);
    try {
      const tx = await submitDeposit(amt, depositMethod);
      setLastDeposit(tx);
      setDepositNotice(`Deposit request of $${amt.toLocaleString()} submitted (ref ${tx.reference}). Payment instructions have been emailed to you.`);
      setTimeout(() => setDepositNotice(null), 8000);
    } catch (err) {
      notify(errMsg(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) return;
    if (amt > currentUser.realBalance) {
      notify('Insufficient available real balance for this withdrawal.', 'error');
      return;
    }
    setBusy(true);
    try {
      const tx = await submitWithdrawal(amt, withdrawMethod, withdrawDestination);
      setWithdrawNotice(`Withdrawal of $${amt.toLocaleString()} submitted (ref ${tx.reference}). Funds reserved pending treasury release.`);
      setWithdrawAmount('');
      setTimeout(() => setWithdrawNotice(null), 8000);
    } catch (err) {
      notify(errMsg(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  const tabTitles: Record<UserTab, { title: string; subtitle: string }> = {
    portfolio: { title: 'Portfolio Overview & Wallet', subtitle: 'Real-time equity breakdown and allocation analytics' },
    positions: { title: 'Open CFD & Margin Positions', subtitle: 'Manage active leverage contracts and take-profit/stop-loss' },
    markets: { title: 'Live Screener & Markets', subtitle: 'Institutional execution across 5,000+ instruments' },
    deposit: { title: 'Deposit Client Capital', subtitle: 'Deposit funds into your trading account' },
    withdraw: { title: 'Disburse Funds', subtitle: 'Secure disbursements to validated bank accounts' },
    kyc: { title: 'KYC & Regulatory Verification', subtitle: 'Identity and address verification' },
    inbox: { title: 'Official Communications & Inbox', subtitle: 'Regulatory dispatches, clearance notes, and broker messaging' },
    copy: { title: 'CopyTrader™ Portfolios', subtitle: 'Automatically mirror verified Pro Investors' },
    history: { title: 'Funding & Ledger History', subtitle: 'Complete immutable record of all deposits, withdrawals, and trades' },
    settings: { title: 'Account Settings & Compliance Profile', subtitle: 'Manage trading limits, leverage, and account tier' }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-7xl h-[94vh] bg-[#14170e] border border-white/15 rounded-3xl shadow-2xl flex overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dedicated Sidebar for All Options */}
        <UserSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          currentUser={currentUser}
          accountType={accountType}
          onToggleAccountType={setAccountType}
          positionsCount={userPositions.length}
          unreadEmailsCount={unreadEmailsCount}
          onOpenAdminPortal={onOpenAdminPortal}
          onLogout={handleLogout}
          onClose={onClose}
        />

        {/* Right Main Body Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#15170f]">
          {/* Header Bar */}
          <div className="p-4 sm:p-5 border-b border-white/10 bg-[#171a10] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {tabTitles[activeTab]?.title || 'Client Portal'}
                </h2>
                <span className="text-[10px] bg-[#6dff8a]/20 text-[#6dff8a] font-mono px-2 py-0.5 rounded font-bold uppercase">
                  /dashboard
                </span>
              </div>
              <p className="text-xs text-[#a3a89e]">
                {tabTitles[activeTab]?.subtitle || 'TradeShark Client Portal'}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Copy URL Button */}
              <button
                onClick={handleCopyLink}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-semibold border border-white/10 transition-colors"
                title="Copy client portal direct link"
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

              {onOpenAdminPortal && (
                <button
                  onClick={onOpenAdminPortal}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-yellow-400/20 text-white/80 hover:text-yellow-400 border border-white/10 text-xs font-semibold transition-colors"
                  title="Switch to Admin Portal (/#admin)"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Admin Console</span>
                </button>
              )}

              {/* Sign Out Button */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 text-xs font-semibold transition-colors"
                title="Sign out of trading account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                title="Close Portal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Toast Notice */}
          {(depositNotice || withdrawNotice) && (
            <div className="bg-[#1b2b18] border-b border-[#6dff8a]/40 text-white px-4 py-2.5 text-xs text-center flex items-center justify-center gap-2 animate-fadeIn">
              <span className="w-2 h-2 rounded-full bg-[#6dff8a] animate-ping" />
              <span className="font-semibold">{depositNotice || withdrawNotice}</span>
            </div>
          )}

          {/* Compliance / Trading Freeze Alert if Admin suspended or froze trading */}
          {(!currentUser.allowTrading || currentUser.status === 'Trading Frozen' || currentUser.status === 'Suspended') && (
            <div className="bg-red-950/40 border-b border-red-500/40 px-6 py-2.5 text-xs text-red-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>
                  <strong>Compliance Notice:</strong> Account trading privileges are currently <strong>{currentUser.status}</strong>. 
                  {currentUser.kycNotes && ` (${currentUser.kycNotes})`}
                </span>
              </div>
              <span className="text-[11px] font-mono text-red-300">Contact: {currentUser.accountManager}</span>
            </div>
          )}

          {/* Tab Content Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

            {/* TAB: KYC & VERIFICATION */}
            {activeTab === 'kyc' && (
              <UserKycTab currentUser={currentUser} onNotify={(msg) => {
                setDepositNotice(msg);
                setTimeout(() => setDepositNotice(null), 4500);
              }} />
            )}

            {/* TAB: OFFICIAL INBOX */}
            {activeTab === 'inbox' && (
              <UserInboxTab currentUser={currentUser} onNotify={(msg) => {
                setDepositNotice(msg);
                setTimeout(() => setDepositNotice(null), 4500);
              }} />
            )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-xs text-white/50 block">Available Cash (Real)</span>
                  <span className="text-2xl font-bold text-white font-mono">
                    ${currentUser.realBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <div className="text-[11px] text-[#6dff8a]">Instant bank wire &amp; crypto clearing</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-xs text-white/50 block">Virtual Practice Balance</span>
                  <span className="text-2xl font-bold text-white/80 font-mono">
                    ${currentUser.virtualBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <div className="text-[11px] text-white/40">Risk-free paper trading</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-xs text-white/50 block">CopyTrader Portfolio</span>
                  <span className="text-2xl font-bold text-[#6dff8a] font-mono">
                    ${copiedInvestors.reduce((a, b) => a + b.currentValue, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <div className="text-[11px] text-[#6dff8a]">+$1,634.10 combined profit</div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="flex flex-wrap gap-3">
                <button
                  disabled={!currentUser.allowTrading}
                  onClick={() => onOpenTrade('NVDA')}
                  className={`px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 transition-colors ${
                    currentUser.allowTrading
                      ? 'bg-[#6dff8a] text-[#15170f] hover:bg-[#5ce077]'
                      : 'bg-white/10 text-white/30 cursor-not-allowed'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{currentUser.allowTrading ? 'Trade Stocks & Crypto' : 'Trading Restricted'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('deposit')}
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-2 border border-white/15 transition-colors"
                >
                  <ArrowDownLeft className="w-4 h-4 text-[#6dff8a]" />
                  <span>Deposit Funds</span>
                </button>

                <button
                  onClick={() => setActiveTab('withdraw')}
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-2 border border-white/15 transition-colors"
                >
                  <ArrowUpRight className="w-4 h-4 text-yellow-400" />
                  <span>Withdraw Funds</span>
                </button>

                <button
                  onClick={() => setActiveTab('copy')}
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-2 border border-white/15 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-[#6dff8a]" />
                  <span>Copy Pro Investors</span>
                </button>
              </div>

              {/* Open Positions Quick Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">Active Positions ({userPositions.length})</h4>
                  <button 
                    onClick={() => setActiveTab('positions')} 
                    className="text-xs text-[#6dff8a] hover:underline"
                  >
                    View details
                  </button>
                </div>

                <div className="border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/10 bg-black/20">
                  {userPositions.map((pos) => (
                    <div key={pos.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold text-xs text-white">
                          {pos.symbol.slice(0, 3)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{pos.symbol}</span>
                            <span className="text-[10px] bg-[#6dff8a]/10 text-[#6dff8a] px-2 py-0.2 rounded font-bold">
                              {pos.type}
                            </span>
                          </div>
                          <span className="text-xs text-white/50">{pos.name} • {pos.units} units</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm font-bold text-white font-mono">
                            ${(parseFloat(pos.units) * pos.currentPrice).toFixed(2)}
                          </div>
                          <div className="text-xs font-semibold text-[#6dff8a]">
                            +${pos.profit.toFixed(2)} (+{pos.profitPercent}%)
                          </div>
                        </div>

                        <button
                          onClick={() => closePosition(pos.id)}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[#ff5c5c]/20 hover:text-[#ff5c5c] text-xs font-semibold text-white/80 transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ALL OPEN POSITIONS */}
          {activeTab === 'positions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Market Positions</h3>
                  <p className="text-xs text-[#a3a89e]">Manage active trade tickets or close out positions to realize profits.</p>
                </div>
                <button
                  disabled={!currentUser.allowTrading}
                  onClick={() => onOpenTrade('NVDA')}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                    currentUser.allowTrading
                      ? 'bg-[#6dff8a] text-[#15170f] hover:bg-[#5ce077]'
                      : 'bg-white/10 text-white/30 cursor-not-allowed'
                  }`}
                >
                  + New Trade
                </button>
              </div>

              {userPositions.length === 0 ? (
                <div className="py-12 text-center text-white/60 space-y-3">
                  <Layers className="w-10 h-10 mx-auto text-white/30" />
                  <p className="text-sm">No open positions currently active for this account.</p>
                  <button
                    onClick={() => onOpenTrade('BTC')}
                    className="px-4 py-2 rounded-full bg-[#6dff8a] text-[#15170f] font-bold text-xs"
                  >
                    Explore Markets
                  </button>
                </div>
              ) : (
                <div className="border border-white/10 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1a1d13] text-white/50 uppercase border-b border-white/10 font-mono text-[10px]">
                      <tr>
                        <th className="p-3.5">Asset</th>
                        <th className="p-3.5">Side</th>
                        <th className="p-3.5">Units</th>
                        <th className="p-3.5">Entry Price</th>
                        <th className="p-3.5">Current Price</th>
                        <th className="p-3.5">Value</th>
                        <th className="p-3.5">Profit / Loss</th>
                        <th className="p-3.5 text-right">Close Position</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-black/20">
                      {userPositions.map((pos) => (
                        <tr key={pos.id} className="hover:bg-white/[0.02]">
                          <td className="p-3.5 font-bold text-white flex items-center gap-2">
                            <span>{pos.symbol}</span>
                            <span className="text-white/40 font-normal truncate max-w-[90px]">{pos.name}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="text-[10px] font-bold bg-[#6dff8a]/20 text-[#6dff8a] px-2 py-0.5 rounded">
                              {pos.type}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono">{pos.units}</td>
                          <td className="p-3.5 font-mono">${pos.entryPrice.toFixed(2)}</td>
                          <td className="p-3.5 font-mono font-bold">${pos.currentPrice.toFixed(2)}</td>
                          <td className="p-3.5 font-mono">${(parseFloat(pos.units) * pos.currentPrice).toFixed(2)}</td>
                          <td className="p-3.5 font-mono font-bold text-[#6dff8a]">
                            +${pos.profit.toFixed(2)} (+{pos.profitPercent}%)
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => closePosition(pos.id)}
                              className="px-3 py-1 rounded bg-[#ff5c5c]/20 hover:bg-[#ff5c5c] text-[#ff5c5c] hover:text-white font-bold text-[11px] transition-colors"
                            >
                              Close Trade
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DEPOSIT */}
          {activeTab === 'deposit' && (
            <div className="max-w-md mx-auto space-y-5 py-4">
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-white">Deposit to {config.appName}</h3>
                <p className="text-xs text-[#a3a89e]">Fund your trading account. Submissions sync with the Admin Approvals Queue.</p>
              </div>

              {depositNotice && (
                <div className="p-4 rounded-2xl bg-[#6dff8a]/15 border border-[#6dff8a]/40 text-xs text-[#6dff8a] font-semibold text-center animate-fadeIn">
                  {depositNotice}
                </div>
              )}

              <form onSubmit={handleDepositSubmit} className="space-y-4 p-6 rounded-3xl bg-white/[0.03] border border-white/10">
                <div className="space-y-1.5">
                  <label className="text-xs text-white/70 block">Deposit Amount ($USD)</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-[#6dff8a] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      required
                      min={config.minDeposit}
                      step="any"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full bg-black/50 border border-white/15 rounded-xl pl-9 pr-4 py-3 text-white font-bold text-base focus:outline-none focus:border-[#6dff8a]"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    {['1000', '5000', '10000', '25000'].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDepositAmount(amt)}
                        className="flex-1 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 border border-white/5"
                      >
                        +${amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="text-xs text-white/70 block">Deposit Method</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {(['Bank Wire', 'Crypto (USDT/BTC)', 'Debit/Credit Card', 'Faster Payments'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setDepositMethod(m)}
                        className={`p-3 rounded-xl border text-left font-semibold transition-all ${
                          depositMethod === m
                            ? 'border-[#6dff8a] bg-[#6dff8a]/10 text-white'
                            : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <DepositInstructions method={depositMethod} payments={payments} reference={lastDeposit?.method === depositMethod ? lastDeposit.reference : currentUser.id} />

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3.5 rounded-2xl bg-[#6dff8a] hover:bg-[#5ce077] text-[#15170f] font-bold text-sm shadow-[0_0_20px_rgba(109,255,138,0.25)] transition-all disabled:opacity-60"
                >
                  {busy ? 'Submitting...' : `Submit Deposit of $${Number(depositAmount || 0).toLocaleString()}`}
                </button>
                <p className="text-[11px] text-white/40 text-center">Minimum deposit ${config.minDeposit}. Your balance is credited once our treasury desk confirms receipt.</p>
              </form>
            </div>
          )}

          {/* TAB 4: WITHDRAW */}
          {activeTab === 'withdraw' && (
            <div className="max-w-md mx-auto space-y-5 py-4">
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-white">Withdraw Funds</h3>
                <p className="text-xs text-[#a3a89e]">
                  Available Balance: <strong className="text-white">${currentUser.realBalance.toLocaleString()}</strong>
                </p>
              </div>

              {withdrawNotice && (
                <div className="p-4 rounded-2xl bg-yellow-400/15 border border-yellow-400/40 text-xs text-yellow-300 font-semibold text-center animate-fadeIn">
                  {withdrawNotice}
                </div>
              )}

              <form onSubmit={handleWithdrawalSubmit} className="space-y-4 p-6 rounded-3xl bg-white/[0.03] border border-white/10">
                <div className="space-y-1.5">
                  <label className="text-xs text-white/70 block">Withdrawal Amount ($USD)</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-yellow-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      required
                      min={config.minWithdrawal}
                      max={currentUser.realBalance}
                      step="any"
                      placeholder={`Min. $${config.minWithdrawal}`}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full bg-black/50 border border-white/15 rounded-xl pl-9 pr-4 py-3 text-white font-bold text-base focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-white/70 block">Disbursement Channel</label>
                  <select
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value as any)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Bank Wire">Bank Wire (SWIFT / Fedwire)</option>
                    <option value="SEPA Wire">SEPA Euro Wire</option>
                    <option value="Crypto (USDT/BTC)">Crypto (USDT ERC20 / TRC20)</option>
                    <option value="Faster Payments">UK Faster Payments</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-white/70 block">Destination Bank Account / Crypto Wallet</label>
                  <input
                    type="text"
                    required
                    placeholder={withdrawMethod.includes('Crypto') ? 'Wallet address and network (e.g. TRC20)' : 'Bank name, account name, account number / IBAN, SWIFT'}
                    value={withdrawDestination}
                    onChange={(e) => setWithdrawDestination(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                {currentUser.kycStatus !== 'Approved' && (
                  <div className="p-3 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-[11px] text-yellow-300">
                    Withdrawals require approved identity verification. <button type="button" onClick={() => setActiveTab('kyc')} className="underline font-bold">Complete KYC</button>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3.5 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-sm shadow-[0_0_20px_rgba(250,204,21,0.25)] transition-all disabled:opacity-60"
                >
                  {busy ? 'Submitting...' : `Request Release of $${Number(withdrawAmount || 0).toLocaleString()}`}
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: TRANSACTION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Client Funding &amp; Cashier History</h3>
                  <p className="text-xs text-[#a3a89e]">Real-time ledger entries, administrative adjustments, and status tracking.</p>
                </div>
              </div>

              <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/20">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#181b11] text-white/50 uppercase border-b border-white/10 font-mono text-[10px]">
                    <tr>
                      <th className="p-3.5">Ref / Date</th>
                      <th className="p-3.5">Transaction Type</th>
                      <th className="p-3.5">Channel</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {userTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-white/40">
                          No transactions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      userTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/[0.02]">
                          <td className="p-3.5 font-mono">
                            <div className="text-white font-bold">{tx.reference}</div>
                            <div className="text-white/40 text-[10px]">{tx.date}</div>
                          </td>

                          <td className="p-3.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              tx.type === 'Deposit' || tx.type === 'Admin Credit'
                                ? 'bg-[#6dff8a]/20 text-[#6dff8a]'
                                : 'bg-yellow-400/20 text-yellow-400'
                            }`}>
                              {tx.type}
                            </span>
                          </td>

                          <td className="p-3.5 text-white/80">{tx.method}</td>

                          <td className="p-3.5 font-mono font-bold text-white text-sm">
                            ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>

                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.status === 'Approved / Settled'
                                ? 'bg-[#6dff8a]/20 text-[#6dff8a]'
                                : tx.status === 'Pending Approval'
                                ? 'bg-yellow-400/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {tx.status}
                            </span>
                          </td>

                          <td className="p-3.5 text-white/60 text-xs max-w-xs truncate">
                            {tx.adminNote || tx.destination || 'Standard ledger clearing'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: COPYTRADER */}
          {activeTab === 'copy' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">CopyTrader™ Portfolio</h3>
                  <p className="text-xs text-[#a3a89e]">Pro Investors mirrored in your live account.</p>
                </div>
              </div>

              {copiedInvestors.length === 0 && (
                <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-3">
                  <p className="text-sm text-white/60">You are not copying anyone yet.</p>
                  <a href="/popular-investors" className="inline-block px-5 py-2.5 rounded-full bg-[#6dff8a] text-[#15170f] font-bold text-xs">Browse Popular Investors</a>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {copiedInvestors.map((inv) => (
                  <div key={inv.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#6dff8a]/20 border border-[#6dff8a]/40 flex items-center justify-center font-bold text-white text-sm">
                          {inv.name.slice(0, 2)}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{inv.name}</h4>
                          <span className="text-xs text-white/50">{inv.handle}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[#6dff8a]/20 text-[#6dff8a] text-[10px] font-bold">
                        {inv.status} • since {inv.startedDate}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-black/40 text-xs">
                      <div>
                        <span className="text-white/40 block text-[10px]">Allocated:</span>
                        <span className="font-bold text-white font-mono">${inv.allocated.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-[10px]">Current Value:</span>
                        <span className="font-bold text-white font-mono">${inv.currentValue.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-[10px]">Profit:</span>
                        <span className={`font-bold font-mono ${inv.profitPercent >= 0 ? 'text-[#6dff8a]' : 'text-[#ff5c5c]'}`}>{inv.profitPercent >= 0 ? '+' : ''}{inv.profitPercent}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-white/50">Risk Score: <strong>{inv.riskScore} / 10</strong></span>
                      <button
                        onClick={async () => {
                          try {
                            await stopCopy(inv.id);
                            notify(`Stopped copying ${inv.name}. Funds returned to your balance.`);
                          } catch (err) { notify(errMsg(err), 'error'); }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[#ff5c5c]/20 hover:text-[#ff5c5c] text-xs font-bold transition-colors"
                      >
                        Stop Copying
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: ACCOUNT & SECURITY */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <SecurityPanel
                user={currentUser}
                onNotify={notify}
                changePassword={changePassword}
                updateProfile={updateProfile}
                resendVerification={resendVerification}
                resetPractice={resetPractice}
              />
              <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                <h4 className="font-bold text-white text-sm">Regulatory &amp; Identity Verification</h4>
                
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/5">
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>Identity Verification ({currentUser.kycDocType})</span>
                        <span className="text-[10px] font-mono text-white/40">#{currentUser.kycDocNumber}</span>
                      </div>
                      <div className="text-white/50">{currentUser.tier}</div>
                      {currentUser.kycNotes && (
                        <div className="text-yellow-400 text-[11px] mt-1">Remark: {currentUser.kycNotes}</div>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full font-bold text-[11px] ${
                      currentUser.kycStatus === 'Approved'
                        ? 'bg-[#6dff8a]/20 text-[#6dff8a]'
                        : currentUser.kycStatus === 'Pending' || currentUser.kycStatus === 'Under Review'
                        ? 'bg-yellow-400/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {currentUser.kycStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/5">
                    <div>
                      <div className="font-bold text-white">Assigned Brokerage Desk &amp; Manager</div>
                      <div className="text-white/50">{currentUser.accountManager} • Priority Institutional Routing</div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-white font-bold text-[11px]">
                      ASSIGNED
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/5">
                    <div>
                      <div className="font-bold text-white">Client Margin &amp; Max Leverage</div>
                      <div className="text-white/50">Allocated leverage limit: 1:{currentUser.leverage}</div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#6dff8a]/20 text-[#6dff8a] font-mono font-bold text-[11px]">
                      1:{currentUser.leverage}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/5">
                    <div>
                      <div className="font-bold text-white">Investor Protection Guarantee</div>
                      <div className="text-white/50">Client funds kept separate from company funds</div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#6dff8a]/20 text-[#6dff8a] font-bold text-[11px]">
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
        </div>

      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// Deposit instructions (from admin Payment Settings / env vars)
// ------------------------------------------------------------------
const DepositInstructions: React.FC<{ method: string; payments: Record<string, string>; reference: string }> = ({ method, payments: p, reference }) => {
  const [copied, setCopied] = useState<string | null>(null);
  let rows: [string, string][] = [];
  if (method.includes('Crypto')) {
    rows = [['USDT (TRC20)', p.usdtTrc20], ['USDT (ERC20)', p.usdtErc20], ['Bitcoin (BTC)', p.btcAddress], ['Ethereum (ETH)', p.ethAddress]].filter(r => r[1]) as [string, string][];
  } else if (method.includes('Card')) {
    rows = p.cardPaymentUrl ? [['Card payment link', p.cardPaymentUrl]] : [];
  } else {
    rows = [['Bank', p.bankName], ['Account name', p.bankAccountName], ['Account number', p.bankAccountNumber], ['Sort code / routing', p.bankSortCode], ['IBAN', p.bankIban], ['SWIFT / BIC', p.bankSwift]].filter(r => r[1]) as [string, string][];
  }
  return (
    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
      <div className="font-bold text-white">Payment instructions - {method}</div>
      {rows.length === 0 ? (
        <p className="text-white/60">Submit your request and our treasury desk will email you payment instructions for this method.</p>
      ) : (
        rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-2">
            <span className="text-white/50 shrink-0">{k}</span>
            {v.startsWith('http') ? (
              <a href={v} target="_blank" rel="noopener noreferrer" className="text-[#6dff8a] underline truncate">Open payment page</a>
            ) : (
              <button type="button" onClick={() => { navigator.clipboard.writeText(v); setCopied(k); setTimeout(() => setCopied(null), 1500); }} className="font-mono text-white text-right break-all hover:text-[#6dff8a]" title="Copy">
                {v} {copied === k ? <Check className="inline w-3 h-3 text-[#6dff8a]" /> : <Copy className="inline w-3 h-3 opacity-50" />}
              </button>
            )}
          </div>
        ))
      )}
      <div className="flex items-center justify-between pt-1 border-t border-white/10">
        <span className="text-white/50">Payment reference</span><span className="font-mono text-[#6dff8a]">{reference}</span>
      </div>
      {p.instructions && <p className="text-white/40 text-[11px]">{p.instructions}</p>}
    </div>
  );
};

// ------------------------------------------------------------------
// Account security & profile
// ------------------------------------------------------------------
const SecurityPanel: React.FC<{
  user: any;
  onNotify: (m: string, t?: 'success' | 'error' | 'info') => void;
  changePassword: (a: string, b: string) => Promise<void>;
  updateProfile: (p: any) => Promise<void>;
  resendVerification: () => Promise<string>;
  resetPractice: () => Promise<void>;
}> = ({ user, onNotify, changePassword, updateProfile, resendVerification, resetPractice }) => {
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [phone, setPhone] = useState(user.phone || '');
  const [street, setStreet] = useState(user.streetAddress || '');
  const [city, setCity] = useState(user.city || '');
  const [postal, setPostal] = useState(user.postalCode || '');
  const input = 'w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6dff8a]';
  const run = async (fn: () => Promise<any>, ok: string) => {
    try { const r = await fn(); onNotify(typeof r === 'string' ? r : ok); } catch (e) { onNotify(errMsg(e), 'error'); }
  };
  return (
    <div className="space-y-6">
      <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-3">
        <h4 className="font-bold text-white text-sm">Profile</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div><span className="text-white/40 block">Name</span><span className="text-white font-semibold">{user.name}</span></div>
          <div>
            <span className="text-white/40 block">Email</span>
            <span className="text-white font-semibold">{user.email}</span>{' '}
            {user.emailVerified
              ? <span className="text-[10px] text-[#6dff8a] font-bold">VERIFIED</span>
              : <button onClick={() => run(resendVerification, 'Verification email sent')} className="text-[10px] text-yellow-400 font-bold underline">Verify email</button>}
          </div>
          <div><span className="text-white/40 block">Client ID</span><span className="text-white font-mono">{user.id}</span></div>
          <div><span className="text-white/40 block">Country</span><span className="text-white">{user.country || '-'}</span></div>
          <label className="space-y-1"><span className="text-white/40 block">Phone</span><input className={input} value={phone} onChange={e => setPhone(e.target.value)} /></label>
          <label className="space-y-1"><span className="text-white/40 block">Street address</span><input className={input} value={street} onChange={e => setStreet(e.target.value)} /></label>
          <label className="space-y-1"><span className="text-white/40 block">City</span><input className={input} value={city} onChange={e => setCity(e.target.value)} /></label>
          <label className="space-y-1"><span className="text-white/40 block">Postal code</span><input className={input} value={postal} onChange={e => setPostal(e.target.value)} /></label>
        </div>
        <button onClick={() => run(() => updateProfile({ phone, streetAddress: street, city, postalCode: postal }), 'Profile updated')} className="px-4 py-2 rounded-xl bg-[#6dff8a] text-[#15170f] font-bold text-xs">Save profile</button>
      </div>

      <form
        className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-3"
        onSubmit={e => { e.preventDefault(); run(async () => { await changePassword(cur, next); setCur(''); setNext(''); }, 'Password changed. A confirmation email has been sent.'); }}
      >
        <h4 className="font-bold text-white text-sm flex items-center gap-2"><Lock className="w-4 h-4 text-[#6dff8a]" />Change password</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="password" required placeholder="Current password" className={input} value={cur} onChange={e => setCur(e.target.value)} />
          <input type="password" required minLength={8} placeholder="New password (min. 8)" className={input} value={next} onChange={e => setNext(e.target.value)} />
        </div>
        <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs">Update password</button>
      </form>

      <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3">
        <div>
          <h4 className="font-bold text-white text-sm">Practice account</h4>
          <p className="text-xs text-white/50">Virtual balance: ${Number(user.virtualBalance || 0).toLocaleString()}</p>
        </div>
        <button onClick={() => run(resetPractice, 'Practice balance reset')} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs">Reset virtual balance</button>
      </div>
    </div>
  );
};

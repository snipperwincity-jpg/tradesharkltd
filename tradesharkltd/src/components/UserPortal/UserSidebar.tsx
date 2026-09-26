import React, { useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Layers, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  Mail, 
  Users, 
  FileText, 
  Settings, 
  Copy, 
  Check, 
  Home, 
  ShieldAlert, 
  Eye, 
  Building2,
  Lock,
  LogOut
} from 'lucide-react';
import { TradeSharkLogo } from '../TradeSharkLogo';
import { UserAccount } from '../../types';

export type UserTab = 
  | 'portfolio' 
  | 'positions' 
  | 'markets' 
  | 'deposit' 
  | 'withdraw' 
  | 'kyc' 
  | 'inbox' 
  | 'copy' 
  | 'history' 
  | 'settings';

interface UserSidebarProps {
  activeTab: UserTab;
  onSelectTab: (tab: UserTab) => void;
  currentUser: UserAccount;
  accountType: 'real' | 'virtual';
  onToggleAccountType: (type: 'real' | 'virtual') => void;
  positionsCount: number;
  unreadEmailsCount: number;
  onOpenAdminPortal?: () => void;
  onLogout?: () => void;
  onClose: () => void;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  accountType,
  onToggleAccountType,
  positionsCount,
  unreadEmailsCount,
  onOpenAdminPortal,
  onLogout,
  onClose
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyUserLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#user`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const navItems: { id: UserTab; label: string; icon: React.ReactNode; badge?: React.ReactNode; group: string }[] = [
    {
      id: 'portfolio',
      label: 'Portfolio Overview',
      icon: <Wallet className="w-4 h-4" />,
      group: 'PORTFOLIO & TRADING'
    },
    {
      id: 'positions',
      label: 'Active Positions',
      icon: <Layers className="w-4 h-4" />,
      badge: positionsCount > 0 ? (
        <span className="px-1.5 py-0.2 rounded-full bg-[#6dff8a] text-[#15170f] font-bold text-[10px]">
          {positionsCount}
        </span>
      ) : undefined,
      group: 'PORTFOLIO & TRADING'
    },
    {
      id: 'copy',
      label: 'CopyTrader™ Portfolios',
      icon: <Users className="w-4 h-4" />,
      group: 'PORTFOLIO & TRADING'
    },
    {
      id: 'deposit',
      label: 'Deposit Funds',
      icon: <ArrowDownLeft className="w-4 h-4 text-[#6dff8a]" />,
      group: 'CASHIER & TRANSFERS'
    },
    {
      id: 'withdraw',
      label: 'Withdraw Capital',
      icon: <ArrowUpRight className="w-4 h-4 text-yellow-400" />,
      group: 'CASHIER & TRANSFERS'
    },
    {
      id: 'history',
      label: 'Funding & Trade History',
      icon: <FileText className="w-4 h-4" />,
      group: 'CASHIER & TRANSFERS'
    },
    {
      id: 'kyc',
      label: 'KYC & Verification',
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: (
        <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
          currentUser.kycStatus === 'Approved'
            ? 'bg-[#6dff8a]/20 text-[#6dff8a]'
            : currentUser.kycStatus === 'Action Required'
            ? 'bg-red-500/20 text-red-400 animate-pulse'
            : 'bg-yellow-400/20 text-yellow-400'
        }`}>
          {currentUser.kycStatus}
        </span>
      ),
      group: 'COMPLIANCE & INBOX'
    },
    {
      id: 'inbox',
      label: 'Official Inbox & Notices',
      icon: <Mail className="w-4 h-4" />,
      badge: unreadEmailsCount > 0 ? (
        <span className="px-1.5 py-0.2 rounded-full bg-cyan-400 text-[#15170f] font-bold text-[10px]">
          {unreadEmailsCount}
        </span>
      ) : undefined,
      group: 'COMPLIANCE & INBOX'
    },
    {
      id: 'settings',
      label: 'Security & Tier Settings',
      icon: <Settings className="w-4 h-4" />,
      group: 'ACCOUNT'
    }
  ];

  const grouped = navItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  return (
    <aside className="w-64 sm:w-72 bg-[#12140c] border-r border-white/10 flex flex-col h-full select-none shrink-0">
      {/* Brand & Client Header */}
      <div className="p-4 sm:p-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <TradeSharkLogo size="sm" showLtd={true} />
          <span className="text-[9px] bg-[#6dff8a]/20 text-[#6dff8a] border border-[#6dff8a]/30 font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            CLIENT PORTAL
          </span>
        </div>

        {/* User Card */}
        <div className="mt-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white truncate max-w-[130px]">{currentUser.name}</div>
              <div className="text-[10px] text-white/50 truncate">{currentUser.tier}</div>
            </div>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
              currentUser.kycStatus === 'Approved' ? 'bg-[#6dff8a]/20 text-[#6dff8a]' : 'bg-yellow-400/20 text-yellow-400'
            }`}>
              {currentUser.kycStatus === 'Approved' ? 'PRO VERIFIED' : currentUser.kycStatus}
            </span>
          </div>

          {/* Real vs Virtual Toggle */}
          <div className="grid grid-cols-2 p-1 bg-black/40 rounded-xl border border-white/10 text-[11px] font-semibold">
            <button
              onClick={() => onToggleAccountType('real')}
              className={`py-1 rounded-lg transition-colors ${
                accountType === 'real'
                  ? 'bg-[#6dff8a] text-[#15170f] font-bold shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Real Money
            </button>
            <button
              onClick={() => onToggleAccountType('virtual')}
              className={`py-1 rounded-lg transition-colors ${
                accountType === 'virtual'
                  ? 'bg-white/20 text-white font-bold shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Practice ($100k)
            </button>
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px]">
            <span className="text-white/50">Available Cash:</span>
            <span className="font-mono font-bold text-[#6dff8a]">
              ${(accountType === 'real' ? currentUser.realBalance : currentUser.virtualBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Direct Link Info */}
      <div className="p-3 mx-3 mt-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs space-y-2">
        <div className="flex items-center justify-between text-[11px] text-white/60">
          <span>Direct Client Link:</span>
          <span className="font-mono text-[#6dff8a] font-bold">/#user</span>
        </div>
        <button
          onClick={handleCopyUserLink}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] font-semibold transition-colors"
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#6dff8a]" />
              <span className="text-[#6dff8a]">Client URL Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-white/70" />
              <span>Copy Direct Link</span>
            </>
          )}
        </button>
      </div>

      {/* Navigation Options Grouped */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4 text-xs no-scrollbar">
        {Object.entries(grouped).map(([groupTitle, items]) => (
          <div key={groupTitle} className="space-y-1">
            <span className="text-[10px] font-mono tracking-wider uppercase text-white/40 px-3 block">
              {groupTitle}
            </span>
            {items.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all ${
                    isActive
                      ? 'bg-[#6dff8a]/15 text-[#6dff8a] border border-[#6dff8a]/30 font-bold shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-[#6dff8a]' : 'text-white/60'}>
                      {item.icon}
                    </span>
                    <span className="text-left">{item.label}</span>
                  </div>
                  {item.badge}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Switcher & Return Links */}
      <div className="p-3 border-t border-white/10 bg-[#10120a] space-y-1.5 text-xs">
        {onOpenAdminPortal && (
          <button
            onClick={onOpenAdminPortal}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-yellow-400/20 text-white/80 hover:text-yellow-400 border border-white/10 transition-colors"
            title="Open Admin Console (/#admin)"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-yellow-400" />
              <span className="font-semibold text-[11px]">Admin Console</span>
            </div>
            <span className="text-[10px] font-mono text-white/40">/#admin</span>
          </button>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 transition-colors"
            title="Sign out of trading account"
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5" />
              <span className="font-semibold text-[11px]">Sign Out</span>
            </div>
            <span className="text-[10px] text-red-400/60 font-mono">End Session</span>
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5 transition-colors"
          title="Return to Public Website"
        >
          <div className="flex items-center gap-2">
            <Home className="w-3.5 h-3.5" />
            <span className="text-[11px]">Back to Website</span>
          </div>
          <span className="text-[10px] font-mono text-white/40">/#home</span>
        </button>
      </div>
    </aside>
  );
};

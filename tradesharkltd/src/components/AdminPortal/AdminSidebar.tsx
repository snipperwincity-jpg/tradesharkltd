import React from 'react';
import { 
  Users, 
  ShieldCheck, 
  DollarSign, 
  Sliders, 
  FileText, 
  UserPlus, 
  Mail, 
  BarChart3, 
  ExternalLink, 
  Copy, 
  Check, 
  Home, 
  Eye,
  LogOut
} from 'lucide-react';
import { TradeSharkLogo } from '../TradeSharkLogo';
import { AdminSession } from './AdminLoginGate';

export type AdminTab = 'overview' | 'users' | 'setup' | 'kyc' | 'funding' | 'emails' | 'markets' | 'audit' | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingKycCount: number;
  pendingFundingCount: number;
  unreadInquiriesCount: number;
  usersCount: number;
  adminSession?: AdminSession | null;
  onLogout?: () => void;
  onSwitchToUserPortal?: () => void;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingKycCount,
  pendingFundingCount,
  unreadInquiriesCount,
  usersCount,
  adminSession,
  onLogout,
  onSwitchToUserPortal,
  onClose
}) => {
  const [copiedLink, setCopiedLink] = React.useState(false);

  const handleCopyAdminLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#admin`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: React.ReactNode; group: string }[] = [
    {
      id: 'overview',
      label: 'Executive Overview',
      icon: <BarChart3 className="w-4 h-4" />,
      group: 'COMMAND & CONTROL'
    },
    {
      id: 'users',
      label: 'Accounts & Permissions',
      icon: <Users className="w-4 h-4" />,
      badge: <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] font-mono text-white/80">{usersCount}</span>,
      group: 'COMMAND & CONTROL'
    },
    {
      id: 'setup',
      label: 'Provision New Account',
      icon: <UserPlus className="w-4 h-4" />,
      group: 'COMMAND & CONTROL'
    },
    {
      id: 'kyc',
      label: 'KYC Verification Desk',
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: pendingKycCount > 0 ? (
        <span className="px-1.5 py-0.2 rounded-full bg-yellow-400 text-[#15170f] font-bold text-[10px] animate-pulse">
          {pendingKycCount}
        </span>
      ) : undefined,
      group: 'COMPLIANCE & RISK'
    },
    {
      id: 'funding',
      label: 'Fundings & Treasury',
      icon: <DollarSign className="w-4 h-4" />,
      badge: pendingFundingCount > 0 ? (
        <span className="px-1.5 py-0.2 rounded-full bg-[#6dff8a] text-[#15170f] font-bold text-[10px]">
          {pendingFundingCount}
        </span>
      ) : undefined,
      group: 'COMPLIANCE & RISK'
    },
    {
      id: 'emails',
      label: 'Emailing & Dispatches',
      icon: <Mail className="w-4 h-4" />,
      badge: unreadInquiriesCount > 0 ? (
        <span className="px-1.5 py-0.2 rounded-full bg-cyan-400 text-[#15170f] font-bold text-[10px]">
          {unreadInquiriesCount}
        </span>
      ) : undefined,
      group: 'COMMUNICATIONS'
    },
    {
      id: 'markets',
      label: 'Market & Risk Controls',
      icon: <Sliders className="w-4 h-4" />,
      group: 'TRADING DESK'
    },
    {
      id: 'audit',
      label: 'Regulatory Audit Trail',
      icon: <FileText className="w-4 h-4" />,
      group: 'TRADING DESK'
    },
    {
      id: 'settings',
      label: 'Payment Settings',
      icon: <Sliders className="w-4 h-4" />,
      group: 'TRADING DESK'
    }
  ];

  const grouped = navItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  return (
    <aside className="w-64 sm:w-72 bg-[#12140c] border-r border-white/10 flex flex-col h-full select-none shrink-0">
      {/* Brand & Portal Type Header */}
      <div className="p-4 sm:p-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <TradeSharkLogo size="sm" showLtd={true} />
          <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            ADMIN DESK
          </span>
        </div>
        <div className="mt-2 text-xs text-white/50 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6dff8a] animate-ping" />
          <span>Back-Office Control Suite</span>
        </div>
      </div>

      {/* Direct Link Info & Quick Action */}
      <div className="p-3 mx-3 mt-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs space-y-2">
        <div className="flex items-center justify-between text-[11px] text-white/60">
          <span>Direct Admin Link:</span>
          <span className="font-mono text-[#6dff8a] font-bold">/#admin</span>
        </div>
        <button
          onClick={handleCopyAdminLink}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] font-semibold transition-colors"
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#6dff8a]" />
              <span className="text-[#6dff8a]">Admin URL Copied!</span>
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

      {/* Active Session & Operator Status */}
      {adminSession && (
        <div className="mx-3 mb-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-white">
              <span className="w-2 h-2 rounded-full bg-[#6dff8a] animate-pulse" />
              <span className="truncate">{adminSession.name}</span>
            </div>
            <span className="text-[9px] font-mono text-white/50 bg-white/5 px-1 rounded">
              @{adminSession.username}
            </span>
          </div>
          <div className="text-[10px] text-white/60 mb-2 flex items-center justify-between">
            <span className="truncate">{adminSession.role}</span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-[11px] font-semibold transition-colors"
              title="Terminate administrative session and lock console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out / Lock Console</span>
            </button>
          )}
        </div>
      )}

      {/* Bottom Switcher & Return Links */}
      <div className="p-3 border-t border-white/10 bg-[#10120a] space-y-1.5 text-xs">
        {onSwitchToUserPortal && (
          <button
            onClick={onSwitchToUserPortal}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-[#6dff8a]/20 text-white/80 hover:text-[#6dff8a] border border-white/10 transition-colors"
            title="Open Client Portal (/#user)"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-[#6dff8a]" />
              <span className="font-semibold text-[11px]">Client Portal</span>
            </div>
            <span className="text-[10px] font-mono text-white/40">/#user</span>
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

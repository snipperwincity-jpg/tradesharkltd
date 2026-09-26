import React, { useState } from 'react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  X,
  Key
} from 'lucide-react';
import { TradeSharkLogo } from '../TradeSharkLogo';
import { useBrokerage } from '../../context/BrokerageContext';
import { errMsg } from '../../lib/api';

export interface AdminSession {
  username: string;
  role: string;
  name: string;
  loginTime: number;
  expiresAt: number;
  sessionType: '30m' | '4h' | '24h' | 'tab';
  token: string;
}

interface AdminLoginGateProps {
  onLoginSuccess: (session: AdminSession) => void;
  onClose: () => void;
  sessionExpiredNotice?: boolean;
}

export const AdminLoginGate: React.FC<AdminLoginGateProps> = ({
  onLoginSuccess,
  onClose,
  sessionExpiredNotice = false
}) => {
  const { loginAdmin } = useBrokerage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const a = await loginAdmin(username.trim(), password, rememberMe);
      onLoginSuccess({
        username: a.username,
        role: a.role,
        name: a.name,
        loginTime: Date.now(),
        expiresAt: a.expiresAt,
        sessionType: rememberMe ? '24h' : 'tab',
        token: 'cookie',
      });
    } catch (err) {
      setErrorMessage(errMsg(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-[#12150d] border border-[#6dff8a]/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col sm:flex-row relative text-left text-white animate-fadeIn">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white/50 hover:text-white transition-colors border border-white/10"
        title="Close"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Left Side: Institutional Server & Operations Visual Banner */}
      <div className="relative sm:w-5/12 hidden sm:flex flex-col justify-between p-6 bg-[#0a0d07] border-b sm:border-b-0 sm:border-r border-white/10 overflow-hidden shrink-0">
        <img
          src="/images/admin-login.jpg"
          alt="TradeShark Server Operations"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-50 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#10130a] via-[#10130a]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#12150d]" />

        {/* Top Status */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/70 border border-white/15 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#6dff8a] animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-white tracking-wider uppercase">Risk Operations</span>
          </div>
        </div>

        {/* Bottom Desk Telemetry */}
        <div className="relative z-10 space-y-2.5 pt-28">
          <div className="p-3 rounded-xl bg-black/65 border border-white/10 backdrop-blur-md space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Node Cluster</span>
              <span className="text-[#6dff8a] font-mono font-semibold">LD4-LON #01</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Escrow Vault</span>
              <span className="text-white font-mono font-semibold">Separate client funds</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Audit Protocol</span>
              <span className="text-yellow-400 font-mono font-semibold">Audit Trail</span>
            </div>
          </div>
          <p className="text-[10px] text-white/50">
            Encrypted session channel for authorized risk and compliance officers.
          </p>
        </div>
      </div>

      {/* Right Side: Form Area */}
      <div className="flex-1 p-6 sm:p-7 flex flex-col justify-center bg-[#12150d]">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5 pb-3.5 border-b border-white/10">
          <TradeSharkLogo size="sm" showLtd={true} />
          <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 font-mono px-2 py-0.5 rounded font-bold uppercase">
            Admin
          </span>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Admin Login</span>
            <Lock className="w-4 h-4 text-[#6dff8a]" />
          </h2>
        </div>

        {sessionExpiredNotice && (
          <div className="mb-4 p-2.5 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs">
            Session expired. Please sign in again.
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="text-xs text-white/70 block mb-1">
              Username
            </label>
            <input
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#181c10] border border-white/15 focus:border-[#6dff8a] rounded-xl px-3 py-2 text-sm text-white outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-white/70 block mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#181c10] border border-white/15 focus:border-[#6dff8a] rounded-xl px-3 py-2 pr-9 text-sm text-white outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Remember Me / Session */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-white/60 hover:text-white/80 transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-[#181c10] border-white/20 text-[#6dff8a] focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span>Remember session (24h)</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 rounded-xl bg-[#6dff8a] hover:bg-[#5ce077] text-[#15170f] font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Key className="w-3.5 h-3.5" />
                <span>Sign In to Admin Desk</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

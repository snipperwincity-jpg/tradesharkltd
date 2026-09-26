import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  UserPlus,
  Globe,
  Phone
} from 'lucide-react';
import { TradeSharkLogo } from '../TradeSharkLogo';
import { useBrokerage } from '../../context/BrokerageContext';
import { UserAccount } from '../../types';
import { errMsg } from '../../lib/api';
import { navigate } from '../../lib/router';
import { COUNTRIES } from '../../data/countries';

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  loginTime: number;
  expiresAt: number;
  sessionType: 'tab' | '24h';
}

interface UserLoginGateProps {
  onLoginSuccess: (session: UserSession, user: UserAccount) => void;
  onClose: () => void;
}

export const UserLoginGate: React.FC<UserLoginGateProps> = ({
  onLoginSuccess,
  onClose
}) => {
  const { loginUser, registerUser, config } = useBrokerage();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login Fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCountry, setRegCountry] = useState('');
  const [regAgreed, setRegAgreed] = useState(false);

  // Status & Feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const toSession = (user: UserAccount, remember: boolean): UserSession => ({
    userId: user.id,
    name: user.name,
    email: user.email,
    loginTime: Date.now(),
    expiresAt: Date.now() + (remember ? 30 : 0.5) * 24 * 3600 * 1000,
    sessionType: remember ? '24h' : 'tab',
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const user = await loginUser(loginIdentifier.trim(), loginPassword, rememberMe);
      onLoginSuccess(toSession(user, rememberMe), user);
    } catch (err) {
      setErrorMessage(errMsg(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const user = await registerUser({ name: regName.trim(), email: regEmail.trim(), password: regPassword, phone: regPhone.trim(), country: regCountry });
      onLoginSuccess(toSession(user, true), user);
    } catch (err) {
      setErrorMessage(errMsg(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-[#14170e] border border-[#6dff8a]/25 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative text-left animate-fadeIn">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white/70 hover:text-white transition-colors border border-white/10"
        title="Close"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Left Side: Photography Banner */}
      <div className="relative md:w-5/12 hidden sm:flex flex-col justify-between p-7 bg-[#0d1008] border-b md:border-b-0 md:border-r border-white/10 overflow-hidden shrink-0">
        <img
          src="/images/user-login.jpg"
          alt="TradeShark Trading Platform"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-45 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#10130a] via-[#10130a]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#14170e]" />

        {/* Top Tag */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 border border-[#6dff8a]/40 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#6dff8a] animate-pulse" />
            <span className="text-[11px] font-semibold text-white tracking-wide">Client WebTrader Portal</span>
          </div>
        </div>

        {/* Bottom Trust Telemetry */}
        <div className="relative z-10 space-y-3 pt-24">
          <div className="p-3.5 rounded-2xl bg-black/65 border border-white/10 backdrop-blur-md space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Execution Latency</span>
              <span className="text-[#6dff8a] font-mono font-bold">&lt; 1.2ms</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Global Client Capital</span>
              <span className="text-white font-mono font-bold">Kept separate</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Account Security</span>
              <span className="text-yellow-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>KYC Verified</span>
              </span>
            </div>
          </div>

          <p className="text-[11px] text-white/50 leading-relaxed">
            Trade global stocks, ETFs, crypto and currencies from one secure account.
          </p>
        </div>
      </div>

      {/* Right Side: Authentication Form */}
      <div className="flex-1 p-6 sm:p-8 md:p-9 flex flex-col justify-center bg-[#14170e]">
        {/* Header */}
        <div className="space-y-1 mb-5">
          <TradeSharkLogo size="sm" showLtd={true} className="mb-2" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {mode === 'login' ? 'Sign In to Client Portal' : 'Open Trading Account'}
          </h2>
          <p className="text-xs text-[#a3a89e]">
            {mode === 'login' 
              ? 'Enter your registered credentials to access your live portfolio.' 
              : 'Register to access multi-asset markets and institutional tools.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex p-1 bg-black/50 border border-white/10 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(null); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              mode === 'login' 
                ? 'bg-[#6dff8a] text-[#15170f] shadow-sm' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMessage(null); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              mode === 'register' 
                ? 'bg-[#6dff8a] text-[#15170f] shadow-sm' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Mode 1: LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs text-white/70 block mb-1">
                Email Address or Client ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full bg-[#181c10] border border-white/15 focus:border-[#6dff8a] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/70 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#181c10] border border-white/15 focus:border-[#6dff8a] rounded-xl pl-9 pr-9 py-2.5 text-xs text-white outline-none transition-colors"
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

            {/* Remember Me */}
            <div className="pt-0.5 flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-white/60 hover:text-white/80 transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-[#181c10] border-white/20 text-[#6dff8a] focus:ring-0 cursor-pointer"
                />
                <span>Keep me signed in</span>
              </label>
              <button type="button" onClick={() => { onClose(); navigate('/forgot-password'); }} className="text-[#6dff8a] hover:underline">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-[#6dff8a] hover:bg-[#5ce077] text-[#15170f] font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(109,255,138,0.2)] transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

          </form>
        ) : (
          /* Mode 2: REGISTER FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-white/70 block mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full bg-[#181c10] border border-white/15 focus:border-[#6dff8a] rounded-xl px-3.5 py-2 text-xs text-white outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs text-white/70 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-[#181c10] border border-white/15 focus:border-[#6dff8a] rounded-xl pl-8 pr-3 py-2 text-xs text-white outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-[#181c10] border border-white/15 focus:border-[#6dff8a] rounded-xl pl-8 pr-3 py-2 text-xs text-white outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs text-white/70 block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="Phone number"
                    className="w-full bg-[#181c10] border border-white/15 focus:border-[#6dff8a] rounded-xl pl-8 pr-3 py-2 text-xs text-white outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Country of Residence</label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    required
                    value={regCountry}
                    onChange={(e) => setRegCountry(e.target.value)}
                    className="w-full bg-[#181c10] border border-white/15 focus:border-[#6dff8a] rounded-xl pl-8 pr-3 py-2 text-xs text-white outline-none transition-colors"
                  >
                    <option value="">Select country...</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-2 text-[11px] text-[#a3a89e] cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={regAgreed}
                onChange={(e) => setRegAgreed(e.target.checked)}
                required
                className="accent-[#6dff8a] w-3.5 h-3.5 mt-0.5"
              />
              <span>
                I agree to the <a href="/terms" target="_blank" className="text-[#6dff8a] underline">Terms</a>, <a href="/privacy" target="_blank" className="text-[#6dff8a] underline">Privacy Policy</a> and <a href="/risk-disclosure" target="_blank" className="text-[#6dff8a] underline">Risk Disclosure</a>.
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-1 py-3 rounded-xl bg-[#6dff8a] hover:bg-[#5ce077] text-[#15170f] font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(109,255,138,0.2)] transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account & Open Terminal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

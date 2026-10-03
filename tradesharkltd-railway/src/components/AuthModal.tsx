import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { TradeSharkLogo } from './TradeSharkLogo';
import { useBrokerage } from '../context/BrokerageContext';
import { errMsg } from '../lib/api';
import { navigate } from '../lib/router';

interface AuthModalProps {
  isOpen: boolean;
  mode: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (user: { name: string; email: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = (props) => (props.isOpen ? <AuthModalInner {...props} /> : null);

const AuthModalInner: React.FC<AuthModalProps> = ({ 
  mode: initialMode, 
  onClose,
  onSuccess
}) => {
  const { loginUser, registerUser, verifyOtp, resendOtp, config } = useBrokerage();

  const [mode, setMode] = useState<'login' | 'signup' | 'otp'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [debugOtp, setDebugOtp] = useState<string | undefined>();
  const [registeredUser, setRegisteredUser] = useState<any>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);
    setIsLoading(true);
    try {
      if (mode === 'login') {
        const user = await loginUser(email.trim(), password, rememberMe);
        setSubmitted(true);
        setTimeout(() => {
          onSuccess({ name: user.name, email: user.email });
          onClose();
        }, 600);
      } else if (mode === 'signup') {
        const user = await registerUser({ name: fullName.trim(), email: email.trim(), password });
        setRegisteredUser(user);
        setDebugOtp(user.debugOtp);
        setMode('otp');
        setResendCooldown(30);
        setInfoMessage(`We've sent a 6-digit verification code to ${email.trim()}.`);
      } else if (mode === 'otp') {
        const user = await verifyOtp(email.trim(), otpCode.trim());
        setSubmitted(true);
        setTimeout(() => {
          onSuccess({ name: user.name, email: user.email });
          onClose();
        }, 600);
      }
    } catch (err) {
      setErrorMessage(errMsg(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !email.trim()) return;
    setErrorMessage(null);
    try {
      const r = await resendOtp(email.trim());
      if (r.debugOtp) setDebugOtp(r.debugOtp);
      setInfoMessage(r.message || `A new code has been sent to ${email.trim()}.`);
      setResendCooldown(30);
    } catch (err) {
      setErrorMessage(errMsg(err));
    }
  };

  const handleSkipOtp = () => {
    if (registeredUser) {
      setSubmitted(true);
      setTimeout(() => {
        onSuccess({ name: registeredUser.name, email: registeredUser.email });
        onClose();
      }, 400);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-4xl bg-[#14170e] border border-[#6dff8a]/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white/70 hover:text-white transition-colors border border-white/10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Side: Rich Financial Trading Visual Banner */}
        <div className="relative md:w-5/12 hidden sm:flex flex-col justify-between p-7 bg-[#0d1008] border-b md:border-b-0 md:border-r border-white/10 overflow-hidden shrink-0">
          <img
            src="/images/user-login.jpg"
            alt="TradeShark Financial Markets"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-45 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#10130a] via-[#10130a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#14170e]" />

          {/* Top Brand Pill */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 border border-[#6dff8a]/40 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#6dff8a] animate-pulse" />
              <span className="text-[11px] font-semibold text-white tracking-wide">Next-Gen Multi-Asset Broker</span>
            </div>
          </div>

          {/* Bottom Live Market Trust Metrics */}
          <div className="relative z-10 space-y-3 pt-24">
            <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Execution Speed</span>
                <span className="text-[#6dff8a] font-mono font-bold">&lt; 1.2ms</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Markets Available</span>
                <span className="text-white font-mono font-bold">Stocks • Crypto • FX</span>
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
              Trade over 5,000 global stocks, forex pairs, indices, and crypto from one account.
            </p>
          </div>
        </div>

        {/* Right Side: Form Content */}
        <div className="flex-1 p-6 sm:p-8 md:p-9 flex flex-col justify-center bg-[#14170e]">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#6dff8a]/20 text-[#6dff8a] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                {mode === 'signup' ? 'Welcome to TradeShark Ltd!' : 'Welcome Back!'}
              </h3>
              <p className="text-sm text-[#a3a89e]">
                Redirecting you to your TradeShark verified multi-asset dashboard...
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              
              {/* Header */}
              <div className="space-y-1.5">
                <TradeSharkLogo size="sm" showLtd={true} className="mb-2" />
                {mode === 'otp' ? (
                  <>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6dff8a]/10 border border-[#6dff8a]/30 text-[#6dff8a] text-xs font-bold mb-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Security Verification</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      Enter Verification Code
                    </h3>
                    <p className="text-xs text-[#a3a89e]">
                      We sent a 6-digit One-Time Passcode (OTP) to <strong className="text-white">{email}</strong>.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {mode === 'signup' ? 'Create your TradeShark account' : 'Log in to TradeShark'}
                    </h3>
                    <p className="text-xs text-[#a3a89e]">
                      {mode === 'signup' 
                        ? 'Start trading stocks, crypto, and ETFs today.' 
                        : 'Access your portfolio, live watchlists, and markets.'}
                    </p>
                  </>
                )}
              </div>

              {/* Info Message */}
              {infoMessage && (
                <div className="p-3 rounded-xl bg-[#6dff8a]/15 border border-[#6dff8a]/30 text-[#6dff8a] text-xs flex items-start gap-2.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{infoMessage}</span>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              {mode === 'otp' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {debugOtp && (
                    <div 
                      onClick={() => setOtpCode(debugOtp)}
                      className="p-3 rounded-xl bg-[#6dff8a]/10 border border-[#6dff8a]/30 text-xs text-[#6dff8a] cursor-pointer hover:bg-[#6dff8a]/20 transition-all flex items-center justify-between"
                    >
                      <span>Demo Preview Code: <strong className="font-mono text-sm tracking-widest">{debugOtp}</strong></span>
                      <span className="text-[10px] underline">Click to autofill</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs text-white/70 block">Enter 6-Digit Verification Code</label>
                    <input
                      type="text"
                      required
                      autoFocus
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full bg-black/50 border border-white/20 focus:border-[#6dff8a] rounded-2xl py-3.5 text-center text-2xl font-mono font-extrabold tracking-[0.4em] text-[#6dff8a] focus:outline-none transition-all placeholder:text-white/20"
                    />
                    <p className="text-[11px] text-white/40">Check your inbox and spam folder. Code is valid for 15 minutes.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otpCode.length < 6}
                    className="w-full py-3.5 rounded-xl bg-[#6dff8a] hover:bg-[#5ce077] text-[#15170f] font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(109,255,138,0.2)] transition-all cursor-pointer disabled:opacity-40"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Verify & Open Client Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <button
                      type="button"
                      disabled={resendCooldown > 0}
                      onClick={handleResendOtp}
                      className={`font-semibold transition-colors ${resendCooldown > 0 ? 'text-white/40 cursor-not-allowed' : 'text-[#6dff8a] hover:underline cursor-pointer'}`}
                    >
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                    </button>

                    <button
                      type="button"
                      onClick={handleSkipOtp}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      Verify later &rarr;
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {mode === 'signup' && (
                    <div className="space-y-1">
                      <label className="text-xs text-white/70">Full Legal Name</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#6dff8a]"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs text-white/70">
                      {mode === 'signup' ? 'Email Address' : 'Email Address or Client ID'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        autoComplete="username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#6dff8a]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-white/70">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                        minLength={mode === 'signup' ? 8 : undefined}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-9 py-2.5 text-xs text-white focus:outline-none focus:border-[#6dff8a]"
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

                  {mode === 'login' && (
                    <label className="flex items-center gap-2 text-xs text-white/60 hover:text-white/80 cursor-pointer pt-0.5 select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded bg-black/40 border-white/20 text-[#6dff8a] focus:ring-0 cursor-pointer"
                      />
                      <span>Keep me signed in</span>
                    </label>
                  )}
                  {mode === 'login' && (
                    <button type="button" onClick={() => { onClose(); navigate('/forgot-password'); }} className="text-xs text-[#6dff8a] hover:underline">
                      Forgot password?
                    </button>
                  )}

                  {mode === 'signup' && (
                    <label className="flex items-start gap-2 text-[11px] text-[#a3a89e] cursor-pointer pt-0.5">
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        required
                        className="accent-[#6dff8a] w-3.5 h-3.5 mt-0.5"
                      />
                      <span>
                        I confirm I have read and agree to the <a href="/terms" target="_blank" className="text-[#6dff8a] underline">{config.legalName} Terms</a>, <a href="/privacy" target="_blank" className="text-[#6dff8a] underline">Privacy Policy</a> and <a href="/risk-disclosure" target="_blank" className="text-[#6dff8a] underline">Risk Disclosures</a>.
                      </span>
                    </label>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-[#6dff8a] hover:bg-[#5ce077] text-[#15170f] font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(109,255,138,0.2)] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{mode === 'signup' ? 'Create Account' : 'Log In to Account'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Toggle login / signup */}
              <div className="text-center text-xs text-[#a3a89e] pt-1">
                {mode === 'signup' ? (
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-[#6dff8a] font-semibold hover:underline"
                    >
                      Log in
                    </button>
                  </span>
                ) : mode === 'login' ? (
                  <span>
                    Don't have an account yet?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-[#6dff8a] font-semibold hover:underline"
                    >
                      Start Investing
                    </button>
                  </span>
                ) : (
                  <span>
                    Need to change email?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-[#6dff8a] font-semibold hover:underline"
                    >
                      Back to sign up
                    </button>
                  </span>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

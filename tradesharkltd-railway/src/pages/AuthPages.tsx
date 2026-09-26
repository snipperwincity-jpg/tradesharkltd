import React, { useEffect, useRef, useState } from 'react';
import { Lock, Mail, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useBrokerage } from '../context/BrokerageContext';
import { errMsg } from '../lib/api';
import { navigate } from '../lib/router';
import { TradeSharkLogo } from '../components/TradeSharkLogo';

const Shell: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#15170f]">
    <div className="w-full max-w-md p-8 rounded-3xl bg-[#14170e] border border-[#6dff8a]/20 shadow-2xl space-y-6">
      <div className="flex justify-center"><TradeSharkLogo size="md" showLtd={true} /></div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-[#a3a89e] mt-2">{subtitle}</p>}
      </div>
      {children}
    </div>
  </div>
);

const Alert: React.FC<{ ok?: boolean; text: string }> = ({ ok, text }) => (
  <div className={`p-3 rounded-xl text-sm flex items-start gap-2 ${ok ? 'bg-[#6dff8a]/10 border border-[#6dff8a]/30 text-[#6dff8a]' : 'bg-red-500/10 border border-red-500/30 text-red-300'}`}>
    {ok ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}<span>{text}</span>
  </div>
);

const inputCls = 'w-full bg-black/50 border border-white/15 rounded-xl pl-10 pr-10 py-3 text-sm text-white focus:outline-none focus:border-[#6dff8a]';

export const ForgotPasswordPage: React.FC = () => {
  const { requestPasswordReset } = useBrokerage();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<{ ok?: boolean; text?: string; busy?: boolean }>({});
  return (
    <Shell title="Forgot your password?" subtitle="Enter your account email and we'll send you a secure reset link.">
      <form className="space-y-4" onSubmit={async e => {
        e.preventDefault();
        setState({ busy: true });
        try { setState({ ok: true, text: await requestPasswordReset(email) }); }
        catch (err) { setState({ ok: false, text: errMsg(err) }); }
      }}>
        <div className="relative">
          <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
        </div>
        {state.text && <Alert ok={state.ok} text={state.text} />}
        <button disabled={state.busy} className="w-full py-3 rounded-full bg-[#6dff8a] text-[#15170f] font-bold disabled:opacity-60">{state.busy ? 'Sending...' : 'Send reset link'}</button>
        <p className="text-center text-xs text-white/50"><a href="/login" className="text-[#6dff8a] hover:underline">Back to log in</a></p>
      </form>
    </Shell>
  );
};

export const ResetPasswordPage: React.FC<{ token: string; setup?: boolean; onDone: () => void }> = ({ token, setup, onDone }) => {
  const { resetPassword } = useBrokerage();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);
  const [state, setState] = useState<{ ok?: boolean; text?: string; busy?: boolean }>({});
  if (!token) return <Shell title="Invalid link"><Alert text="This link is missing its token. Please use the link from your email or request a new one." /><a href="/forgot-password" className="block text-center text-[#6dff8a] text-sm">Request a new link</a></Shell>;
  return (
    <Shell title={setup ? 'Set your password' : 'Choose a new password'} subtitle="Use at least 8 characters.">
      <form className="space-y-4" onSubmit={async e => {
        e.preventDefault();
        if (pw !== pw2) return setState({ ok: false, text: 'Passwords do not match.' });
        setState({ busy: true });
        try {
          await resetPassword(token, pw);
          setState({ ok: true, text: 'Password saved. Opening your client portal...' });
          setTimeout(onDone, 900);
        } catch (err) { setState({ ok: false, text: errMsg(err) }); }
      }}>
        {[{ v: pw, s: setPw, p: 'New password' }, { v: pw2, s: setPw2, p: 'Confirm password' }].map((f, i) => (
          <div key={i} className="relative">
            <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type={show ? 'text' : 'password'} required minLength={8} value={f.v} onChange={e => f.s(e.target.value)} placeholder={f.p} className={inputCls} />
            {i === 0 && <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>}
          </div>
        ))}
        {state.text && <Alert ok={state.ok} text={state.text} />}
        <button disabled={state.busy || state.ok} className="w-full py-3 rounded-full bg-[#6dff8a] text-[#15170f] font-bold disabled:opacity-60">{state.busy ? 'Saving...' : 'Save password'}</button>
      </form>
    </Shell>
  );
};

export const VerifyEmailPage: React.FC<{ token: string }> = ({ token }) => {
  const { verifyEmail } = useBrokerage();
  const [state, setState] = useState<{ ok?: boolean; text: string }>({ text: 'Verifying your email address...' });
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!token) { setState({ ok: false, text: 'This link is missing its token.' }); return; }
    verifyEmail(token)
      .then(() => setState({ ok: true, text: 'Your email address has been verified. Thank you!' }))
      .catch(err => setState({ ok: false, text: errMsg(err) }));
  }, [token]);
  return (
    <Shell title="Email verification">
      <Alert ok={state.ok !== false} text={state.text} />
      {state.ok !== undefined && (
        <button onClick={() => navigate('/dashboard')} className="w-full py-3 rounded-full bg-[#6dff8a] text-[#15170f] font-bold">Go to my portal</button>
      )}
    </Shell>
  );
};

export const NotFoundPage: React.FC = () => (
  <Shell title="Page not found" subtitle="The page you're looking for doesn't exist or has moved.">
    <div className="grid grid-cols-2 gap-3">
      <a href="/" className="py-3 rounded-full bg-[#6dff8a] text-[#15170f] font-bold text-center">Home</a>
      <a href="/help" className="py-3 rounded-full border border-white/20 text-white font-semibold text-center">Help Center</a>
    </div>
  </Shell>
);

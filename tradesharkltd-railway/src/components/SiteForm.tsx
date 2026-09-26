import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { api, errMsg } from '../lib/api';
import { FormType } from '../data/pages';
import { useBrokerage } from '../context/BrokerageContext';

type Field = { name: string; label: string; type?: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'url'; required?: boolean; options?: string[]; placeholder?: string };

const FIELDS: Record<FormType, Field[]> = {
  contact: [
    { name: 'name', label: 'Full name', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone (optional)', type: 'tel' },
    { name: 'topic', label: 'Topic', type: 'select', options: ['Account & login', 'Verification (KYC)', 'Deposits', 'Withdrawals', 'Trading', 'Technical issue', 'Complaint', 'Other'] },
    { name: 'subject', label: 'Subject', required: true },
    { name: 'message', label: 'Message', type: 'textarea', required: true },
  ],
  careers: [
    { name: 'name', label: 'Full name', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'tel' },
    { name: 'role', label: 'Role you are applying for', type: 'select', required: true, options: ['Senior Full-Stack Engineer', 'Compliance Analyst (KYC/AML)', 'Client Services Associate', 'Quantitative Researcher', 'Product Designer', 'Open application'] },
    { name: 'linkedin', label: 'LinkedIn / portfolio / CV link', type: 'url', placeholder: 'https://' },
    { name: 'message', label: 'Why do you want to join us?', type: 'textarea', required: true },
  ],
  press: [
    { name: 'name', label: 'Full name', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'company', label: 'Publication / outlet', required: true },
    { name: 'deadline', label: 'Deadline (optional)' },
    { name: 'message', label: 'Your enquiry', type: 'textarea', required: true },
  ],
  investors: [
    { name: 'name', label: 'Full name', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'company', label: 'Organisation' },
    { name: 'message', label: 'Your enquiry', type: 'textarea', required: true },
  ],
  affiliates: [
    { name: 'name', label: 'Full name', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'company', label: 'Website / channel', required: true, placeholder: 'https://' },
    { name: 'audience', label: 'Monthly audience size', type: 'select', options: ['< 5,000', '5,000 - 50,000', '50,000 - 250,000', '250,000+'] },
    { name: 'country', label: 'Main audience country' },
    { name: 'message', label: 'How will you promote us?', type: 'textarea', required: true },
  ],
  pro: [
    { name: 'name', label: 'Full name', required: true },
    { name: 'email', label: 'Email (same as your account)', type: 'email', required: true },
    { name: 'experience', label: 'Trading experience', type: 'select', options: ['1-2 years', '3-5 years', '5-10 years', '10+ years'] },
    { name: 'portfolio', label: 'Approximate portfolio size', type: 'select', options: ['< $50k', '$50k - $250k', '$250k - $1M', '$1M+'] },
    { name: 'message', label: 'Describe your strategy / qualifications', type: 'textarea', required: true },
  ],
  club: [
    { name: 'name', label: 'Full name', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'tel' },
    { name: 'message', label: 'How can we help?', type: 'textarea' },
  ],
  callback: [
    { name: 'name', label: 'Full name', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'tel', required: true },
    { name: 'time', label: 'Preferred time' },
  ],
  newsletter: [
    { name: 'name', label: 'First name' },
    { name: 'email', label: 'Email', type: 'email', required: true },
  ],
};

export const SiteForm: React.FC<{ type: FormType; title?: string }> = ({ type, title }) => {
  const { currentUser } = useBrokerage();
  const [values, setValues] = useState<Record<string, string>>(() =>
    currentUser ? { name: currentUser.name, email: currentUser.email, phone: currentUser.phone || '' } : {}
  );
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const fields = FIELDS[type];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const r = await api.post(`/api/forms/${type}`, values);
      setStatus('done');
      setMessage(r.message || 'Thank you - we have received your submission.');
    } catch (err) {
      setStatus('error');
      setMessage(errMsg(err));
    }
  };

  if (status === 'done') {
    return (
      <div className="p-6 rounded-3xl bg-[#6dff8a]/10 border border-[#6dff8a]/40 flex items-start gap-3">
        <CheckCircle2 className="w-6 h-6 text-[#6dff8a] shrink-0" />
        <div>
          <div className="font-bold text-white">Submitted</div>
          <p className="text-sm text-[#d4d6cf] mt-1">{message} A confirmation has been sent to your email.</p>
        </div>
      </div>
    );
  }

  const inputCls = 'w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#6dff8a]';
  const compact = type === 'newsletter';

  return (
    <form onSubmit={submit} className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
      {title && <h3 className="text-lg font-bold text-white">{title}</h3>}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" onChange={e => setValues(v => ({ ...v, website: e.target.value }))} />
      <div className={compact ? 'flex flex-col sm:flex-row gap-3' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
        {fields.map(f => (
          <label key={f.name} className={`space-y-1.5 block ${f.type === 'textarea' ? 'sm:col-span-2' : ''} ${compact ? 'flex-1' : ''}`}>
            <span className="text-xs text-white/70">{f.label}{f.required && ' *'}</span>
            {f.type === 'textarea' ? (
              <textarea required={f.required} rows={5} value={values[f.name] || ''} onChange={e => setValues(v => ({ ...v, [f.name]: e.target.value }))} className={inputCls} />
            ) : f.type === 'select' ? (
              <select required={f.required} value={values[f.name] || ''} onChange={e => setValues(v => ({ ...v, [f.name]: e.target.value }))} className={inputCls}>
                <option value="">Select...</option>
                {f.options!.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input type={f.type || 'text'} required={f.required} placeholder={f.placeholder} value={values[f.name] || ''} onChange={e => setValues(v => ({ ...v, [f.name]: e.target.value }))} className={inputCls} />
            )}
          </label>
        ))}
      </div>
      {status === 'error' && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />{message}
        </div>
      )}
      <button type="submit" disabled={status === 'sending'} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#6dff8a] hover:bg-[#5ce077] text-[#15170f] font-bold text-sm disabled:opacity-60">
        <Send className="w-4 h-4" />
        {status === 'sending' ? 'Sending...' : compact ? 'Subscribe' : 'Submit'}
      </button>
      {!compact && <p className="text-[11px] text-white/40">By submitting you agree to our <a href="/privacy" className="underline">Privacy Policy</a>.</p>}
    </form>
  );
};

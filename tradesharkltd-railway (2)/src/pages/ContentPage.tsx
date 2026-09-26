import React, { useMemo, useState } from 'react';
import { ArrowRight, ChevronRight, Copy, Check, Mail, Phone, MessageCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { SitePage, PAGE_BY_SLUG, CtaAction } from '../data/pages';
import { useBrokerage, SiteConfig } from '../context/BrokerageContext';
import { SiteForm } from '../components/SiteForm';

export const fillPlaceholders = (text: string, c: SiteConfig) =>
  text
    .replace(/\{brand\}/g, c.appName)
    .replace(/\{legal\}/g, c.legalName)
    .replace(/\{support\}/g, c.supportEmail)
    .replace(/\{compliance\}/g, c.complianceEmail || c.supportEmail)
    .replace(/\{press\}/g, c.pressEmail || c.supportEmail)
    .replace(/\{careers\}/g, c.careersEmail || c.supportEmail)
    .replace(/\{address\}/g, c.address)
    .replace(/\{url\}/g, c.appUrl.replace(/^https?:\/\//, ''))
    .replace(/\{phone\}/g, c.supportPhone)
    .replace(/\{minDeposit\}/g, c.minDeposit.toLocaleString())
    .replace(/\{minWithdrawal\}/g, c.minWithdrawal.toLocaleString())
    .replace(/\{practice\}/g, c.practiceBalance.toLocaleString())
    .replace(/\{regulatory\}/g, c.regulatoryText || `${c.legalName} operates in accordance with the laws of the jurisdictions in which it is registered. Full details of our authorisations are available on request from ${c.complianceEmail || c.supportEmail}.`);

interface Props {
  page: SitePage;
  onAction: (a: CtaAction) => void;
}

export const ContentPage: React.FC<Props> = ({ page, onAction }) => {
  const { config } = useBrokerage();
  const f = (t: string) => fillPlaceholders(t, config);

  return (
    <div className="bg-[#15170f]">
      {/* Hero */}
      <section className="relative border-b border-white/5 bg-gradient-to-b from-[#1a1e14] to-[#15170f]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <nav className="flex items-center gap-1.5 text-xs text-white/40 mb-6">
            <a href="/" className="hover:text-[#6dff8a]">Home</a>
            <ChevronRight className="w-3 h-3" />
            <span>{page.group}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/70">{f(page.title)}</span>
          </nav>
          <span className="text-xs font-bold uppercase tracking-wider text-[#6dff8a]">{f(page.eyebrow)}</span>
          <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">{f(page.title)}</h1>
          <p className="mt-5 text-base sm:text-lg text-[#a3a89e] max-w-3xl leading-relaxed">{f(page.intro)}</p>
          {page.cta && (
            <button onClick={() => onAction(page.cta!.action)} className="mt-8 inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#6dff8a] hover:bg-[#5ce077] text-[#15170f] font-bold text-sm shadow-[0_0_20px_rgba(109,255,138,0.25)]">
              {f(page.cta.label)} <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        {page.widget && <PageWidget widget={page.widget} onAction={onAction} />}

        {page.sections.map((s, i) => (
          <section key={i} className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">{f(s.heading)}</h2>
            {s.body && <p className="text-[#c9ccc3] leading-relaxed">{f(s.body)}</p>}
            {s.bullets && (
              <ul className="space-y-2.5">
                {s.bullets.map((b, j) => (
                  <li key={j} className="flex items-start gap-3 text-[#c9ccc3]">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#6dff8a] shrink-0" />
                    <span>{f(b)}</span>
                  </li>
                ))}
              </ul>
            )}
            {s.table && (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white/5 text-white/60 text-xs uppercase">
                    <tr>{s.table.head.map(h => <th key={h} className="p-3.5 font-semibold">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {s.table.rows.map((r, k) => (
                      <tr key={k} className="hover:bg-white/[0.02]">{r.map((c, ci) => <td key={ci} className={`p-3.5 ${ci === 0 ? 'font-semibold text-white' : 'text-[#c9ccc3]'}`}>{f(c)}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}

        {page.form && <SiteForm type={page.form} title={page.formTitle} />}

        {page.related && page.related.length > 0 && (
          <section className="pt-6 border-t border-white/10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/60 mb-4">Related</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {page.related.filter(r => PAGE_BY_SLUG[r] || r === 'popular-investors').map(r => {
                const p = PAGE_BY_SLUG[r];
                return (
                  <a key={r} href={`/${r}`} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#6dff8a]/50 transition-colors group">
                    <div className="text-xs text-[#6dff8a] font-semibold">{p ? f(p.eyebrow) : 'Community'}</div>
                    <div className="font-bold text-white mt-1 flex items-center justify-between">
                      {p ? f(p.title) : 'Popular Investors'}
                      <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// Dynamic widgets
// ------------------------------------------------------------------
const PageWidget: React.FC<{ widget: NonNullable<SitePage['widget']>; onAction: (a: CtaAction) => void }> = ({ widget, onAction }) => {
  switch (widget) {
    case 'hours': return <HoursWidget />;
    case 'earnings': return <EarningsWidget />;
    case 'movers': return <MoversWidget />;
    case 'cookies': return <CookieWidget />;
    case 'invite': return <InviteWidget onAction={onAction} />;
    case 'contact-cards': return <ContactCards />;
    case 'fees': return <FeesWidget />;
    case 'faq-deposit': return <DepositMethods />;
    default: return null;
  }
};

const Table: React.FC<{ head: string[]; rows: React.ReactNode[][] }> = ({ head, rows }) => (
  <div className="overflow-x-auto rounded-2xl border border-white/10">
    <table className="w-full text-sm text-left">
      <thead className="bg-white/5 text-white/60 text-xs uppercase"><tr>{head.map(h => <th key={h} className="p-3.5">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-white/5">
        {rows.map((r, i) => <tr key={i} className="hover:bg-white/[0.02]">{r.map((c, j) => <td key={j} className={`p-3.5 ${j === 0 ? 'font-semibold text-white' : 'text-[#c9ccc3]'}`}>{c}</td>)}</tr>)}
      </tbody>
    </table>
  </div>
);

const FeesWidget = () => (
  <Table head={['Asset class', 'Commission', 'Typical spread', 'Max leverage (retail)']} rows={[
    ['Stocks', '$0', 'Market spread', '1:5'],
    ['ETFs', '$0', 'Market spread', '1:5'],
    ['Crypto', '$0', 'from 0.30%', 'Not leveraged'],
    ['Commodities', '$0', 'from 0.05%', '1:10'],
    ['Indices', '$0', 'from 0.01%', '1:20'],
    ['Currencies', '$0', 'from 0.01%', '1:30'],
  ]} />
);

const HoursWidget = () => {
  const { instruments } = useBrokerage();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <div className="space-y-3">
      <Table head={['Market', 'Session (UTC)', 'Days', 'Instruments on platform']} rows={[
        ['US Stocks & ETFs', '13:30 - 20:00', 'Mon - Fri', instruments.filter(i => i.category === 'stocks' || i.category === 'etfs').length],
        ['UK / EU Stocks', '07:00 - 15:30', 'Mon - Fri', '-'],
        ['Currencies (FX)', '22:00 Sun - 22:00 Fri', '24/5', instruments.filter(i => i.category === 'currencies').length],
        ['Indices', '23:00 - 22:00', 'Sun - Fri', instruments.filter(i => i.category === 'indices').length],
        ['Commodities', '23:00 - 22:00', 'Sun - Fri', instruments.filter(i => i.category === 'commodities').length],
        ['Crypto', '24 hours', '7 days a week', instruments.filter(i => i.category === 'crypto').length],
      ]} />
      <p className="text-xs text-white/40">Your local time zone: {tz}. Sessions shift by one hour when daylight saving time changes.</p>
    </div>
  );
};

const EarningsWidget = () => {
  const { instruments } = useBrokerage();
  const rows = useMemo(() => {
    const stocks = instruments.filter(i => i.category === 'stocks');
    const base = new Date();
    return stocks.map((s, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + 3 + i * 4 + (s.symbol.charCodeAt(0) % 5));
      while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
      return { s, d, session: s.symbol.charCodeAt(1) % 2 ? 'After close' : 'Before open' };
    }).sort((a, b) => a.d.getTime() - b.d.getTime());
  }, [instruments]);
  return (
    <Table head={['Date (indicative)', 'Company', 'Session', 'Last price']} rows={rows.map(r => [
      r.d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }),
      `${r.s.name} (${r.s.symbol})`,
      r.session,
      `$${r.s.price.toLocaleString()}`,
    ])} />
  );
};

const MoversWidget = () => {
  const { instruments } = useBrokerage();
  const sorted = [...instruments].sort((a, b) => b.deltaPercent - a.deltaPercent);
  const Card = ({ title, list }: { title: string; list: typeof instruments }) => (
    <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10">
      <h3 className="font-bold text-white mb-3">{title}</h3>
      <div className="space-y-2">
        {list.map(i => (
          <div key={i.symbol} className="flex items-center justify-between text-sm">
            <span className="text-white font-semibold">{i.symbol} <span className="text-white/40 font-normal">{i.name}</span></span>
            <span className="flex items-center gap-3 font-mono">
              <span className="text-white/80">${i.price.toLocaleString()}</span>
              <span className={`flex items-center gap-1 ${i.deltaPercent >= 0 ? 'text-[#6dff8a]' : 'text-[#ff5c5c]'}`}>
                {i.deltaPercent >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {i.deltaPercent >= 0 ? '+' : ''}{i.deltaPercent.toFixed(2)}%
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Top gainers" list={sorted.slice(0, 6)} />
        <Card title="Top losers" list={sorted.slice(-6).reverse()} />
      </div>
      <p className="text-xs text-white/40">Prices update automatically every 15 seconds.</p>
    </div>
  );
};

export const COOKIE_KEY = 'ts_cookie_prefs';
export const readCookiePrefs = (): { analytics: boolean; marketing: boolean; decided: boolean } => {
  try { return { decided: false, analytics: false, marketing: false, ...JSON.parse(localStorage.getItem(COOKIE_KEY) || '{}') }; }
  catch { return { decided: false, analytics: false, marketing: false }; }
};
export const saveCookiePrefs = (p: { analytics: boolean; marketing: boolean }) => {
  try { localStorage.setItem(COOKIE_KEY, JSON.stringify({ ...p, decided: true })); } catch { /* ignore */ }
};

const CookieWidget = () => {
  const [prefs, setPrefs] = useState(readCookiePrefs);
  const [saved, setSaved] = useState(false);
  const Row = ({ k, label, desc }: { k: 'analytics' | 'marketing'; label: string; desc: string }) => (
    <label className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-black/30 border border-white/10 cursor-pointer">
      <div><div className="font-semibold text-white">{label}</div><div className="text-xs text-white/50">{desc}</div></div>
      <input type="checkbox" checked={prefs[k]} onChange={e => { setPrefs(p => ({ ...p, [k]: e.target.checked })); setSaved(false); }} className="w-5 h-5 accent-[#6dff8a]" />
    </label>
  );
  return (
    <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-3">
      <div className="flex items-center justify-between p-4 rounded-2xl bg-black/30 border border-white/10">
        <div><div className="font-semibold text-white">Strictly necessary</div><div className="text-xs text-white/50">Sign-in sessions and security</div></div>
        <span className="text-xs font-bold text-[#6dff8a]">Always on</span>
      </div>
      <Row k="analytics" label="Analytics" desc="Help us understand how the site is used" />
      <Row k="marketing" label="Marketing" desc="Personalised content and offers" />
      <button onClick={() => { saveCookiePrefs(prefs); setSaved(true); }} className="px-5 py-2.5 rounded-full bg-[#6dff8a] text-[#15170f] font-bold text-sm">
        {saved ? 'Preferences saved' : 'Save preferences'}
      </button>
    </div>
  );
};

const InviteWidget: React.FC<{ onAction: (a: CtaAction) => void }> = ({ onAction }) => {
  const { currentUser, config } = useBrokerage();
  const [copied, setCopied] = useState(false);
  if (!currentUser) {
    return (
      <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[#c9ccc3]">Sign in to get your personal referral link.</p>
        <div className="flex gap-2">
          <button onClick={() => onAction('login')} className="px-5 py-2.5 rounded-full border border-white/20 text-white font-semibold text-sm">Log in</button>
          <button onClick={() => onAction('signup')} className="px-5 py-2.5 rounded-full bg-[#6dff8a] text-[#15170f] font-bold text-sm">Create account</button>
        </div>
      </div>
    );
  }
  const link = `${config.appUrl || window.location.origin}/?ref=${currentUser.referralCode || currentUser.id}`;
  return (
    <div className="p-6 rounded-3xl bg-[#6dff8a]/10 border border-[#6dff8a]/30 space-y-3">
      <div className="text-sm font-semibold text-white">Your referral link</div>
      <div className="flex gap-2">
        <input readOnly value={link} className="flex-1 bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono" />
        <button onClick={() => { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="px-4 rounded-xl bg-[#6dff8a] text-[#15170f] font-bold text-sm flex items-center gap-1.5">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
};

const ContactCards = () => {
  const { config } = useBrokerage();
  const cards = [
    config.supportEmail && { icon: <Mail className="w-5 h-5" />, title: 'Email support', value: config.supportEmail, href: `mailto:${config.supportEmail}` },
    config.supportPhone && { icon: <Phone className="w-5 h-5" />, title: 'Call us', value: config.supportPhone, href: `tel:${config.supportPhone.replace(/\s/g, '')}` },
    config.whatsapp && { icon: <MessageCircle className="w-5 h-5" />, title: 'WhatsApp', value: config.whatsapp, href: `https://wa.me/${config.whatsapp.replace(/\D/g, '')}` },
  ].filter(Boolean) as { icon: React.ReactNode; title: string; value: string; href: string }[];
  if (!cards.length) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map(c => (
        <a key={c.title} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-[#6dff8a]/50 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#6dff8a]/15 text-[#6dff8a] flex items-center justify-center">{c.icon}</div>
          <div className="mt-3 text-xs text-white/50">{c.title}</div>
          <div className="font-semibold text-white break-all">{c.value}</div>
        </a>
      ))}
    </div>
  );
};

const DepositMethods = () => {
  const { config } = useBrokerage();
  return (
    <Table head={['Method', 'Processing', 'Minimum']} rows={[
      ['Bank wire (SWIFT/SEPA)', '1-3 business days', `$${config.minDeposit}`],
      ['Faster Payments / local transfer', 'Same day', `$${config.minDeposit}`],
      ['Debit / credit card', 'Instant once confirmed', `$${config.minDeposit}`],
      ['Crypto (USDT, BTC, ETH)', 'After network confirmations', `$${config.minDeposit}`],
    ]} />
  );
};

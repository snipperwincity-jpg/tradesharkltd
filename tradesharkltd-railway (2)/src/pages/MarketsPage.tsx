import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import { useBrokerage } from '../context/BrokerageContext';
import { Instrument } from '../types';

const CATS: { id: Instrument['category'] | 'all'; label: string; blurb: string }[] = [
  { id: 'all', label: 'All markets', blurb: 'Every instrument available to trade.' },
  { id: 'stocks', label: 'Stocks', blurb: 'Commission-free shares in the world\'s leading companies.' },
  { id: 'etfs', label: 'ETFs', blurb: 'Diversified exposure to indices, sectors and themes in a single trade.' },
  { id: 'crypto', label: 'Crypto', blurb: 'Buy and sell leading cryptoassets 24/7 with tight spreads.' },
  { id: 'commodities', label: 'Commodities', blurb: 'Trade gold, silver, oil and more.' },
  { id: 'indices', label: 'Indices', blurb: 'Take a view on entire markets like the S&P 500 or FTSE 100.' },
  { id: 'currencies', label: 'Currencies', blurb: 'Major, minor and exotic FX pairs, 24 hours a day, 5 days a week.' },
];

export const MarketsPage: React.FC<{ category?: string; onTrade: (i: Instrument) => void }> = ({ category, onTrade }) => {
  const { instruments, config } = useBrokerage();
  const [q, setQ] = useState('');
  const active = CATS.find(c => c.id === category) || CATS[0];
  const list = instruments.filter(i =>
    (active.id === 'all' || i.category === active.id) &&
    (!q.trim() || i.symbol.toLowerCase().includes(q.toLowerCase()) || i.name.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="bg-[#15170f]">
      <section className="border-b border-white/5 bg-gradient-to-b from-[#1a1e14] to-[#15170f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <nav className="flex items-center gap-1.5 text-xs text-white/40 mb-5">
            <a href="/" className="hover:text-[#6dff8a]">Home</a><ChevronRight className="w-3 h-3" />
            <a href="/markets" className="hover:text-[#6dff8a]">Markets</a>
            {active.id !== 'all' && <><ChevronRight className="w-3 h-3" /><span className="text-white/70">{active.label}</span></>}
          </nav>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">{active.id === 'all' ? `Markets on ${config.appName}` : `Trade ${active.label}`}</h1>
          <p className="mt-4 text-[#a3a89e] max-w-2xl">{active.blurb} Live prices update every 15 seconds.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {CATS.map(c => (
              <a key={c.id} href={c.id === 'all' ? '/markets' : `/markets/${c.id}`}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${active.id === c.id ? 'bg-[#6dff8a] text-[#15170f] border-[#6dff8a]' : 'border-white/15 text-white/70 hover:text-white hover:border-white/30'}`}>
                {c.label}
              </a>
            ))}
          </div>
          <div className="relative md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search symbol or name" className="w-full bg-black/40 border border-white/15 rounded-full pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6dff8a]" />
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-white/10">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-white/50 text-xs uppercase">
              <tr><th className="p-4">Instrument</th><th className="p-4">Category</th><th className="p-4 text-right">Price</th><th className="p-4 text-right">Change</th><th className="p-4 hidden md:table-cell">Market cap / volume</th><th className="p-4 text-right">Trade</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {list.map(i => (
                <tr key={i.symbol} className="hover:bg-white/[0.02]">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0" style={{ backgroundColor: i.avatarBg }}>{i.symbol.slice(0, 3)}</div>
                      <div><div className="font-bold text-white">{i.symbol}</div><div className="text-xs text-white/50">{i.name}</div></div>
                    </div>
                  </td>
                  <td className="p-4 text-white/60 capitalize">{i.category}</td>
                  <td className="p-4 text-right font-mono font-bold text-white">{i.currency === 'USD' ? '$' : ''}{i.price.toLocaleString()}</td>
                  <td className={`p-4 text-right font-mono font-semibold ${i.deltaPercent >= 0 ? 'text-[#6dff8a]' : 'text-[#ff5c5c]'}`}>
                    <span className="inline-flex items-center gap-1">{i.deltaPercent >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}{i.deltaPercent >= 0 ? '+' : ''}{i.deltaPercent.toFixed(2)}%</span>
                  </td>
                  <td className="p-4 text-white/50 hidden md:table-cell">{i.marketCap || i.volume24h || '-'}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => onTrade(i)} className="px-4 py-1.5 rounded-full bg-[#6dff8a] hover:bg-[#5ce077] text-[#15170f] font-bold text-xs">Trade</button>
                  </td>
                </tr>
              ))}
              {!list.length && <tr><td colSpan={6} className="p-10 text-center text-white/50">No instruments match your search.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-white/40">Your capital is at risk. Prices shown are indicative and may differ from the execution price.</p>
      </div>
    </div>
  );
};

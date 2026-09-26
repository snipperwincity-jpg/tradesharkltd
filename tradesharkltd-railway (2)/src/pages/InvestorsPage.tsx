import React, { useState } from 'react';
import { ChevronRight, Users, ShieldCheck } from 'lucide-react';
import { POPULAR_INVESTORS } from '../data/mockData';
import { PopularInvestor } from '../types';

export const InvestorsPage: React.FC<{ onCopy: (i: PopularInvestor) => void }> = ({ onCopy }) => {
  const [sort, setSort] = useState<'return' | 'copiers' | 'risk'>('return');
  const list = [...POPULAR_INVESTORS].sort((a, b) =>
    sort === 'return' ? b.return24M - a.return24M : sort === 'copiers' ? b.copiers - a.copiers : a.riskScore - b.riskScore);
  return (
    <div className="bg-[#15170f]">
      <section className="border-b border-white/5 bg-gradient-to-b from-[#1a1e14] to-[#15170f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <nav className="flex items-center gap-1.5 text-xs text-white/40 mb-5">
            <a href="/" className="hover:text-[#6dff8a]">Home</a><ChevronRight className="w-3 h-3" /><a href="/copytrader" className="hover:text-[#6dff8a]">CopyTrader™</a><ChevronRight className="w-3 h-3" /><span className="text-white/70">Popular Investors</span>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">Popular Investors</h1>
          <p className="mt-4 text-[#a3a89e] max-w-2xl">Copy the strategies of verified investors automatically. Minimum allocation $200. Past performance is not an indication of future results.</p>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex gap-2 text-sm">
          {([['return', 'Highest return'], ['copiers', 'Most copied'], ['risk', 'Lowest risk']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setSort(k)} className={`px-4 py-2 rounded-full font-semibold border ${sort === k ? 'bg-[#6dff8a] text-[#15170f] border-[#6dff8a]' : 'border-white/15 text-white/70'}`}>{l}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map(inv => (
            <div key={inv.id} className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <img src={inv.avatarUrl} alt={inv.name} referrerPolicy="no-referrer" className="w-14 h-14 rounded-2xl object-cover bg-white/10" />
                <div>
                  <div className="font-bold text-white">{inv.name}</div>
                  <div className="text-xs text-white/50">{inv.handle} • {inv.role}</div>
                </div>
              </div>
              <p className="text-sm text-[#c9ccc3] line-clamp-3">{inv.bio}</p>
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-black/30 text-center">
                <div><div className="text-[10px] text-white/40">24M return</div><div className="font-bold text-[#6dff8a]">+{inv.return24M}%</div></div>
                <div><div className="text-[10px] text-white/40 flex items-center justify-center gap-1"><Users className="w-3 h-3" />Copiers</div><div className="font-bold text-white">{inv.copiers.toLocaleString()}</div></div>
                <div><div className="text-[10px] text-white/40 flex items-center justify-center gap-1"><ShieldCheck className="w-3 h-3" />Risk</div><div className="font-bold text-white">{inv.riskScore}/10</div></div>
              </div>
              <div className="text-xs text-white/50">Top holdings: {inv.topHoldings.join(', ')}</div>
              <button onClick={() => onCopy(inv)} className="mt-auto py-3 rounded-full bg-[#6dff8a] hover:bg-[#5ce077] text-[#15170f] font-bold text-sm">Copy {inv.name.split(' ')[0]}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

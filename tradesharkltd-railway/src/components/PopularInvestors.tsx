import React, { useState } from 'react';
import { POPULAR_INVESTORS } from '../data/mockData';
import { PopularInvestor } from '../types';
import { Check, ShieldCheck, TrendingUp, Users, ArrowRight, Sparkles } from 'lucide-react';

interface PopularInvestorsProps {
  onCopyInvestor: (investor: PopularInvestor) => void;
  onExploreAll: () => void;
}

export const PopularInvestors: React.FC<PopularInvestorsProps> = ({ 
  onCopyInvestor, 
  onExploreAll 
}) => {
  const [selectedInvestor, setSelectedInvestor] = useState<PopularInvestor>(POPULAR_INVESTORS[0]);
  const [simulatedCapital, setSimulatedCapital] = useState(1000);

  // Projected 2-year profit based on historical 24M return
  const projectedReturn = (simulatedCapital * (selectedInvestor.return24M / 100));
  const projectedTotal = simulatedCapital + projectedReturn;

  return (
    <section id="copytrader" className="py-20 bg-[#15170f] relative border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6dff8a] bg-[#6dff8a]/10 px-3 py-1 rounded-full border border-[#6dff8a]/20">
            CopyTrader™ Community
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            The investors worth watching.
          </h2>
          <p className="text-sm sm:text-base text-[#a3a89e] leading-relaxed">
            Find someone with a track record you aspire to and set your amount. CopyTrader™ takes care of the rest — now their trades are your trades. Smart, isn't it?
          </p>
        </div>

        {/* Carousel / Grid of Verified Pro Investors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 mb-14">
          {POPULAR_INVESTORS.map((inv) => (
            <div 
              key={inv.id}
              className={`relative rounded-3xl overflow-hidden bg-[#1a1d14] border transition-all duration-300 flex flex-col justify-between group ${
                selectedInvestor.id === inv.id 
                  ? 'border-[#6dff8a] shadow-[0_0_25px_rgba(109,255,138,0.15)]' 
                  : 'border-white/10 hover:border-white/25'
              }`}
            >
              {/* Card Image Banner */}
              <div className="relative h-60 w-full overflow-hidden bg-[#10120a]">
                <img 
                  src={inv.avatarUrl} 
                  alt={inv.name} 
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1d14] via-[#1a1d14]/40 to-transparent" />
                
                {/* Risk score badge */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-white border border-white/10 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#6dff8a]" />
                  <span>Risk Score {inv.riskScore}/10</span>
                </div>

                {/* Copiers count */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-medium text-white/90 border border-white/10 flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#6dff8a]" />
                  <span>{inv.copiers.toLocaleString()} copiers</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 pt-2 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white">{inv.name}</h3>
                    <div className="w-4 h-4 rounded-full bg-[#6dff8a] text-[#15170f] flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  </div>
                  <div className="text-xs text-[#6dff8a] font-medium mb-3">{inv.role}</div>
                  
                  <p className="text-xs text-[#a3a89e] line-clamp-3 leading-relaxed mb-4">
                    "{inv.bio}"
                  </p>
                </div>

                {/* 24M Metrics Box */}
                <div>
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 mb-4">
                    <div>
                      <div className="text-2xl font-bold text-[#6dff8a] font-heading tracking-tight">
                        +{inv.return24M.toFixed(2)}%
                      </div>
                      <div className="text-[11px] text-[#a3a89e]">Return (24M)</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white font-heading tracking-tight">
                        {inv.copiers.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-[#a3a89e]">Active Copiers</div>
                    </div>
                  </div>

                  {/* Top holdings tags */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-4">
                    <span className="text-[10px] text-white/40 uppercase font-semibold">Holdings:</span>
                    {inv.topHoldings.map((h, i) => (
                      <span key={i} className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/80 font-mono">
                        {h}
                      </span>
                    ))}
                  </div>

                  {/* Copy Action Button */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onCopyInvestor(inv)}
                      className="flex-1 py-3 px-4 rounded-xl bg-[#6dff8a] hover:bg-[#5ce077] text-[#15170f] font-bold text-xs sm:text-sm transition-all shadow-[0_0_15px_rgba(109,255,138,0.2)] flex items-center justify-center gap-1.5"
                    >
                      <span>Copy {inv.name.split(' ')[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSelectedInvestor(inv)}
                      className="px-3.5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold"
                      title="Simulate returns in calculator"
                    >
                      Simulate
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Interactive Copy Simulation Calculator Bar */}
        <div className="rounded-3xl bg-[#191c13] border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#6dff8a] uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Interactive Copy Calculator</span>
              </div>
              <h4 className="text-xl font-bold text-white">
                If you had copied <span className="text-[#6dff8a]">{selectedInvestor.name}</span> with:
              </h4>
              <div className="flex items-center gap-3 pt-2">
                {[500, 1000, 2500, 5000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setSimulatedCapital(val)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      simulatedCapital === val 
                        ? 'bg-[#6dff8a] text-[#15170f]' 
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    ${val.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 grid grid-cols-2 gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
              <div>
                <span className="text-xs text-[#a3a89e] block">Historical 24M Profit:</span>
                <span className="text-xl font-bold text-[#6dff8a] font-heading">
                  +${projectedReturn.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#a3a89e] block">Simulated Portfolio:</span>
                <span className="text-xl font-bold text-white font-heading">
                  ${projectedTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            <div className="lg:col-span-3 flex justify-end">
              <button
                onClick={() => onCopyInvestor(selectedInvestor)}
                className="w-full lg:w-auto px-6 py-3.5 rounded-full bg-[#6dff8a] text-[#15170f] font-bold text-sm hover:bg-[#5ce077] transition-all shadow-[0_0_20px_rgba(109,255,138,0.25)] flex items-center justify-center gap-2"
              >
                <span>Start Copying Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Bottom Qualification Tag & CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2.5 text-xs text-[#a3a89e] text-center sm:text-left">
            <ShieldCheck className="w-4 h-4 text-[#6dff8a] shrink-0" />
            <span>
              Pro Investors. Every investor shown here is verified under the <strong>TradeShark Pro Investor Program</strong>. Past performance is not an indication of future results.
            </span>
          </div>

          <button
            onClick={onExploreAll}
            className="shrink-0 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/15 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <span>Find more investors to copy</span>
            <ArrowRight className="w-4 h-4 text-[#6dff8a]" />
          </button>
        </div>

      </div>
    </section>
  );
};

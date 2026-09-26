import React, { useState } from 'react';
import { ArrowRight, Search, Bell, User, TrendingUp, TrendingDown, ChevronRight, Layers, Sparkles, CheckCircle2 } from 'lucide-react';

const heroBannerImg = '/images/hero-banner.jpg';

interface HeroProps {
  onStartInvesting: () => void;
  onSelectInstrumentSymbol?: (symbol: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartInvesting, onSelectInstrumentSymbol }) => {
  const [activeListTab, setActiveListTab] = useState<'gainers' | 'trending'>('gainers');
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  const gainersList = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: '$61,134.79',
      change: '-0.80%',
      diff: '-392.94',
      isPos: false,
      color: '#f7931a',
      iconText: '₿'
    },
    {
      symbol: 'GOOG',
      name: 'Alphabet Inc.',
      price: '$154.67',
      change: '-1.95%',
      diff: '-3.24',
      isPos: false,
      color: '#4285f4',
      iconText: 'G'
    },
    {
      symbol: 'META',
      name: 'Meta Platforms Inc.',
      price: '$504.99',
      change: '-1.42%',
      diff: '-8.71',
      isPos: false,
      color: '#0668e1',
      iconText: '∞'
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Motors, Inc.',
      price: '$428.37',
      change: '+0.74%',
      diff: '+3.13',
      isPos: true,
      color: '#e82127',
      iconText: 'T'
    },
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: '$294.31',
      change: '+0.56%',
      diff: '+0.33',
      isPos: true,
      color: '#a2aaad',
      iconText: ''
    }
  ];

  return (
    <section 
      id="hero"
      className="relative w-full bg-[#15170f] text-white overflow-hidden border-b border-white/5"
    >
      <div className="relative w-full min-h-[640px] lg:min-h-[720px] flex items-center">
        
        {/* Background Layer: Real Editorial Photo of iPhone on Dark Green Marble Table with Espresso Cup */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <picture>
            <img 
              src={heroBannerImg}
              alt="TradeShark Mobile on Marble Cafe Table" 
              className="w-full h-full object-cover object-right lg:object-[80%_center] filter brightness-[0.95]"
              referrerPolicy="no-referrer"
            />
          </picture>

          {/* Scrim Gradients matching eToro: Deep slate olive-black fading from left to preserve readability */}
          <div className="pointer-events-none absolute inset-0 z-[1] hidden lg:block bg-gradient-to-r from-[#15170f] via-[#15170f]/95 via-35% to-transparent to-75%" />
          <div className="pointer-events-none absolute inset-0 z-[1] hidden md:block lg:hidden bg-gradient-to-r from-[#15170f] via-[#15170f]/90 to-transparent" />
          <div className="pointer-events-none absolute inset-0 z-[1] md:hidden bg-gradient-to-b from-[#15170f] via-[#15170f]/90 via-50% to-[#15170f]" />
        </div>

        {/* Foreground Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Hero Text & Call to Actions */}
            <div className="lg:col-span-6 space-y-6 max-w-xl text-left">
              
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-[#d4d6cf] backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-[#6dff8a] animate-pulse" />
                <span>TradeShark Ltd • The Intelligence Platform</span>
              </div>

              {/* Exact eToro Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-bold tracking-tight text-[#f4f4f0] leading-[1.08]">
                A window into what millions of investors are doing<span className="text-[#6dff8a]">.</span>
              </h1>

              {/* Subheading */}
              <p className="text-lg sm:text-xl font-medium text-[#d4d6cf] leading-relaxed">
                You're welcome.
              </p>

              <p className="text-sm sm:text-base text-[#a3a89e] leading-relaxed">
                The data, tools, and collective intelligence you need for better investing. Trade stocks, crypto, and ETFs commission-free on one seamless screen.
              </p>

              {/* CTA Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  id="hero-cta-btn"
                  onClick={onStartInvesting}
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 text-base sm:text-lg font-bold text-[#15170f] bg-[#6dff8a] hover:bg-[#5ce077] rounded-full shadow-[0_0_30px_rgba(109,255,138,0.35)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Start investing</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <a
                  href="#copytrader"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 text-sm sm:text-base font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-full backdrop-blur-md transition-colors"
                >
                  <span>Explore CopyTrader™</span>
                </a>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white font-heading">$1</div>
                  <div className="text-xs text-[#a3a89e]">Stock commission</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-[#6dff8a] font-heading">0%</div>
                  <div className="text-xs text-[#a3a89e]">Commission on ETFs</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white font-heading">40M+</div>
                  <div className="text-xs text-[#a3a89e]">Global community</div>
                </div>
              </div>

            </div>

            {/* Right Column: Interactive Phone Mockup reflecting the exact screen from user image */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[340px] sm:max-w-[360px] transform hover:scale-[1.01] transition-transform duration-300">
                
                {/* Smartphone Device Frame */}
                <div className="relative rounded-[48px] p-3 bg-gradient-to-b from-[#3a3f33] via-[#1f2218] to-[#12140d] border-[3px] border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
                  
                  {/* Phone Inner Bezel */}
                  <div className="relative rounded-[40px] bg-[#12140d] overflow-hidden border border-white/10 text-white p-4 pt-3 flex flex-col space-y-3">
                    
                    {/* Status Bar & Dynamic Island */}
                    <div className="flex items-center justify-between text-[11px] text-white/70 font-semibold px-2">
                      <span>9:41</span>
                      
                      {/* Dynamic Island */}
                      <div className="h-5 w-24 bg-black rounded-full flex items-center justify-center space-x-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#6dff8a]/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-black border border-white/20" />
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span>5G</span>
                        <div className="w-4 h-2 border border-white/70 rounded-sm p-0.5">
                          <div className="w-full h-full bg-white rounded-2xs" />
                        </div>
                      </div>
                    </div>

                    {/* App Header Icons Bar */}
                    <div className="flex items-center justify-between px-1 pt-1">
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-[#6dff8a]">
                        TS
                      </div>
                      <div className="flex items-center gap-3 text-white/70">
                        <Search className="w-4 h-4 hover:text-white cursor-pointer" />
                        <Bell className="w-4 h-4 hover:text-white cursor-pointer" />
                      </div>
                    </div>

                    {/* Live Ticker Strip */}
                    <div className="py-1 px-2.5 rounded-lg bg-white/[0.04] border border-white/5 overflow-hidden">
                      <div className="text-[10px] text-white/60 flex items-center gap-3 whitespace-nowrap overflow-x-auto no-scrollbar font-mono">
                        <span className="flex items-center gap-1">
                          <strong className="text-white">S&amp;P 500</strong> $5,477 <span className="text-[#ff5c5c]">-0.42%</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <strong className="text-white">NASDAQ 100</strong> $19,025 <span className="text-[#ff5c5c]">-1.28%</span>
                        </span>
                      </div>
                    </div>

                    {/* Popular Lists Section Header */}
                    <div className="px-1 flex items-center justify-between">
                      <h3 className="text-base font-bold text-white tracking-tight">Popular Lists</h3>
                      <span className="text-[10px] text-[#6dff8a] font-semibold cursor-pointer">View all</span>
                    </div>

                    {/* Top Gainers Card with Forest Green Glass Gradient (Exact match to screenshot) */}
                    <div className="rounded-2xl p-3.5 bg-gradient-to-b from-[#1d2b1b]/90 via-[#162015]/80 to-[#12160f] border border-[#6dff8a]/20 shadow-lg space-y-3">
                      
                      {/* Card Title */}
                      <div className="flex items-center justify-between pb-1">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                            <span>Top Gainers</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#6dff8a]" />
                          </div>
                          <span className="text-[10px] text-[#a3a89e]">Today's biggest market gainers</span>
                        </div>
                      </div>

                      {/* Stock / Crypto Rows: BTC, GOOG, META, TSLA, AAPL */}
                      <div className="space-y-2">
                        {gainersList.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedRow(item.symbol);
                              if (onSelectInstrumentSymbol) onSelectInstrumentSymbol(item.symbol);
                            }}
                            className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                              selectedRow === item.symbol 
                                ? 'bg-white/15 border border-[#6dff8a]' 
                                : 'hover:bg-white/5 border border-transparent'
                            }`}
                          >
                            {/* Icon & Symbol Name */}
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm"
                                style={{ backgroundColor: item.color }}
                              >
                                {item.iconText}
                              </div>
                              <div className="text-left leading-tight">
                                <div className="text-xs font-bold text-white">{item.symbol}</div>
                                <div className="text-[10px] text-white/50 truncate max-w-[100px]">{item.name}</div>
                              </div>
                            </div>

                            {/* Price & Delta */}
                            <div className="text-right leading-tight">
                              <div className="text-xs font-bold text-white font-mono">{item.price}</div>
                              <div className={`text-[10px] font-semibold ${item.isPos ? 'text-[#6dff8a]' : 'text-[#ff5c5c]'}`}>
                                {item.diff} ({item.change})
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>

                    {/* Smart Portfolio Sub-card from screenshot */}
                    <div className="rounded-2xl p-3 bg-white/[0.04] border border-white/10 hover:border-[#6dff8a]/40 transition-colors cursor-pointer flex items-center justify-between">
                      <div className="space-y-0.5 text-left">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                          <Sparkles className="w-3.5 h-3.5 text-[#6dff8a]" />
                          <span>Smart Portfolio</span>
                          <ChevronRight className="w-3 h-3 text-[#6dff8a]" />
                        </div>
                        <p className="text-[10px] text-[#a3a89e]">
                          Invest in curated, thematic collections
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6dff8a]/10 text-[#6dff8a] font-bold">
                        Top ROI
                      </span>
                    </div>

                    {/* Bottom App Navigation Bar */}
                    <div className="pt-2 border-t border-white/10 grid grid-cols-4 gap-1 text-center text-[9px] text-white/60">
                      <div className="flex flex-col items-center gap-1 cursor-pointer">
                        <div className="w-4 h-4 rounded bg-white/20" />
                        <span>Watchlist</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 cursor-pointer">
                        <div className="w-4 h-4 rounded bg-white/20" />
                        <span>Portfolio</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 cursor-pointer text-[#6dff8a]">
                        <div className="w-4 h-4 rounded-full bg-[#6dff8a] text-[#15170f] flex items-center justify-center font-bold text-[8px]">
                          ✓
                        </div>
                        <span className="font-bold text-[#6dff8a]">Explore</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 cursor-pointer">
                        <div className="w-4 h-4 rounded bg-white/20" />
                        <span>More</span>
                      </div>
                    </div>

                    {/* iPhone Bottom Home Bar */}
                    <div className="w-28 h-1 bg-white/30 rounded-full mx-auto mt-1" />

                  </div>

                </div>

                {/* Floating pill annotation */}
                <div className="absolute -bottom-4 -left-4 bg-[#1b2214] border border-[#6dff8a]/40 rounded-xl px-3 py-1.5 shadow-xl text-[11px] text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#6dff8a] animate-ping" />
                  <span>Real-time TradeShark Mobile</span>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

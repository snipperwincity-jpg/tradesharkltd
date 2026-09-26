import React, { useState, useMemo } from 'react';
import { useBrokerage } from '../context/BrokerageContext';
import { Instrument } from '../types';
import { ArrowRight, Search, Clock, ChevronRight, TrendingUp, TrendingDown, Shield } from 'lucide-react';

interface ProductRangeProps {
  onSelectInstrument: (inst: Instrument) => void;
  onStartInvesting: () => void;
}

export const ProductRange: React.FC<ProductRangeProps> = ({ 
  onSelectInstrument, 
  onStartInvesting 
}) => {
  const [activeTab, setActiveTab] = useState<'stocks' | 'etfs' | 'crypto' | 'commodities' | 'indices' | 'currencies'>('stocks');
  const [searchQuery, setSearchQuery] = useState('');
  const { instruments: INSTRUMENTS } = useBrokerage();

  const tabs = [
    { id: 'stocks', label: 'Stocks' },
    { id: 'etfs', label: 'ETFs' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'commodities', label: 'Commodities' },
    { id: 'indices', label: 'Indices' },
    { id: 'currencies', label: 'Currencies' },
  ] as const;

  const tabContent = {
    stocks: {
      headline: '20+ exchanges. Thousands of shares.',
      bullets: [
        'Start from as little as $10 with fractional shares.',
        'Trade top US & global stocks with extended 24/5 hours.',
        'TradeShark analyst consensus & real-time retail sentiment.'
      ],
      ctaText: 'Trade Stocks'
    },
    etfs: {
      headline: 'Vanguard, iShares, SPDR and more.',
      bullets: [
        'Zero commission and no management surcharge.',
        'Instant diversification across sectors, regions, and commodities.',
        'Automatic dividend reinvestment credited directly.'
      ],
      ctaText: 'Explore ETFs'
    },
    crypto: {
      headline: 'Trade 150+ leading cryptocurrencies.',
      bullets: [
        'Institutional-grade offline cold storage custody.',
        'Earn up to 12% APY staking rewards with no lock-up periods.',
        'Direct deposits & withdrawals via TradeShark Money.'
      ],
      ctaText: 'Trade Crypto'
    },
    commodities: {
      headline: 'From Gold to Crude Oil. At your fingertips.',
      bullets: [
        'Trade physical & non-expiry commodity CFDs 24/7.',
        'Hedge inflation with precious metals and energy markets.',
        'Built-in stop-loss and take-profit controls.'
      ],
      ctaText: 'Trade Commodities'
    },
    indices: {
      headline: 'Major global indices. Minor spreads.',
      bullets: [
        'Ultra-tight spreads on NASDAQ 100, S&P 500, FTSE 100 and DAX 40.',
        'Fast order execution with transparent pricing.',
        'Gain broad market exposure with up to 20x leverage.'
      ],
      ctaText: 'Trade Indices'
    },
    currencies: {
      headline: 'Global Forex with competitive spreads.',
      bullets: [
        'EUR/USD, GBP/USD, USD/JPY and 48+ currency pairs.',
        'Up to 30:1 leverage for retail and 400:1 for professional accounts.',
        'Integrated TradingView chart analysis with 100+ technical indicators.'
      ],
      ctaText: 'Trade Currencies'
    }
  };

  const currentTabInfo = tabContent[activeTab];

  const filteredInstruments = useMemo(() => {
    return INSTRUMENTS.filter(inst => {
      const matchCategory = inst.category === activeTab;
      if (!searchQuery.trim()) return matchCategory;
      const matchSearch = 
        inst.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
        inst.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeTab, searchQuery, INSTRUMENTS]);

  return (
    <section id="markets" className="py-20 bg-[#12140e] relative border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6dff8a] bg-[#6dff8a]/10 px-3 py-1 rounded-full border border-[#6dff8a]/20">
            Market Screener
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Global markets. Your move.
          </h2>
          <p className="text-sm sm:text-base text-[#a3a89e]">
            Access multi-asset classes seamlessly on TradeShark Ltd with institutional execution.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex justify-center mb-10 overflow-x-auto pb-2 no-scrollbar">
          <div className="inline-flex items-center gap-2 p-1.5 rounded-full bg-[#1b1e15] border border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                }}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#6dff8a] text-[#15170f] shadow-[0_0_15px_rgba(109,255,138,0.3)] font-bold'
                    : 'text-[#d4d6cf] hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Feature Highlights */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl bg-[#181b12] border border-white/10 p-8 sm:p-10 shadow-xl">
            <div className="space-y-6">
              <span className="text-xs font-bold text-[#6dff8a] uppercase tracking-wider block">
                TradeShark {tabs.find(t => t.id === activeTab)?.label}
              </span>

              <h3 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
                {currentTabInfo.headline}
              </h3>

              <ul className="space-y-4 pt-2">
                {currentTabInfo.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-3 text-sm text-[#d4d6cf]">
                    <span className="h-2 w-2 rounded-full bg-[#6dff8a] mt-1.5 shrink-0 shadow-[0_0_8px_#6dff8a]" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8 mt-8 border-t border-white/10">
              <button
                onClick={onStartInvesting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#6dff8a] text-[#15170f] font-bold hover:bg-[#5ce077] transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(109,255,138,0.25)]"
              >
                <span>{currentTabInfo.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Live Instruments List */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl bg-[#181b12] border border-white/10 p-6 sm:p-8 shadow-xl">
            
            {/* Quick Filter Header */}
            <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Filter ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#6dff8a]"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#a3a89e]">
                <Clock className="w-3.5 h-3.5 text-[#6dff8a]" />
                <span className="hidden sm:inline">Live quotes</span>
                <span className="inline-block w-2 h-2 rounded-full bg-[#6dff8a] animate-pulse" />
              </div>
            </div>

            {/* Instrument Cards */}
            <div className="space-y-3">
              {filteredInstruments.map((item) => {
                const isPositive = item.deltaPercent >= 0;
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectInstrument(item)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-[#6dff8a]/40 transition-all cursor-pointer group"
                  >
                    {/* Symbol & Name */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div 
                        className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-md"
                        style={{ backgroundColor: item.avatarBg }}
                      >
                        {item.symbol.slice(0, 3)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm sm:text-base group-hover:text-[#6dff8a] transition-colors">
                            {item.symbol}
                          </span>
                          <span className="text-[10px] text-white/40 uppercase hidden sm:inline">{item.category}</span>
                        </div>
                        <p className="text-xs text-[#a3a89e] truncate max-w-[160px] sm:max-w-xs">
                          {item.name}
                        </p>
                      </div>
                    </div>

                    {/* Price & Delta */}
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="text-sm sm:text-base font-bold text-white font-heading">
                          {item.currency}{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className={`text-xs font-semibold flex items-center justify-end gap-1 ${
                          isPositive ? 'text-[#6dff8a]' : 'text-[#ff5c5c]'
                        }`}>
                          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{isPositive ? '+' : ''}{item.deltaPercent.toFixed(2)}%</span>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white/5 group-hover:bg-[#6dff8a] group-hover:text-[#15170f] text-white transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredInstruments.length === 0 && (
                <div className="text-center py-10 text-xs text-[#a3a89e]">
                  No matching instruments found in {activeTab}. Try another query.
                </div>
              )}
            </div>

            {/* Bottom footnote in screener */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#a3a89e]">
              <span>Click any asset to simulate trade orders</span>
              <span>TradeShark Feed • Powered by Refinitiv</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

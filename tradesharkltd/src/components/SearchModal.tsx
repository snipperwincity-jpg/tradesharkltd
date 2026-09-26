import React, { useState, useEffect } from 'react';
import { useBrokerage } from '../context/BrokerageContext';
import { Instrument } from '../types';
import { Search, X, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectInstrument: (inst: Instrument) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelectInstrument 
}) => {
  const [query, setQuery] = useState('');
  const { instruments: INSTRUMENTS } = useBrokerage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Handled externally if needed
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = INSTRUMENTS.filter(
    (inst) =>
      inst.symbol.toLowerCase().includes(query.toLowerCase()) ||
      inst.name.toLowerCase().includes(query.toLowerCase()) ||
      inst.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-[#191c13] border border-white/15 rounded-3xl shadow-2xl overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#6dff8a] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 5,000+ stocks, cryptos, ETFs, or commodities..."
            className="w-full bg-transparent text-white text-base placeholder:text-white/40 focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs bg-white/10 hover:bg-white/15 text-white/80 px-2.5 py-1 rounded-lg transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1.5">
          {results.map((inst) => {
            const isPositive = inst.deltaPercent >= 0;
            return (
              <div
                key={inst.id}
                onClick={() => {
                  onSelectInstrument(inst);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0"
                    style={{ backgroundColor: inst.avatarBg }}
                  >
                    {inst.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm group-hover:text-[#6dff8a] transition-colors">
                        {inst.symbol}
                      </span>
                      <span className="text-[10px] text-white/40 uppercase bg-white/5 px-1.5 py-0.5 rounded">
                        {inst.category}
                      </span>
                    </div>
                    <div className="text-xs text-[#a3a89e] truncate max-w-xs">{inst.name}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-white font-heading">
                    {inst.currency}{inst.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className={`text-xs font-semibold flex items-center justify-end gap-1 ${
                    isPositive ? 'text-[#6dff8a]' : 'text-[#ff5c5c]'
                  }`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{isPositive ? '+' : ''}{inst.deltaPercent.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            );
          })}

          {results.length === 0 && (
            <div className="text-center py-12 text-sm text-[#a3a89e]">
              No instruments found matching "{query}".
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-black/40 border-t border-white/5 flex items-center justify-between text-[11px] text-white/50 px-5">
          <span>Navigate with arrows, press Enter to view</span>
          <span>TradeShark Ltd Terminal</span>
        </div>
      </div>
    </div>
  );
};

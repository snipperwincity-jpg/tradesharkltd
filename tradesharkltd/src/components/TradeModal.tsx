import React, { useState } from 'react';
import { Instrument } from '../types';
import { useBrokerage } from '../context/BrokerageContext';
import { errMsg } from '../lib/api';
import { X, CheckCircle2, TrendingUp, TrendingDown, DollarSign, ShieldAlert, ArrowRight } from 'lucide-react';

interface TradeModalProps {
  instrument: Instrument | null;
  onClose: () => void;
  onRequireAuth?: () => void;
  onOpenPortal?: (tab?: string) => void;
}

export const TradeModal: React.FC<TradeModalProps> = (props) => (props.instrument ? <TradeModalInner {...props} instrument={props.instrument} /> : null);

const TradeModalInner: React.FC<TradeModalProps & { instrument: Instrument }> = ({ instrument: initial, onClose, onRequireAuth, onOpenPortal }) => {
  const { instruments, currentUser, openPosition } = useBrokerage();
  const instrument = instruments.find(i => i.symbol === initial.symbol) || initial;

  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [amount, setAmount] = useState(100);
  const [orderPlaced, setOrderPlaced] = useState<null | { units: string; price: number }>(null);
  const [useLeverage, setUseLeverage] = useState<'X1' | 'X2' | 'X5'>('X1');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const units = (amount / instrument.price).toFixed(4);
  const isPositive = instrument.deltaPercent >= 0;

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!currentUser) {
      onRequireAuth?.();
      return;
    }
    setBusy(true);
    try {
      const pos = await openPosition(instrument.symbol, tradeType, amount, Number(useLeverage.slice(1)));
      setOrderPlaced({ units: pos.units, price: pos.entryPrice });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-md bg-[#181b12] border border-white/15 rounded-3xl shadow-2xl p-6 sm:p-7 relative text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {orderPlaced ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#6dff8a]/20 text-[#6dff8a] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white">Order Executed</h3>
            <p className="text-sm text-[#a3a89e]">
              Your {tradeType} order of <strong>${amount.toLocaleString()}</strong> in {instrument.symbol} ({orderPlaced.units} units @ ${orderPlaced.price.toLocaleString()}) was executed. A confirmation email is on its way.
            </p>
            <div className="pt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => onOpenPortal?.('positions')}
                className="w-full py-3 rounded-full border border-white/20 text-white font-bold text-sm"
              >
                View positions
              </button>
              <button
                onClick={() => { setOrderPlaced(null); onClose(); }}
                className="w-full py-3 rounded-full bg-[#6dff8a] text-[#15170f] font-bold text-sm"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleOrder} className="space-y-6">
            
            {/* Asset Header */}
            <div className="flex items-center gap-3.5 pr-8">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-lg"
                style={{ backgroundColor: instrument.avatarBg }}
              >
                {instrument.symbol.slice(0, 3)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{instrument.symbol}</h3>
                  <span className="text-[10px] text-[#6dff8a] uppercase bg-[#6dff8a]/10 px-2 py-0.5 rounded font-bold">
                    {instrument.category}
                  </span>
                </div>
                <div className="text-xs text-[#a3a89e]">{instrument.name}</div>
              </div>
            </div>

            {/* Current Price Banner */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs text-white/50 block">Market Price</span>
                <span className="text-2xl font-bold text-white font-heading">
                  {instrument.currency}{instrument.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                isPositive ? 'bg-[#6dff8a]/15 text-[#6dff8a]' : 'bg-[#ff5c5c]/15 text-[#ff5c5c]'
              }`}>
                {isPositive ? '+' : ''}{instrument.deltaPercent.toFixed(2)}%
              </div>
            </div>

            {/* Buy / Sell Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
              <button
                type="button"
                onClick={() => setTradeType('BUY')}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  tradeType === 'BUY'
                    ? 'bg-[#6dff8a] text-[#15170f] shadow-md'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                BUY (Long)
              </button>
              <button
                type="button"
                onClick={() => setTradeType('SELL')}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  tradeType === 'SELL'
                    ? 'bg-[#ff5c5c] text-white shadow-md'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                SELL (Short CFD)
              </button>
            </div>

            {/* Amount input */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[#d4d6cf]">
                <span>Amount to Invest ($USD):</span>
                <span>Approx. <strong>{units} units</strong></span>
              </div>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-[#6dff8a] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="10"
                  max="100000"
                  step="10"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/15 rounded-xl pl-9 pr-4 py-3 text-white font-heading font-bold text-base focus:outline-none focus:border-[#6dff8a]"
                />
              </div>

              {/* Quick amount chips */}
              <div className="flex gap-2 pt-1">
                {[50, 100, 500, 1000, 5000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmount(v)}
                    className="flex-1 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] text-white/80 font-medium border border-white/5"
                  >
                    ${v}
                  </button>
                ))}
              </div>
            </div>

            {/* Leverage selector */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-white/60">
                <span>Leverage:</span>
                <span className="text-[#6dff8a]">{useLeverage === 'X1' ? 'No Leverage (Real Asset)' : `${useLeverage} Exposure`}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['X1', 'X2', 'X5'] as const).map((lev) => (
                  <button
                    key={lev}
                    type="button"
                    onClick={() => setUseLeverage(lev)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      useLeverage === lev 
                        ? 'bg-[#6dff8a]/20 border-[#6dff8a] text-[#6dff8a]' 
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {lev}
                  </button>
                ))}
              </div>
            </div>

            {/* Zero commission callout */}
            <div className="text-[11px] text-[#a3a89e] flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
              <span>TradeShark Brokerage Fee:</span>
              <span className="text-[#6dff8a] font-bold font-mono">$0.00 (Commission Free)</span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">{error}</div>
            )}
            {currentUser && (
              <div className="text-[11px] text-white/50 flex justify-between"><span>Available balance</span><span className="font-mono text-white">${currentUser.realBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={busy}
              className={`w-full py-4 rounded-full font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] ${
                tradeType === 'BUY'
                  ? 'bg-[#6dff8a] hover:bg-[#5ce077] text-[#15170f] shadow-[#6dff8a]/20'
                  : 'bg-[#ff5c5c] hover:bg-[#ff4747] text-white shadow-[#ff5c5c]/20'
              }`}
            >
              <span>{!currentUser ? 'Log in to Trade' : busy ? 'Executing...' : `Place ${tradeType} Order`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

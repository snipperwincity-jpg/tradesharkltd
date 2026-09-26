import React from 'react';
import { ArrowRight, QrCode, Shield, Zap, Sparkles, Smartphone } from 'lucide-react';

interface FinalCtaProps {
  onSignUp: () => void;
}

export const FinalCta: React.FC<FinalCtaProps> = ({ onSignUp }) => {
  return (
    <section className="py-20 bg-gradient-to-br from-[#181d12] via-[#15170f] to-[#12140c] relative border-b border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="rounded-3xl bg-gradient-to-r from-[#1c2215] to-[#161a10] border border-[#6dff8a]/25 p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden">
          {/* Neon corner flare */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#6dff8a]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6dff8a] bg-[#6dff8a]/10 px-3.5 py-1.5 rounded-full border border-[#6dff8a]/20">
                Get Started in 3 Minutes
              </span>

              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                Ready when you are<span className="text-[#6dff8a]">.</span>
              </h2>

              <p className="text-base sm:text-lg text-[#d4d6cf] leading-relaxed max-w-xl">
                An account takes minutes. $50 gets you in. You could be trading global stocks, ETFs, crypto, and copying top investors by the next market open.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-5">
                <button
                  onClick={onSignUp}
                  className="inline-flex items-center justify-center gap-3 px-9 py-4 text-base sm:text-lg font-bold text-[#15170f] bg-[#6dff8a] hover:bg-[#5ce077] rounded-full shadow-[0_0_30px_rgba(109,255,138,0.3)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Create free account</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                {/* QR Code download container */}
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2.5 px-4">
                  <div className="w-10 h-10 bg-white rounded-lg p-1 shrink-0 flex items-center justify-center">
                    <QrCode className="w-full h-full text-black" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-white">Scan to get App</div>
                    <div className="text-[11px] text-[#a3a89e]">iOS &amp; Android</div>
                  </div>
                </div>
              </div>

              {/* Security guarantee line */}
              <div className="pt-4 flex items-center gap-6 text-xs text-[#a3a89e]">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#6dff8a]" />
                  <span>Bank-grade 256-bit encryption</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#6dff8a]" />
                  <span>Instant deposit &amp; execution</span>
                </div>
              </div>

            </div>

            {/* Right Graphic: Smartphone TradeShark App Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-64 sm:w-72 bg-[#12140e] border-4 border-white/20 rounded-[42px] p-4 shadow-2xl shadow-black/80">
                {/* Phone Speaker Notch */}
                <div className="w-20 h-4 bg-black rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="w-8 h-1 bg-white/20 rounded-full" />
                </div>

                {/* Screen Content */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-white/50">Total Portfolio</div>
                      <div className="text-lg font-bold text-white font-heading">$48,290.45</div>
                    </div>
                    <span className="text-[10px] font-bold text-[#6dff8a] bg-[#6dff8a]/20 px-2 py-0.5 rounded-full">
                      +24.8%
                    </span>
                  </div>

                  {/* Mini Watchlist */}
                  <div className="space-y-2">
                    {[
                      { s: 'NVDA', p: '$218.15', c: '+3.4%', col: '#76b900' },
                      { s: 'BTC', p: '$91,420', c: '+2.8%', col: '#f7931a' },
                      { s: 'VOO', p: '$521.80', c: '+0.3%', col: '#96151d' }
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-white/5 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: row.col }} />
                          <span className="font-bold text-white">{row.s}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-white">{row.p}</div>
                          <div className="text-[10px] text-[#6dff8a]">{row.c}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CopyTrader Mini Notification */}
                  <div className="p-2.5 rounded-xl bg-[#1e2715] border border-[#6dff8a]/30 text-[10px] text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#6dff8a] animate-ping" />
                    <span>CopyTrader: Rhys Adams bought MSFT</span>
                  </div>
                </div>

                {/* Home Indicator bar */}
                <div className="w-24 h-1 bg-white/30 rounded-full mx-auto mt-6" />
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

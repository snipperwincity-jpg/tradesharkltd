import React from 'react';
import { ArrowRight, Check } from 'lucide-react';

interface PricingSectionProps {
  onLearnMore?: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onLearnMore }) => {
  const cards = [
    {
      metric: '$1',
      title: 'Commission on stocks.',
      description: 'Unlimited trades. No management fees, ever. Keep more of what you earn.',
      features: ['US, UK & European shares', 'Fractional ownership from $10', 'Real-time quotes included']
    },
    {
      metric: '0%',
      title: 'Commission on ETFs.',
      description: 'Build a diversified portfolio with leading Vanguard, iShares, and SPDR funds.',
      features: ['Zero broker commissions', 'Auto-reinvested dividends', 'No quarterly custody fees']
    },
    {
      metric: 'From 0.3%',
      title: 'Trade more crypto, pay less.',
      description: 'Transparent tiered spreads starting at 0.3% for active traders, capped at 1%.',
      features: ['150+ cryptocurrencies', 'Secure cold-storage custody', 'Staking yield up to 12% APY']
    }
  ];

  return (
    <section id="fees" className="py-20 bg-[#15170f] relative border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6dff8a] bg-[#6dff8a]/10 px-3 py-1 rounded-full border border-[#6dff8a]/20">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            No hidden fees. Just better investing.
          </h2>
          <p className="text-sm sm:text-base text-[#a3a89e]">
            At TradeShark Ltd, we believe transparent fees build trust. Compare our ultra-low pricing structure.
          </p>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, idx) => (
            <div 
              key={idx}
              className="relative flex flex-col justify-between rounded-2xl bg-[#1a1d14]/70 border border-white/10 hover:border-[#6dff8a]/40 p-8 transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] group"
            >
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-[#6dff8a] font-heading mb-4 tracking-tight group-hover:scale-105 transition-transform origin-left">
                  {card.metric}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">
                  {card.title}
                </h3>
                
                <p className="text-sm text-[#a3a89e] mb-6 leading-relaxed">
                  {card.description}
                </p>

                <ul className="space-y-2.5 pt-4 border-t border-white/10 text-xs sm:text-sm text-[#d4d6cf]">
                  {card.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#6dff8a]/20 text-[#6dff8a] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5">
                <span className="text-xs font-semibold text-[#6dff8a] flex items-center gap-1.5 group-hover:underline cursor-pointer">
                  <span>Explore asset specifications</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footnote */}
        <div className="mt-12 text-center text-xs text-[#a3a89e] max-w-xl mx-auto">
          For the complete fee schedule in plain numbers, including overnight financing and FX conversion rates, view the{' '}
          <a href="/fees" className="text-[#6dff8a] underline underline-offset-2 hover:text-white transition-colors">
            TradeShark Ltd Fee Schedule
          </a>
          .
        </div>

      </div>
    </section>
  );
};

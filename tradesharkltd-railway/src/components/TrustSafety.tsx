import React from 'react';
import { ShieldCheck, Landmark, Lock, CheckCircle2 } from 'lucide-react';

export const TrustSafety: React.FC = () => {
  const cards = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-[#6dff8a]" />,
      title: 'Regulated entities.',
      description: 'Wherever you sign up, TradeShark Ltd answers directly to stringent Tier-1 global regulators. No exceptions.',
      tags: ['FCA (UK)', 'CySEC (EU)', 'ASIC (Australia)', 'FinCEN (US)']
    },
    {
      icon: <Landmark className="w-8 h-8 text-[#6dff8a]" />,
      title: 'Your money, held separately.',
      description: 'Segregated accounts at some of the world’s largest tier-1 banking institutions. Not a cent sits on our operational balance sheet.',
      tags: ['Barclays', 'Deutsche Bank', 'BNY Mellon', 'J.P. Morgan']
    },
    {
      icon: <Lock className="w-8 h-8 text-[#6dff8a]" />,
      title: 'Investor protection.',
      description: 'TradeShark Ltd client funds are protected under statutory compensation schemes and top-tier private insurance coverage.',
      tags: ['FSCS (up to £85k)', 'ICF (up to €20k)', 'Lloyd’s of London (up to $1M)']
    }
  ];

  return (
    <section id="safety" className="py-20 bg-[#12140e] relative border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6dff8a] bg-[#6dff8a]/10 px-3 py-1 rounded-full border border-[#6dff8a]/20">
            Security &amp; Compliance
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Trusted by 40M+ users. Obviously.
          </h2>
          <p className="text-sm sm:text-base text-[#a3a89e]">
            Your security is our prime directive. Explore how TradeShark Ltd safeguards client assets worldwide.
          </p>
        </div>

        {/* 3 Security Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-3xl bg-[#181b12] border border-white/10 hover:border-[#6dff8a]/30 p-8 shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  {card.icon}
                </div>

                <h3 className="text-xl font-bold text-white">
                  {card.title}
                </h3>

                <p className="text-sm text-[#a3a89e] leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-2">
                {card.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/90"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#6dff8a]" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

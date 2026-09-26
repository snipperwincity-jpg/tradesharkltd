import React from 'react';
import { ShieldCheck, Landmark, Lock, CheckCircle2 } from 'lucide-react';

export const TrustSafety: React.FC = () => {
  const cards = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-[#6dff8a]" />,
      title: 'Verified clients.',
      description: 'Every account goes through identity verification and anti-money-laundering screening before funds can be withdrawn.',
      tags: ['KYC checks', 'AML screening', 'Sanctions & PEP checks']
    },
    {
      icon: <Landmark className="w-8 h-8 text-[#6dff8a]" />,
      title: 'Your money, held separately.',
      description: 'Client funds are kept separate from company operating funds, and withdrawals only go to verified destinations.',
      tags: ['Separate client accounts', 'Verified withdrawals', 'Full transaction history']
    },
    {
      icon: <Lock className="w-8 h-8 text-[#6dff8a]" />,
      title: 'Account security.',
      description: 'Encrypted sessions, secure password storage and a complete audit trail of every sensitive action on your account.',
      tags: ['Encrypted sessions', 'Email alerts', 'Audit trail']
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
            Built with security first.
          </h2>
          <p className="text-sm sm:text-base text-[#a3a89e]">
            Your security is our prime directive. Here is how we keep your account and your money safe.
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

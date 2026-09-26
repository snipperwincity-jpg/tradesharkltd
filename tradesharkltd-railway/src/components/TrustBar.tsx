import React from 'react';
import { Calendar, Award, Users, ShieldCheck, Lock } from 'lucide-react';

export const TrustBar: React.FC = () => {
  const trustItems = [
    {
      icon: <Calendar className="w-5 h-5 text-[#6dff8a]" />,
      title: 'Established 2014',
      subtitle: '12+ years experience'
    },
    {
      icon: <Award className="w-5 h-5 text-[#6dff8a]" />,
      title: 'Nasdaq Listed',
      subtitle: 'Ticker: SHRK'
    },
    {
      icon: <Users className="w-5 h-5 text-[#6dff8a]" />,
      title: '40M+ Users',
      subtitle: 'Across 75 countries'
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#6dff8a]" />,
      title: 'Regulated',
      subtitle: 'FCA, CySEC & ASIC'
    },
    {
      icon: <Lock className="w-5 h-5 text-[#6dff8a]" />,
      title: 'Protected Funds',
      subtitle: 'Under FSCS & Tier 1 Banks'
    }
  ];

  return (
    <div className="w-full py-6 bg-[#11130c] border-b border-white/5 relative overflow-hidden">
      {/* Desktop view */}
      <div className="hidden xl:block max-w-7xl mx-auto px-4">
        <ul className="flex items-center justify-between">
          {trustItems.map((item, idx) => (
            <React.Fragment key={idx}>
              <li className="flex items-center gap-4 px-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/5 border border-white/10 shrink-0">
                  {item.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{item.title}</div>
                  <div className="text-xs text-[#a3a89e]">{item.subtitle}</div>
                </div>
              </li>
              {idx < trustItems.length - 1 && (
                <li className="h-8 w-px bg-white/10 shrink-0" aria-hidden="true" />
              )}
            </React.Fragment>
          ))}
        </ul>
      </div>

      {/* Mobile & Tablet marquee */}
      <div className="xl:hidden overflow-hidden relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 z-10 bg-gradient-to-r from-[#11130c] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 z-10 bg-gradient-to-l from-[#11130c] to-transparent" />
        
        <div className="animate-marquee flex items-center gap-8">
          {[...trustItems, ...trustItems, ...trustItems].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 shrink-0 px-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/10 shrink-0">
                {item.icon}
              </div>
              <div className="whitespace-nowrap">
                <div className="text-xs font-semibold text-white">{item.title}</div>
                <div className="text-[11px] text-[#a3a89e]">{item.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { SPONSOR_TEAMS } from '../data/mockData';

export const SponsorshipStrip: React.FC = () => {
  return (
    <section className="py-14 bg-[#11130c] border-b border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          From podiums to pitches, look for our name.
        </h2>
        <p className="text-xs text-[#a3a89e] mt-1">
          TradeShark Ltd is proud partner of world-class athletes, Formula 1 racing teams, and sports franchises.
        </p>
      </div>

      {/* Marquee Strip */}
      <div className="relative overflow-hidden w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-[#11130c] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-[#11130c] to-transparent" />

        <div className="animate-marquee flex items-center gap-10">
          {[...SPONSOR_TEAMS, ...SPONSOR_TEAMS, ...SPONSOR_TEAMS].map((team, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3.5 px-6 py-3 rounded-2xl bg-white/[0.02] border border-white/5 shrink-0 hover:border-[#6dff8a]/40 transition-colors"
            >
              <span className="text-2xl">{team.icon}</span>
              <div>
                <div className="text-sm font-bold text-white whitespace-nowrap">{team.name}</div>
                <div className="text-[11px] text-[#6dff8a] font-medium whitespace-nowrap">{team.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

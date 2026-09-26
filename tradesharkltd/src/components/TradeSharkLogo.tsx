import React from 'react';
import { useBrokerage } from '../context/BrokerageContext';

interface TradeSharkLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLtd?: boolean;
}

export const TradeSharkLogo: React.FC<TradeSharkLogoProps> = ({ 
  className = '', 
  size = 'md',
  showLtd = true 
}) => {
  const { config } = useBrokerage();
  const name = config.appName || 'TradeShark';
  // "TradeShark" -> "Trade" + "Shark"; "Nova Markets" -> "Nova" + " Markets"
  const m = name.match(/^(.+?)([A-Z][a-z0-9]+.*|\s.+)$/);
  const [first, second] = m ? [m[1], m[2]] : [name, ''];
  const suffix = (config.legalName.match(/\b(Ltd|Limited|LLC|Inc|PLC|GmbH|Sp\. z o\.o\.)\.?$/i) || [])[1];
  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-7 w-7',
    lg: 'h-8 w-8'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`inline-flex items-center gap-2.5 font-heading tracking-tight select-none ${className}`}>
      <div className={`relative flex items-center justify-center rounded-lg bg-[#1a2315] border border-[#6dff8a]/30 p-1.5 shadow-[0_0_12px_rgba(109,255,138,0.15)] ${iconSizes[size]}`}>
        {/* Shark fin forward momentum SVG glyph */}
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M3 18C8 17 11.5 13 12 3C15 9.5 19 14.5 21 17C16 18 13.5 17 12 21C10.5 17 6.5 18 3 18Z" 
            fill="#6dff8a" 
          />
          <circle cx="16" cy="11" r="1.5" fill="#15170f" />
        </svg>
      </div>

      <div className="flex items-center gap-1.5">
        <span className={`font-bold tracking-tight text-white ${textSizes[size]}`}>
          {first}<span className="text-[#6dff8a]">{second}</span>
        </span>
        {showLtd && suffix && (
          <span className="text-[10px] font-semibold tracking-wider text-[#6dff8a]/90 bg-[#6dff8a]/10 border border-[#6dff8a]/30 rounded px-1 py-0.2 uppercase">
            {suffix === 'Limited' ? 'Ltd' : suffix}
          </span>
        )}
      </div>
    </div>
  );
};

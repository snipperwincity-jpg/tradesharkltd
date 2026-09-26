import React from 'react';
import { useBrokerage } from '../context/BrokerageContext';

export const Toasts: React.FC = () => {
  const { toasts } = useBrokerage();
  return (
    <div className="fixed top-24 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`pointer-events-auto max-w-sm px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fadeIn border ${
          t.type === 'error' ? 'bg-[#2a1414] border-red-500/40' : t.type === 'info' ? 'bg-[#15202a] border-sky-400/40' : 'bg-[#1e2715] border-[#6dff8a]/40'}`}>
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${t.type === 'error' ? 'bg-red-400' : t.type === 'info' ? 'bg-sky-400' : 'bg-[#6dff8a]'}`} />
          <span className="text-xs font-semibold text-white">{t.text}</span>
        </div>
      ))}
    </div>
  );
};

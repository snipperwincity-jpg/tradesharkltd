import React, { useState } from 'react';
import { readCookiePrefs, saveCookiePrefs } from '../pages/ContentPage';

export const CookieBanner: React.FC = () => {
  const [show, setShow] = useState(() => !readCookiePrefs().decided);
  if (!show) return null;
  const decide = (all: boolean) => { saveCookiePrefs({ analytics: all, marketing: all }); setShow(false); };
  return (
    <div className="fixed bottom-4 left-4 right-4 md:right-auto md:max-w-md z-40 p-4 rounded-2xl bg-[#1b1e15] border border-white/15 shadow-2xl text-xs text-[#c9ccc3] space-y-3">
      <p>We use essential cookies to keep you signed in and optional cookies to improve the site. See our <a href="/cookies" className="text-[#6dff8a] underline">Cookie Policy</a>.</p>
      <div className="flex gap-2">
        <button onClick={() => decide(true)} className="px-4 py-2 rounded-full bg-[#6dff8a] text-[#15170f] font-bold">Accept all</button>
        <button onClick={() => decide(false)} className="px-4 py-2 rounded-full border border-white/20 text-white font-semibold">Essential only</button>
        <a href="/cookies" className="px-3 py-2 text-white/60 hover:text-white">Manage</a>
      </div>
    </div>
  );
};

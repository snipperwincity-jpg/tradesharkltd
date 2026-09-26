/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TrustBar } from './components/TrustBar';
import { PricingSection } from './components/PricingSection';
import { ProductRange } from './components/ProductRange';
import { PopularInvestors } from './components/PopularInvestors';
import { AiProducts } from './components/AiProducts';
import { TrustSafety } from './components/TrustSafety';
import { FinalCta } from './components/FinalCta';
import { Footer } from './components/Footer';
import { Toasts } from './components/Toasts';
import { CookieBanner } from './components/CookieBanner';

// Modals
import { SearchModal } from './components/SearchModal';
import { TradeModal } from './components/TradeModal';
import { CopyModal } from './components/CopyModal';
import { AuthModal } from './components/AuthModal';
import { AiChatDrawer } from './components/AiChatDrawer';
import { UserDashboardModal } from './components/UserDashboardModal';
import { AdminPortalModal } from './components/AdminPortalModal';

// Pages
import { ContentPage } from './pages/ContentPage';
import { MarketsPage } from './pages/MarketsPage';
import { InvestorsPage } from './pages/InvestorsPage';
import { ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage, NotFoundPage } from './pages/AuthPages';

import { Instrument, PopularInvestor } from './types';
import { PAGE_BY_SLUG, LEGACY_LINKS, CtaAction } from './data/pages';
import { ArrowUp, ArrowRight } from 'lucide-react';
import { useBrokerage } from './context/BrokerageContext';
import { useLocation, navigate, scrollToHash } from './lib/router';
import { errMsg } from './lib/api';

const PORTAL_PATHS = ['/dashboard', '/user', '/admin'];

export default function App() {
  const { currentUser, config, instruments, loginUser, loginAdmin, notify, ready } = useBrokerage();
  const loc = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [tradeInstrument, setTradeInstrument] = useState<Instrument | null>(null);
  const [copyInvestor, setCopyInvestor] = useState<PopularInvestor | null>(null);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({ isOpen: false, mode: 'signup' });
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showMobileStickyCta, setShowMobileStickyCta] = useState(false);
  const returnPath = useRef('/');
  const lastContentPath = useRef('/');

  const path = loc.path.toLowerCase();
  const isUserPortal = path === '/dashboard' || path === '/user';
  const isAdminPortal = path === '/admin' || path.startsWith('/admin/');
  if (!PORTAL_PATHS.some(p => path === p || path.startsWith('/admin/')) && !['/login', '/signup'].includes(path)) {
    lastContentPath.current = loc.path + window.location.search;
  }

  // Legacy hash links (#admin, #user, #about ...) and referral capture
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '').toLowerCase();
    if (hash === 'admin') navigate('/admin', { replace: true });
    else if (hash === 'user' || hash === 'dashboard') navigate('/dashboard', { replace: true });
    else if (hash && LEGACY_LINKS[hash] && !document.getElementById(hash)) navigate(LEGACY_LINKS[hash], { replace: true });
    else if (hash) scrollToHash(hash);

    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) { try { sessionStorage.setItem('ts_ref', ref); } catch { /* ignore */ } }
  }, []);

  // /login and /signup open the auth modal over the home page
  useEffect(() => {
    if (path === '/login' || path === '/signup') {
      setAuthModal({ isOpen: true, mode: path === '/login' ? 'login' : 'signup' });
      navigate('/', { replace: true });
    }
  }, [path]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
      setShowMobileStickyCta(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openUserDashboard = (tab?: string) => {
    returnPath.current = lastContentPath.current;
    navigate(`/dashboard${tab ? `?tab=${tab}` : ''}`);
  };
  const openAdminPortal = () => {
    returnPath.current = lastContentPath.current;
    navigate('/admin');
  };
  const closePortal = () => navigate(returnPath.current && !PORTAL_PATHS.includes(returnPath.current.split('?')[0]) ? returnPath.current : '/');

  const openAuth = (mode: 'login' | 'signup') => setAuthModal({ isOpen: true, mode });

  const handleOpenTradeForSymbol = (symbol: string) => {
    const found = instruments.find(i => i.symbol.toLowerCase() === symbol.toLowerCase()) || instruments[0];
    setIsAiChatOpen(false);
    setTradeInstrument(found);
  };

  const handleCta = (a: CtaAction) => {
    switch (a) {
      case 'signup': return currentUser ? openUserDashboard() : openAuth('signup');
      case 'login': return currentUser ? openUserDashboard() : openAuth('login');
      case 'dashboard': return openUserDashboard();
      case 'deposit': return openUserDashboard('deposit');
      case 'kyc': return openUserDashboard('kyc');
      case 'practice': return currentUser ? openUserDashboard() : openAuth('signup');
      case 'copy': return navigate('/popular-investors');
      case 'ai': return setIsAiChatOpen(true);
    }
  };

  // ------------------------------------------------------------------
  // Route → page body
  // ------------------------------------------------------------------
  const slug = path.replace(/^\//, '');
  let body: React.ReactNode;
  const isHome = path === '/' || isUserPortal || isAdminPortal || path === '/login' || path === '/signup';
  if (isHome) {
    body = (
      <>
        <Hero onStartInvesting={() => handleCta('signup')} onSelectInstrumentSymbol={handleOpenTradeForSymbol} />
        <TrustBar />
        <PricingSection onLearnMore={() => navigate('/fees')} />
        <ProductRange onSelectInstrument={(inst) => setTradeInstrument(inst)} onStartInvesting={() => handleCta('signup')} />
        <PopularInvestors onCopyInvestor={(inv) => setCopyInvestor(inv)} onExploreAll={() => navigate('/popular-investors')} />
        <AiProducts onOpenAiChat={() => setIsAiChatOpen(true)} />
        <TrustSafety />
        <FinalCta onSignUp={() => handleCta('signup')} />
      </>
    );
  } else if (path === '/markets' || path.startsWith('/markets/')) {
    body = <MarketsPage category={path.split('/')[2]} onTrade={setTradeInstrument} />;
  } else if (path === '/popular-investors') {
    body = <InvestorsPage onCopy={setCopyInvestor} />;
  } else if (path === '/forgot-password') {
    body = <ForgotPasswordPage />;
  } else if (path === '/reset-password') {
    body = <ResetPasswordPage token={loc.search.get('token') || ''} setup={loc.search.get('setup') === '1'} onDone={() => openUserDashboard()} />;
  } else if (path === '/verify-email') {
    body = <VerifyEmailPage token={loc.search.get('token') || ''} />;
  } else if (PAGE_BY_SLUG[slug]) {
    body = <ContentPage page={PAGE_BY_SLUG[slug]} onAction={handleCta} />;
  } else if (LEGACY_LINKS[slug]) {
    body = <ContentPage page={PAGE_BY_SLUG[LEGACY_LINKS[slug].slice(1)] || PAGE_BY_SLUG['help']} onAction={handleCta} />;
  } else {
    body = <NotFoundPage />;
  }

  return (
    <div className="min-h-screen bg-[#15170f] text-[#f4f4f0] flex flex-col selection:bg-[#6dff8a] selection:text-[#15170f]">
      <Toasts />

      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuth={openAuth}
        onOpenUserDashboard={() => openUserDashboard()}
        currentUser={currentUser}
      />

      <main className="flex-1">{body}</main>

      <Footer onOpenUserDashboard={() => openUserDashboard()} />

      {/* Floating AI Assistant Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-3 rounded-full bg-[#1b1e15] border border-white/15 text-white/80 hover:text-white hover:border-[#6dff8a] shadow-xl transition-all"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}
        <button
          id="floating-shark-ai-btn"
          onClick={() => setIsAiChatOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#6dff8a] text-[#15170f] font-bold shadow-[0_0_25px_rgba(109,255,138,0.4)] hover:bg-[#5ce077] transition-all transform hover:scale-105 active:scale-95"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#15170f] opacity-40"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#15170f]"></span>
          </span>
          <span className="text-xs sm:text-sm font-bold">Ask Shark AI</span>
        </button>
      </div>

      {/* Mobile Sticky CTA Bar */}
      {showMobileStickyCta && !currentUser && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-30 p-3 bg-[#15170f]/95 border-t border-white/10 backdrop-blur-md animate-slideUp">
          <button
            onClick={() => openAuth('signup')}
            className="w-full py-3.5 rounded-full bg-[#6dff8a] text-[#15170f] font-bold text-sm shadow-[0_0_20px_rgba(109,255,138,0.3)] flex items-center justify-center gap-2"
          >
            <span>Start Investing with {config.appName}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <CookieBanner />

      {/* Modals */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onSelectInstrument={(inst) => setTradeInstrument(inst)} />

      <TradeModal
        instrument={tradeInstrument}
        onClose={() => setTradeInstrument(null)}
        onRequireAuth={() => { setTradeInstrument(null); openAuth('login'); }}
        onOpenPortal={(tab) => { setTradeInstrument(null); openUserDashboard(tab); }}
      />

      <CopyModal
        investor={copyInvestor}
        onClose={() => setCopyInvestor(null)}
        onRequireAuth={() => { setCopyInvestor(null); openAuth('login'); }}
        onOpenPortal={(tab) => { setCopyInvestor(null); openUserDashboard(tab); }}
      />

      <AuthModal
        isOpen={authModal.isOpen}
        mode={authModal.mode}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        onSuccess={(u) => { notify(`Signed in as ${u.name}`); openUserDashboard(); }}
      />

      <AiChatDrawer isOpen={isAiChatOpen} onClose={() => setIsAiChatOpen(false)} onOpenTrade={handleOpenTradeForSymbol} />

      {ready && (
        <UserDashboardModal
          isOpen={isUserPortal}
          onClose={closePortal}
          initialTab={loc.search.get('tab') || undefined}
          onOpenTrade={handleOpenTradeForSymbol}
        />
      )}

      {ready && (
        <AdminPortalModal
          isOpen={isAdminPortal}
          initialTab={loc.search.get('tab') || undefined}
          onClose={closePortal}
          onSwitchToUserDashboard={() => openUserDashboard()}
        />
      )}

    </div>
  );
}

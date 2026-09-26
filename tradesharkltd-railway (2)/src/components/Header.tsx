import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Globe, 
  ChevronDown, 
  Menu, 
  X, 
  ArrowRight,
  TrendingUp,
  Cpu,
  ShieldCheck,
  BookOpen,
  Building2,
  Users,
  Key,
  Lock
} from 'lucide-react';
import { TradeSharkLogo } from './TradeSharkLogo';
import { useBrokerage } from '../context/BrokerageContext';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onOpenUserDashboard?: () => void;
  onOpenAdminPortal?: () => void;
  onOpenQuickLogins?: () => void;
  currentUser?: { name: string; email: string } | null;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenSearch, 
  onOpenAuth,
  onOpenUserDashboard,
  onOpenAdminPortal,
  onOpenQuickLogins,
  currentUser
}) => {
  const { config } = useBrokerage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN');
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const hasUserSession = !!currentUser;

  const languages = ['EN', 'ES', 'DE', 'FR', 'IT', 'NL', 'PT', 'AR'];

  return (
    <header 
      id="main-header"
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#15170f]/95 backdrop-blur-md border-b border-white/10 shadow-lg' 
          : 'bg-[#15170f]/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left Side: Brand Logo & Navigation */}
        <div className="flex items-center gap-8 lg:gap-10">
          <a href="/" className="flex items-center group">
            <TradeSharkLogo size="md" showLtd={true} />
          </a>

          {/* Desktop Navigation Links with Dropdowns */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {/* 1. Trade & Invest */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('trade')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button 
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-[#f4f4f0] hover:text-[#6dff8a] rounded-lg transition-colors"
              >
                <span>Trade and Invest</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'trade' ? 'rotate-180 text-[#6dff8a]' : ''}`} />
              </button>

              {activeDropdown === 'trade' && (
                <div className="absolute left-0 top-full pt-2 w-[540px] animate-fadeIn">
                  <div className="bg-[#1b1e15] border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl grid grid-cols-3 gap-6">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6dff8a] block mb-3">
                        Markets
                      </span>
                      <ul className="space-y-2.5 text-sm text-[#d4d6cf]">
                        <li><a href="/markets/stocks" className="hover:text-[#6dff8a] transition-colors block">Stocks</a></li>
                        <li><a href="/markets/crypto" className="hover:text-[#6dff8a] transition-colors block">Crypto</a></li>
                        <li><a href="/markets/etfs" className="hover:text-[#6dff8a] transition-colors block">ETFs</a></li>
                        <li><a href="/markets/commodities" className="hover:text-[#6dff8a] transition-colors block">Commodities</a></li>
                        <li><a href="/markets/indices" className="hover:text-[#6dff8a] transition-colors block">Indices</a></li>
                        <li><a href="/markets/currencies" className="hover:text-[#6dff8a] transition-colors block">Currencies</a></li>
                      </ul>
                    </div>

                    <div className="border-l border-white/10 pl-6">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6dff8a] block mb-3">
                        Trading
                      </span>
                      <ul className="space-y-2.5 text-sm text-[#d4d6cf]">
                        <li><a href="/fees" className="hover:text-[#6dff8a] transition-colors block">Fees &amp; Margins</a></li>
                        <li><a href="/market-hours" className="hover:text-[#6dff8a] transition-colors block">Market Hours</a></li>
                        <li><a href="/cfd-trading" className="hover:text-[#6dff8a] transition-colors block">CFD Trading</a></li>
                        <li><a href="/futures" className="hover:text-[#6dff8a] transition-colors block">Futures</a></li>
                        <li><a href="/professional-account" className="hover:text-[#6dff8a] transition-colors block">Professional Account</a></li>
                      </ul>
                    </div>

                    <div className="border-l border-white/10 pl-6">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6dff8a] block mb-3">
                        Products
                      </span>
                      <ul className="space-y-2.5 text-sm text-[#d4d6cf]">
                        <li>
                          <a href="/copytrader" className="hover:text-[#6dff8a] transition-colors flex items-center justify-between">
                            <span>CopyTrader™</span>
                            <span className="text-[10px] bg-[#6dff8a]/20 text-[#6dff8a] px-1.5 py-0.5 rounded font-bold">HOT</span>
                          </a>
                        </li>
                        <li><a href="/smart-portfolios" className="hover:text-[#6dff8a] transition-colors block">Smart Portfolios</a></li>
                        <li><a href="/recurring-investments" className="hover:text-[#6dff8a] transition-colors block">Recurring Buys</a></li>
                        <li><a href="/alpha-portfolios" className="hover:text-[#6dff8a] transition-colors block">Alpha Portfolios</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Why TradeShark */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('why')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button 
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-[#f4f4f0] hover:text-[#6dff8a] rounded-lg transition-colors"
              >
                <span>Why {config.appName}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'why' ? 'rotate-180 text-[#6dff8a]' : ''}`} />
              </button>

              {activeDropdown === 'why' && (
                <div className="absolute left-0 top-full pt-2 w-[520px] animate-fadeIn">
                  <div className="bg-[#1b1e15] border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl grid grid-cols-3 gap-6">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6dff8a] block mb-3">
                        AI Technology
                      </span>
                      <ul className="space-y-2.5 text-sm text-[#d4d6cf]">
                        <li><a href="/shark-ai" className="hover:text-[#6dff8a] transition-colors block">Shark AI™</a></li>
                        <li><a href="/agent-portfolios" className="hover:text-[#6dff8a] transition-colors block">Agent Portfolios</a></li>
                        <li><a href="/predictive-screener" className="hover:text-[#6dff8a] transition-colors block">Predictive Screener</a></li>
                      </ul>
                    </div>

                    <div className="border-l border-white/10 pl-6">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6dff8a] block mb-3">
                        Signature
                      </span>
                      <ul className="space-y-2.5 text-sm text-[#d4d6cf]">
                        <li><a href="/copytrader" className="hover:text-[#6dff8a] transition-colors block">CopyTrader™</a></li>
                        <li><a href="/popular-investors" className="hover:text-[#6dff8a] transition-colors block">Pro Investors</a></li>
                        <li><a href="/smart-portfolios" className="hover:text-[#6dff8a] transition-colors block">Smart Portfolios</a></li>
                      </ul>
                    </div>

                    <div className="border-l border-white/10 pl-6">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6dff8a] block mb-3">
                        Benefits
                      </span>
                      <ul className="space-y-2.5 text-sm text-[#d4d6cf]">
                        <li><a href="/club" className="hover:text-[#6dff8a] transition-colors block">{config.appName} Club</a></li>
                        <li><a href="/interest-on-cash" className="hover:text-[#6dff8a] transition-colors block">Interest on Cash</a></li>
                        <li><a href="/account-protection" className="hover:text-[#6dff8a] transition-colors block">Account Protection</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Learn */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('learn')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button 
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-[#f4f4f0] hover:text-[#6dff8a] rounded-lg transition-colors"
              >
                <span>Learn</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'learn' ? 'rotate-180 text-[#6dff8a]' : ''}`} />
              </button>

              {activeDropdown === 'learn' && (
                <div className="absolute left-0 top-full pt-2 w-[280px] animate-fadeIn">
                  <div className="bg-[#1b1e15] border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-xl">
                    <ul className="space-y-3 text-sm text-[#d4d6cf]">
                      <li><a href="/academy" className="hover:text-[#6dff8a] transition-colors block">{config.appName} Academy</a></li>
                      <li><a href="/getting-started" className="hover:text-[#6dff8a] transition-colors block">Getting Started Guide</a></li>
                      <li><a href="/market-news" className="hover:text-[#6dff8a] transition-colors block">Market Analysis &amp; News</a></li>
                      <li><a href="/earnings-calendar" className="hover:text-[#6dff8a] transition-colors block">Earnings Calendar</a></li>
                      <li><a href="/daily-digest" className="hover:text-[#6dff8a] transition-colors block">Daily Shark Digest</a></li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Company */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('company')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button 
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-[#f4f4f0] hover:text-[#6dff8a] rounded-lg transition-colors"
              >
                <span>Company</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'company' ? 'rotate-180 text-[#6dff8a]' : ''}`} />
              </button>

              {activeDropdown === 'company' && (
                <div className="absolute left-0 top-full pt-2 w-[290px] animate-fadeIn">
                  <div className="bg-[#1b1e15] border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-xl">
                    <ul className="space-y-3 text-sm text-[#d4d6cf]">
                      <li><a href="/about" className="hover:text-[#6dff8a] transition-colors block font-medium">About {config.legalName}</a></li>
                      <li><a href="/help" className="hover:text-[#6dff8a] transition-colors block">24/7 Customer Support</a></li>
                      <li><a href="/press" className="hover:text-[#6dff8a] transition-colors block">Media Center &amp; Press</a></li>
                      <li><a href="/careers" className="hover:text-[#6dff8a] transition-colors block">Careers (We're Hiring)</a></li>
                      <li><a href="/investor-relations" className="hover:text-[#6dff8a] transition-colors block">Investor Relations</a></li>
                      <li><a href="/risk-disclosure" className="hover:text-[#6dff8a] transition-colors block text-xs text-white/50">Risk Disclosures</a></li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Button */}
          <button 
            id="header-search-btn"
            onClick={onOpenSearch}
            className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 text-sm text-[#c8ccc2] hover:text-white bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors"
            title="Search instruments (Cmd+K)"
          >
            <Search className="w-4 h-4 text-[#6dff8a]" />
            <span className="hidden 2xl:inline text-xs text-white/60">Search markets...</span>
            <kbd className="hidden lg:inline text-[10px] bg-white/10 text-white/70 px-1.5 py-0.5 rounded border border-white/10 font-mono">⌘K</kbd>
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button 
              id="header-lang-btn"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 p-2 text-sm text-[#c8ccc2] hover:text-[#6dff8a] transition-colors rounded-lg"
              title="Select Language"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">{selectedLang}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-32 bg-[#1b1e15] border border-white/10 rounded-xl p-2 shadow-xl z-50">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setSelectedLang(lang);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      selectedLang === lang ? 'bg-[#6dff8a]/20 text-[#6dff8a] font-bold' : 'text-white/80 hover:bg-white/5'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          {onOpenAdminPortal && (
            <button
              onClick={onOpenAdminPortal}
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-full transition-all cursor-pointer"
              title="Open Back-Office Admin & Institutional Desk"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Desk</span>
            </button>
          )}

          <div className="h-5 w-px bg-white/15 hidden sm:block"></div>

          {/* Log In Button / User Avatar Button */}
          {hasUserSession && currentUser ? (
            <button
              onClick={onOpenUserDashboard}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-[#6dff8a]/40 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <span className="w-6 h-6 rounded-full bg-[#6dff8a] text-[#15170f] font-bold flex items-center justify-center text-[10px]">
                {currentUser.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden sm:inline">{currentUser.name}</span>
            </button>
          ) : (
            <button 
              id="header-login-btn"
              onClick={() => onOpenAuth('login')}
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold text-white hover:text-[#6dff8a] bg-transparent border border-white/20 hover:border-[#6dff8a]/50 rounded-full transition-all cursor-pointer"
            >
              Log in
            </button>
          )}

          {/* Start Investing Primary CTA */}
          <button 
            id="header-signup-btn"
            onClick={() => onOpenAuth('signup')}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-[#15170f] bg-[#6dff8a] hover:bg-[#5ce077] rounded-full shadow-[0_0_20px_rgba(109,255,138,0.25)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start Investing</span>
            <ArrowRight className="w-4 h-4 hidden sm:inline" />
          </button>

          {/* Mobile Menu Hamburger */}
          <button 
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-[#6dff8a] rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#15170f] border-b border-white/10 px-6 py-6 space-y-6 animate-fadeIn max-h-[80vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="font-semibold text-[#6dff8a] text-xs uppercase tracking-wider">Markets &amp; Trading</div>
            <div className="grid grid-cols-2 gap-2 text-sm text-white/80">
              <a href="/markets/stocks" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-lg">Stocks</a>
              <a href="/markets/crypto" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-lg">Crypto</a>
              <a href="/markets/etfs" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-lg">ETFs</a>
              <a href="/markets/commodities" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-lg">Commodities</a>
              <a href="/copytrader" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-lg">CopyTrader™</a>
              <a href="/shark-ai" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-lg">Shark AI</a>
            </div>

            <div className="pt-3 border-t border-white/10">
              <div className="font-semibold text-[#6dff8a] text-xs uppercase tracking-wider mb-2">TradeShark Ltd</div>
              <div className="grid grid-cols-2 gap-2 text-sm text-white/80">
                <a href="/about" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-lg">About Us</a>
                <a href="/fees" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-lg">Zero Fees</a>
                <a href="/regulation" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-lg">Regulation</a>
                <a href="/help" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-lg">Help Center</a>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              {onOpenAdminPortal && (
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdminPortal();
                  }}
                  className="w-full py-2.5 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Institutional Admin Portal</span>
                </button>
              )}

              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (currentUser && onOpenUserDashboard) onOpenUserDashboard(); else onOpenAuth('login');
                }}
                className="w-full py-3 text-sm font-semibold text-white border border-white/20 rounded-full"
              >
                {currentUser ? `My Portal (${currentUser.name})` : 'Log in'}
              </button>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('signup');
                }}
                className="w-full py-3 text-sm font-bold text-[#15170f] bg-[#6dff8a] rounded-full"
              >
                Start Investing
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

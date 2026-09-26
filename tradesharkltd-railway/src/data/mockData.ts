import { Instrument, PopularInvestor, AiSlide } from '../types';

export const INSTRUMENTS: Instrument[] = [
  // Stocks
  {
    id: 101,
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    category: 'stocks',
    price: 218.15,
    deltaPercent: -2.47,
    currency: '$',
    avatarBg: '#76b900',
    marketCap: '$3.41T',
    volume24h: '$42.8B'
  },
  {
    id: 102,
    symbol: 'AMZN',
    name: 'Amazon.com Inc',
    category: 'stocks',
    price: 252.17,
    deltaPercent: -0.09,
    currency: '$',
    avatarBg: '#ff9900',
    marketCap: '$2.12T',
    volume24h: '$18.4B'
  },
  {
    id: 103,
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    category: 'stocks',
    price: 491.69,
    deltaPercent: 0.01,
    currency: '$',
    avatarBg: '#00a4ef',
    marketCap: '$3.28T',
    volume24h: '$21.9B'
  },
  {
    id: 104,
    symbol: 'AAPL',
    name: 'Apple Inc.',
    category: 'stocks',
    price: 232.80,
    deltaPercent: 1.45,
    currency: '$',
    avatarBg: '#a2aaad',
    marketCap: '$3.52T',
    volume24h: '$29.1B'
  },
  {
    id: 105,
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    category: 'stocks',
    price: 248.50,
    deltaPercent: 3.24,
    currency: '$',
    avatarBg: '#e82127',
    marketCap: '$790B',
    volume24h: '$34.2B'
  },
  {
    id: 106,
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    category: 'stocks',
    price: 182.40,
    deltaPercent: 0.85,
    currency: '$',
    avatarBg: '#ea4335',
    marketCap: '$2.25T',
    volume24h: '$15.7B'
  },

  // ETFs
  {
    id: 201,
    symbol: 'CSPX.L',
    name: 'iShares Core S&P 500 UCITS ETF',
    category: 'etfs',
    price: 820.50,
    deltaPercent: 0.28,
    currency: '$',
    avatarBg: '#005596',
    marketCap: '$84B',
    volume24h: '$1.2B'
  },
  {
    id: 202,
    symbol: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    category: 'etfs',
    price: 521.80,
    deltaPercent: 0.35,
    currency: '$',
    avatarBg: '#96151d',
    marketCap: '$490B',
    volume24h: '$5.4B'
  },
  {
    id: 203,
    symbol: 'QQQ',
    name: 'Invesco QQQ Trust Series 1',
    category: 'etfs',
    price: 498.60,
    deltaPercent: 0.72,
    currency: '$',
    avatarBg: '#002d72',
    marketCap: '$285B',
    volume24h: '$8.1B'
  },
  {
    id: 204,
    symbol: 'WDEF.L',
    name: 'WisdomTree Europe Defence UCITS ETF',
    category: 'etfs',
    price: 30.48,
    deltaPercent: 1.15,
    currency: '€',
    avatarBg: '#34495e',
    marketCap: '$1.4B',
    volume24h: '$65M'
  },
  {
    id: 205,
    symbol: 'CNDX.L',
    name: 'iShares NASDAQ 100 UCITS ETF',
    category: 'etfs',
    price: 1679.00,
    deltaPercent: 0.64,
    currency: '$',
    avatarBg: '#1b365d',
    marketCap: '$14.2B',
    volume24h: '$340M'
  },

  // Crypto
  {
    id: 301,
    symbol: 'BTC',
    name: 'Bitcoin',
    category: 'crypto',
    price: 91420.00,
    deltaPercent: 2.84,
    currency: '$',
    avatarBg: '#f7931a',
    marketCap: '$1.81T',
    volume24h: '$41.2B'
  },
  {
    id: 302,
    symbol: 'ETH',
    name: 'Ethereum',
    category: 'crypto',
    price: 3415.50,
    deltaPercent: 1.52,
    currency: '$',
    avatarBg: '#627eea',
    marketCap: '$410B',
    volume24h: '$22.8B'
  },
  {
    id: 303,
    symbol: 'SOL',
    name: 'Solana',
    category: 'crypto',
    price: 194.20,
    deltaPercent: 4.18,
    currency: '$',
    avatarBg: '#9945ff',
    marketCap: '$91B',
    volume24h: '$7.5B'
  },
  {
    id: 304,
    symbol: 'BCH',
    name: 'Bitcoin Cash',
    category: 'crypto',
    price: 226.04,
    deltaPercent: -9.83,
    currency: '$',
    avatarBg: '#0ac18e',
    marketCap: '$4.4B',
    volume24h: '$320M'
  },
  {
    id: 305,
    symbol: 'XTZ',
    name: 'Tezos',
    category: 'crypto',
    price: 0.2592,
    deltaPercent: -0.31,
    currency: '$',
    avatarBg: '#2c7df7',
    marketCap: '$260M',
    volume24h: '$18M'
  },
  {
    id: 306,
    symbol: 'SGB',
    name: 'Songbird',
    category: 'crypto',
    price: 0.0010,
    deltaPercent: 0.00,
    currency: '$',
    avatarBg: '#d9381e',
    marketCap: '$15M',
    volume24h: '$2.1M'
  },

  // Commodities
  {
    id: 401,
    symbol: 'GOLD',
    name: 'Gold (Non Expiry Spot)',
    category: 'commodities',
    price: 2749.12,
    deltaPercent: -1.14,
    currency: '$',
    avatarBg: '#ffd700',
    marketCap: 'Commodity',
    volume24h: '$110B'
  },
  {
    id: 402,
    symbol: 'SILVER',
    name: 'Silver (Spot)',
    category: 'commodities',
    price: 32.40,
    deltaPercent: -4.79,
    currency: '$',
    avatarBg: '#c0c0c0',
    marketCap: 'Commodity',
    volume24h: '$24B'
  },
  {
    id: 403,
    symbol: 'OIL',
    name: 'Crude Oil Brent',
    category: 'commodities',
    price: 74.20,
    deltaPercent: 5.17,
    currency: '$',
    avatarBg: '#333333',
    marketCap: 'Commodity',
    volume24h: '$55B'
  },
  {
    id: 404,
    symbol: 'COPPER',
    name: 'High Grade Copper',
    category: 'commodities',
    price: 4.38,
    deltaPercent: 1.25,
    currency: '$',
    avatarBg: '#b87333',
    marketCap: 'Commodity',
    volume24h: '$12B'
  },

  // Indices
  {
    id: 501,
    symbol: 'NSDQ100',
    name: 'NASDAQ 100 Index',
    category: 'indices',
    price: 20140.10,
    deltaPercent: 0.45,
    currency: 'pts',
    avatarBg: '#1f2937',
    marketCap: 'Benchmark',
    volume24h: 'Index'
  },
  {
    id: 502,
    symbol: 'SPX500',
    name: 'S&P 500 Index',
    category: 'indices',
    price: 5891.50,
    deltaPercent: 0.18,
    currency: 'pts',
    avatarBg: '#1e3a8a',
    marketCap: 'Benchmark',
    volume24h: 'Index'
  },
  {
    id: 503,
    symbol: 'USDOLLAR',
    name: 'US Dollar Index (DXY)',
    category: 'indices',
    price: 104.73,
    deltaPercent: -0.12,
    currency: 'pts',
    avatarBg: '#065f46',
    marketCap: 'Currency Basket',
    volume24h: 'Index'
  },
  {
    id: 504,
    symbol: 'FTSE100',
    name: 'FTSE 100 Index (UK)',
    category: 'indices',
    price: 8240.20,
    deltaPercent: 0.32,
    currency: 'pts',
    avatarBg: '#4b5563',
    marketCap: 'Benchmark',
    volume24h: 'Index'
  },

  // Currencies
  {
    id: 601,
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    category: 'currencies',
    price: 1.0852,
    deltaPercent: -0.13,
    currency: '$',
    avatarBg: '#2563eb',
    marketCap: 'Major Pair',
    volume24h: '$580B'
  },
  {
    id: 602,
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    category: 'currencies',
    price: 1.2985,
    deltaPercent: -0.12,
    currency: '$',
    avatarBg: '#7c3aed',
    marketCap: 'Major Pair',
    volume24h: '$320B'
  },
  {
    id: 603,
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    category: 'currencies',
    price: 153.25,
    deltaPercent: 0.42,
    currency: '¥',
    avatarBg: '#dc2626',
    marketCap: 'Major Pair',
    volume24h: '$410B'
  },
  {
    id: 604,
    symbol: 'NZD/USD',
    name: 'NZ Dollar / US Dollar',
    category: 'currencies',
    price: 0.5910,
    deltaPercent: -0.64,
    currency: '$',
    avatarBg: '#059669',
    marketCap: 'Commodity Pair',
    volume24h: '$45B'
  }
];

export const POPULAR_INVESTORS: PopularInvestor[] = [
  {
    id: 1,
    name: 'Rhys Adams',
    handle: '@radams_wealth',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    role: 'Elite Pro Investor',
    bio: 'Long term copy recommended. I invest for the long term, often buying out of favour stocks with a strong dividend. If you copy for the short term, you may be exposed to volatility.',
    return24M: 45.41,
    copiers: 2372,
    riskScore: 4,
    topHoldings: ['MSFT', 'BRK.B', 'JNJ', 'AAPL']
  },
  {
    id: 2,
    name: 'Agnieszka Nowak',
    handle: '@anowak_capital',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    role: 'Investment Management Director',
    bio: 'Investment Management Director with +9 years experience managing institutional equity strategies with disciplined risk-adjusted compounding.',
    return24M: 45.98,
    copiers: 508,
    riskScore: 3,
    topHoldings: ['NVDA', 'ASML', 'TSMC', 'GOOGL']
  },
  {
    id: 3,
    name: 'Stefan Uleia',
    handle: '@stefan_tech',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    role: 'Tech & Macro Strategist',
    bio: 'Passionate about markets, AI innovation, and semiconductor revolutions. Committed to growing wealth with discipline, transparency, and a clear long-term vision.',
    return24M: 64.73,
    copiers: 1417,
    riskScore: 5,
    topHoldings: ['BTC', 'NVDA', 'ARM', 'META']
  },
  {
    id: 4,
    name: 'Thomas Roddy',
    handle: '@troddy_quant',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    role: 'Multi-Factor Portfolio Lead',
    bio: 'I diversify across industries, geographies, and a small hedge in crypto. Unlike basic ETFs, my quantitative strategy incorporates three core factor models.',
    return24M: 47.00,
    copiers: 844,
    riskScore: 4,
    topHoldings: ['VOO', 'AMZN', 'COST', 'ETH']
  },
  {
    id: 5,
    name: 'Catalina Norena',
    handle: '@catalina_invest',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    role: 'Former S&P 500 Treasury Analyst',
    bio: 'Professional corporate finance background in Fortune 500 treasuries. High emphasis on capital preservation, defensive cash flow, and steady dividend reinvestment.',
    return24M: 16.19,
    copiers: 1459,
    riskScore: 2,
    topHoldings: ['PG', 'KO', 'PEP', 'GLD']
  },
  {
    id: 6,
    name: 'Akansha Trivedi',
    handle: '@akatrivedi_alpha',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    role: 'Quantitative Risk Analyst',
    bio: 'Disciplined, data-driven approach aimed at steady compounding while keeping portfolio risk score < 5 and Sharpe ratio strictly ≥ 1.0.',
    return24M: 57.61,
    copiers: 479,
    riskScore: 4,
    topHoldings: ['QQQ', 'MSFT', 'LLY', 'AVGO']
  }
];

export const AI_SLIDES: AiSlide[] = [
  {
    id: 1,
    headline: 'Ask anything. Know better.',
    tagline: 'Shark AI Assistant',
    bullets: [
      'Real-time sentiment and analyst consensus on assets you actually own.',
      'Ask Shark AI why your portfolio moved while you were sleeping.',
      'Execute simulated or live trades without ever leaving the conversation.'
    ],
    ctaText: 'Ask Shark AI',
    ctaAction: 'open_ai',
    imageAlt: 'TradeShark AI Assistant Interface',
    previewType: 'chat'
  },
  {
    id: 2,
    headline: 'Powered by intelligence.',
    tagline: 'Agentic Trading Portfolios',
    bullets: [
      'Create a dedicated portfolio connected to a specialized autonomous trading agent.',
      'Not just getting answers from AI — letting your parameters execute securely.',
      'You are always in control: define the maximum capital, loss stops, and sectors.'
    ],
    ctaText: 'Set up an Agent Portfolio',
    ctaAction: 'agent_portfolio',
    imageAlt: 'Autonomous Agent Allocation Matrix',
    previewType: 'agent'
  },
  {
    id: 3,
    headline: 'Customise instantly.',
    tagline: 'No-Code Tool Builder',
    bullets: [
      'Build your own custom investing tools with AI prompts, zero code required.',
      'Access verified ready-made apps from TradeShark Pro Investors & developers.',
      'Add live market monitors, technical oscillators, research bots, and custom alerts.'
    ],
    ctaText: 'Visit TradeShark App Store',
    ctaAction: 'app_store',
    imageAlt: 'TradeShark Custom Tooling Suite',
    previewType: 'custom'
  }
];

export const SPONSOR_TEAMS = [
  { name: 'Premiership Rugby', role: 'Official Partner', icon: '🏉' },
  { name: 'FSV Mainz 05', role: 'Bundesliga Partner', icon: '⚽' },
  { name: 'AZ Alkmaar', role: 'Eredivisie Partner', icon: '⚽' },
  { name: 'SK Slavia Prague', role: 'First League', icon: '⚽' },
  { name: 'FC Union Berlin', role: 'Bundesliga Partner', icon: '⚽' },
  { name: 'Bayer 04 Leverkusen', role: 'Official Sponsor', icon: '🏆' },
  { name: 'BWT Alpine F1 Team', role: 'Formula 1 Team Partner', icon: '🏎️' },
  { name: 'Crystal Palace F.C.', role: 'Premier League Club', icon: '🦅' },
  { name: '1. FC Köln', role: 'Official Partner', icon: '⚽' }
];

export const FOOTER_NAV_COLUMNS = [
  {
    title: 'INVEST',
    links: [
      { name: 'Stocks', href: '/markets/stocks' },
      { name: 'Crypto', href: '/markets/crypto' },
      { name: 'ETFs', href: '/markets/etfs' },
      { name: 'Commodities', href: '/markets/commodities' },
      { name: 'Indices', href: '/markets/indices' },
      { name: 'Currencies', href: '/markets/currencies' }
    ]
  },
  {
    title: 'PLATFORM',
    links: [
      { name: 'TradeShark WebTrader', href: '/webtrader' },
      { name: 'CopyTrader™', href: '/copytrader' },
      { name: '$100K Practice Account', href: '/practice-account' },
      { name: 'Smart Portfolios', href: '/smart-portfolios' },
      { name: 'Fee Schedule', href: '/fees' },
      { name: 'Shark AI Assistant', href: '/shark-ai' }
    ]
  },
  {
    title: 'SUPPORT',
    links: [
      { name: 'Help Center', href: '/help' },
      { name: 'Verification & Safety', href: '/verification' },
      { name: 'How to Deposit', href: '/how-to-deposit' },
      { name: 'Open an Account', href: '/open-account' },
      { name: 'Risk Disclosures', href: '/risk-disclosure' },
      { name: 'Responsible Trading', href: '/responsible-trading' }
    ]
  },
  {
    title: 'ABOUT US',
    links: [
      { name: 'About TradeShark Ltd', href: '/about' },
      { name: 'Investor Relations', href: '/investor-relations' },
      { name: 'Careers at TradeShark', href: '/careers' },
      { name: 'Press & Media', href: '/press' }
    ]
  },
  {
    title: 'LEGAL',
    links: [
      { name: 'Regulation & Licensing', href: '/regulation' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms & Conditions', href: '/terms' },
      { name: 'Cookie Preferences', href: '/cookies' }
    ]
  },
  {
    title: 'PARTNERS',
    links: [
      { name: 'Invite a Friend', href: '/invite-a-friend' },
      { name: 'Affiliate Program', href: '/affiliates' },
      { name: 'TradeShark Club', href: '/club' },
      { name: 'Pro Investor Program', href: '/pro-investor-program' }
    ]
  }
];

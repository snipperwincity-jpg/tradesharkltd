/**
 * Content for every secondary page linked from the header, footer and home sections.
 * Placeholders are filled from the live site config (Railway env vars), so nothing brand-specific is hard coded:
 *   {brand} {legal} {support} {compliance} {press} {careers} {address} {url} {minDeposit} {minWithdrawal} {practice} {phone}
 */

export type FormType = 'contact' | 'careers' | 'press' | 'investors' | 'affiliates' | 'pro' | 'club' | 'callback' | 'newsletter';
export type Widget = 'hours' | 'earnings' | 'movers' | 'cookies' | 'invite' | 'contact-cards' | 'fees' | 'faq-deposit';
export type CtaAction = 'signup' | 'login' | 'dashboard' | 'ai' | 'deposit' | 'kyc' | 'copy' | 'practice';

export interface PageSection {
  heading: string;
  body?: string;
  bullets?: string[];
  table?: { head: string[]; rows: string[][] };
}

export interface SitePage {
  slug: string;
  group: 'Trading' | 'Products' | 'AI' | 'Benefits' | 'Learn' | 'Company' | 'Support' | 'Legal' | 'Partners' | 'Platform';
  title: string;
  eyebrow: string;
  intro: string;
  sections: PageSection[];
  cta?: { label: string; action: CtaAction };
  form?: FormType;
  formTitle?: string;
  widget?: Widget;
  related?: string[];
}

const P = (p: SitePage) => p;

export const SITE_PAGES: SitePage[] = [
  // ------------------------------------------------------------------ TRADING
  P({
    slug: 'fees', group: 'Trading', eyebrow: 'Pricing', title: 'Fees & Margins',
    intro: 'Transparent, low-cost pricing across every asset class. No account management fees, no hidden custody charges.',
    widget: 'fees',
    sections: [
      { heading: 'How we charge', body: 'Stocks and ETFs are commission-free. For crypto, commodities, indices and currencies you pay only the spread - the difference between the buy and sell price - which is displayed on every trade ticket before you confirm.' },
      { heading: 'Overnight & weekend fees', body: 'Leveraged positions held open overnight incur a small financing charge based on the underlying benchmark rate plus a markup. Non-leveraged stock and ETF positions have no overnight fees.' },
      { heading: 'Deposits & withdrawals', bullets: ['Deposits: free by bank transfer, faster payments and crypto.', 'Minimum deposit: ${minDeposit}.', 'Withdrawals: minimum ${minWithdrawal}; processed by our treasury desk, usually within 1 business day.', 'Inactivity: no inactivity fee for the first 12 months.'] },
    ],
    cta: { label: 'Open an account', action: 'signup' },
    related: ['market-hours', 'cfd-trading', 'professional-account'],
  }),
  P({
    slug: 'market-hours', group: 'Trading', eyebrow: 'Trading schedule', title: 'Market Hours',
    intro: 'When each market is open on {brand}. Crypto never sleeps; traditional markets follow their exchange sessions.',
    widget: 'hours',
    sections: [
      { heading: 'Holidays & early closes', body: 'Exchange holidays and early closes are announced in your client inbox and on the Daily Digest at least 48 hours in advance. Orders placed while a market is closed are queued and executed at the next open.' },
      { heading: 'Extended hours', body: 'Selected US stocks can be traded in pre-market and after-hours sessions. Liquidity is lower and spreads may be wider outside regular hours.' },
    ],
    cta: { label: 'Start trading', action: 'dashboard' },
    related: ['fees', 'earnings-calendar'],
  }),
  P({
    slug: 'cfd-trading', group: 'Trading', eyebrow: 'Leveraged products', title: 'CFD Trading',
    intro: 'Contracts for Difference let you speculate on price movements - up or down - without owning the underlying asset.',
    sections: [
      { heading: 'How CFDs work', body: 'When you open a CFD you agree to exchange the difference in the price of an asset between the time the contract is opened and when it is closed. You can go long (BUY) if you expect prices to rise, or short (SELL) if you expect them to fall.' },
      { heading: 'Leverage', body: 'Leverage multiplies your exposure relative to your capital. It magnifies both profits and losses. Your maximum leverage depends on your account tier and verification status and is shown in Account Settings.' },
      { heading: 'Risk management tools', bullets: ['Stop-loss and take-profit on every position', 'Negative balance protection for retail clients', 'Margin alerts sent by email before a position is closed out'] },
      { heading: 'Important risk warning', body: 'CFDs are complex instruments and come with a high risk of losing money rapidly due to leverage. You should consider whether you understand how CFDs work and whether you can afford to take the high risk of losing your money.' },
    ],
    cta: { label: 'Try it with virtual funds', action: 'practice' },
    related: ['risk-disclosure', 'professional-account', 'fees'],
  }),
  P({
    slug: 'futures', group: 'Trading', eyebrow: 'Derivatives', title: 'Futures',
    intro: 'Trade futures-based CFDs on indices, energy, metals and agricultural commodities with transparent margins.',
    sections: [
      { heading: 'What you can trade', bullets: ['Equity indices: S&P 500, Nasdaq 100, FTSE 100, DAX', 'Energy: crude oil, natural gas', 'Metals: gold, silver, copper', 'Agriculture: wheat, corn, coffee'] },
      { heading: 'Rollovers', body: 'Futures contracts expire. Positions are automatically rolled to the next contract before expiry with a transparent rollover adjustment shown in your statement.' },
    ],
    cta: { label: 'Explore commodity markets', action: 'dashboard' },
    related: ['cfd-trading', 'market-hours'],
  }),
  P({
    slug: 'professional-account', group: 'Trading', eyebrow: 'For experienced traders', title: 'Professional Account',
    intro: 'Eligible experienced traders can apply for professional client status with higher leverage limits and dedicated support.',
    sections: [
      { heading: 'Eligibility', body: 'You typically need to meet at least two of the following:', bullets: ['Significant trading activity in the last 12 months', 'A financial portfolio above the regulatory threshold', 'Relevant professional experience in the financial sector'] },
      { heading: 'What changes', bullets: ['Higher maximum leverage', 'Priority execution desk and a dedicated account manager', 'Some retail protections no longer apply - please read the risk disclosure carefully'] },
    ],
    form: 'pro', formTitle: 'Apply for professional status',
    related: ['pro-investor-program', 'club', 'risk-disclosure'],
  }),

  // ------------------------------------------------------------------ PRODUCTS
  P({
    slug: 'copytrader', group: 'Products', eyebrow: 'Social investing', title: 'CopyTrader™',
    intro: 'Automatically replicate the portfolios of verified Popular Investors in real time, in proportion to the amount you allocate.',
    sections: [
      { heading: 'How it works', bullets: ['Browse Popular Investors ranked by performance, risk score and number of copiers', 'Choose an amount to allocate (minimum $200)', 'Set a copy stop-loss to cap your downside', 'Every trade they make is mirrored in your account automatically'] },
      { heading: 'Stay in control', body: 'You can stop copying at any time. The current value of your copy portfolio is returned to your available balance immediately.' },
      { heading: 'Fees', body: 'There is no additional fee for using CopyTrader. Standard spreads and financing charges apply to the underlying trades.' },
    ],
    cta: { label: 'Browse Popular Investors', action: 'copy' },
    related: ['smart-portfolios', 'pro-investor-program'],
  }),
  P({
    slug: 'smart-portfolios', group: 'Products', eyebrow: 'Thematic investing', title: 'Smart Portfolios',
    intro: 'Long-term, thematic portfolios bundling stocks, ETFs and crypto around a single idea - rebalanced by our investment committee.',
    sections: [
      { heading: 'Popular themes', table: { head: ['Portfolio', 'Theme', 'Risk'], rows: [['FutureTech', 'AI, semiconductors & cloud', 'Medium-High'], ['CleanPower', 'Renewables & grid storage', 'Medium'], ['CryptoCore', 'Top digital assets by market cap', 'High'], ['DividendKings', 'Blue-chip income stocks', 'Low-Medium']] } },
      { heading: 'Why Smart Portfolios', bullets: ['Diversification in one click', 'Periodic rebalancing handled for you', 'No management fee'] },
    ],
    cta: { label: 'Get started', action: 'signup' },
    related: ['alpha-portfolios', 'recurring-investments', 'copytrader'],
  }),
  P({
    slug: 'recurring-investments', group: 'Products', eyebrow: 'Automate your investing', title: 'Recurring Buys',
    intro: 'Build wealth steadily by investing a fixed amount daily, weekly or monthly - a strategy known as dollar-cost averaging.',
    sections: [
      { heading: 'Set it and forget it', body: 'Choose an asset, an amount and a frequency. Your order executes automatically at market price on each scheduled date, provided you have sufficient available balance.' },
      { heading: 'Benefits', bullets: ['Reduce the impact of market timing', 'Start from as little as $25 per order', 'Pause or cancel at any time'] },
    ],
    cta: { label: 'Open an account', action: 'signup' },
    related: ['smart-portfolios', 'getting-started'],
  }),
  P({
    slug: 'alpha-portfolios', group: 'Products', eyebrow: 'Advanced strategies', title: 'Alpha Portfolios',
    intro: 'Quantitative, rules-based strategies designed by our research desk for investors seeking returns uncorrelated to broad markets.',
    sections: [
      { heading: 'Strategies', bullets: ['Momentum rotation across global equity sectors', 'Volatility-targeted multi-asset allocation', 'Market-neutral pairs across large-cap stocks'] },
      { heading: 'Access', body: 'Alpha Portfolios are available to verified Tier 2 and Tier 3 clients. Minimum allocation applies and is shown in the portfolio factsheet.' },
    ],
    cta: { label: 'Verify your account', action: 'kyc' },
    related: ['smart-portfolios', 'club'],
  }),
  P({
    slug: 'webtrader', group: 'Platform', eyebrow: 'Trade from your browser', title: '{brand} WebTrader',
    intro: 'Our full-featured browser trading terminal: live prices, one-click orders, portfolio analytics and your compliance inbox in one place.',
    sections: [
      { heading: 'Features', bullets: ['Live streaming prices across 5,000+ instruments', 'Open and close positions with stop-loss and leverage controls', 'Deposit, withdraw and track every transaction', 'Official inbox with account, KYC and funding notifications', 'Real-time CopyTrader portfolio tracking'] },
      { heading: 'Security', body: 'Sessions are protected by secure, HTTP-only cookies and every sensitive action is recorded in an audit trail. You can change your password at any time from Account Settings.' },
    ],
    cta: { label: 'Launch WebTrader', action: 'dashboard' },
    related: ['practice-account', 'mobile-app'],
  }),
  P({
    slug: 'practice-account', group: 'Platform', eyebrow: 'Risk-free', title: '${practice} Practice Account',
    intro: 'Every {brand} account comes with a virtual portfolio funded with ${practice} so you can practise trading with zero risk.',
    sections: [
      { heading: 'Learn by doing', body: 'Test strategies, explore new markets and get familiar with the platform using virtual money and real market prices.' },
      { heading: 'Switch any time', body: 'Toggle between your real and virtual balance from the sidebar of your client portal. You can reset your virtual balance whenever you like.' },
    ],
    cta: { label: 'Create a free account', action: 'signup' },
    related: ['getting-started', 'academy', 'webtrader'],
  }),
  P({
    slug: 'mobile-app', group: 'Platform', eyebrow: 'Trade on the go', title: 'Mobile App',
    intro: 'Manage your portfolio, follow markets and receive instant notifications wherever you are.',
    sections: [
      { heading: 'Works in any mobile browser', body: 'The {brand} WebTrader is fully responsive - open {url} on your phone and add it to your home screen for an app-like experience.' },
      { heading: 'Native apps', body: 'Download links for our native iOS and Android apps appear in the site footer whenever they are available in your region.' },
    ],
    cta: { label: 'Open WebTrader', action: 'dashboard' },
    related: ['webtrader'],
  }),

  // ------------------------------------------------------------------ AI
  P({
    slug: 'shark-ai', group: 'AI', eyebrow: 'Financial intelligence', title: 'Shark AI™',
    intro: 'Your AI copilot for markets: ask about any instrument, fees, CopyTrader or your account and get clear answers in seconds.',
    sections: [
      { heading: 'What Shark AI can do', bullets: ['Summarise price action for any stock, crypto or currency pair', 'Explain fees, leverage and order types in plain English', 'Help you compare Popular Investors to copy', 'Jump straight to a trade ticket for any instrument it mentions'] },
      { heading: 'Responsible AI', body: 'Shark AI provides information, not personalised investment advice. Always consider your own circumstances and the risks involved before trading.' },
    ],
    cta: { label: 'Ask Shark AI', action: 'ai' },
    related: ['agent-portfolios', 'predictive-screener'],
  }),
  P({
    slug: 'agent-portfolios', group: 'AI', eyebrow: 'AI-managed', title: 'Agent Portfolios',
    intro: 'Portfolios managed by AI agents that monitor news, earnings and sentiment and rebalance within strict risk limits.',
    sections: [
      { heading: 'Guardrails first', bullets: ['Hard position and drawdown limits set by our risk desk', 'Every rebalance is logged and explained in plain English', 'Human oversight from our investment committee'] },
      { heading: 'Availability', body: 'Agent Portfolios are rolling out to verified clients. Join the waitlist through Shark AI or contact your account manager.' },
    ],
    cta: { label: 'Ask Shark AI', action: 'ai' },
    related: ['shark-ai', 'smart-portfolios'],
  }),
  P({
    slug: 'predictive-screener', group: 'AI', eyebrow: 'Find opportunities', title: 'Predictive Screener',
    intro: 'Filter thousands of instruments by fundamentals, technicals and AI-generated momentum signals.',
    widget: 'movers',
    sections: [
      { heading: 'Signals', bullets: ['Momentum and trend strength', 'Unusual volume and volatility', 'Analyst revisions and earnings surprises', 'Sentiment from news and social activity'] },
    ],
    cta: { label: 'Open the screener', action: 'dashboard' },
    related: ['shark-ai', 'market-news'],
  }),

  // ------------------------------------------------------------------ BENEFITS
  P({
    slug: 'club', group: 'Benefits', eyebrow: 'Membership', title: '{brand} Club',
    intro: 'Exclusive benefits that grow with your account: from priority support to a dedicated relationship manager.',
    sections: [
      { heading: 'Tiers', table: { head: ['Tier', 'Typical equity', 'Highlights'], rows: [['Silver', '$5,000+', 'Priority support, advanced analytics'], ['Gold', '$25,000+', 'Account manager, reduced conversion fees'], ['Platinum', '$50,000+', 'Higher interest on cash, exclusive events'], ['Diamond', '$250,000+', 'Dedicated relationship manager, bespoke research']] } },
    ],
    form: 'club', formTitle: 'Talk to a relationship manager',
    related: ['interest-on-cash', 'professional-account'],
  }),
  P({
    slug: 'interest-on-cash', group: 'Benefits', eyebrow: 'Make idle cash work', title: 'Interest on Cash',
    intro: 'Eligible clients earn interest on uninvested cash balances, paid monthly into your account.',
    sections: [
      { heading: 'How it works', body: 'Interest accrues daily on your available (uninvested) balance and is paid monthly. The rate depends on your Club tier and is shown in your client portal.' },
      { heading: 'Eligibility', bullets: ['Verified account (KYC approved)', 'Account in good standing', 'Available in supported regions'] },
    ],
    cta: { label: 'Verify your account', action: 'kyc' },
    related: ['club', 'account-protection'],
  }),
  P({
    slug: 'account-protection', group: 'Benefits', eyebrow: 'Your money, protected', title: 'Account Protection',
    intro: 'Client money is kept separate from company operating funds.',
    sections: [
      { heading: 'How we protect you', bullets: ['Client funds kept separate from company funds', 'Negative balance protection for retail clients', 'Encrypted sessions and full audit trail of account activity', 'Withdrawals only to verified destinations after identity checks'] },
      { heading: 'Keep your account secure', bullets: ['Use a unique password of at least 8 characters', 'Never share your login details - our staff will never ask for your password', 'Review login and funding emails and report anything unusual to {support}'] },
    ],
    related: ['regulation', 'verification'],
  }),

  // ------------------------------------------------------------------ LEARN
  P({
    slug: 'academy', group: 'Learn', eyebrow: 'Education', title: '{brand} Academy',
    intro: 'Free courses, guides and webinars for every level - from your first trade to advanced risk management.',
    sections: [
      { heading: 'Courses', table: { head: ['Course', 'Level', 'Length'], rows: [['Investing 101', 'Beginner', '45 min'], ['Understanding ETFs', 'Beginner', '30 min'], ['Crypto fundamentals', 'Beginner', '40 min'], ['Technical analysis essentials', 'Intermediate', '1 h 10 min'], ['Leverage & risk management', 'Intermediate', '50 min'], ['Building a diversified portfolio', 'Advanced', '1 h']] } },
      { heading: 'Practice what you learn', body: 'Apply each lesson risk-free using your ${practice} practice account.' },
    ],
    form: 'newsletter', formTitle: 'Get new lessons by email',
    related: ['getting-started', 'practice-account', 'daily-digest'],
  }),
  P({
    slug: 'getting-started', group: 'Learn', eyebrow: 'Step by step', title: 'Getting Started Guide',
    intro: 'Go from sign-up to your first trade in five simple steps.',
    sections: [
      { heading: '1. Create your account', body: 'Sign up with your name, email and a secure password. You will receive a welcome email and a link to verify your email address.' },
      { heading: '2. Verify your identity', body: 'Upload a government-issued ID, a recent proof of address and a quick selfie in the Verification Centre. Most reviews complete within one business day.' },
      { heading: '3. Fund your account', body: 'Deposit from ${minDeposit} by bank transfer, card or crypto. Your balance is credited once our treasury desk confirms receipt.' },
      { heading: '4. Explore & practise', body: 'Use the ${practice} practice account, browse markets or ask Shark AI anything.' },
      { heading: '5. Place your first trade', body: 'Open any instrument, choose BUY or SELL, set your amount and confirm. You will get an email confirmation for every executed trade.' },
    ],
    cta: { label: 'Create your account', action: 'signup' },
    related: ['open-account', 'how-to-deposit', 'verification'],
  }),
  P({
    slug: 'market-news', group: 'Learn', eyebrow: 'Market pulse', title: 'Market Analysis & News',
    intro: 'Live movers across the {brand} universe, updated continuously from our pricing engine.',
    widget: 'movers',
    sections: [
      { heading: 'Daily research', body: 'Our research desk publishes a morning brief and an evening wrap every trading day. Subscribe to the Daily Digest to receive them by email.' },
    ],
    form: 'newsletter', formTitle: 'Subscribe to the Daily Digest',
    related: ['daily-digest', 'earnings-calendar', 'predictive-screener'],
  }),
  P({
    slug: 'earnings-calendar', group: 'Learn', eyebrow: 'Upcoming reports', title: 'Earnings Calendar',
    intro: 'Indicative schedule of upcoming quarterly results for popular stocks on {brand}. Dates are confirmed by each company closer to the event.',
    widget: 'earnings',
    sections: [
      { heading: 'Trading around earnings', body: 'Prices can move sharply after results. Consider using stop-loss orders and be aware that spreads may widen around the announcement.' },
    ],
    related: ['market-news', 'market-hours'],
  }),
  P({
    slug: 'daily-digest', group: 'Learn', eyebrow: 'Newsletter', title: 'Daily Shark Digest',
    intro: 'A concise morning email with the market movers, key events and what our analysts are watching - free for everyone.',
    sections: [
      { heading: 'What you get', bullets: ['Top gainers and losers', 'Economic calendar highlights', 'One actionable idea from the research desk', 'Platform news and holiday trading hours'] },
    ],
    form: 'newsletter', formTitle: 'Subscribe for free',
    related: ['market-news', 'academy'],
  }),

  // ------------------------------------------------------------------ COMPANY
  P({
    slug: 'about', group: 'Company', eyebrow: 'Who we are', title: 'About {legal}',
    intro: '{brand} is a multi-asset investment platform built to make global markets accessible, transparent and social.',
    sections: [
      { heading: 'Our mission', body: 'We believe everyone should have access to the same tools and opportunities as professional investors. That means low costs, clear information and a community you can learn from.' },
      { heading: 'What we offer', bullets: ['Stocks, ETFs, crypto, commodities, indices and currencies', 'CopyTrader™ social investing', 'AI-powered research with Shark AI™', 'Free education through the {brand} Academy'] },
      { heading: 'Registered office', body: '{legal}, {address}' },
    ],
    cta: { label: 'Join {brand}', action: 'signup' },
    related: ['careers', 'press', 'investor-relations'],
  }),
  P({
    slug: 'help', group: 'Support', eyebrow: 'We are here to help', title: 'Help Center & Support',
    intro: 'Find answers fast or contact our client services team. Signed-in clients can also message the desk directly from the Inbox tab of their portal.',
    widget: 'contact-cards',
    sections: [
      { heading: 'Frequently asked questions', bullets: ['How long does verification take? Most applications are reviewed within one business day.', 'When will my deposit arrive? As soon as our treasury desk confirms receipt - you will be emailed immediately.', 'How do I withdraw? Open the Withdraw tab, enter the amount and destination. KYC must be approved first.', 'I forgot my password. Use "Forgot password" on the login screen to receive a reset link by email.'] },
    ],
    form: 'contact', formTitle: 'Send us a message',
    related: ['how-to-deposit', 'verification', 'open-account'],
  }),
  P({
    slug: 'press', group: 'Company', eyebrow: 'Newsroom', title: 'Media Center & Press',
    intro: 'Company news, brand assets and media contacts for journalists.',
    sections: [
      { heading: 'Media contact', body: 'For interviews, comment and press materials email {press}. We aim to respond to media enquiries within the same business day.' },
      { heading: 'Brand guidelines', body: 'Please use our name as "{brand}" and our legal name as "{legal}". Logo files are available on request.' },
    ],
    form: 'press', formTitle: 'Press enquiry',
    related: ['about', 'careers'],
  }),
  P({
    slug: 'careers', group: 'Company', eyebrow: "We're hiring", title: 'Careers at {brand}',
    intro: 'Help us build the future of investing. We hire curious, driven people across engineering, product, compliance and client services.',
    sections: [
      { heading: 'Open roles', table: { head: ['Role', 'Team', 'Location'], rows: [['Senior Full-Stack Engineer', 'Engineering', 'Hybrid / Remote'], ['Compliance Analyst (KYC/AML)', 'Compliance', 'On-site'], ['Client Services Associate', 'Operations', 'Hybrid'], ['Quantitative Researcher', 'Research', 'Hybrid'], ['Product Designer', 'Product', 'Remote']] } },
      { heading: 'Why join us', bullets: ['Competitive salary and equity', 'Learning budget and conference allowance', 'Flexible and remote-friendly working', 'Private health cover'] },
    ],
    form: 'careers', formTitle: 'Apply now',
    related: ['about'],
  }),
  P({
    slug: 'investor-relations', group: 'Company', eyebrow: 'Shareholders', title: 'Investor Relations',
    intro: 'Information for shareholders, analysts and prospective investors in {legal}.',
    sections: [
      { heading: 'Corporate information', body: 'Registered office: {address}. For financial statements, governance documents and shareholder enquiries please contact our investor relations team using the form below.' },
    ],
    form: 'investors', formTitle: 'Investor enquiry',
    related: ['about', 'press'],
  }),

  // ------------------------------------------------------------------ SUPPORT
  P({
    slug: 'open-account', group: 'Support', eyebrow: 'Join in minutes', title: 'Open an Account',
    intro: 'Opening a {brand} account is free and takes just a few minutes.',
    sections: [
      { heading: 'What you need', bullets: ['A valid email address and phone number', 'A government-issued photo ID (passport, national ID or driving licence)', 'A proof of address dated within the last 90 days', 'A device with a camera for the selfie check'] },
      { heading: 'After you sign up', body: 'You will receive a welcome email with a link to verify your email address. You can explore the platform and use your practice account straight away, and complete verification whenever you are ready.' },
    ],
    cta: { label: 'Open my account', action: 'signup' },
    related: ['verification', 'how-to-deposit', 'getting-started'],
  }),
  P({
    slug: 'verification', group: 'Support', eyebrow: 'KYC', title: 'Verification & Safety',
    intro: 'We verify every client to protect you and comply with anti-money-laundering regulations.',
    sections: [
      { heading: 'Documents we accept', table: { head: ['Type', 'Examples', 'Requirements'], rows: [['Identity', 'Passport, national ID, driving licence', 'Valid, unexpired, all corners visible'], ['Proof of address', 'Utility bill, bank statement, tax letter', 'Dated within 90 days, shows your name and address'], ['Selfie', 'Live photo from your device camera', 'Good lighting, face fully visible']] } },
      { heading: 'Review times', body: 'Most applications are reviewed within one business day. You will be notified by email as soon as a decision is made, or if we need anything else from you.' },
      { heading: 'Your data', body: 'Documents are stored securely and only accessible to authorised compliance staff. See our Privacy Policy for details.' },
    ],
    cta: { label: 'Go to Verification Centre', action: 'kyc' },
    related: ['account-protection', 'privacy', 'open-account'],
  }),
  P({
    slug: 'how-to-deposit', group: 'Support', eyebrow: 'Funding', title: 'How to Deposit',
    intro: 'Fund your account in a few clicks from the Deposit tab of your client portal.',
    widget: 'faq-deposit',
    sections: [
      { heading: 'Steps', bullets: ['Sign in and open the Deposit tab', 'Enter an amount (minimum ${minDeposit}) and choose a method', 'Follow the payment instructions shown on screen and in your confirmation email', 'Use your deposit reference so we can match your payment', 'Your balance is credited once our treasury desk confirms receipt - we will email you'] },
    ],
    cta: { label: 'Make a deposit', action: 'deposit' },
    related: ['fees', 'verification'],
  }),
  P({
    slug: 'responsible-trading', group: 'Support', eyebrow: 'Trade responsibly', title: 'Responsible Trading',
    intro: 'Investing should be deliberate and within your means. Here is how we help you stay in control.',
    sections: [
      { heading: 'Good habits', bullets: ['Only invest money you can afford to lose', 'Diversify across assets and sectors', 'Use stop-loss orders on leveraged positions', 'Take breaks and avoid trading on emotion'] },
      { heading: 'Need a break?', body: 'Contact {support} to set deposit limits, pause trading or close your account. Our team will respond confidentially.' },
    ],
    form: 'contact', formTitle: 'Talk to our team confidentially',
    related: ['risk-disclosure', 'help'],
  }),

  // ------------------------------------------------------------------ LEGAL
  P({
    slug: 'regulation', group: 'Legal', eyebrow: 'Compliance', title: 'Regulation & Licensing',
    intro: 'How {legal} is organised and supervised.',
    sections: [
      { heading: 'Regulatory status', body: '{regulatory}' },
      { heading: 'Anti-money laundering', body: 'We perform identity verification, sanctions and PEP screening on all clients and monitor transactions for suspicious activity in line with applicable AML regulations.' },
      { heading: 'Complaints', body: 'If you are unhappy with our service, contact {compliance}. We will acknowledge your complaint promptly and aim to resolve it within 15 business days.' },
    ],
    related: ['risk-disclosure', 'terms', 'privacy'],
  }),
  P({
    slug: 'risk-disclosure', group: 'Legal', eyebrow: 'Please read carefully', title: 'Risk Disclosures',
    intro: 'All investing involves risk. This summary explains the main risks of the products available on {brand}.',
    sections: [
      { heading: 'General investment risk', body: 'The value of investments can go down as well as up and you may get back less than you invest. Past performance is not an indication of future results.' },
      { heading: 'Leveraged products (CFDs)', body: 'CFDs are complex instruments and come with a high risk of losing money rapidly due to leverage. A significant proportion of retail investor accounts lose money when trading CFDs.' },
      { heading: 'Cryptoassets', body: 'Cryptoassets are highly volatile and may be unregulated in some jurisdictions. There may be no consumer protection and you could lose your entire investment.' },
      { heading: 'CopyTrader', body: 'Copying other investors does not guarantee results. Popular Investors may experience losses and you are responsible for your own investment decisions.' },
    ],
    related: ['responsible-trading', 'regulation', 'terms'],
  }),
  P({
    slug: 'privacy', group: 'Legal', eyebrow: 'Your data', title: 'Privacy Policy',
    intro: 'How {legal} collects, uses and protects your personal information.',
    sections: [
      { heading: 'What we collect', bullets: ['Identity and contact details you provide at registration', 'Verification documents and selfie images (KYC)', 'Transaction, trading and account activity', 'Technical data such as IP address and device information'] },
      { heading: 'How we use it', bullets: ['To open and operate your account', 'To meet legal and regulatory obligations (KYC/AML)', 'To send service emails about your account, deposits, withdrawals and trades', 'To improve our platform and, with your consent, send marketing'] },
      { heading: 'Your rights', body: 'You can request access to, correction of, or deletion of your data (subject to regulatory retention requirements) by emailing {compliance}.' },
      { heading: 'Contact', body: 'Data controller: {legal}, {address}.' },
    ],
    related: ['cookies', 'terms'],
  }),
  P({
    slug: 'terms', group: 'Legal', eyebrow: 'Client agreement', title: 'Terms & Conditions',
    intro: 'The agreement between you and {legal} when you use our services.',
    sections: [
      { heading: 'Your account', body: 'You must be at least 18 years old and provide accurate information. You are responsible for keeping your login details secure and for all activity on your account.' },
      { heading: 'Services', body: 'We provide execution-only services. We do not provide personalised investment advice. Information from Shark AI, research or Popular Investors is for informational purposes only.' },
      { heading: 'Deposits & withdrawals', body: 'Deposits are credited after confirmation of receipt. Withdrawals are processed to verified destinations and may require additional checks.' },
      { heading: 'Termination', body: 'You may close your account at any time by contacting {support}. We may suspend or close accounts in line with our legal obligations.' },
    ],
    related: ['privacy', 'risk-disclosure', 'cookies'],
  }),
  P({
    slug: 'cookies', group: 'Legal', eyebrow: 'Your choices', title: 'Cookie Policy & Preferences',
    intro: 'We use a small number of cookies to keep you signed in and understand how the site is used. Manage your preferences below.',
    widget: 'cookies',
    sections: [
      { heading: 'Strictly necessary', body: 'Session cookies keep you securely signed in to the client portal and admin console. They cannot be switched off.' },
      { heading: 'Analytics & marketing', body: 'Optional cookies help us measure site performance and show relevant content. They are only set with your consent.' },
    ],
    related: ['privacy', 'terms'],
  }),

  // ------------------------------------------------------------------ PARTNERS
  P({
    slug: 'invite-a-friend', group: 'Partners', eyebrow: 'Referral programme', title: 'Invite a Friend',
    intro: 'Share {brand} with friends. Use your personal referral link - every friend who signs up through it is linked to your account.',
    widget: 'invite',
    sections: [
      { heading: 'How it works', bullets: ['Copy your personal link below', 'Your friend signs up and verifies their account', 'Qualifying referrals are credited by our team according to the current promotion terms'] },
    ],
    related: ['affiliates', 'club'],
  }),
  P({
    slug: 'affiliates', group: 'Partners', eyebrow: 'Partner with us', title: 'Affiliate Program',
    intro: 'Earn competitive commissions by introducing new clients to {brand}.',
    sections: [
      { heading: 'Why partner with us', bullets: ['Competitive CPA and revenue-share models', 'Real-time reporting dashboard', 'Marketing materials and dedicated partner manager', 'Monthly payouts'] },
    ],
    form: 'affiliates', formTitle: 'Apply to become an affiliate',
    related: ['invite-a-friend', 'pro-investor-program'],
  }),
  P({
    slug: 'pro-investor-program', group: 'Partners', eyebrow: 'Get copied', title: 'Pro Investor Program',
    intro: 'Share your strategy, build a following and earn as other clients copy your trades.',
    sections: [
      { heading: 'Requirements', bullets: ['Verified account in good standing', 'Consistent trading history and sensible risk management', 'A public profile with a clear strategy description'] },
      { heading: 'Benefits', bullets: ['Monthly payments based on assets copying you', 'Featured placement on the Popular Investors page', 'Dedicated support from our community team'] },
    ],
    form: 'pro', formTitle: 'Apply to the programme',
    related: ['copytrader', 'affiliates'],
  }),
];

export const PAGE_BY_SLUG: Record<string, SitePage> = Object.fromEntries(SITE_PAGES.map(p => [p.slug, p]));

/** Legacy hash anchors (#about, #fees ...) → real routes. */
export const LEGACY_LINKS: Record<string, string> = {
  stocks: '/markets/stocks', crypto: '/markets/crypto', etfs: '/markets/etfs', commodities: '/markets/commodities',
  indices: '/markets/indices', currencies: '/markets/currencies', markets: '/markets',
  fees: '/fees', 'fee-schedule': '/fees', hours: '/market-hours', cfd: '/cfd-trading', futures: '/futures', 'pro-account': '/professional-account',
  copytrader: '/copytrader', portfolios: '/smart-portfolios', recurring: '/recurring-investments', alpha: '/alpha-portfolios',
  'shark-ai': '/shark-ai', 'agent-portfolios': '/agent-portfolios', 'ai-screener': '/predictive-screener',
  'pro-investors': '/popular-investors', club: '/club', interest: '/interest-on-cash', protection: '/account-protection',
  academy: '/academy', basics: '/getting-started', insights: '/market-news', earnings: '/earnings-calendar', digest: '/daily-digest',
  about: '/about', support: '/help', help: '/help', media: '/press', careers: '/careers', investors: '/investor-relations', ir: '/investor-relations',
  risk: '/risk-disclosure', safety: '/regulation', regulation: '/regulation', webtrader: '/webtrader', demo: '/practice-account',
  deposit: '/how-to-deposit', 'open-account': '/open-account', responsible: '/responsible-trading',
  privacy: '/privacy', terms: '/terms', cookies: '/cookies', invite: '/invite-a-friend', affiliates: '/affiliates', pro: '/pro-investor-program',
  contact: '/help',
};

import 'dotenv/config';
import crypto from 'crypto';

const env = (key: string, fallback = ''): string => {
  const v = process.env[key];
  return v === undefined || v === null || String(v).trim() === '' ? fallback : String(v).trim();
};
const bool = (key: string, fallback = false): boolean => {
  const v = process.env[key];
  if (v === undefined || v === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());
};
const num = (key: string, fallback: number): number => {
  const n = Number(process.env[key]);
  return Number.isFinite(n) && process.env[key] !== '' ? n : fallback;
};

const isProd = env('NODE_ENV', 'development') === 'production';

// Railway exposes RAILWAY_PUBLIC_DOMAIN automatically when a domain is attached.
const railwayDomain = env('RAILWAY_PUBLIC_DOMAIN');
const port = num('PORT', 3000);
const appUrl = env('APP_URL', railwayDomain ? `https://${railwayDomain}` : `http://localhost:${port}`).replace(/\/+$/, '');

// If JWT_SECRET is not provided, a secret is generated once and persisted in the database (see seed.ts),
// so sessions survive restarts with zero configuration.
let jwtSecret = env('JWT_SECRET') || crypto.randomBytes(48).toString('hex');
const jwtFromEnv = !!env('JWT_SECRET');

const appName = env('APP_NAME', 'TradeShark');
const legalName = env('COMPANY_LEGAL_NAME', `${appName} Ltd`);
const domain = (() => { try { return new URL(appUrl).hostname; } catch { return 'localhost'; } })();
const supportEmail = env('SUPPORT_EMAIL', `support@${domain}`);

export const config = {
  isProd,
  port,
  appUrl,
  jwtSecret,
  jwtFromEnv,
  databaseUrl: env('DATABASE_URL'),
  dataDir: env('DATA_DIR', env('RAILWAY_VOLUME_MOUNT_PATH', './data')),
  seedDemoData: bool('SEED_DEMO_DATA', false),
  enableDemoLogins: bool('ENABLE_DEMO_LOGINS', false),
  showAdminLink: bool('SHOW_ADMIN_LINK', true),
  requireEmailVerification: bool('REQUIRE_EMAIL_VERIFICATION', false),
  signupBonus: num('SIGNUP_BONUS', 0),
  practiceBalance: num('PRACTICE_BALANCE', 100000),
  minDeposit: num('MIN_DEPOSIT', 100),
  minWithdrawal: num('MIN_WITHDRAWAL', 50),

  brand: {
    appName,
    legalName,
    tagline: env('APP_TAGLINE', 'Trade and invest in stocks, crypto, ETFs and more'),
    supportEmail,
    complianceEmail: env('COMPLIANCE_EMAIL', supportEmail),
    pressEmail: env('PRESS_EMAIL', supportEmail),
    careersEmail: env('CAREERS_EMAIL', supportEmail),
    supportPhone: env('SUPPORT_PHONE', ''),
    whatsapp: env('SUPPORT_WHATSAPP', ''),
    address: env('COMPANY_ADDRESS', ''),
    companyNumber: env('COMPANY_NUMBER', ''),
    regulatoryText: env('REGULATORY_TEXT', ''),
    defaultAccountManager: env('DEFAULT_ACCOUNT_MANAGER', 'Client Services Desk'),
    social: {
      facebook: env('SOCIAL_FACEBOOK'),
      instagram: env('SOCIAL_INSTAGRAM'),
      linkedin: env('SOCIAL_LINKEDIN'),
      x: env('SOCIAL_X'),
      youtube: env('SOCIAL_YOUTUBE'),
      telegram: env('SOCIAL_TELEGRAM'),
    },
    apps: {
      ios: env('APP_STORE_URL'),
      android: env('PLAY_STORE_URL'),
    },
    liveChatScript: env('LIVE_CHAT_SCRIPT_URL'),
  },

  admin: {
    username: env('ADMIN_USERNAME', 'admin').toLowerCase(),
    password: env('ADMIN_PASSWORD'),
    email: env('ADMIN_EMAIL', supportEmail),
    name: env('ADMIN_NAME', 'Administrator'),
    compliancePassword: env('COMPLIANCE_PASSWORD'),
    treasuryPassword: env('TREASURY_PASSWORD'),
    notifyEmail: env('ADMIN_NOTIFY_EMAIL', env('ADMIN_EMAIL', supportEmail)),
  },

  demo: {
    userPassword: env('DEMO_USER_PASSWORD', 'trader123'),
    vipPassword: env('DEMO_VIP_PASSWORD', 'vip123'),
  },

  mail: {
    resendApiKey: env('RESEND_API_KEY'),
    smtpHost: env('SMTP_HOST'),
    smtpPort: num('SMTP_PORT', 587),
    smtpSecure: bool('SMTP_SECURE', num('SMTP_PORT', 587) === 465),
    smtpUser: env('SMTP_USER'),
    smtpPass: env('SMTP_PASS'),
    fromAddress: env('MAIL_FROM_ADDRESS', env('SMTP_USER', `no-reply@${domain}`)),
    fromName: env('MAIL_FROM_NAME', appName),
    replyTo: env('MAIL_REPLY_TO', supportEmail),
    tradeConfirmations: bool('EMAIL_TRADE_CONFIRMATIONS', true),
    loginAlerts: bool('EMAIL_LOGIN_ALERTS', false),
  },

  ai: {
    geminiKey: env('GEMINI_API_KEY'),
    model: env('GEMINI_MODEL', 'gemini-2.5-flash'),
  },

  payments: {
    bankName: env('DEPOSIT_BANK_NAME'),
    bankAccountName: env('DEPOSIT_BANK_ACCOUNT_NAME'),
    bankAccountNumber: env('DEPOSIT_BANK_ACCOUNT_NUMBER'),
    bankSortCode: env('DEPOSIT_BANK_SORT_CODE'),
    bankIban: env('DEPOSIT_BANK_IBAN'),
    bankSwift: env('DEPOSIT_BANK_SWIFT'),
    usdtTrc20: env('DEPOSIT_USDT_TRC20'),
    usdtErc20: env('DEPOSIT_USDT_ERC20'),
    btcAddress: env('DEPOSIT_BTC_ADDRESS'),
    ethAddress: env('DEPOSIT_ETH_ADDRESS'),
    cardPaymentUrl: env('CARD_PAYMENT_URL'),
    instructions: env('DEPOSIT_INSTRUCTIONS', 'Use your account ID as the payment reference so our treasury desk can match your transfer.'),
  },
};

export type AppConfig = typeof config;

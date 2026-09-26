import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config';
import { db } from './db';
import { verifyMailer } from './mailer';
import { seedAdmins, seedDemoData, ensureSystemSecrets } from './seed';
import { startMarketEngine } from './services';
import { authRouter } from './routes/auth';
import { userRouter } from './routes/user';
import { adminRouter } from './routes/admin';
import { publicRouter } from './routes/public';
import { SITE_PAGES } from '../src/data/pages';
import { INSTRUMENTS } from '../src/data/mockData';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  await db.init();
  await ensureSystemSecrets();
  await seedAdmins();
  await seedDemoData();
  startMarketEngine();

  const app = express();
  app.set('trust proxy', 1); // Railway sits behind a proxy
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
  });

  app.use('/api', publicRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/me', userRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

  // ----- Static frontend (Vite build) -----
  const candidates = [path.resolve(__dirname, '../dist'), path.resolve(process.cwd(), 'dist')];
  const distDir = candidates.find(p => fs.existsSync(path.join(p, 'index.html')));
  if (distDir) {
    const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
    const b = config.brand;
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    const rendered = indexHtml
      .replace(/__APP_NAME__/g, esc(b.appName))
      .replace(/__APP_TAGLINE__/g, esc(b.tagline))
      .replace(/__APP_URL__/g, esc(config.appUrl))
      .replace('</head>', b.liveChatScript ? `<script src="${esc(b.liveChatScript)}" async></script></head>` : '</head>');

    app.use('/assets', express.static(path.join(distDir, 'assets'), { immutable: true, maxAge: '1y' }));
    app.use(express.static(distDir, { index: false, maxAge: '1h' }));
    app.get('/robots.txt', (_req, res) => res.type('text/plain').send(`User-agent: *\nDisallow: /admin\nDisallow: /dashboard\nSitemap: ${config.appUrl}/sitemap.xml\n`));
    app.get('/sitemap.xml', (_req, res) => {
      const cats = Array.from(new Set(INSTRUMENTS.map(i => i.category)));
      const paths = ['/', '/markets', ...cats.map(c => `/markets/${c}`), '/popular-investors', ...SITE_PAGES.map(p => `/${p.slug}`)];
      const today = new Date().toISOString().slice(0, 10);
      res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map(p => `  <url><loc>${config.appUrl}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>`);
    });
    app.get('*', (_req, res) => res.type('html').send(rendered));
  } else {
    app.get('/', (_req, res) => res.send('Frontend not built. Run "npm run build" (API is available under /api).'));
  }

  app.listen(config.port, '0.0.0.0', async () => {
    console.log(`[server] ${config.brand.appName} listening on :${config.port} (${config.isProd ? 'production' : 'development'})`);
    console.log(`[server] APP_URL=${config.appUrl} | storage=${db.mode} | mail=${await verifyMailer()}`);
  });

  const shutdown = () => { db.flushNow(); process.exit(0); };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch(err => {
  console.error('[server] fatal startup error', err);
  process.exit(1);
});

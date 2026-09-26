# TradeShark - Multi-asset trading platform

React + Vite frontend served by an Express API (Node 20). Real accounts, sessions, KYC uploads, deposits/withdrawals with admin approval, trading with live-simulated prices, CopyTrader, admin back office and transactional email.

## Deploy on Railway

1. Push this folder to GitHub and create a new Railway project from the repo.
2. In the project, **+ New -> Database -> PostgreSQL**.
3. On the app service -> **Variables**, add at least:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=<openssl rand -hex 32>
   ADMIN_PASSWORD=<strong password>
   ADMIN_EMAIL=you@yourdomain.com
   RESEND_API_KEY=<from resend.com>
   MAIL_FROM_ADDRESS=no-reply@yourdomain.com
   SUPPORT_EMAIL=support@yourdomain.com
   ```
   Everything else (brand name, address, socials, bank/crypto details, AI key...) is in `.env.example`.
4. **Settings -> Networking -> Generate Domain** (or add your custom domain and set `APP_URL=https://yourdomain.com`).
5. Deploy. Health check: `/api/health`. Build/start commands are in `railway.json`.

Admin console: `https://yourdomain/admin` (username `admin` unless you changed `ADMIN_USERNAME`).
Client portal: `https://yourdomain/dashboard`.

> Railway blocks outbound SMTP on the Trial plan - use `RESEND_API_KEY` there. SMTP works on Hobby/Pro.
> Without any email provider, emails are written to the deploy logs (useful for testing).

## Local development

```bash
npm install
cp .env.example .env        # fill what you need; SEED_DEMO_DATA=true ENABLE_DEMO_LOGINS=true is handy locally
npm run dev:api             # API on :3000 (terminal 1)
npm run dev                 # Vite on :5173 with /api proxied (terminal 2)
```
Production-style run: `npm run build && npm start` -> http://localhost:3000

## What sends email

| Event | To |
|---|---|
| Registration (welcome + verify email link) | client (+ admin alert) |
| Forgot / reset / changed password | client |
| Admin-created account (set-password link) | client |
| KYC submitted / approved / rejected / resubmit requested | client (+ admin alert on submit) |
| Deposit request (with payment instructions) / credited / rejected | client (+ admin alert) |
| Withdrawal request / released / rejected | client (+ admin alert) |
| Balance credit / debit / bonus | client |
| Trade executed / position closed, CopyTrader start/stop | client |
| Status, tier or leverage changed by admin | client |
| Admin compose, reply, broadcast | client(s) |
| Client "Contact broker desk" message | admin |
| Website forms (contact, careers, press, affiliates, pro, club, newsletter) | admin + auto-reply |

Every client email is also stored in the client's portal inbox; delivery status shows in Admin -> Emails -> Outbox.

## Routes

`/markets`, `/markets/:category`, `/popular-investors`, `/fees`, `/copytrader`, `/shark-ai`, `/about`, `/help`, `/careers`, `/press`,
`/regulation`, `/risk-disclosure`, `/privacy`, `/terms`, `/cookies`, `/affiliates`, `/invite-a-friend` and ~30 more
(content lives in `src/data/pages.ts`; brand/contact placeholders are filled from env vars). `/sitemap.xml` and `/robots.txt` are generated.

## Admin roles

- **Super-Admin** (`ADMIN_USERNAME`/`ADMIN_PASSWORD`) - everything.
- **compliance** (`COMPLIANCE_PASSWORD`) - KYC, AML, account status, emails.
- **treasury** (`TREASURY_PASSWORD`) - funding approvals, balance adjustments, payment settings, emails.

## Storage

With `DATABASE_URL` all data (and KYC files) are stored in Postgres (tables `app_documents`, `app_files`, created automatically).
Without it, data goes to `DATA_DIR` - attach a Railway volume or it resets on each deploy.

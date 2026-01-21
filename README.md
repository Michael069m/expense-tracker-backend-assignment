# Personal Expense Tracker

Backend service for recording personal expenses, enforcing per-user budgets, and sending rich monthly reports. The service is modular, cloud-ready, and ships with automation for insights, CSV flows, and email delivery.

## Key Features
- Budgets & summaries: per-user monthly budgets, category budgets, summaries, and remaining balance.
- Insights & forecast: top categories, anomaly spikes, and next-month forecast combining recurring + recent spend.
- Categories & recurring: shared category dictionary (emoji/color), recurring templates (day 1–28), and manual run hook.
- CSV import/export: one-shot import of expenses from CSV and export to CSV for any user.
- Webhooks: optional per-user webhook fire when budgets are breached or recurring expenses are processed.
- Reporting & email: SendGrid-first mailer (SMTP fallback) with HTML + CSV attachment; test endpoint plus cron-driven monthly/annual sends.

## Tech Stack
- Node.js, Express, TypeScript
- MongoDB Atlas (Mongoose ODM)
- csv-parse, date-fns, node-cron
- Axios for webhooks
- @sendgrid/mail (preferred) with Nodemailer SMTP fallback

## Setup
1) Clone and install
```
git clone <repo-url>
cd personal-expense-tracker
npm install
```
2) Configure environment
   - Copy `.env.example` to `.env`.
   - Set `MONGODB_URI` to your MongoDB Atlas SRV string.
   - Optional: `PORT` (default 3000) and `NODE_ENV`.
   - Email (SendGrid preferred): `SENDGRID_API_KEY`, `SENDGRID_FROM`.
   - SMTP fallback (only if SendGrid is absent): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
3) Run the server
```
npm run dev
# or
npm run dev:watch
```
4) Production build/run
```
npm run build
npm start
```

## Database
- Connects via `MONGODB_URI`.
- Ensure your Atlas IP allowlist and user permissions are set.

## API Overview (base: `/api`)
- **POST /users** – create user (supports `categoryBudgets`, `webhookUrl`).
- **POST /expenses** – add expense with tags/note; response flags budget breach and webhook trigger.
- **POST /expenses/import** – bulk create from CSV (`title,amount,category,date,tags,note`).
- **GET /users/:id/expenses** – list expenses with pagination and category filter.
- **GET /users/:id/expenses/export** – export expenses as CSV.
- **GET /users/:id/summary** – monthly totals + remaining budget.
- **GET /users/:id/insights** – category breakdown, top categories, spikes vs previous month.
- **GET /users/:id/forecast** – next-month forecast using recurring templates + recent variable spend.
- **POST /categories** / **GET /categories** – manage category dictionary (emoji/color for UI hints).
- **POST /recurring** – create monthly recurring expense template (dayOfMonth 1–28).
- **POST /recurring/run** – process due recurring expenses immediately.
- **POST /users/:id/test-report** – generate report now and email HTML + CSV attachment to the user.

### Sample payloads

**Create user**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "monthlyBudget": 5000,
  "categoryBudgets": [
    { "category": "Food", "limit": 2000 }
  ],
  "webhookUrl": "https://example.com/webhooks/budget"
}
```

**Create expense**
```json
{
  "title": "Coffee",
  "amount": 4.5,
  "category": "Food",
  "userId": "<userId>",
  "tags": ["morning", "cafe"],
  "note": "Flat white"
}
```

**Create recurring expense**
```json
{
  "title": "Rent",
  "amount": 1200,
  "category": "Housing",
  "dayOfMonth": 1,
  "userId": "<userId>",
  "tags": ["fixed"],
  "note": "Apartment rent"
}
```

**CSV import example (body.csv string)**
```

Coffee,4.5,Food,2026-01-20T10:00:00.000Z,morning;cafe,Flat white
```

Notes:
- `month` is zero-based (January = 0) for summary/insights/forecast.
- Pagination defaults: `page=1`, `limit=10`.
- Validation uses Joi; invalid payloads return `400` with details.

## Email Reporting
- Preferred: set `SENDGRID_API_KEY` and `SENDGRID_FROM` (verified sender). No SMTP variables are needed in this mode.
- Fallback: provide `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` when SendGrid is not configured.
- Manual test: `curl -X POST "http://localhost:3000/api/users/<userId>/test-report"` to trigger an immediate HTML+CSV report email.
- Automated: node-cron runs monthly (1st of each month) and annual (Jan 1) reports for all users.

## Assumptions
- Currency amounts are treated as a generic number (assumed INR unless specified) with no exchange handling.
- Month calculations are based on calendar months (`month` zero-based) using server time zone.
- Expenses require an existing user; enforced in service layer and Mongoose pre-save hook.
- No authentication layer is included; secure the routes before production use.

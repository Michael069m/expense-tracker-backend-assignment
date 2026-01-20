# Personal Expense Tracker

## Project Overview
Backend service for recording personal expenses, enforcing per-user monthly budgets, listing expenses with pagination and category filters, and returning monthly spending summaries. Built to be small, modular, and cloud-ready.

## Tech Stack
- Node.js
- Express
- TypeScript
- MongoDB Atlas (Mongoose ODM)
- Axios (webhooks), csv-parse (CSV import), date-fns (recurring scheduling)

## Setup Instructions
1) Clone and install
```
git clone <repo-url>
cd personal-expense-tracker
npm install
```
2) Configure environment
	 - Copy `.env.example` to `.env`.
	 - Set `MONGODB_URI` to your MongoDB Atlas SRV string (e.g., `mongodb+srv://...`).
	 - Optionally set `PORT` (defaults to 3000) and `NODE_ENV`.
3) Run the server
```
npm run dev      # ts-node
# or
npm run dev:watch
```
4) Production build/run
```
npm run build
npm start
```

## Database Configuration
- Uses MongoDB Atlas via the `MONGODB_URI` connection string in `.env`.
- Ensure your IP is whitelisted in Atlas and the user has the required permissions.

## API Documentation

Base path: `/api`

- **POST /users** – create user (supports `categoryBudgets` and optional `webhookUrl`).
- **POST /expenses** – add expense with tags/note; response includes budget status and webhook flag.
- **POST /expenses/import** – bulk create from CSV (`title,amount,category,date,tags,note`).
- **GET /users/:id/expenses** – list expenses with pagination/category filter.
- **GET /users/:id/expenses/export** – export expenses as CSV.
- **GET /users/:id/summary** – monthly totals + remaining budget.
- **GET /users/:id/insights** – category breakdown, top categories, spikes vs previous month.
- **GET /users/:id/forecast** – next-month forecast using recurring + recent variable spend.
- **POST /categories** / **GET /categories** – manage category dictionary (emoji/color support).
- **POST /recurring** – create monthly recurring expense template (dayOfMonth 1–28).
- **POST /recurring/run** – process due recurring expenses immediately.

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
title,amount,category,date,tags,note
Coffee,4.5,Food,2026-01-20T10:00:00.000Z,morning;cafe,Flat white
```

Notes:
- `month` is zero-based (January = 0) for summary/insights/forecast.
- Pagination defaults: `page=1`, `limit=10`.
- Validation uses Joi; invalid payloads return `400` with details.

## Assumptions
- Currency amounts are treated as a generic number (assumed INR unless specified) with no exchange handling.
- Month calculations are based on calendar months (`month` zero-based) using server time zone.
- Expenses require an existing user; user existence is enforced in service layer and Mongoose pre-save hook.
- No authentication layer is included; routes are open for simplicity and should be secured before production.

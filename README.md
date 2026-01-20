# Personal Expense Tracker

## Project Overview
Backend service for recording personal expenses, enforcing per-user monthly budgets, listing expenses with pagination and category filters, and returning monthly spending summaries. Built to be small, modular, and cloud-ready.

## Tech Stack
- Node.js
- Express
- TypeScript
- MongoDB Atlas (Mongoose ODM)

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

### POST /users
- Purpose: Create a user with monthly budget.
- Sample request
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "monthlyBudget": 5000
}
```
- Sample response (`201 Created`)
```json
{
  "_id": "...",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "monthlyBudget": 5000,
  "createdAt": "...",
  "updatedAt": "...",
  "__v": 0
}
```

### POST /expenses
- Purpose: Add an expense for a user.
- Sample request
```json
{
  "title": "Coffee",
  "amount": 4.5,
  "category": "Food",
  "userId": "<userId>",
  "date": "2026-01-20T10:00:00.000Z"
}
```
- Sample response (`201 Created`)
```json
{
  "_id": "...",
  "title": "Coffee",
  "amount": 4.5,
  "category": "Food",
  "user": "<userId>",
  "date": "2026-01-20T10:00:00.000Z",
  "createdAt": "...",
  "updatedAt": "...",
  "__v": 0
}
```

### GET /users/:id/expenses
- Purpose: List a user's expenses with pagination and optional category filter.
- Query params: `page=1&limit=10&category=Food`
- Sample response (`200 OK`)
```json
{
  "expenses": [
    {
      "_id": "...",
      "title": "Coffee",
      "amount": 4.5,
      "category": "Food",
      "user": "<userId>",
      "date": "2026-01-20T10:00:00.000Z",
      "createdAt": "...",
      "updatedAt": "...",
      "__v": 0
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 1
}
```

### GET /users/:id/summary
- Purpose: Monthly summary with total spent, remaining budget, and expense count.
- Optional query: `month=0&year=2026` (month is zero-based; defaults to current month/year when omitted).
- Sample response (`200 OK`)
```json
{
  "month": 0,
  "year": 2026,
  "totalSpent": 2500,
  "expenseCount": 12,
  "monthlyBudget": 5000,
  "remainingBudget": 2500
}
```

Notes:
- `month` is zero-based (January = 0). If omitted, the current month is used.
- Pagination defaults: `page=1`, `limit=10`.
- Validation uses Joi; invalid payloads return `400` with details.

## Assumptions
- Currency amounts are treated as a generic number (assumed INR unless specified) with no exchange handling.
- Month calculations are based on calendar months (`month` zero-based) using server time zone.
- Expenses require an existing user; user existence is enforced in service layer and Mongoose pre-save hook.
- No authentication layer is included; routes are open for simplicity and should be secured before production.

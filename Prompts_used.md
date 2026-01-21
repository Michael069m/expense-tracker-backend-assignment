Build a Backend Service for a Personal Expense Tracker using Node.js, Express, and TypeScript. Use a clean, modular structure with Controllers, Models, Routes, and Services. Configure the Mongoose connection using environment variables for a MongoDB Atlas cluster.

Create separate Mongoose schemas for User and Expense. User needs a unique email and monthly budget. Expense must reference a valid User. Implement a pre save hook to ensure the user exists before saving an expense and validate that amounts are positive.

Write the logic for the GET /users/:id/summary endpoint. It must calculate total expenses for the current month, the remaining budget based on the user's limit, and the count of expenses.

Implement request validation using Zod for all endpoints. Add pagination and category filtering to the GET /users/:id/expenses route.
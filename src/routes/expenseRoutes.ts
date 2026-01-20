import { Router } from "express";
import {
	createExpenseHandler,
	importExpensesHandler,
} from "../controllers/expenseController";
import { validateBody } from "../middleware/validateRequest";
import { createExpenseSchema, importExpensesSchema } from "../middleware/validators";

const router = Router();

router.post("/", validateBody(createExpenseSchema), createExpenseHandler);
router.post("/import", validateBody(importExpensesSchema), importExpensesHandler);

export default router;

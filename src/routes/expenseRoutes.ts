import { Router } from "express";
import { createExpenseHandler } from "../controllers/expenseController";
import { validateBody } from "../middleware/validateRequest";
import { createExpenseSchema } from "../middleware/validators";

const router = Router();

router.post("/", validateBody(createExpenseSchema), createExpenseHandler);

export default router;

import { Router } from "express";
import {
  createUserHandler,
  getUserExpensesHandler,
  getUserSummaryHandler,
} from "../controllers/userController";
import { validateBody, validateQuery } from "../middleware/validateRequest";
import {
  createUserSchema,
  expenseQuerySchema,
  summaryQuerySchema,
} from "../middleware/validators";

const router = Router();

router.post("/", validateBody(createUserSchema), createUserHandler);
router.get(
  "/:id/expenses",
  validateQuery(expenseQuerySchema),
  getUserExpensesHandler,
);
router.get(
  "/:id/summary",
  validateQuery(summaryQuerySchema),
  getUserSummaryHandler,
);

export default router;

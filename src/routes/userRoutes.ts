import { Router } from "express";
import {
  createUserHandler,
  getUserExpensesHandler,
  getUserSummaryHandler,
  getUserInsightsHandler,
  getForecastHandler,
  testReportHandler,
} from "../controllers/userController";
import { exportExpensesHandler } from "../controllers/expenseController";
import { validateBody, validateQuery } from "../middleware/validateRequest";
import {
  createUserSchema,
  expenseQuerySchema,
  summaryQuerySchema,
  forecastQuerySchema,
  insightsQuerySchema,
  summaryQuerySchema as reportQuerySchema,
} from "../middleware/validators";

const router = Router();

router.post("/", validateBody(createUserSchema), createUserHandler);
router.get(
  "/:id/expenses",
  validateQuery(expenseQuerySchema),
  getUserExpensesHandler,
);
router.get("/:id/expenses/export", exportExpensesHandler);
router.get(
  "/:id/summary",
  validateQuery(summaryQuerySchema),
  getUserSummaryHandler,
);
router.get(
  "/:id/insights",
  validateQuery(insightsQuerySchema),
  getUserInsightsHandler,
);
router.get(
  "/:id/forecast",
  validateQuery(forecastQuerySchema),
  getForecastHandler,
);
router.post(
  "/:id/test-report",
  validateQuery(reportQuerySchema),
  testReportHandler,
);

export default router;

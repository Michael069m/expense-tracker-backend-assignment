import { Router } from "express";
import { createRecurringHandler, runRecurringHandler } from "../controllers/recurringController";
import { validateBody } from "../middleware/validateRequest";
import { recurringExpenseSchema } from "../middleware/validators";

const router = Router();

router.post("/", validateBody(recurringExpenseSchema), createRecurringHandler);
router.post("/run", runRecurringHandler);

export default router;

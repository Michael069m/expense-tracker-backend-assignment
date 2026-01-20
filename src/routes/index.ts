import { Router } from "express";
import userRoutes from "./userRoutes";
import expenseRoutes from "./expenseRoutes";

const router = Router();

router.use("/users", userRoutes);
router.use("/expenses", expenseRoutes);

export default router;

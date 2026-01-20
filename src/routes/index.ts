import { Router } from "express";
import userRoutes from "./userRoutes";
import expenseRoutes from "./expenseRoutes";
import categoryRoutes from "./categoryRoutes";
import recurringRoutes from "./recurringRoutes";

const router = Router();

router.use("/users", userRoutes);
router.use("/expenses", expenseRoutes);
router.use("/categories", categoryRoutes);
router.use("/recurring", recurringRoutes);

export default router;

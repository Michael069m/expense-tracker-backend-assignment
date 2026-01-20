import { Router } from "express";
import { createCategoryHandler, listCategoriesHandler } from "../controllers/categoryController";
import { validateBody } from "../middleware/validateRequest";
import { categorySchema } from "../middleware/validators";

const router = Router();

router.get("/", listCategoriesHandler);
router.post("/", validateBody(categorySchema), createCategoryHandler);

export default router;

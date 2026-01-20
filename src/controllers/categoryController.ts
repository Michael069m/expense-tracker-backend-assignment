import { RequestHandler } from "express";
import { createCategory, listCategories } from "../services/categoryService";

export const createCategoryHandler: RequestHandler = async (req, res, next) => {
  try {
    const category = await createCategory(req.body);
    return res.status(201).json(category);
  } catch (error) {
    return next(error);
  }
};

export const listCategoriesHandler: RequestHandler = async (_req, res, next) => {
  try {
    const categories = await listCategories();
    return res.json(categories);
  } catch (error) {
    return next(error);
  }
};

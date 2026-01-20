import { RequestHandler } from "express";
import {
  createUser,
  getMonthlySummary,
  getUserExpenses,
} from "../services/userService";

export const createUserHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = await createUser(req.body);
    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
};

export const getUserExpensesHandler: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, category } = req.query as any;
    const result = await getUserExpenses(id, {
      page: Number(page),
      limit: Number(limit),
      category: category as string | undefined,
    });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

export const getUserSummaryHandler: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { month, year } = req.query as any;
    const summary = await getMonthlySummary(
      id,
      month !== undefined ? Number(month) : undefined,
      year !== undefined ? Number(year) : undefined,
    );
    return res.json(summary);
  } catch (error) {
    return next(error);
  }
};

import { RequestHandler } from "express";
import { createExpense } from "../services/expenseService";

export const createExpenseHandler: RequestHandler = async (req, res, next) => {
  try {
    const expense = await createExpense(req.body);
    return res.status(201).json(expense);
  } catch (error) {
    return next(error);
  }
};

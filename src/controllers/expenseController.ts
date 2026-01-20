import { RequestHandler } from "express";
import {
  createExpense,
  exportExpensesCsv,
  importExpensesFromCsv,
} from "../services/expenseService";

export const createExpenseHandler: RequestHandler = async (req, res, next) => {
  try {
    const result = await createExpense(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

export const importExpensesHandler: RequestHandler = async (req, res, next) => {
  try {
    const { userId, csv } = req.body;
    const result = await importExpensesFromCsv(userId, csv);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

export const exportExpensesHandler: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const csv = await exportExpensesCsv(id);
    res.header("Content-Type", "text/csv");
    return res.status(200).send(csv);
  } catch (error) {
    return next(error);
  }
};

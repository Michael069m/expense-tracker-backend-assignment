import { RequestHandler } from "express";
import { createRecurring, runDueRecurring } from "../services/recurringService";

export const createRecurringHandler: RequestHandler = async (req, res, next) => {
  try {
    const recurring = await createRecurring(req.body);
    return res.status(201).json(recurring);
  } catch (error) {
    return next(error);
  }
};

export const runRecurringHandler: RequestHandler = async (_req, res, next) => {
  try {
    const result = await runDueRecurring();
    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

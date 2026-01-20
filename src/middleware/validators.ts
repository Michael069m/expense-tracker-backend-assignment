import Joi from "joi";
import mongoose from "mongoose";

const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
}, "ObjectId validation");

export const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().lowercase().required(),
  monthlyBudget: Joi.number().greater(0).required(),
  categoryBudgets: Joi.array()
    .items(
      Joi.object({
        category: Joi.string().min(2).max(50).required(),
        limit: Joi.number().greater(0).required(),
      }),
    )
    .optional(),
  webhookUrl: Joi.string().uri().optional(),
});

export const createExpenseSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  amount: Joi.number().greater(0).required(),
  category: Joi.string().min(2).max(50).required(),
  date: Joi.date().iso(),
  userId: objectId.required(),
  tags: Joi.array().items(Joi.string().min(1).max(30)).default([]),
  note: Joi.string().max(500).optional(),
});

export const expenseQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  category: Joi.string().min(2).max(50).optional(),
});

export const summaryQuerySchema = Joi.object({
  month: Joi.number().integer().min(0).max(11).optional(),
  year: Joi.number().integer().min(1970).max(3000).optional(),
});

export const categorySchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  emoji: Joi.string().max(4).optional(),
  color: Joi.string().max(20).optional(),
});

export const recurringExpenseSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  amount: Joi.number().greater(0).required(),
  category: Joi.string().min(2).max(50).required(),
  dayOfMonth: Joi.number().integer().min(1).max(28).required(),
  tags: Joi.array().items(Joi.string().min(1).max(30)).default([]),
  note: Joi.string().max(500).optional(),
  userId: objectId.required(),
});

export const importExpensesSchema = Joi.object({
  userId: objectId.required(),
  csv: Joi.string().min(1).required(),
});

export const forecastQuerySchema = Joi.object({
  month: Joi.number().integer().min(0).max(11).optional(),
  year: Joi.number().integer().min(1970).max(3000).optional(),
});

export const insightsQuerySchema = summaryQuerySchema;

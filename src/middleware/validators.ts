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
});

export const createExpenseSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  amount: Joi.number().greater(0).required(),
  category: Joi.string().min(2).max(50).required(),
  date: Joi.date().iso(),
  userId: objectId.required(),
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

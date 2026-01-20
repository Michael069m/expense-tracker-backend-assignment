import Expense from "../models/expense";
import { ensureUserExists } from "./userService";

interface CreateExpenseInput {
  title: string;
  amount: number;
  category: string;
  date?: Date;
  userId: string;
}

export const createExpense = async (payload: CreateExpenseInput) => {
  const { userId, ...rest } = payload;
  await ensureUserExists(userId);
  const expense = await Expense.create({ ...rest, user: userId });
  return expense;
};

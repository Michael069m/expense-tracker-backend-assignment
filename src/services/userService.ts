import mongoose from "mongoose";
import User, { IUser } from "../models/user";
import Expense, { IExpense } from "../models/expense";
import { getMonthRange } from "../utils/dateRange";

interface ExpenseListOptions {
  page: number;
  limit: number;
  category?: string;
}

export const createUser = async (
  payload: Pick<IUser, "name" | "email" | "monthlyBudget">,
) => {
  return User.create(payload);
};

export const ensureUserExists = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error("Invalid user id");
    (err as any).status = 400;
    throw err;
  }
  const exists = await User.exists({ _id: userId });
  if (!exists) {
    const err = new Error("User not found");
    (err as any).status = 404;
    throw err;
  }
};

export const getUserExpenses = async (
  userId: string,
  options: ExpenseListOptions,
) => {
  await ensureUserExists(userId);

  const { page, limit, category } = options;
  const filter: Record<string, any> = { user: userId };
  if (category) {
    filter.category = category;
  }

  const [total, expenses] = await Promise.all([
    Expense.countDocuments(filter),
    Expense.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  return { expenses, page, limit, total };
};

export const getMonthlySummary = async (
  userId: string,
  month?: number,
  year?: number,
) => {
  await ensureUserExists(userId);
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    (err as any).status = 404;
    throw err;
  }

  const { start, end } = getMonthRange(month, year);
  const [aggregate] = await Expense.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  const totalSpent = aggregate?.totalAmount || 0;
  const expenseCount = aggregate?.count || 0;

  return {
    month: start.getMonth(),
    year: start.getFullYear(),
    totalSpent,
    expenseCount,
    monthlyBudget: user.monthlyBudget,
    remainingBudget: user.monthlyBudget - totalSpent,
  };
};

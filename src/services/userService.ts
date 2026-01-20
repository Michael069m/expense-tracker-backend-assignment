import mongoose from "mongoose";
import User, { IUser } from "../models/user";
import Expense from "../models/expense";
import RecurringExpense from "../models/recurringExpense";
import { getMonthRange } from "../utils/dateRange";

interface ExpenseListOptions {
  page: number;
  limit: number;
  category?: string;
}

export const createUser = async (
  payload: Pick<IUser, "name" | "email" | "monthlyBudget"> &
    Partial<Pick<IUser, "categoryBudgets" | "webhookUrl">>,
) => {
  return User.create(payload);
};

export const ensureUserExists = async (userId: string) => {
  await getUserOrThrow(userId);
};

export const getUserOrThrow = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error("Invalid user id");
    (err as any).status = 400;
    throw err;
  }
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    (err as any).status = 404;
    throw err;
  }
  return user;
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
  const user = await getUserOrThrow(userId);

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

export const getInsights = async (
  userId: string,
  month?: number,
  year?: number,
) => {
  const user = await getUserOrThrow(userId);
  const { start, end } = getMonthRange(month, year);
  const prevStart = new Date(start);
  prevStart.setMonth(prevStart.getMonth() - 1);
  const prevEnd = new Date(end);
  prevEnd.setMonth(prevEnd.getMonth() - 1);

  const [currentAgg, prevAgg] = await Promise.all([
    Expense.aggregate([
      { $match: { user: user._id, date: { $gte: start, $lte: end } } },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    Expense.aggregate([
      { $match: { user: user._id, date: { $gte: prevStart, $lte: prevEnd } } },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
  ]);

  const currentTotal = currentAgg.reduce((acc, c) => acc + (c.total || 0), 0);
  const prevTotal = prevAgg.reduce((acc, c) => acc + (c.total || 0), 0);
  const categoryBreakdown = currentAgg
    .map((c) => ({ category: c._id, total: c.total, count: c.count }))
    .sort((a, b) => b.total - a.total);

  const prevMap = new Map<string, number>(prevAgg.map((c) => [c._id, c.total]));
  const spikes = categoryBreakdown
    .filter((c) => {
      const prevVal = prevMap.get(c.category) || 0;
      return prevVal > 0 && c.total >= prevVal * 2;
    })
    .map((c) => ({ category: c.category, current: c.total, previous: prevMap.get(c.category) || 0 }));

  return {
    period: { month: start.getMonth(), year: start.getFullYear() },
    totals: { current: currentTotal, previous: prevTotal },
    categoryBreakdown,
    topCategories: categoryBreakdown.slice(0, 3),
    spikes,
    monthlyBudget: user.monthlyBudget,
    remainingBudget: user.monthlyBudget - currentTotal,
  };
};

export const getForecast = async (userId: string, month?: number, year?: number) => {
  const user = await getUserOrThrow(userId);
  const targetMonth = typeof month === "number" ? month : new Date().getMonth();
  const targetYear = typeof year === "number" ? year : new Date().getFullYear();

  const recurring = await RecurringExpense.aggregate([
    { $match: { user: user._id, active: true } },
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);
  const recurringTotal = recurring[0]?.total || 0;

  const last30 = new Date();
  last30.setDate(last30.getDate() - 30);
  const variableAgg = await Expense.aggregate([
    { $match: { user: user._id, date: { $gte: last30 } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const variableTotal = variableAgg[0]?.total || 0;
  const variableEstimate = (variableTotal / 30) * 30; // keep simple 30-day projection

  return {
    month: targetMonth,
    year: targetYear,
    forecastTotal: recurringTotal + variableEstimate,
    recurringTotal,
    variableEstimate,
    monthlyBudget: user.monthlyBudget,
    remainingBudget: user.monthlyBudget - (recurringTotal + variableEstimate),
  };
};

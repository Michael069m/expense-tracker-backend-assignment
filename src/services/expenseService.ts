import axios from "axios";
import { parse } from "csv-parse/sync";
import mongoose from "mongoose";
import Expense from "../models/expense";
import ExpenseAudit from "../models/expenseAudit";
import { getMonthRange } from "../utils/dateRange";
import { getUserOrThrow } from "./userService";

interface CreateExpenseInput {
  title: string;
  amount: number;
  category: string;
  date?: Date;
  userId: string;
  tags?: string[];
  note?: string;
  isRecurringInstance?: boolean;
  auditAction?: "created" | "imported" | "recurring";
}

const BUDGET_WEBHOOK_THRESHOLD = 0.2; // 20%

const getCurrentMonthSpend = async (userId: string) => {
  const { start, end } = getMonthRange();
  const [agg] = await Expense.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return agg?.total || 0;
};

const getCurrentMonthCategorySpend = async (userId: string, category: string) => {
  const { start, end } = getMonthRange();
  const [agg] = await Expense.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        category,
        date: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return agg?.total || 0;
};

const triggerWebhook = async (url: string, payload: any) => {
  try {
    await axios.post(url, payload, { timeout: 3000 });
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Webhook failed", message);
    return false;
  }
};

export const createExpenseWithMetadata = async (payload: CreateExpenseInput) => {
  const { userId, auditAction = "created", ...rest } = payload;
  const user = await getUserOrThrow(userId);

  const expense = await Expense.create({ ...rest, user: userId });
  await ExpenseAudit.create({
    expenseId: expense._id,
    user: expense.user,
    action: auditAction,
    snapshot: expense.toObject(),
  });

  const totalSpent = await getCurrentMonthSpend(userId);
  const remainingBudget = user.monthlyBudget - totalSpent;

  let categoryLimit: number | undefined;
  if (user.categoryBudgets && user.categoryBudgets.length) {
    const match = user.categoryBudgets.find((c) => c.category === expense.category);
    categoryLimit = match?.limit;
  }
  let categoryRemaining: number | undefined;
  if (categoryLimit !== undefined) {
    const categorySpent = await getCurrentMonthCategorySpend(userId, expense.category);
    categoryRemaining = categoryLimit - categorySpent;
  }

  let webhookTriggered = false;
  if (user.webhookUrl && remainingBudget / user.monthlyBudget <= BUDGET_WEBHOOK_THRESHOLD) {
    webhookTriggered = await triggerWebhook(user.webhookUrl, {
      type: "budget_threshold",
      userId,
      remainingBudget,
      monthlyBudget: user.monthlyBudget,
    });
  }

  return {
    expense,
    budgetStatus: {
      monthlyBudget: user.monthlyBudget,
      remainingBudget,
      categoryLimit,
      categoryRemaining,
    },
    webhookTriggered,
  };
};

export const createExpense = async (payload: CreateExpenseInput) => {
  return createExpenseWithMetadata({ ...payload, auditAction: "created" });
};

export const importExpensesFromCsv = async (userId: string, csv: string) => {
  await getUserOrThrow(userId);
  const rows = parse(csv, { columns: true, skip_empty_lines: true, trim: true });
  let created = 0;
  for (const row of rows) {
    const tags = row.tags ? String(row.tags).split(";").filter(Boolean) : [];
    await createExpenseWithMetadata({
      title: row.title,
      amount: Number(row.amount),
      category: row.category,
      date: row.date ? new Date(row.date) : undefined,
      userId,
      tags,
      note: row.note,
      auditAction: "imported",
    });
    created += 1;
  }
  return { created };
};

export const exportExpensesCsv = async (userId: string) => {
  await getUserOrThrow(userId);
  const expenses = await Expense.find({ user: userId }).sort({ date: -1 });
  const header = "title,amount,category,date,tags,note";
  const lines = expenses.map((e) => {
    const tags = (e.tags || []).join(";");
    const note = e.note ? e.note.replace(/"/g, "''") : "";
    const date = e.date ? new Date(e.date).toISOString() : "";
    return `${e.title},${e.amount},${e.category},${date},${tags},"${note}"`;
  });
  return [header, ...lines].join("\n");
};

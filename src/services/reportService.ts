import mongoose from "mongoose";
import Expense from "../models/expense";
import { getMonthRange } from "../utils/dateRange";
import { getUserOrThrow } from "./userService";

export interface ReportResult {
  userId: string;
  userName: string;
  userEmail: string;
  periodLabel: string;
  start: Date;
  end: Date;
  totalSpent: number;
  previousTotal: number;
  topCategories: { category: string; total: number }[];
  monthlyBudget: number;
  remainingBudget: number;
  expenseCount: number;
  csvBuffer: Buffer;
}

const buildCsv = (rows: any[]) => {
  const header = "title,amount,category,date,tags,note";
  const lines = rows.map((e) => {
    const tags = (e.tags || []).join(";");
    const note = e.note ? String(e.note).replace(/"/g, "''") : "";
    const date = e.date ? new Date(e.date).toISOString() : "";
    return `${e.title},${e.amount},${e.category},${date},${tags},"${note}"`;
  });
  return Buffer.from([header, ...lines].join("\n"), "utf-8");
};

export const generateUserReport = async (
  userId: string,
  month?: number,
  year?: number,
): Promise<ReportResult> => {
  const user = await getUserOrThrow(userId);
  const { start, end } = getMonthRange(month, year);
  const prevStart = new Date(start);
  prevStart.setMonth(prevStart.getMonth() - 1);
  const prevEnd = new Date(end);
  prevEnd.setMonth(prevEnd.getMonth() - 1);

  const [agg, prevAgg, expenses] = await Promise.all([
    Expense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: prevStart, $lte: prevEnd },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Expense.find({ user: userId, date: { $gte: start, $lte: end } }).sort({ date: -1 }),
  ]);

  const totalSpent = agg.reduce((acc, c) => acc + (c.total || 0), 0);
  const previousTotal = prevAgg[0]?.total || 0;
  const breakdown = agg
    .map((c) => ({ category: c._id as string, total: c.total }))
    .sort((a, b) => b.total - a.total);

  const csvBuffer = buildCsv(expenses);
  const remainingBudget = user.monthlyBudget - totalSpent;
  const periodLabel = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;

  return {
    userId,
    userName: user.name,
    userEmail: user.email,
    periodLabel,
    start,
    end,
    totalSpent,
    previousTotal,
    topCategories: breakdown.slice(0, 3),
    monthlyBudget: user.monthlyBudget,
    remainingBudget,
    expenseCount: expenses.length,
    csvBuffer,
  };
};

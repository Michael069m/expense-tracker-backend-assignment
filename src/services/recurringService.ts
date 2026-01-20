import { addMonths, startOfDay } from "date-fns";
import RecurringExpense from "../models/recurringExpense";
import { ensureUserExists } from "./userService";
import { createExpenseWithMetadata } from "./expenseService";

export const createRecurring = async (payload: {
  title: string;
  amount: number;
  category: string;
  dayOfMonth: number;
  tags?: string[];
  note?: string;
  userId: string;
}) => {
  const { userId, ...rest } = payload;
  await ensureUserExists(userId);
  const now = new Date();
  const nextRun = startOfDay(new Date(now.getFullYear(), now.getMonth(), rest.dayOfMonth));
  if (nextRun < now) {
    nextRun.setMonth(nextRun.getMonth() + 1);
  }
  return RecurringExpense.create({ ...rest, user: userId, nextRun });
};

export const runDueRecurring = async () => {
  const now = new Date();
  const due = await RecurringExpense.find({ active: true, nextRun: { $lte: now } });
  const results = [] as any[];
  for (const rec of due) {
    const expenseResult = await createExpenseWithMetadata({
      title: rec.title,
      amount: rec.amount,
      category: rec.category,
      date: rec.nextRun,
      userId: rec.user.toString(),
      tags: rec.tags,
      note: rec.note,
      isRecurringInstance: true,
      auditAction: "recurring",
    });
    rec.nextRun = addMonths(rec.nextRun, 1);
    await rec.save();
    results.push({ recurringId: rec._id, expense: expenseResult.expense });
  }
  return { processed: results.length, items: results };
};

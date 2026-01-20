import { Schema, model, Document, Types } from "mongoose";

export type RecurrenceCadence = "monthly";

export interface IRecurringExpense extends Document {
  title: string;
  amount: number;
  category: string;
  dayOfMonth: number;
  cadence: RecurrenceCadence;
  nextRun: Date;
  active: boolean;
  tags: string[];
  note?: string;
  user: Types.ObjectId;
}

const recurringExpenseSchema = new Schema<IRecurringExpense>(
  {
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
    amount: { type: Number, required: true, min: [0.01, "Amount must be greater than 0"] },
    category: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    dayOfMonth: { type: Number, required: true, min: 1, max: 28 },
    cadence: { type: String, enum: ["monthly"], default: "monthly" },
    nextRun: { type: Date, required: true },
    active: { type: Boolean, default: true },
    tags: { type: [String], default: [] },
    note: { type: String, maxlength: 500 },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

recurringExpenseSchema.index({ user: 1, nextRun: 1, active: 1 });

recurringExpenseSchema.pre("validate", function (next) {
  if (this.amount <= 0) {
    return next(new Error("Amount must be greater than 0"));
  }
  if (!this.nextRun) {
    const now = new Date();
    this.nextRun = new Date(now.getFullYear(), now.getMonth(), this.dayOfMonth, 0, 0, 0, 0);
    if (this.nextRun < now) {
      this.nextRun.setMonth(this.nextRun.getMonth() + 1);
    }
  }
  return next();
});

export const RecurringExpense = model<IRecurringExpense>(
  "RecurringExpense",
  recurringExpenseSchema,
);
export default RecurringExpense;

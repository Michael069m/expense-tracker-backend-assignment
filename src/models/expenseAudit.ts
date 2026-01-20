import { Schema, model, Document, Types } from "mongoose";

export interface IExpenseAudit extends Document {
  expenseId: Types.ObjectId;
  user: Types.ObjectId;
  action: "created" | "imported" | "recurring";
  snapshot: Record<string, any>;
  createdAt: Date;
}

const expenseAuditSchema = new Schema<IExpenseAudit>(
  {
    expenseId: { type: Schema.Types.ObjectId, ref: "Expense", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, enum: ["created", "imported", "recurring"], required: true },
    snapshot: { type: Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

expenseAuditSchema.index({ expenseId: 1, action: 1 });

export const ExpenseAudit = model<IExpenseAudit>("ExpenseAudit", expenseAuditSchema);
export default ExpenseAudit;

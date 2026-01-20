import { Schema, model, Document, Types } from "mongoose";

export interface IExpense extends Document {
  title: string;
  amount: number;
  category: string;
  date: Date;
  user: Types.ObjectId;
}

const expenseSchema = new Schema<IExpense>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than 0"],
    },
    category: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    date: { type: Date, default: Date.now },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

expenseSchema.index({ user: 1, date: -1 });

expenseSchema.pre("validate", function (next) {
  if (this.amount <= 0) {
    return next(new Error("Amount must be greater than 0"));
  }
  return next();
});

expenseSchema.pre("save", async function (next) {
  const userExists = await this.model("User").exists({ _id: this.user });
  if (!userExists) {
    return next(new Error("Associated user does not exist"));
  }
  if (!this.date) {
    this.date = new Date();
  }
  return next();
});

export const Expense = model<IExpense>("Expense", expenseSchema);
export default Expense;

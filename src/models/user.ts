import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  monthlyBudget: number;
  categoryBudgets?: { category: string; limit: number }[];
  webhookUrl?: string;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value: string) => /.+@.+\..+/.test(value),
        message: "Email is invalid",
      },
    },
    monthlyBudget: {
      type: Number,
      required: true,
      min: [0.01, "Monthly budget must be greater than 0"],
    },
    categoryBudgets: [
      {
        category: {
          type: String,
          required: true,
          trim: true,
          minlength: 2,
          maxlength: 50,
        },
        limit: { type: Number, required: true, min: [0.01, "Category limit must be greater than 0"] },
      },
    ],
    webhookUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (value: string) => /^https?:\/\//.test(value),
        message: "webhookUrl must be http(s)",
      },
    },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.pre("save", function (next) {
  if (this.monthlyBudget <= 0) {
    return next(new Error("Monthly budget must be greater than 0"));
  }
  if (this.isModified("email") && this.email) {
    this.email = this.email.toLowerCase();
  }
  return next();
});

export const User = model<IUser>("User", userSchema);
export default User;

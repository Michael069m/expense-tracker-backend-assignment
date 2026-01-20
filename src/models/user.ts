import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  monthlyBudget: number;
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

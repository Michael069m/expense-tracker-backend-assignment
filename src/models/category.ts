import { Schema, model, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  emoji?: string;
  color?: string;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    emoji: { type: String, maxlength: 4 },
    color: { type: String, maxlength: 20 },
  },
  { timestamps: true },
);

categorySchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }
  return next();
});

export const Category = model<ICategory>("Category", categorySchema);
export default Category;

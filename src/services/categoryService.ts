import Category, { ICategory } from "../models/category";

export const createCategory = async (payload: Pick<ICategory, "name" | "emoji" | "color">) => {
  return Category.create(payload);
};

export const listCategories = async () => {
  return Category.find().sort({ name: 1 });
};

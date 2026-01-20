import mongoose from "mongoose";

export const connectDB = async (uri: string): Promise<void> => {
  if (!uri) {
    throw new Error("MONGODB_URI is missing");
  }

  await mongoose.connect(uri);
};

export default connectDB;

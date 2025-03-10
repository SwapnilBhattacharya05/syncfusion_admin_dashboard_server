import mongoose from "mongoose";

import { MONGO_URI, NODE_ENV } from "../config/env.js";

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined");
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`MongoDB connected in ${NODE_ENV} mode`);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

export default connectDB;

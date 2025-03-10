import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export const { NODE_ENV, PORT, MONGO_URI, CLIENT_URL, SERVER_URL } = process.env;

import express from "express";
import cors from "cors";
import { CLIENT_URL, PORT } from "./config/env.js";
import connectDB from "./database/db.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("📊 Welcome to the Dashboard Backend!");
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDB();
});

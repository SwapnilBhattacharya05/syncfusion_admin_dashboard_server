import express from "express";
import cors from "cors";
import { CLIENT_URL, PORT } from "./config/env.js";

import connectDB from "./database/db.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";

import orderRouter from "./routes/order.routes.js";
import customerRouter from "./routes/customer.routes.js";
import employeeRouter from "./routes/employee.routes.js";

const app = express();

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser()); // TO PARSE COOKIES FOR THE INCOMING REQUESTS

app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/customers", customerRouter);
app.use("/api/v1/employees", employeeRouter);

app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("📊 Welcome to the Dashboard Backend!");
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDB();
});

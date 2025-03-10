import { Router } from "express";

import { getAllCustomers } from "../controllers/customer.controller.js";

const customerRouter = Router();

customerRouter.get("/", getAllCustomers);

export default customerRouter;
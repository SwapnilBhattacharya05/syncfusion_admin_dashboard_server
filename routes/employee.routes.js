import { Router } from "express";

import { getAllEmployees } from "../controllers/employee.controller.js";

const employeeRouter = Router();

employeeRouter.get("/", getAllEmployees);

export default employeeRouter;

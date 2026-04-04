import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/authorize.js";
import getDashboardData from "../controllers/dashboardController.js";

const dashboardRouter = Router();

dashboardRouter.get('/:id',authMiddleware,authorize("admin","analyst","viewer"),getDashboardData)

export default dashboardRouter;
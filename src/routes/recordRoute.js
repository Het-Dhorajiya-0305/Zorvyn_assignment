import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/authorized.js";
import { addRecord, deleteRecord, getAllRecords, getRecordById, getSummary, updateRecord } from "../controllers/recordController.js";



const recordRouter=Router();


recordRouter.post("/add",authMiddleware,authorize("admin"),addRecord);
recordRouter.get("/summary",authMiddleware,authorize("admin","analyst"),getSummary);
recordRouter.get("/",authMiddleware,authorize("admin","analyst"),getAllRecords);
recordRouter.get("/:id",authMiddleware,authorize("admin","analyst"),getRecordById);
recordRouter.put("/:id",authMiddleware,authorize("admin"),updateRecord);
recordRouter.delete("/:id",authMiddleware,authorize("admin"),deleteRecord);


export default recordRouter;
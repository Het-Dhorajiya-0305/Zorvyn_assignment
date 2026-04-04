import { Router } from "express";
import { getAllUsers, loginUser, registerUser, updateUserInfo } from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/authorize.js";



const userRouter=Router();

userRouter.post("/register",registerUser);
userRouter.post("/login",loginUser)

userRouter.get('/',authMiddleware,authorize("admin"),getAllUsers);
userRouter.patch("/:id", authMiddleware, authorize("admin"), updateUserInfo);

export default userRouter;
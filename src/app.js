import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRoute.js";

const app=express();


app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"))



app.get("/",(req,res)=>{
    res.send("Welcome to Zorvyn Assignment");
});


app.use("/api/user",userRouter);


export default app;

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRoute.js";
import recordRouter from "./routes/recordRoute.js";
import dashboardRouter from "./routes/dashboardRoute.js";


const app = express();


app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get("/", (req, res) => {
  res.send("Welcome to Zorvyn Assignment");
});


app.use("/api/v1/users", userRouter);
app.use("/api/v1/records", recordRouter);
app.use("/api/v1/dashboard", dashboardRouter);


app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

export default app;
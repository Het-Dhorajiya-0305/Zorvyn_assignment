import app from "./src/app.js";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";

dotenv.config(
    { path: './.env' }
);

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 4000, () => {
            console.log(`server is running on port ${process.env.PORT || 4000}`);
        })
    })
    .catch((error) => {
        console.log("error in database connection :", error)
    })


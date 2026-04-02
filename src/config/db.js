import mongoose from "mongoose";

async function connectDB() {
    try {
        const connectionINstance=await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.MONGODB_DATABASE_NAME}`)
        console.log(`MongoDB connected: ${connectionINstance.connection.host}`);
    }
    catch (error) {
        console.log("error in database connection :",error);
        process.exit(1);
    }
}

export default connectDB;
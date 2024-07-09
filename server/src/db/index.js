import mongoose from "mongoose";

const connectDB = async() => {
    try {
        const connection = await mongoose.connect(`${process.env.MONGO_URL}/Doet`)
        console.log("MongoDB connected.");
    } catch (error) {
        console.log("Database connection error", error);
        process.exit(1)
    }
}

export { connectDB }
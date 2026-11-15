import mongoose from "mongoose"; // C'est une bibliothèque Js qui permet Node.js de communiquer avec MongoDB

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection error:", error);
    }
};
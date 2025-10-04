import mongoose from "mongoose";

export async function connecToDb() {
  try {
    const connection = {};
    if (connection.isConnected) return;
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "Please define the DATABASE_URL environment variable inside .env.local"
      );
    }
    await mongoose.connect(process.env.MONGODB_URI, {});
    connection.isConnected = mongoose.connections[0].readyState;
  } catch (error) {
    throw error;
  }
}

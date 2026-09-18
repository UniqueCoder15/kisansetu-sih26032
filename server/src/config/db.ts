import mongoose from "mongoose";

let isConnected = false;

export const isDBConnected = (): boolean => isConnected;

export const connectDB = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/kisansetu";
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    const host = conn.connection.host || "127.0.0.1";
    const port = conn.connection.port || 27017;
    const name = conn.connection.name || "kisansetu";

    console.log(`✅ MongoDB Connected: ${host}:${port}/${name}`);
    return true;
  } catch (error) {
    isConnected = false;
    const errMessage = (error as Error).message || "Connection refused";

    console.error(`❌ MongoDB Connection Failure: ${errMessage}`);
    console.error("📌 MongoDB is currently unavailable. Check MONGODB_URI and Atlas credentials.");
    console.error("⚠️ Server will start in standalone HTTP mode. Database-dependent endpoints will return 503 Service Unavailable.");
    return false;
  }
};


mongoose.connection.on("disconnected", () => {
  isConnected = false;
  console.warn("⚠️ MongoDB connection disconnected.");
});

mongoose.connection.on("reconnected", () => {
  isConnected = true;
  console.log("🔄 MongoDB reconnected successfully.");
});

export const closeDB = async (): Promise<void> => {
  try {
    if (isConnected) {
      await mongoose.connection.close();
      isConnected = false;
      console.log("🔒 MongoDB connection closed gracefully");
    }
  } catch (error) {
    console.error("❌ Error closing MongoDB connection:", error);
  }
};

import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB, closeDB } from "./config/db.js";
import { initSocketServer } from "./services/socketService.js";

const startServer = async () => {
  // Connect to MongoDB Atlas / Local MongoDB
  await connectDB();

  // Create HTTP Server & Initialize Socket.IO Engine
  const httpServer = http.createServer(app);
  initSocketServer(httpServer);

  const server = httpServer.listen(env.PORT, () => {
    console.log(
      `🚀 KisanSetu Backend API Server & Socket.IO running on port ${env.PORT} [${env.NODE_ENV} mode]`
    );
    console.log(`🔗 Health Check Endpoint: http://localhost:${env.PORT}/api/health`);
  });

  // Graceful Shutdown Handlers
  const handleShutdown = async (signal: string) => {
    console.log(`\n⚠️ Received ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
      console.log("🔒 Express HTTP server closed");
      await closeDB();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => handleShutdown("SIGINT"));
  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
};

startServer();

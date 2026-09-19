import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { getCorsOrigins } from "../config/cors.js";

let io: SocketIOServer | null = null;

export const initSocketServer = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (requestOrigin, callback) => {
        if (!requestOrigin) return callback(null, true);
        const cleanOrigin = requestOrigin.trim().replace(/[\r\n\0]/g, "").replace(/\/+$/, "");
        const allowed = getCorsOrigins();
        const isAllowed = allowed.some((a) => a.replace(/\/+$/, "") === cleanOrigin);
        if (isAllowed || cleanOrigin.endsWith(".onrender.com")) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`🔌 [Socket.IO] Client connected: ${socket.id}`);

    // Join room for a specific mandi procurement centre
    socket.on("join:mandi", (mandiId: string) => {
      if (mandiId) {
        const room = `mandi:${mandiId}`;
        socket.join(room);
        console.log(`📌 [Socket.IO] ${socket.id} joined room: ${room}`);
      }
    });

    // Join room for a specific farmer user
    socket.on("join:farmer", (farmerId: string) => {
      if (farmerId) {
        const room = `farmer:${farmerId}`;
        socket.join(room);
        console.log(`📌 [Socket.IO] ${socket.id} joined room: ${room}`);
      }
    });

    // Leave room
    socket.on("leave:room", (room: string) => {
      socket.leave(room);
      console.log(`🚪 [Socket.IO] ${socket.id} left room: ${room}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ [Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error("Socket.IO server has not been initialized!");
  }
  return io;
};

// Helper event emitters
export const emitTokenCalled = (mandiId: string, payload: { tokenId: string; tokenNumber: string; counterNum: string; farmerId: string }) => {
  if (!io) return;
  io.to(`mandi:${mandiId}`).emit("queue:token_called", payload);
  if (payload.farmerId) {
    io.to(`farmer:${payload.farmerId}`).emit("queue:token_called", payload);
  }
};

export const emitQueueStatusUpdate = (mandiId: string, payload: { tokenId: string; tokenNumber: string; status: string; farmerId: string }) => {
  if (!io) return;
  io.to(`mandi:${mandiId}`).emit("queue:status_update", payload);
  if (payload.farmerId) {
    io.to(`farmer:${payload.farmerId}`).emit("queue:status_update", payload);
  }
};

export const emitPositionSync = (farmerId: string, payload: { positionAhead: number; estimatedWaitMinutes: number }) => {
  if (!io) return;
  io.to(`farmer:${farmerId}`).emit("queue:position_sync", payload);
};

export const emitNotification = (userId: string, notification: any) => {
  if (!io) return;
  io.to(`farmer:${userId}`).emit("notification:new", notification);
};

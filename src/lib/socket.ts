import { io, Socket } from "socket.io-client";

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5001";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_SERVER_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log(`🔌 [Socket.IO Client] Connected to server ID: ${socket?.id}`);
    });

    socket.on("connect_error", (err) => {
      console.warn(`[Socket.IO Client] Connection warning: ${err.message}`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`❌ [Socket.IO Client] Disconnected: ${reason}`);
    });
  }

  if (socket.disconnected) {
    socket.connect();
  }

  return socket;
};

export const joinMandiRoom = (mandiId: string) => {
  const s = getSocket();
  if (mandiId) {
    s.emit("join:mandi", mandiId);
  }
};

export const joinFarmerRoom = (farmerId: string) => {
  const s = getSocket();
  if (farmerId) {
    s.emit("join:farmer", farmerId);
  }
};

export const leaveRoom = (room: string) => {
  const s = getSocket();
  s.emit("leave:room", room);
};

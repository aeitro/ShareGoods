import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initSocket = (token: string): Socket => {
  if (socket) return socket;

  socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
    auth: {
      token
    },
    transports: ["websocket"]
  });

  socket.on("connect", () => {
    console.log("Connected to messaging server");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from messaging server");
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

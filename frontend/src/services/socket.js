import { io } from "socket.io-client";
import { API_BASE_URL } from "./axios";

let socket = null;

export function getSocket() {
  const token = localStorage.getItem("token");
  if (!token) {
    return null;
  }
  if (!socket) {
    socket = io(API_BASE_URL, {
      transports: ["websocket", "polling"],
      auth: (cb) => {
        cb({ token: localStorage.getItem("token") || "" });
      },
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

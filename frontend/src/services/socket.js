import { io } from "socket.io-client";
import { API_BASE_URL } from "./axios";

let socket = null;

/**
 * Kết nối Socket.io tới cùng host với REST API.
 * Gửi token trong handshake (handshake.auth) khi cần server nhận diện user.
 * Trả về `null` nếu chưa đăng nhập (chưa có token).
 */
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

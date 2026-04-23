const http = require("http");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

const router = require("./routes/index");
const connect = require("./config/db");

// Bảo mật DB
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

function getSocketCorsOrigins() {
  const raw = process.env.CLIENT_ORIGIN || process.env.FRONTEND_URL;
  if (raw) {
    return raw
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);
  }
  return ["http://localhost:5173", "http://127.0.0.1:5173"];
}

// Mở cửa cho phép các nguồn ở ngoài truy cập vào -> giấy phép thông hành
app.use(cors());
app.use(express.json()); // Đọc body JSON từ REQUEST

// Router
router(app);

// Một HTTP server duy nhất: Express + Socket.io dùng chung (bắt buộc cho WebSocket)
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: getSocketCorsOrigins(),
    methods: ["GET", "POST"],
  },
  // WebSocket trước → kết nối trực tiếp, độ trễ thấp; polling là dự phòng
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.log(`[socket] Kết nối: ${socket.id}`);

  socket.on("addNewUser", (userId) => {
    if (userId == null || userId === "") {
      return;
    }
    const uid = String(userId);
    socket.data.userId = uid;
    socket.join(`user:${uid}`);
    console.log(
      `[socket] addNewUser: userId=${uid} (socket.id=${socket.id})`,
    );
  });

  socket.on("disconnect", (reason) => {
    const uid = socket.data?.userId;
    console.log(
      `[socket] Ngắt: ${socket.id} (${reason})` +
        (uid ? ` userId=${uid}` : ""),
    );
  });
});

connect().then(() => {
  httpServer.listen(port, () => {
    console.log(`Server chạy trên cổng ${port}`);
    console.log(`Socket.io đã gắn (transports: websocket, polling)`);
  });
});

module.exports = { app, httpServer, io };

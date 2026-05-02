const http = require("http");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

const router = require("./routes/index");
const connect = require("./config/db");
const { setupSocketIO } = require("./utils/socketServer");
const { setIO } = require("./utils/ioRegistry");
const {
  startAutoCancelVipPending,
} = require("./jobs/autoCancelVipPending");
const { startReviewReminder } = require("./jobs/reviewReminder");
const {
  startPrecomputeRecommendations,
} = require("./jobs/precomputeRecommendations");
const redisCache = require("./config/redis");

// Bảo mật DB
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

function getSocketCorsOrigins() {
  const raw = process.env.CLIENT_ORIGIN;
  if (raw) {
    return raw
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);
  }
  return [raw];
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

setupSocketIO(io);
setIO(io);

connect().then(() => {
  httpServer.listen(port, () => {
    console.log(`Server chạy trên cổng ${port}`);
    console.log(`Socket.io đã gắn (transports: websocket, polling)`);
  });
  startAutoCancelVipPending();
  startReviewReminder();
  startPrecomputeRecommendations();

  // Khởi tạo kết nối Redis (lazy, chỉ khi REDIS_URL được set)
  if (redisCache.isEnabled()) {
    redisCache.getClient();
  } else {
    console.log(
      "[redis] REDIS_URL không có — chạy không cache L1 (chỉ dùng Mongo cache).",
    );
  }
});

module.exports = { app, httpServer, io };

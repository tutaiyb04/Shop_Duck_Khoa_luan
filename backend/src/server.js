const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const router = require("./routes/index");
const connect = require("./config/db");

// Bảo mật DB
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Mở cửa cho phép các nguồn ở ngoài truy cập vào -> giấy phép thông hành
app.use(cors());
app.use(express.json()); // Đọc body JSON từ REQUEST

// Router
router(app);

connect().then(() => {
  app.listen(port, () => {
    console.log(`Server chạy trên cổng ${port}`);
  });
});

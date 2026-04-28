const mongoose = require("mongoose");

async function ConnectDB() {
  try {
    // mở sẵn 50 connection để tăng tốc độ kết nối DB
    const pool =
      Number.parseInt(process.env.MONGODB_MAX_POOL_SIZE ?? "", 10) || 50;
    await mongoose.connect(process.env.MONGOOSE_URI, {
      maxPoolSize: pool,
    });
    console.log("Kết nối DB thành công");
  } catch (error) {
    console.error("Kết nối DB thất bại", error);
    process.exit(1);
  }
}
module.exports = ConnectDB;

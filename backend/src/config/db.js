const mongoose = require("mongoose");

async function ConnectDB() {
  try {
    const pool =
      Number.parseInt(process.env.MONGODB_MAX_POOL_SIZE ?? "", 10) || 50;
    await mongoose.connect(process.env.MONGOOSE_URI, {
      /** Nhiều request đồng thời — tăng trên deploy khi cần (vd. 100–300) */
      maxPoolSize: pool,
    });
    console.log("Kết nối DB thành công");
  } catch (error) {
    console.error("Kết nối DB thất bại", error);
    process.exit(1);
  }
}
module.exports = ConnectDB;

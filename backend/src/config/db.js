const mongoose = require("mongoose");

async function ConnectDB() {
  try {
    await mongoose.connect(process.env.MONGOOSE_URI);
    console.log("Kết nối DB thành công");
  } catch (error) {
    console.error("Kết nối DB thất bại", error);
    process.exit(1);
  }
}
module.exports = ConnectDB;

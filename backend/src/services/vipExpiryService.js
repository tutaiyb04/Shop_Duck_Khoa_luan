const Product = require("../model/Product");
const notificationService = require("./notificationService");

// thời gian lặp lại hủy cờ VIP
const VIP_EXPIRE_INTERVAL_MS = Math.max(
  15_000,
  parseInt(process.env.VIP_EXPIRE_INTERVAL_MS || "", 10) || 60 * 1000,
);

// hủy cờ VIP cho sản phẩm đã quá vipUntil và gửi thông báo cho người bán
async function expireVipProductsAndNotify() {
  const now = new Date();

  // tạo điều kiện lọc sản phẩm
  const filter = {
    isVIP: true,
    vipUntil: { $lte: now },
    status: { $in: ["PENDING", "AVAILABLE"] },
  };

  // lấy sản phẩm đã quá vipUntil
  const expired = await Product.find(filter)
    .select("_id name sellerId vipUntil status")
    .lean();

  // khởi tạo biến đếm số sản phẩm đã hủy cờ VIP
  let cleared = 0;

  for (const p of expired) {
    // hủy cờ VIP cho sản phẩm
    const res = await Product.updateOne(
      {
        _id: p._id,
        isVIP: true,
        vipUntil: { $lte: now },
      },
      { $set: { isVIP: false, updatedAt: now } },
    );

    // kiểm tra xem có sản phẩm nào được hủy cờ VIP không
    if (res.modifiedCount !== 1) continue;
    // tăng biến đếm số sản phẩm đã hủy cờ VIP
    cleared += 1;

    // tạo tiêu đề và nội dung thông báo
    const title = "Gói VIP đã hết hạn";
    const shortName = (p.name || "Sản phẩm").trim().slice(0, 80);
    const content = `Tin "${shortName}" không còn hiển thị HOT. Bạn có thể mua gói VIP mới tại mục Tất cả sản phẩm.`;

    try {
      await notificationService.createNotification({
        userId: p.sellerId,
        type: "VIP_EXPIRED",
        title,
        content,
        relatedId: p._id,
        refModel: "Product",
        metadata: {
          vipExpiredAt: p.vipUntil ? new Date(p.vipUntil).toISOString() : null,
        },
      });
    } catch (e) {
      console.error("[vipExpiryService] createNotification:", e.message);
    }
  }

  return { scanned: expired.length, cleared };
}

module.exports = {
  expireVipProductsAndNotify,
  VIP_EXPIRE_INTERVAL_MS,
};

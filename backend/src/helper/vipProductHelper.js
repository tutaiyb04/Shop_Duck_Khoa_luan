// hủy cờ VIP cho sản phẩm đã quá vipUntil
function stripExpiredVipFlags(product, now = new Date()) {
  // kiểm tra sản phẩm có tồn tại và là object không
  if (!product || typeof product !== "object") return product;

  // kiểm tra xem có còn hạn vip hay không
  const until = product.vipUntil ? new Date(product.vipUntil) : null;

  if (
    product.isVIP &&
    until &&
    !Number.isNaN(until.getTime()) &&
    until <= now
  ) {
    product.isVIP = false;
  }

  return product;
}

// hủy cờ VIP cho nhiều sản phẩm đã quá vipUntil
function stripExpiredVipFlagsMany(products, now = new Date()) {
  // kiểm tra xem products có phải là mảng không
  if (!Array.isArray(products)) return products;

  // duyệt qua từng sản phẩm và hủy cờ VIP
  for (const p of products) {
    stripExpiredVipFlags(p, now);
  }

  return products;
}

module.exports = {
  stripExpiredVipFlags,
  stripExpiredVipFlagsMany,
};

const Order = require("../model/Order");

/**
 * Gỡ các chỉ mục UNIQUE cũ trên `orders` khiến mỗi tin chỉ tạo được một đơn.
 * Cần thiết khi tồn kho > 1: nhiều lần "Đã bán" phải tạo nhiều đơn COMPLETED cùng productId.
 */
async function ensureOrderIndexesForPartialSales() {
  try {
    const coll = Order.collection;
    const indexes = await coll.indexes();

    for (const idx of indexes) {
      if (!idx.unique || idx.name === "_id_") continue;

      const key = idx.key || {};
      const fields = Object.keys(key);

      const legacyUniqueProductOnly =
        fields.length === 1 && fields[0] === "productId";

      const legacyUniqueBuyerProductStatus =
        fields.length === 3 &&
        fields.includes("buyerId") &&
        fields.includes("productId") &&
        fields.includes("status");

      if (legacyUniqueProductOnly || legacyUniqueBuyerProductStatus) {
        await coll.dropIndex(idx.name);
        console.log(
          `[orders] Đã gỡ chỉ mục unique cũ "${idx.name}" — cho phép nhiều đơn hoàn tất trên cùng một tin khi còn tồn.`,
        );
      }
    }
  } catch (e) {
    console.error(
      "[orders] ensureOrderIndexesForPartialSales:",
      e?.message || e,
    );
  }
}

module.exports = { ensureOrderIndexesForPartialSales };

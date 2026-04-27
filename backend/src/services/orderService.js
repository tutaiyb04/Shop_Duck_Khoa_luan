const mongoose = require("mongoose");
const Order = require("../model/Order");
const Product = require("../model/Product");
const Conversation = require("../model/Conversation");

const SELLABLE_STATUSES = ["AVAILABLE"];

/**
 * Đặt lại trạng thái tin khi tạo Order thất bại (chỉ khi vẫn là SOLD và đúng seller).
 */
async function rollbackProductAfterFailedOrder(productObjectId, sellerObjectId) {
  await Product.updateOne(
    {
      _id: productObjectId,
      sellerId: sellerObjectId,
      status: "SOLD",
    },
    { $set: { status: "AVAILABLE" } },
  );
}

/**
 * Xác nhận đã bán (không dùng MongoDB transaction — chạy được standalone).
 *
 * Chống race / gánh cao:
 * - Một phép findOneAndUpdate nguyên tử: chỉ tin AVAILABLE + đúng sellerId mới đổi SOLD (một luồng thắng).
 * - Index unique partial Order(productId)+COMPLETED chặn trùng đơn.
 * - Order.create sau claim — lỗi thì rollback tin về AVAILABLE.
 */
exports.completeOfflineSale = async (sellerId, productId, buyerId) => {
  if (!mongoose.isValidObjectId(String(productId))) {
    const err = new Error("ID sản phẩm không hợp lệ");
    err.status = 400;
    throw err;
  }

  if (!mongoose.isValidObjectId(String(buyerId))) {
    const err = new Error("ID người mua không hợp lệ");
    err.status = 400;
    throw err;
  }

  if (String(sellerId) === String(buyerId)) {
    const err = new Error("Người mua phải khác người bán");
    err.status = 400;
    throw err;
  }

  const pid = new mongoose.Types.ObjectId(String(productId));
  const sid = new mongoose.Types.ObjectId(String(sellerId));
  const bid = new mongoose.Types.ObjectId(String(buyerId));

  const conv = await Conversation.findOne({
    productId: pid,
    participants: { $all: [sid, bid] },
  })
    .select("_id")
    .lean();

  if (!conv) {
    const err = new Error(
      "Chưa có hội thoại với tài khoản này về sản phẩm. Hãy chat trước khi xác nhận đã bán.",
    );
    err.status = 400;
    throw err;
  }

  const alreadySoldOrder = await Order.exists({
    productId: pid,
    status: "COMPLETED",
  });
  if (alreadySoldOrder) {
    const err = new Error("Sản phẩm này đã có đơn hoàn tất trước đó");
    err.status = 400;
    throw err;
  }

  const claimed = await Product.findOneAndUpdate(
    {
      _id: pid,
      sellerId: sid,
      status: "AVAILABLE",
    },
    { $set: { status: "SOLD" } },
    {
      new: true,
      select: "price quantity sellerId status",
    },
  ).lean();

  if (!claimed) {
    const peek = await Product.findById(pid).select("sellerId status").lean();
    if (!peek) {
      const err = new Error("Sản phẩm không tồn tại");
      err.status = 404;
      throw err;
    }
    if (String(peek.sellerId) !== String(sellerId)) {
      const err = new Error("Bạn không phải người bán sản phẩm này");
      err.status = 403;
      throw err;
    }
    if (peek.status === "SOLD") {
      const err = new Error(
        "Tin đã được xác nhận bán (có thể do người khác vừa thao tác).",
      );
      err.status = 409;
      throw err;
    }
    const err = new Error(
      !SELLABLE_STATUSES.includes(peek.status)
        ? "Sản phẩm ở trạng thái không thể bán (chỉ khi đang hiển thị Đang bán)."
        : "Không thể xác nhận bán lúc này.",
    );
    err.status = 400;
    throw err;
  }

  const quantity = Math.max(1, Number(claimed.quantity) || 1);
  const unitPrice = Number(claimed.price);
  const totalAmount = unitPrice * quantity;

  try {
    const [order] = await Order.create([
      {
        buyerId: bid,
        sellerId: sid,
        productId: pid,
        quantity,
        unitPrice,
        totalAmount,
        status: "COMPLETED",
        conversationId: conv._id,
      },
    ]);
    return { order };
  } catch (error) {
    await rollbackProductAfterFailedOrder(pid, sid);

    if (error.code === 11000) {
      const err = new Error("Sản phẩm này đã có giao dịch hoàn tất");
      err.status = 409;
      throw err;
    }
    throw error;
  }
};


 // Lịch sử bán: đơn COMPLETED của người bán.
exports.listSellerCompletedOrders = async (sellerId, { page = 1, limit = 20 } = {}) => {
  const safeLimit = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
  const safePage = Math.max(1, parseInt(String(page), 10) || 1);
  const skip = (safePage - 1) * safeLimit;

  const [items, total, sumAgg] = await Promise.all([
    Order.find({ sellerId, status: "COMPLETED" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate("productId", "name images")
      .populate("buyerId", "username avatar")
      .lean(),
    Order.countDocuments({ sellerId, status: "COMPLETED" }),
    Order.aggregate([
      { $match: { sellerId: new mongoose.Types.ObjectId(String(sellerId)), status: "COMPLETED" } },
      { $group: { _id: null, totalValue: { $sum: "$totalAmount" } } },
    ]),
  ]);

  const totalDisposalValue =
    sumAgg[0] && Number.isFinite(sumAgg[0].totalValue) ? sumAgg[0].totalValue : 0;

  return {
    orders: items,
    total,
    currentPage: safePage,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    totalDisposalValue,
  };
};


// Lịch sử mua: đơn COMPLETED của người mua.
exports.listBuyerCompletedOrders = async (buyerId, { page = 1, limit = 20 } = {}) => {
  const safeLimit = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
  const safePage = Math.max(1, parseInt(String(page), 10) || 1);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Order.find({ buyerId, status: "COMPLETED" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate("productId", "name images price")
      .populate("sellerId", "username avatar")
      .lean(),
    Order.countDocuments({ buyerId, status: "COMPLETED" }),
  ]);

  return {
    orders: items,
    total,
    currentPage: safePage,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
  };
};

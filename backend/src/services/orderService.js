const mongoose = require("mongoose");
const Order = require("../model/Order");
const Product = require("../model/Product");
const Conversation = require("../model/Conversation");

const SELLABLE_STATUSES = ["AVAILABLE"];

// Xác nhận đã bán hàng
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

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await Product.findById(productId)
      .select("sellerId status price quantity")
      .session(session);

    if (!product) {
      const err = new Error("Sản phẩm không tồn tại");
      err.status = 404;
      throw err;
    }

    if (String(product.sellerId) !== String(sellerId)) {
      const err = new Error("Bạn không phải người bán sản phẩm này");
      err.status = 403;
      throw err;
    }

    if (product.status === "SOLD") {
      const err = new Error("Sản phẩm đã được đánh dấu bán");
      err.status = 400;
      throw err;
    }

    if (!SELLABLE_STATUSES.includes(product.status)) {
      const err = new Error(
        "Sản phẩm ở trạng thái không thể bán (chỉ bán khi còn hàng/đang hiển thị hợp lệ)",
      );
      err.status = 400;
      throw err;
    }

    // tìm cuộc hội thoại giữa người bán và người mua
    const conv = await Conversation.findOne({
      productId: new mongoose.Types.ObjectId(String(productId)),
      participants: {
        $all: [
          new mongoose.Types.ObjectId(String(sellerId)),
          new mongoose.Types.ObjectId(String(buyerId)),
        ],
      },
    })
      .select("_id")
      .session(session);

    if (!conv) {
      const err = new Error(
        "Chưa có hội thoại với tài khoản này về sản phẩm. Hãy chat trước khi xác nhận đã bán.",
      );
      err.status = 400;
      throw err;
    }

    const existingCompleted = await Order.findOne({
      productId: new mongoose.Types.ObjectId(String(productId)),
      status: "COMPLETED",
    })
      .select("_id")
      .session(session)
      .lean();
    if (existingCompleted) {
      const err = new Error("Sản phẩm này đã có đơn hoàn tất trước đó");
      err.status = 400;
      throw err;
    }

    const quantity = Math.max(1, Number(product.quantity) || 1);
    const unitPrice = Number(product.price);
    const totalAmount = unitPrice * quantity;

    // tạo đơn hàng và đổi trạng thái
    const [order] = await Order.create(
      [
        {
          buyerId: new mongoose.Types.ObjectId(String(buyerId)),
          sellerId: new mongoose.Types.ObjectId(String(sellerId)),
          productId: new mongoose.Types.ObjectId(String(productId)),
          quantity,
          unitPrice,
          totalAmount,
          status: "COMPLETED",
          conversationId: conv._id,
        },
      ],
      { session },
    );

    await Product.updateOne(
      { _id: product._id, status: { $ne: "SOLD" } },
      { $set: { status: "SOLD" } },
      { session },
    );

    await session.commitTransaction();

    return { order };
  } catch (error) {
    await session.abortTransaction();

    if (error.code === 11000) {
      const err = new Error("Sản phẩm này đã có giao dịch hoàn tất");
      err.status = 400;
      throw err;
    }

    throw error;
  } finally {
    session.endSession();
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

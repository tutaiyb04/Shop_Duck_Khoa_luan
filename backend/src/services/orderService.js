const mongoose = require("mongoose");
const Order = require("../model/Order");
const Product = require("../model/Product");
const Conversation = require("../model/Conversation");
const Review = require("../model/Review");
const {
  cancelPendingVipTransactionsForProduct,
} = require("./paymentService");
const { notifyProductChatLocked } = require("../utils/chatSocketNotify");
const notificationService = require("./notificationService");
const recommendationService = require("./recommendationService");

const SELLABLE_STATUSES = ["AVAILABLE"];

// Trừ tồn kho và có thể chuyển SOLD — pipeline (1 atomic write)
const buildSubtractQuantityPipeline = (qtyToSell) => [
  {
    // tính toàn tồn kho còn lại
    $set: {
      _remain: {
        $subtract: [
          { $toInt: { $ifNull: ["$quantity", 1] } },
          { $literal: qtyToSell },
        ],
      },
    },
  },
  // cập nhật tồn kho và trạng thái
  {
    $set: {
      quantity: "$_remain",
      status: {
        $cond: [{ $eq: ["$_remain", 0] }, "SOLD", "AVAILABLE"],
      },
    },
  },
  { $unset: "_remain" },
];

// xác nhận bán hàng — có thể bán một phần tồn kho / nhiều đơn trên cùng tin đăng
exports.completeOfflineSale = async (
  sellerId,
  productId,
  buyerId,
  saleQuantityRaw = 1,
) => {
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

  // ép kiểu số lượng bán thành số nguyên dương
  const parsed = Number(saleQuantityRaw);
  const qtyToSell = Number.isFinite(parsed) ? Math.trunc(parsed) : NaN;

  // kiểm tra số lượng bán có hợp lệ không
  if (!Number.isFinite(qtyToSell) || qtyToSell < 1 || parsed !== qtyToSell) {
    const err = new Error(
      "Số lượng bán phải là số nguyên dương và không lớn hơn số tin đăng có trên chợ.",
    );
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

  // tạo session để đảm bảo tính toàn vẹn dữ liệu - Giao dịch an toàn & Tạo Đơn (Transaction)
  const session = await mongoose.startSession();

  try {
    let updatedProduct = null;
    let orderDoc = null;

    // thực hiện giao dịch an toàn & tạo đơn
    await session.withTransaction(async () => {
      // tìm và cập nhật sản phẩm
      updatedProduct = await Product.findOneAndUpdate(
        {
          _id: pid,
          sellerId: sid,
          status: "AVAILABLE",
          quantity: { $gte: qtyToSell },
        },
        buildSubtractQuantityPipeline(qtyToSell),
        {
          session,
          new: true,
        },
      )
        .select("price quantity sellerId status name")
        .lean();

      if (!updatedProduct) {
        const peek = await Product.findById(pid)
          .session(session)
          .select("sellerId status quantity")
          .lean();

        let errMsg = "Không thể xác nhận bán lúc này.";
        let code = 400;

        if (!peek) {
          errMsg = "Sản phẩm không tồn tại";
          code = 404;
        } else if (String(peek.sellerId) !== String(sellerId)) {
          errMsg = "Bạn không phải người bán sản phẩm này";
          code = 403;
        } else if (peek.status === "SOLD") {
          errMsg =
            "Tin đã bán hết (kho không còn). Không ghi nhận thêm đơn trên tin này.";
          code = 409;
        } else if (!SELLABLE_STATUSES.includes(peek.status)) {
          errMsg =
            "Sản phẩm ở trạng thái không thể bán (chỉ khi đang hiển thị đang bán).";
        } else {
          const stocked = Number(peek.quantity) || 0;
          errMsg =
            stocked <= 0
              ? "Sản phẩm không còn tồn kho để xác nhận bán."
              : stocked < qtyToSell
                ? `Số lượng có trên tin (${stocked}) nhỏ hơn số bạn nhập (${qtyToSell}).`
                : errMsg;
        }

        const err = new Error(errMsg);
        err.status = code;
        throw err;
      }

      const unitPrice = Number(updatedProduct.price);
      const totalAmount = unitPrice * qtyToSell;

      let inserted;

      try {
        inserted = await Order.create(
          [
            {
              buyerId: bid,
              sellerId: sid,
              productId: pid,
              quantity: qtyToSell,
              unitPrice,
              totalAmount,
              status: "COMPLETED",
              conversationId: conv._id,
            },
          ],
          { session },
        );
      } catch (dupOrErr) {
        if (dupOrErr.code === 11000) {
          const err = new Error("Đơn hàng không thể được tạo (trùng ràng buộc).");
          err.status = 409;
          throw err;
        }
        throw dupOrErr;
      }

      orderDoc = inserted[0];
    });

    const soldOut = updatedProduct.status === "SOLD";

    if (soldOut) {
      await cancelPendingVipTransactionsForProduct(pid).catch((e) =>
        console.error("cancelPendingVipTransactionsForProduct:", e),
      );

      notifyProductChatLocked(pid, "SOLD").catch((e) =>
        console.error("notifyProductChatLocked(SOLD):", e),
      );
    }

    notificationService
      .notifyOrderConfirmed({
        buyerId: bid,
        sellerId: sid,
        orderId: orderDoc._id,
        totalAmount: orderDoc.totalAmount,
      })
      .catch((e) => console.error("notifyOrderConfirmed:", e));

    recommendationService
      .invalidateUserRecommendation(bid)
      .catch((e) => console.error("invalidateUserRecommendation(buyer):", e));

    return { order: orderDoc, productUpdated: updatedProduct, soldOut };
  } catch (e) {
    if (!e.message && e.reason) Object.assign(e, { message: String(e.reason) });
    throw e;
  } finally {
    session.endSession();
  }
};

// Lịch sử bán hàng cho người bán
exports.listSellerCompletedOrders = async (
  sellerId,
  { page = 1, limit = 20 } = {},
) => {
  const safeLimit = Math.min(
    100,
    Math.max(1, parseInt(String(limit), 10) || 20),
  );

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
      {
        $match: {
          sellerId: new mongoose.Types.ObjectId(String(sellerId)),
          status: "COMPLETED",
        },
      },
      { $group: { _id: null, totalValue: { $sum: "$totalAmount" } } },
    ]),
  ]);

  const totalDisposalValue =
    sumAgg[0] && Number.isFinite(sumAgg[0].totalValue)
      ? sumAgg[0].totalValue
      : 0;

  return {
    orders: items,
    total,
    currentPage: safePage,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    totalDisposalValue,
  };
};

// Lịch sử mua của người mua
exports.listBuyerCompletedOrders = async (
  buyerId,
  { page = 1, limit = 20 } = {},
) => {
  const safeLimit = Math.min(
    100,
    Math.max(1, parseInt(String(limit), 10) || 20),
  );

  const safePage = Math.max(1, parseInt(String(page), 10) || 1);

  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Order.find({ buyerId, status: "COMPLETED" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate("productId", "name images price")
      .populate("sellerId", "username avatar sellerProfile")
      .lean(),
    Order.countDocuments({ buyerId, status: "COMPLETED" }),
  ]);

  const orderIds = items.map((o) => o._id);
  let reviewedIds = new Set();
  if (orderIds.length > 0) {
    const rows = await Review.find({ orderId: { $in: orderIds } })
      .select("orderId")
      .lean();
    reviewedIds = new Set(rows.map((r) => String(r.orderId)));
  }

  for (const o of items) {
    o.hasReview = reviewedIds.has(String(o._id));
  }

  return {
    orders: items,
    total,
    currentPage: safePage,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
  };
};

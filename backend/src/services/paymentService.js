const crypto = require("crypto");
const mongoose = require("mongoose");
const { getPayOS } = require("../config/payos");
const Transaction = require("../model/Transaction");
const Product = require("../model/Product");
const { getIO } = require("../utils/ioRegistry");

const vipDurationDays = () =>
  Math.max(1, parseInt(process.env.PAYOS_VIP_DURATION_DAYS || "30", 10) || 30);

const vipAmountVnd = () => {
  const n = parseInt(process.env.PAYOS_VIP_AMOUNT_VND || "2000", 10);
  return Number.isFinite(n) && n > 0 ? n : 2000;
};

const frontendBase = () =>
  (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

/**
 * Mã giao dịch số, phân tán tốt khi tải cao: ms * 1000 + 0..999 (tránh trùng cùng millisecond).
 * Giữ dạng Number an toàn với Number.MAX_SAFE_INTEGER.
 */
function generateOrderCode() {
  return Date.now() * 1000 + crypto.randomInt(0, 1000);
}

function buildVipDescription(productName) {
  const shortName =
    (productName || "SP").replace(/\s+/g, " ").trim().slice(0, 50) || "Sản phẩm";
  return `VIP hien thi: ${shortName}`.slice(0, 200);
}

/**
 * Gửi socket sau khi xử lý (không chặn phản hồi HTTP — phù hợp tải rất lớn trên connection PayOS).
 */
function emitVipSuccess(userId, productId) {
  setImmediate(() => {
    const io = getIO();
    if (io) {
      void io.to(`user:${userId}`).emit("payment:vip_success", { productId });
    }
  });
}

/**
 * @param {{ userId: import('mongoose').Types.ObjectId, productId: string }} param0
 * @returns {Promise<
 *   | { ok: true; data: { message: string; checkoutUrl: string; qrCode: string; orderCode: number } }
 *   | { ok: false; status: number; message: string }
 * >}
 */
async function createVipPaymentLink({ userId, productId }) {
  if (!productId) {
    return { ok: false, status: 400, message: "Thiếu productId" };
  }
  if (!mongoose.isValidObjectId(String(productId))) {
    return { ok: false, status: 400, message: "productId không hợp lệ" };
  }

  const product = await Product.findById(productId)
    .select("sellerId status name")
    .lean();
  if (!product) {
    return { ok: false, status: 404, message: "Sản phẩm không tồn tại" };
  }
  if (String(product.sellerId) !== String(userId)) {
    return {
      ok: false,
      status: 403,
      message: "Bạn không phải chủ sở hữu sản phẩm này",
    };
  }
  const canVip = product.status === "PENDING" || product.status === "AVAILABLE";
  if (!canVip) {
    return {
      ok: false,
      status: 400,
      message:
        "Chỉ sản phẩm ở trạng thái Chờ duyệt hoặc Đang bán mới đăng ký VIP",
    };
  }

  const amount = vipAmountVnd();
  const orderCode = generateOrderCode();
  const base = frontendBase();
  const returnUrl = `${base}/my-products?vip_payment=success`;
  const cancelUrl = `${base}/my-products?vip_payment=cancel`;
  const description = buildVipDescription(product.name);

  let createdTxId = null;
  try {
    const tx = await Transaction.create({
      userId,
      productId: product._id,
      amount,
      orderCode,
      status: "PENDING",
    });
    createdTxId = tx._id;

    let payos;
    try {
      payos = getPayOS();
    } catch (e) {
      await Transaction.deleteOne({ _id: createdTxId }).catch(() => {});
      createdTxId = null;
      if (e?.code === "PAYOS_NOT_CONFIGURED") {
        return { ok: false, status: 503, message: e.message };
      }
      throw e;
    }

    const paymentLink = await payos.paymentRequests.create({
      orderCode,
      amount,
      description,
      cancelUrl,
      returnUrl,
    });

    return {
      ok: true,
      data: {
        message: "Tạo link thanh toán thành công",
        checkoutUrl: paymentLink.checkoutUrl,
        qrCode: paymentLink.qrCode,
        orderCode: paymentLink.orderCode,
      },
    };
  } catch (error) {
    if (createdTxId) {
      await Transaction.deleteOne({ _id: createdTxId }).catch(() => {});
    }
    if (error?.code === "PAYOS_NOT_CONFIGURED") {
      return { ok: false, status: 503, message: error.message };
    }
    throw error;
  }
}

/**
 * Xử lý webhook PayOS: verify chữ ký, idempotency (findOneAndUpdate PENDING),
 * cập nhật Product bằng updateOne, socket tách luồng.
 *
 * @param {object} body — req.body từ PayOS
 * @returns {Promise<{
 *   response: { success: boolean; message?: string };
 *   httpStatus: number;
 * }>}
 */
async function processPayosVipWebhook(body) {
  let payos;
  try {
    payos = getPayOS();
  } catch (e) {
    return {
      response: { success: false, message: "PayOS not configured" },
      httpStatus: 503,
    };
  }

  let data;
  try {
    data = await payos.webhooks.verify(body);
  } catch (err) {
    console.error("PayOS webhook verify failed:", err);
    return {
      response: { success: false, message: "Invalid signature" },
      httpStatus: 400,
    };
  }

  if (String(data.code) !== "00") {
    return {
      response: { success: true, message: "Ignored non-success code" },
      httpStatus: 200,
    };
  }

  const tx = await Transaction.findOneAndUpdate(
    { orderCode: data.orderCode, status: "PENDING" },
    { $set: { status: "SUCCESS" } },
    { new: true, lean: true },
  );

  if (!tx) {
    return {
      response: { success: true, message: "Ignored" },
      httpStatus: 200,
    };
  }

  const until = new Date();
  until.setDate(until.getDate() + vipDurationDays());

  await Product.updateOne(
    { _id: tx.productId },
    { $set: { isVIP: true, vipUntil: until } },
  );

  emitVipSuccess(String(tx.userId), String(tx.productId));

  return {
    response: { success: true },
    httpStatus: 200,
  };
}

module.exports = {
  createVipPaymentLink,
  processPayosVipWebhook,
};

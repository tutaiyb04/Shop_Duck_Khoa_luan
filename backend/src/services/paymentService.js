const crypto = require("crypto");
const mongoose = require("mongoose");
const { getPayOS } = require("../config/payos");
const Transaction = require("../model/Transaction");
const Product = require("../model/Product");
const { getIO } = require("../utils/ioRegistry");

const vipDurationDays = () =>
  Math.max(1, parseInt(process.env.PAYOS_VIP_DURATION_DAYS || "30", 10) || 30);

/** Gói cố định: 7 ngày 50.000₫, 30 ngày 150.000₫ (đồng bộ UI) */
const VIP_PLANS = {
  7: { days: 7, amount: 50_000 },
  30: { days: 30, amount: 150_000 },
};

function resolveVipPlan(plan) {
  const key = plan === "7" || plan === 7 ? 7 : plan === "30" || plan === 30 ? 30 : null;
  if (key == null) return null;
  return VIP_PLANS[key];
}

let _frontendBase;
const frontendBase = () => {
  if (_frontendBase) return _frontendBase;
  _frontendBase = (process.env.FRONTEND_URL || "http://localhost:5173").replace(
    /\/$/,
    "",
  );
  return _frontendBase;
};

/**
 * Mã giao dịch số, phân tán tốt khi tải cao: ms * 1000 + 0..999 (tránh trùng cùng millisecond).
 * Giữ dạng Number an toàn với Number.MAX_SAFE_INTEGER.
 */
function generateOrderCode() {
  return Date.now() * 1000 + crypto.randomInt(0, 1000);
}

/**
 * PayOS: trường `description` tối đa 25 ký tự (lỗi code 20 nếu vượt).
 */
function buildPayosPaymentDescription(productName, vipPlanDays) {
  const name = (productName || "SP")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 18);
  const base = `VIP${vipPlanDays}d ${name}`.trim();
  return base.slice(0, 25) || "Duck Shop VIP";
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
 * Gia hạn VIP trên sản phẩm (gọi sau khi giao dịch chuyển sang SUCCESS: webhook hoặc xác nhận từ PayOS).
 * @param {{ productId: import("mongoose").Types.ObjectId, userId: import("mongoose").Types.ObjectId, vipPlanDays?: number }} tx
 */
async function applyVipToProductAfterPayment(tx) {
  const daysToAdd =
    Number(tx.vipPlanDays) > 0
      ? Number(tx.vipPlanDays)
      : vipDurationDays();

  const product = await Product.findById(tx.productId).select("vipUntil").lean();
  const now = new Date();
  let base = now;
  if (product?.vipUntil) {
    const v = new Date(product.vipUntil);
    if (v > now) {
      base = v;
    }
  }
  const until = new Date(base);
  until.setDate(until.getDate() + daysToAdd);

  await Product.updateOne(
    { _id: tx.productId },
    {
      $set: { isVIP: true, vipUntil: until, updatedAt: new Date() },
    },
  );

  emitVipSuccess(String(tx.userId), String(tx.productId));
}

/**
 * @param {{ userId: import('mongoose').Types.ObjectId, productId: string, plan?: string|number }} param0
 * @returns {Promise<
 *   | { ok: true; data: { message: string; checkoutUrl: string; qrCode: string; orderCode: number } }
 *   | { ok: false; status: number; message: string }
 * >}
 */
async function createVipPaymentLink({ userId, productId, plan }) {
  if (!productId) {
    return { ok: false, status: 400, message: "Thiếu productId" };
  }
  if (!mongoose.isValidObjectId(String(productId))) {
    return { ok: false, status: 400, message: "productId không hợp lệ" };
  }
  const resolved = resolveVipPlan(plan);
  if (!resolved) {
    return {
      ok: false,
      status: 400,
      message: "Gói VIP không hợp lệ. Chọn gói 7 ngày (7) hoặc 30 ngày (30).",
    };
  }
  const { days: vipPlanDays, amount } = resolved;

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

  const orderCode = generateOrderCode();
  const base = frontendBase();
  const returnUrl = `${base}/my-products?vip_payment=success`;
  const cancelUrl = `${base}/my-products?vip_payment=cancel`;
  const description = buildPayosPaymentDescription(product.name, vipPlanDays);

  let createdTxId = null;
  try {
    const tx = await Transaction.create({
      userId,
      productId: product._id,
      amount,
      vipPlanDays,
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

  await applyVipToProductAfterPayment(tx);

  return {
    response: { success: true },
    httpStatus: 200,
  };
}

/**
 * Khi người dùng trả về từ PayOS (returnUrl) mà webhook chưa chạy / không tới (localhost, chưa công khai),
 * gọi API này: đối chiếu trạng thái PAID từ PayOS rồi kích hoạt VIP (idempotent nếu đã SUCCESS).
 */
async function confirmVipAfterReturn({ userId, orderCode }) {
  if (orderCode === undefined || orderCode === null || orderCode === "") {
    return { ok: false, status: 400, message: "Thiếu orderCode" };
  }
  const code = Number(orderCode);
  if (!Number.isFinite(code)) {
    return { ok: false, status: 400, message: "orderCode không hợp lệ" };
  }

  /** `orderCode` unique — tìm theo mã, rồi so `userId` dạng chuỗi (tránh lệch ObjectId/string) */
  const rec = await Transaction.findOne({ orderCode: code })
    .select("productId status _id userId amount vipPlanDays")
    .lean();
  if (!rec) {
    return {
      ok: false,
      status: 404,
      message: "Không tìm thấy giao dịch tương ứng orderCode",
    };
  }
  if (String(rec.userId) !== String(userId)) {
    return {
      ok: false,
      status: 403,
      message: "Giao dịch không thuộc tài khoản hiện tại",
    };
  }
  if (String(rec.status) === "SUCCESS") {
    return {
      ok: true,
      data: {
        message: "Gói VIP đã kích hoạt",
        productId: String(rec.productId),
        already: true,
      },
    };
  }
  if (String(rec.status) !== "PENDING") {
    return {
      ok: false,
      status: 409,
      message: "Giao dịch không ở trạng thái chờ thanh toán",
    };
  }
  const tx = rec;

  let payos;
  try {
    payos = getPayOS();
  } catch (e) {
    return {
      ok: false,
      status: 503,
      message: e?.message || "PayOS chưa cấu hình",
    };
  }

  let info;
  try {
    info = await payos.paymentRequests.get(code);
  } catch (err) {
    console.error("PayOS paymentRequests.get failed:", err);
    return {
      ok: false,
      status: 502,
      message: "Không lấy được trạng thái từ PayOS. Thử lại sau vài giây.",
    };
  }

  const st = String(info?.status || "").toUpperCase();
  if (st !== "PAID") {
    return {
      ok: false,
      status: 409,
      message:
        "PayOS chưa ghi nhận thanh toán. Đợi vài giây rồi tải lại trang hoặc bấm đồng bộ lại.",
    };
  }

  const expectAmt = Number(tx.amount);
  const gotAmt = Number(info?.amount);
  const gotPaid = Number(info?.amountPaid);
  const amountMatch =
    (Number.isFinite(gotAmt) && gotAmt === expectAmt) ||
    (Number.isFinite(gotPaid) && gotPaid === expectAmt) ||
    (Number.isFinite(gotAmt) &&
      Math.abs(gotAmt - expectAmt) < 1) ||
    (Number.isFinite(gotPaid) && Math.abs(gotPaid - expectAmt) < 1);
  if (!amountMatch) {
    return {
      ok: false,
      status: 400,
      message: "Số tiền giao dịch không khớp",
    };
  }

  const updated = await Transaction.findOneAndUpdate(
    { _id: tx._id, status: "PENDING" },
    { $set: { status: "SUCCESS" } },
    { new: true, lean: true },
  );

  if (!updated) {
    const again = await Transaction.findOne({ orderCode: code, status: "SUCCESS" })
      .select("productId")
      .lean();
    if (again) {
      return {
        ok: true,
        data: {
          message: "Gói VIP đã kích hoạt",
          productId: String(again.productId),
          already: true,
        },
      };
    }
    return {
      ok: false,
      status: 409,
      message: "Trạng thái giao dịch thay đổi, vui lòng tải lại trang",
    };
  }

  await applyVipToProductAfterPayment(updated);

  return {
    ok: true,
    data: {
      message: "Gói VIP đã kích hoạt",
      productId: String(updated.productId),
    },
  };
}

const VIP_TX_STATUSES = ["PENDING", "SUCCESS", "CANCELLED"];

/**
 * Danh sách giao dịch mua gói VIP (admin) + tổng doanh thu các giao dịch thành công.
 * @param {{ page?: number|string, limit?: number|string, status?: string }} query
 */
async function getAdminVipTransactions({ page = 1, limit = 20, status } = {}) {
  const safeLimit = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
  const safePage = Math.max(1, parseInt(String(page), 10) || 1);
  const skip = (safePage - 1) * safeLimit;

  const filter = {};
  if (status && VIP_TX_STATUSES.includes(String(status).toUpperCase())) {
    filter.status = String(status).toUpperCase();
  }

  const [rawList, total, revenueAgg, successCount] = await Promise.all([
    Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate({ path: "userId", select: "username email" })
      .populate({ path: "productId", select: "name" })
      .lean(),
    Transaction.countDocuments(filter),
    Transaction.aggregate([
      { $match: { status: "SUCCESS" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Transaction.countDocuments({ status: "SUCCESS" }),
  ]);

  const totalRevenue =
    Array.isArray(revenueAgg) && revenueAgg[0] && Number.isFinite(revenueAgg[0].total)
      ? revenueAgg[0].total
      : 0;

  const transactions = rawList.map((doc) => {
    const u = doc.userId;
    const p = doc.productId;
    const hasUser = u && typeof u === "object" && u._id;
    const hasProduct = p && typeof p === "object" && p._id;
    return {
      _id: doc._id,
      orderCode: doc.orderCode,
      amount: doc.amount,
      vipPlanDays: doc.vipPlanDays,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      user: hasUser
        ? {
            _id: u._id,
            username: u.username,
            email: u.email,
          }
        : null,
      product: hasProduct
        ? {
            _id: p._id,
            name: p.name,
          }
        : null,
    };
  });

  return {
    transactions,
    total,
    currentPage: safePage,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    totalRevenue,
    successCount,
  };
}

module.exports = {
  createVipPaymentLink,
  processPayosVipWebhook,
  confirmVipAfterReturn,
  getAdminVipTransactions,
};

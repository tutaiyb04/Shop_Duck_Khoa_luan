const crypto = require("crypto");
const Product = require("../model/Product");
const { getIO } = require("../utils/ioRegistry");

/** Gói cố định: 7 ngày 50.000₫, 30 ngày 150.000₫*/
const VIP_PLANS = {
  7: { days: 7, amount: 50_000 },
  30: { days: 30, amount: 150_000 },
};

// Các trạng thái hợp lệ của giao dịch VIP
const VIP_TX_STATUSES = ["PENDING", "SUCCESS", "CANCELLED"];

/**
 * TTL cho hoá đơn VIP đang chờ thanh toán (mặc định 17 phút).
 * Đặt > 15 phút TTL của QR PayOS để tránh hủy nhầm khi KH thanh toán đúng phút cuối.
 */
const VIP_PENDING_TTL_MS = Math.max(
  60_000,
  parseInt(process.env.VIP_PENDING_TTL_MS || "", 10) || 17 * 60 * 1000,
);

// Tính toán và trả về số ngày của một gói VIP
const vipDurationDays = () =>
  Math.max(1, parseInt(process.env.PAYOS_VIP_DURATION_DAYS || "30", 10) || 30);

function resolveVipPlan(plan) {
  const key =
    plan === "7" || plan === 7 ? 7 : plan === "30" || plan === 30 ? 30 : null;

  if (key == null) {
    return null;
  }

  return VIP_PLANS[key];
}

// xác định chính xác địa chỉ trang web
let _frontendBase;
const frontendBase = () => {
  if (_frontendBase) {
    return _frontendBase;
  }

  _frontendBase = (process.env.FRONTEND_URL || "http://localhost:5173").replace(
    /\/$/,
    "",
  );

  return _frontendBase;
};

// Tạo mã đơn hàng duy nhất -> tránh trùng lặp khi có nhiều người bấm thanh toán cùng lúc
function generateOrderCode() {
  return Date.now() * 1000 + crypto.randomInt(0, 1000);
}

// Làm sạch nội dung chuyển khoản
function buildPayosPaymentDescription(productName, vipPlanDays) {
  // Làm sạch tên sản phẩm
  const name = (productName || "SP").replace(/\s+/g, " ").trim().slice(0, 18);

  // gộp vào thành câu hoàn chỉnh
  const base = `VIP${vipPlanDays}d ${name}`.trim();

  return base.slice(0, 25) || "Duck Shop VIP";
}

// Bắn socket báo VIP kích hoạt thành công cho user (chạy ngầm, không block request)
function emitVipSuccess(userId, productId) {
  setImmediate(() => {
    const io = getIO();

    if (io) {
      void io.to(`user:${userId}`).emit("payment:vip_success", { productId });
    }
  });
}

// Validate và parse orderCode -> { ok, code } hoặc { ok: false, status, message }
function parseOrderCode(orderCode) {
  if (orderCode === undefined || orderCode === null || orderCode === "") {
    return { ok: false, status: 400, message: "Thiếu orderCode" };
  }

  const code = Number(orderCode);
  if (!Number.isFinite(code)) {
    return { ok: false, status: 400, message: "orderCode không hợp lệ" };
  }

  return { ok: true, code };
}

// So khớp số tiền PayOS báo về với số tiền dự kiến (cho phép sai lệch < 1)
function isAmountMatch(expectAmt, info) {
  const gotAmt = Number(info?.amount);
  const gotPaid = Number(info?.amountPaid);

  return (
    (Number.isFinite(gotAmt) && gotAmt === expectAmt) ||
    (Number.isFinite(gotPaid) && gotPaid === expectAmt) ||
    (Number.isFinite(gotAmt) && Math.abs(gotAmt - expectAmt) < 1) ||
    (Number.isFinite(gotPaid) && Math.abs(gotPaid - expectAmt) < 1)
  );
}

// nâng cấp bài đăng lên vip sau khi thanh toán
async function applyVipToProductAfterPayment(transaction) {
  // tính toán cần cộng thêm bao nhiêu ngày
  const daysToAdd =
    Number(transaction.vipPlanDays) > 0
      ? Number(transaction.vipPlanDays)
      : vipDurationDays();

  // Kiểm tra tình trạng hiện tại của tin đăng hàng
  const product = await Product.findById(transaction.productId)
    .select("vipUntil")
    .lean();

  const now = new Date();
  let base = now;
  // kiểm tra xem còn hạn vip hay đã hết
  if (product?.vipUntil) {
    // nếu hết hạn hoặc chưa có VIP lấy ngày hiện tại làm mốc
    const vipDate = new Date(product.vipUntil);
    // nếu vẫn còn -> lấy làm mốc
    if (vipDate > now) {
      base = vipDate;
    }
  }
  // Cộng thêm số ngày
  const until = new Date(base);
  until.setDate(until.getDate() + daysToAdd);

  await Product.updateOne(
    { _id: transaction.productId },
    {
      $set: { isVIP: true, vipUntil: until, updatedAt: new Date() },
    },
  );

  // báo về màn hình KH
  emitVipSuccess(String(transaction.userId), String(transaction.productId));
}

// Format dữ liệu một transaction VIP cho danh sách Admin
function mapAdminVipTransaction(doc) {
  const userId = doc.userId;
  const productId = doc.productId;
  const hasUser = userId && typeof userId === "object" && userId._id;
  const hasProduct =
    productId && typeof productId === "object" && productId._id;

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
          _id: userId._id,
          username: userId.username,
          email: userId.email,
        }
      : null,
    product: hasProduct
      ? {
          _id: productId._id,
          name: productId.name,
        }
      : null,
  };
}

// Tính skip/limit/page an toàn cho phân trang (Bảo vệ Server)
function buildSafePagination(page, limit, defaultLimit = 20, maxLimit = 100) {
  const safeLimit = Math.min(
    maxLimit,
    Math.max(1, parseInt(String(limit), 10) || defaultLimit),
  );
  const safePage = Math.max(1, parseInt(String(page), 10) || 1);
  const skip = (safePage - 1) * safeLimit;

  return { safePage, safeLimit, skip };
}

module.exports = {
  VIP_PLANS,
  VIP_TX_STATUSES,
  VIP_PENDING_TTL_MS,
  vipDurationDays,
  resolveVipPlan,
  frontendBase,
  generateOrderCode,
  buildPayosPaymentDescription,
  emitVipSuccess,
  parseOrderCode,
  isAmountMatch,
  applyVipToProductAfterPayment,
  mapAdminVipTransaction,
  buildSafePagination,
};

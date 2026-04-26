const crypto = require("crypto");

/** Gói cố định: 7 ngày 50.000₫, 30 ngày 150.000₫*/
const VIP_PLANS = {
  7: { days: 7, amount: 50_000 },
  30: { days: 30, amount: 150_000 },
};

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

module.exports = {
  vipDurationDays,

  resolveVipPlan,
  frontendBase,
  generateOrderCode,
  buildPayosPaymentDescription,
};

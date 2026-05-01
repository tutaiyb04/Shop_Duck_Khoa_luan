const mongoose = require("mongoose");
const Transaction = require("../model/Transaction");
const Product = require("../model/Product");
const { getPayOS } = require("../config/payos");
const {
  VIP_TX_STATUSES,
  VIP_PENDING_TTL_MS,
  resolveVipPlan,
  frontendBase,
  generateOrderCode,
  buildPayosPaymentDescription,
  parseOrderCode,
  isAmountMatch,
  applyVipToProductAfterPayment,
  mapAdminVipTransaction,
  buildSafePagination,
} = require("../helper/paymentHelper");

// tạo mã QR thanh toán
exports.createVipPaymentLink = async ({ userId, productId, plan }) => {
  if (!productId) {
    return { ok: false, status: 400, message: "Thiếu productId" };
  }

  // kiểm tra ID theo chuẩn mongoose
  if (!mongoose.isValidObjectId(String(productId))) {
    return { ok: false, status: 400, message: "productId không hợp lệ" };
  }

  // kiểm tra gói VIP
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

  // Kiểm tra chính chủ
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

  // tạo mã số hóa đơn độc nhất
  const orderCode = generateOrderCode();

  // biết chính xác đường dẫn của KH
  const base = frontendBase();
  const returnUrl = `${base}/my-products?vip_payment=success`;
  const cancelUrl = `${base}/my-products?vip_payment=cancel`;

  // tạo nội dung chuyển khoản
  const description = buildPayosPaymentDescription(product.name, vipPlanDays);

  let createdTransactionId = null;
  try {
    // Viết hoá đơn nháp (Tạo Transaction)
    const transaction = await Transaction.create({
      userId,
      productId: product._id,
      amount,
      vipPlanDays,
      orderCode,
      status: "PENDING",
    });
    createdTransactionId = transaction._id;

    // gọi payOS
    let payos;
    try {
      payos = getPayOS();
    } catch (e) {
      // nếu goi PayOS fail -> lấy id đã nhớ ở createdTransactionId -> xóa sạch hóa đơn nháp trong db
      await Transaction.deleteOne({ _id: createdTransactionId }).catch(
        () => {},
      );
      createdTransactionId = null;
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
        expiresInSec: Math.floor(VIP_PENDING_TTL_MS / 1000),
      },
    };
  } catch (error) {
    if (createdTransactionId) {
      await Transaction.deleteOne({ _id: createdTransactionId }).catch(
        () => {},
      );
    }
    if (error?.code === "PAYOS_NOT_CONFIGURED") {
      return { ok: false, status: 503, message: error.message };
    }
    throw error;
  }
};

// theo dõi và trả về thông báo KH đã thanh toán thành công
exports.processPayosVipWebhook = async (body) => {
  // gọi cấu hình PayOS
  let payos;
  try {
    payos = getPayOS();
  } catch (e) {
    return {
      response: { success: false, message: "PayOS chưa được cấu hình" },
      httpStatus: 503,
    };
  }

  // Kiểm tra an ninh (Chữ ký điện tử)
  let data;
  try {
    // verify dùng mã bí mật này để giải mã cục dữ liệu -> bị sai lệch -> báo lỗi
    data = await payos.webhooks.verify(body);
  } catch (err) {
    console.error("PayOS webhook verify failed:", err);
    return {
      response: { success: false, message: "Cấu hình không tồn tại" },
      httpStatus: 400,
    };
  }

  // Kiểm tra trạng thái giao dịch
  if (String(data.code) !== "00") {
    return {
      response: { success: true, message: "Mã không thành công bị bỏ qua" },
      httpStatus: 200,
    };
  }

  // chốt sổ sách cộng số VIP
  // Tìm tờ hoá đơn mang mã đó VÀ VẪN CÒN CHỮ PENDING, sau đó đóng mộc SUCCESS lên
  const transaction = await Transaction.findOneAndUpdate(
    { orderCode: data.orderCode, status: "PENDING" },
    { $set: { status: "SUCCESS" } },
    { returnDocument: "after", lean: true },
  );

  if (!transaction) {
    return {
      response: { success: true, message: "Bỏ qua" },
      httpStatus: 200,
    };
  }

  // cập nhập ngày hết hạn
  await applyVipToProductAfterPayment(transaction);

  return {
    response: { success: true },
    httpStatus: 200,
  };
};

// Khi người dùng trả về từ PayOS (returnUrl) mà webhook chưa chạy / không tới (localhost, chưa công khai)
exports.confirmVipAfterReturn = async ({ userId, orderCode }) => {
  const parsed = parseOrderCode(orderCode);
  if (!parsed.ok) return parsed;
  const code = parsed.code;

  // Tìm lại hoá đơn và Kiểm tra chủ quyền
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

  // Đề phòng Webhook nhanh chân hơn
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
  if (String(rec.status) === "CANCELLED") {
    return {
      ok: false,
      status: 410,
      message: "Giao dịch đã hết hạn hoặc bị hủy. Vui lòng tạo gói VIP mới.",
      expired: true,
    };
  }
  if (String(rec.status) !== "PENDING") {
    return {
      ok: false,
      status: 409,
      message: "Giao dịch không ở trạng thái chờ thanh toán",
    };
  }

  const transaction = rec;

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

  // báo lên payos để xác nhận đã nhận được tiền chưa
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

  const status = String(info?.status || "").toUpperCase();
  if (status !== "PAID") {
    return {
      ok: false,
      status: 409,
      message:
        "PayOS chưa ghi nhận thanh toán. Đợi vài giây rồi tải lại trang hoặc bấm đồng bộ lại.",
    };
  }

  // kiểm tra lại số tiền
  if (!isAmountMatch(Number(transaction.amount), info)) {
    return {
      ok: false,
      status: 400,
      message: "Số tiền giao dịch không khớp",
    };
  }

  // tránh đụng độ với applyVipToProductAfterPayment
  // tìm hoá đơn PENDING và đổi thành SUCCESS -> ngắn Race Condition (đụng độ dữ liệu)
  const updated = await Transaction.findOneAndUpdate(
    { _id: transaction._id, status: "PENDING" },
    { $set: { status: "SUCCESS" } },
    { returnDocument: "after", lean: true },
  );

  if (!updated) {
    const again = await Transaction.findOne({
      orderCode: code,
      status: "SUCCESS",
    })
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
};

// Tự hủy giao dịch PENDING quá hạn — chạy định kỳ qua jobs/autoCancelVipPending
exports.autoCancelExpiredPendingVip = async () => {
  const cutoff = new Date(Date.now() - VIP_PENDING_TTL_MS);
  const res = await Transaction.updateMany(
    { status: "PENDING", createdAt: { $lt: cutoff } },
    { $set: { status: "CANCELLED" } },
  );
  return { modifiedCount: res.modifiedCount || 0 };
};

// Hủy tất cả giao dịch VIP đang chờ thanh toán của tin (đã bán / không còn được mua VIP…)
exports.cancelPendingVipTransactionsForProduct = async (productId) => {
  if (!productId || !mongoose.isValidObjectId(String(productId))) {
    return { modifiedCount: 0 };
  }
  const pid = new mongoose.Types.ObjectId(String(productId));
  const res = await Transaction.updateMany(
    { productId: pid, status: "PENDING" },
    { $set: { status: "CANCELLED" } },
  );
  return { modifiedCount: res.modifiedCount };
};

// Người bán bấm hủy trên PayOS → redirect về site (chưa có webhook hủy)
exports.cancelVipCheckout = async ({ userId, orderCode }) => {
  const parsed = parseOrderCode(orderCode);
  if (!parsed.ok) return parsed;
  const code = parsed.code;

  const updated = await Transaction.findOneAndUpdate(
    {
      orderCode: code,
      userId,
      status: "PENDING",
    },
    { $set: { status: "CANCELLED" } },
    { returnDocument: "after", lean: true },
  );

  if (updated) {
    return {
      ok: true,
      data: { message: "Đã hủy giao dịch VIP", orderCode: code },
    };
  }

  const existing = await Transaction.findOne({ orderCode: code })
    .select("status userId")
    .lean();

  if (!existing) {
    return { ok: false, status: 404, message: "Không tìm thấy giao dịch" };
  }
  if (String(existing.userId) !== String(userId)) {
    return {
      ok: false,
      status: 403,
      message: "Giao dịch không thuộc tài khoản này",
    };
  }
  if (existing.status === "CANCELLED") {
    return {
      ok: true,
      data: { message: "Giao dịch đã ở trạng thái đã hủy", already: true },
    };
  }
  if (existing.status === "SUCCESS") {
    return {
      ok: false,
      status: 409,
      message: "Giao dịch đã thanh toán thành công, không thể hủy",
    };
  }
  return { ok: false, status: 409, message: "Không thể hủy giao dịch" };
};

// xem báo cáo doanh thu và danh sách lịch sử mua VIP của Admin
exports.getAdminVipTransactions = async ({
  page = 1,
  limit = 20,
  status,
} = {}) => {
  // Bảo vệ Server (Phân trang an toàn)
  const { safePage, safeLimit, skip } = buildSafePagination(page, limit);

  // Tạo bộ lọc (Filter)
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

  // tránh crash nếu csdl lỗi, chưa ai mua hàng
  const totalRevenue =
    Array.isArray(revenueAgg) &&
    revenueAgg[0] &&
    Number.isFinite(revenueAgg[0].total)
      ? revenueAgg[0].total
      : 0;

  // lấy dữ liệu cần thiết
  const transactions = rawList.map(mapAdminVipTransaction);

  return {
    transactions,
    total,
    currentPage: safePage,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    totalRevenue,
    successCount,
  };
};

exports.VIP_PENDING_TTL_MS = VIP_PENDING_TTL_MS;

const mongoose = require("mongoose");
const Transaction = require("../model/Transaction");
const Product = require("../model/Product");
const { getPayOS } = require("../config/payos");
const { getIO } = require("../utils/ioRegistry");
const {
  vipDurationDays,
  resolveVipPlan,
  frontendBase,
  generateOrderCode,
  buildPayosPaymentDescription,
} = require("../helper/paymentHelper");

function emitVipSuccess(userId, productId) {
  // chạy ngầm socket
  setImmediate(() => {
    const io = getIO();

    if (io) {
      void io.to(`user:${userId}`).emit("payment:vip_success", { productId });
    }
  });
}

// tạo mã QR thanh toán
async function createVipPaymentLink({ userId, productId, plan }) {
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
}

// theo dõi và trả về thông báo KH đã thanh toán thành công
async function processPayosVipWebhook(body) {
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
    { new: true, lean: true },
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

// Khi người dùng trả về từ PayOS (returnUrl) mà webhook chưa chạy / không tới (localhost, chưa công khai),

async function confirmVipAfterReturn({ userId, orderCode }) {
  if (orderCode === undefined || orderCode === null || orderCode === "") {
    return { ok: false, status: 400, message: "Thiếu orderCode" };
  }
  const code = Number(orderCode);
  if (!Number.isFinite(code)) {
    return { ok: false, status: 400, message: "orderCode không hợp lệ" };
  }

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
  const expectAmt = Number(transaction.amount); // Số tiền web yêu cầu
  const gotAmt = Number(info?.amount); // Số tiền PayOS báo
  const gotPaid = Number(info?.amountPaid); // Số tiền khách thực chuyển

  const amountMatch =
    (Number.isFinite(gotAmt) && gotAmt === expectAmt) ||
    (Number.isFinite(gotPaid) && gotPaid === expectAmt) ||
    (Number.isFinite(gotAmt) && Math.abs(gotAmt - expectAmt) < 1) ||
    (Number.isFinite(gotPaid) && Math.abs(gotPaid - expectAmt) < 1);

  if (!amountMatch) {
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
    { new: true, lean: true },
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
}

const VIP_TX_STATUSES = ["PENDING", "SUCCESS", "CANCELLED"];
async function  getAdminVipTransactions({ page = 1, limit = 20, status } = {}) {
  // Bảo vệ Server (Phân trang an toàn)
  const safeLimit = Math.min(
    100,
    Math.max(1, parseInt(String(limit), 10) || 20),
  );
  const safePage = Math.max(1, parseInt(String(page), 10) || 1);
  const skip = (safePage - 1) * safeLimit;

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
  const transactions = rawList.map((doc) => {
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

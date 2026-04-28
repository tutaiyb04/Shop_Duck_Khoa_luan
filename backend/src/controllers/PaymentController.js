const paymentService = require("../services/paymentService");

// Tạo link thanh toán VIP
exports.createVipPaymentLink = async (req, res) => {
  try {
    const result = await paymentService.createVipPaymentLink({
      userId: req.user._id,
      productId: req.body?.productId,
      plan: req.body?.plan,
    });

    if (!result.ok) {
      return res.status(result.status).json({ message: result.message });
    }

    return res.status(200).json(result.data);
  } catch (error) {
    console.error("Lỗi createVipPaymentLink:", error);
    return res.status(500).json({
      message: error?.message || "Không thể tạo link thanh toán",
    });
  }
};

// "lắng nghe" hoạt dộng từ PayOS: KH quét mã QR -> chuyển khoản thành công -> PayOS tự động và gọi vào API này để báo về
exports.handlePayOSWebhook = async (req, res) => {
  try {
    const { response, httpStatus } =
      await paymentService.processPayosVipWebhook(req.body);

    return res.status(httpStatus).json(response);
  } catch (error) {
    console.error("Lỗi handlePayOSWebhook:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Hủy giao dịch VIP khi KH thoát PayOS (cancelUrl) — cập nhật DB để admin thấy "Đã hủy".
exports.cancelVipCheckout = async (req, res) => {
  try {
    const result = await paymentService.cancelVipCheckout({
      userId: req.user._id,
      orderCode: req.body?.orderCode,
    });

    if (!result.ok) {
      return res.status(result.status).json({ message: result.message });
    }

    return res.status(200).json(result.data);
  } catch (error) {
    console.error("Lỗi cancelVipCheckout:", error);
    return res.status(500).json({
      message: error?.message || "Không thể hủy giao dịch",
    });
  }
};

// xác nhận VIP sau khi về từ PayOS (dự phòng khi webhook ở handlePayOSWebhook không tới).
exports.confirmVipAfterReturn = async (req, res) => {
  try {
    const result = await paymentService.confirmVipAfterReturn({
      userId: req.user._id,
      orderCode: req.body?.orderCode,
    });

    if (!result.ok) {
      return res.status(result.status).json({
        message: result.message,
        ...(result.expired ? { expired: true } : {}),
      });
    }

    return res.status(200).json(result.data);
  } catch (error) {
    console.error("Lỗi confirmVipAfterReturn:", error);
    return res.status(500).json({
      message: error?.message || "Không thể xác nhận thanh toán",
    });
  }
};

// xem báo cáo doanh thu và danh sách lịch sử mua VIP của Admin
exports.getAdminVipTransactions = async (req, res) => {
  try {
    const result = await paymentService.getAdminVipTransactions({
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
    });

    return res.status(200).json({
      message: "Lấy giao dịch VIP thành công",
      result,
    });
  } catch (error) {
    console.error("Lỗi getAdminVipTransactions:", error);
    return res.status(500).json({
      message: error?.message || "Không thể tải giao dịch",
    });
  }
};

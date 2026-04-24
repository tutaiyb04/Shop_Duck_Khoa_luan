const paymentService = require("../services/paymentService");

/**
 * POST /payment/create-vip-link (auth) — tạo link PayOS, logic nằm ở paymentService.
 */
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

/**
 * POST /payment/webhook — lưu lượng cao: nghiệp vụ + DB trong service, controller chỉ trả JSON.
 */
exports.handlePayOSWebhook = async (req, res) => {
  try {
    const { response, httpStatus } = await paymentService.processPayosVipWebhook(
      req.body,
    );
    return res.status(httpStatus).json(response);
  } catch (error) {
    console.error("Lỗi handlePayOSWebhook:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
};

/**
 * POST /payment/confirm-vip (auth) — xác nhận VIP sau khi về từ PayOS (bù khi webhook không tới).
 * Body: { orderCode: number }
 */
exports.confirmVipAfterReturn = async (req, res) => {
  try {
    const result = await paymentService.confirmVipAfterReturn({
      userId: req.user._id,
      orderCode: req.body?.orderCode,
    });
    if (!result.ok) {
      return res.status(result.status).json({ message: result.message });
    }
    return res.status(200).json(result.data);
  } catch (error) {
    console.error("Lỗi confirmVipAfterReturn:", error);
    return res.status(500).json({
      message: error?.message || "Không thể xác nhận thanh toán",
    });
  }
};

/**
 * GET /payment/admin/vip-transactions?status=&page=&limit= — admin: giao dịch VIP + tổng doanh thu
 */
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

const orderService = require("../services/orderService");

const userIdOf = (req) => {
  return req.user?._id || req.user?.id;
}

// xác nhận đã bán hàng
exports.postCompleteOfflineSale = async (req, res) => {
  try {
    const sellerId = userIdOf(req);

    if (!sellerId) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    const { productId, buyerId } = req.body;
    
    if (!productId || !buyerId) {
      return res.status(400).json({ message: "Thiếu productId hoặc buyerId" });
    }
    
    const { order } = await orderService.completeOfflineSale(
      sellerId,
      productId,
      buyerId,
    );
    
    return res.status(201).json({
      message: "Đã ghi nhận bán hàng thành công",
      order: {
        _id: order._id,
        buyerId: order.buyerId,
        sellerId: order.sellerId,
        productId: order.productId,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    const status = error.status || 500;

    if (status === 500) {
      console.error("postCompleteOfflineSale:", error);
    }

    return res
      .status(status)
      .json({ message: error.message || "Không thể hoàn tất giao dịch" });
  }
};

// xem lịch sử bán hàng
exports.getSalesHistory = async (req, res) => {
  try {
    const sellerId = userIdOf(req);

    if (!sellerId) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    const { page, limit } = req.query;

    const data = await orderService.listSellerCompletedOrders(sellerId, {
      page,
      limit,
    });

    return res.json({ message: "OK", ...data });
  } catch (error) {
    console.error("getSalesHistory:", error);

    return res
      .status(500)
      .json({ message: error.message || "Lỗi lấy lịch sử bán" });
  }
};

// lịch sử mua hàng
exports.getPurchaseHistory = async (req, res) => {
  try {
    const buyerId = userIdOf(req);

    if (!buyerId) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    const { page, limit } = req.query;

    const data = await orderService.listBuyerCompletedOrders(buyerId, {
      page,
      limit,
    });

    return res.json({ message: "OK", ...data });
  } catch (error) {
    console.error("getPurchaseHistory:", error);
    
    return res
      .status(500)
      .json({ message: error.message || "Lỗi lấy lịch sử mua" });
  }
};

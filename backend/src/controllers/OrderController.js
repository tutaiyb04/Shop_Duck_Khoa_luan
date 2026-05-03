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

    const { productId, buyerId, quantity } = req.body;

    if (!productId || !buyerId) {
      return res.status(400).json({ message: "Thiếu productId hoặc buyerId" });
    }

    const qtyParsed = Number(quantity);
    const saleQuantity =
      quantity === undefined || quantity === "" || quantity === null
        ? 1
        : Number.isFinite(qtyParsed) &&
            Math.trunc(qtyParsed) === qtyParsed &&
            qtyParsed >= 1
          ? qtyParsed
          : null;

    if (saleQuantity == null) {
      return res
        .status(400)
        .json({ message: "quantity phải là số nguyên dương (tùy chọn, mặc định 1)" });
    }

    const { order, productUpdated, soldOut } =
      await orderService.completeOfflineSale(
      sellerId,
      productId,
      buyerId,
      saleQuantity,
    );

    return res.status(201).json({
      message: soldOut
        ? "Đã ghi nhận bán hàng — tin đăng đã bán hết."
        : "Đã ghi nhận bán hàng — tồn kho tin đăng đã được cập nhật.",
      order: {
        _id: order._id,
        buyerId: order.buyerId,
        sellerId: order.sellerId,
        productId: order.productId,
        quantity: order.quantity,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
      },
      product: productUpdated && {
        _id: productUpdated._id,
        quantity: productUpdated.quantity,
        status: productUpdated.status,
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

const adminDashboardService = require("../services/adminDashboardService");

exports.getStats = async (req, res) => {
  try {
    const result = await adminDashboardService.getAdminDashboardStats();
    return res.status(200).json({
      message: "Lấy số liệu tổng quan thành công",
      result,
    });
  } catch (error) {
    console.error("Lỗi getAdminDashboardStats:", error);
    return res.status(500).json({
      message: error?.message || "Không thể tải số liệu tổng quan",
    });
  }
};

const Report = require("../model/Report");
const Product = require("../model/Product");
const User = require("../model/User");

exports.getAllReportsService = async (filters) => {
  try {
    let query = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.search) {
      query.$or = [
        { reason: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 15;
    const skip = (page - 1) * limit;

    // 1. Chạy song song lệnh "Tìm data" và lệnh "Đếm tổng" để giảm 50% thời gian chờ
    // 2. Dùng .lean() giúp giảm 80% dung lượng RAM tiêu thụ vì chỉ cần đọc dữ liệu
    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate("reporterId", "username email avatar")
        .populate("targetId") // Tự động nhận diện Product hoặc User nhờ refPath
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Report.countDocuments(query),
    ]);

    return {
      reports,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Lỗi tại getAdminReportsService:", error);
    throw new Error("Không thể tải danh sách báo cáo");
  }
};

exports.resolveReportService = async (reportId, action, adminNote) => {
  try {
    const reportStatus = action === "APPROVE" ? "RESOLVED" : "REJECTED";
    const defaultNote =
      action === "APPROVE"
        ? "Đã xử lý vi phạm theo quy định."
        : "Báo cáo không chính xác. Bài đăng hợp lệ.";

    const report = await Report.findByIdAndUpdate(
      reportId,
      { status: reportStatus, adminNote: adminNote || defaultNote },
      { new: true },
    );

    if (!report) throw new Error("Báo cáo không tồn tại");
    if (action === "REJECT") return { report };

    if (report.targetType === "Product") {
      const product = await Product.findByIdAndUpdate(
        report.targetId,
        { status: "LOCKED", adminNote: `Khóa do vi phạm: ${report.reason}` },
        { new: true },
      );

      if (product && product.sellerId) {
        // TỐI ƯU RACE CONDITION: Dùng $inc để cộng dồn trực tiếp dưới DB
        const updatedSeller = await User.findByIdAndUpdate(
          product.sellerId,
          { $inc: { reportCount: 1 } },
          { new: true },
        );

        if (updatedSeller && updatedSeller.reportCount >= 3) {
          await User.findByIdAndUpdate(product.sellerId, { status: "locked" });
        }
      }
    } else if (report.targetType === "User") {
      const targetUser = await User.findByIdAndUpdate(
        report.targetId,
        { $inc: { reportCount: 1 } },
        { new: true },
      );

      if (targetUser && targetUser.reportCount >= 3) {
        await User.findByIdAndUpdate(report.targetId, { status: "locked" });
      }
    }

    return { report };
  } catch (error) {
    console.error("Lỗi tại resolveReportService:", error);
    throw new Error(error.message || "Lỗi khi xử lý báo cáo");
  }
};

exports.createReportService = async (reporterId, reportData) => {
  try {
    const newReport = await Report.create({
      reporterId: reporterId,
      targetType: reportData.targetType,
      targetId: reportData.targetId,
      reason: reportData.reason,
      description: reportData.description || "",
      // evidenceImages: [] - Xử lý sau
    });
    return { newReport };
  } catch (error) {
    console.error("Lỗi tại createReportService:", error);
    throw new Error("Không thể tạo báo cáo vi phạm");
  }
};

const mongoose = require("mongoose");
const Report = require("../model/Report");
const Product = require("../model/Product");
const User = require("../model/User");
const Conversation = require("../model/Conversation");

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
      { returnDocument: "after" },
    );

    if (!report) throw new Error("Báo cáo không tồn tại");
    if (action === "REJECT") return { report };

    if (report.targetType === "Product") {
      const product = await Product.findByIdAndUpdate(
        report.targetId,
        { status: "LOCKED", adminNote: `Khóa do vi phạm: ${report.reason}` },
        { returnDocument: "after" },
      );

      if (product && product.sellerId) {
        // TỐI ƯU RACE CONDITION: Dùng $inc để cộng dồn trực tiếp dưới DB
        const updatedSeller = await User.findByIdAndUpdate(
          product.sellerId,
          { $inc: { reportCount: 1 } },
          { returnDocument: "after" },
        );

        if (updatedSeller && updatedSeller.reportCount >= 3) {
          await User.findByIdAndUpdate(product.sellerId, { status: "locked" });
        }
      }
    } else if (report.targetType === "User") {
      const targetUser = await User.findByIdAndUpdate(
        report.targetId,
        { $inc: { reportCount: 1 } },
        { returnDocument: "after" },
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
    const imgs = Array.isArray(reportData.evidenceImages)
      ? reportData.evidenceImages.filter(Boolean)
      : [];
    const newReport = await Report.create({
      reporterId: reporterId,
      targetType: reportData.targetType,
      targetId: reportData.targetId,
      reason: reportData.reason,
      description: reportData.description || "",
      evidenceImages: imgs,
    });
    return { report: newReport };
  } catch (error) {
    console.error("Lỗi tại createReportService:", error);
    throw new Error("Không thể tạo báo cáo vi phạm");
  }
};

/**
 * Tố cáo người dùng từ ngữ cảnh chat — prefix conversationId trong description cho Admin.
 */
exports.createChatReportService = async (reporterId, body) => {
  const {
    targetUserId,
    reason,
    description,
    evidenceImages,
    conversationId,
  } = body || {};

  if (!conversationId || !mongoose.isValidObjectId(String(conversationId))) {
    const err = new Error("ID hội thoại không hợp lệ");
    err.status = 400;
    throw err;
  }
  if (!targetUserId || !mongoose.isValidObjectId(String(targetUserId))) {
    const err = new Error("ID người bị tố cáo không hợp lệ");
    err.status = 400;
    throw err;
  }
  if (!reason) {
    const err = new Error("Thiếu lý do báo cáo");
    err.status = 400;
    throw err;
  }
  const descTrim = typeof description === "string" ? description.trim() : "";
  if (!descTrim) {
    const err = new Error("Vui lòng nhập mô tả chi tiết");
    err.status = 400;
    throw err;
  }

  const conv = await Conversation.findById(conversationId)
    .select("participants")
    .lean();
  if (!conv) {
    const err = new Error("Không tìm thấy hội thoại");
    err.status = 404;
    throw err;
  }
  const me = String(reporterId);
  const parts = (conv.participants || []).map((p) => String(p));
  if (!parts.includes(me)) {
    const err = new Error("Bạn không tham gia hội thoại này");
    err.status = 403;
    throw err;
  }
  const targetStr = String(targetUserId);
  if (!parts.includes(targetStr)) {
    const err = new Error("Người bị tố cáo không thuộc hội thoại này");
    err.status = 400;
    throw err;
  }
  if (targetStr === me) {
    const err = new Error("Không thể tố cáo chính mình");
    err.status = 400;
    throw err;
  }

  const imgs = Array.isArray(evidenceImages)
    ? evidenceImages.map((s) => String(s).trim()).filter(Boolean)
    : [];

  const prefixedDescription = `[Conversation ID: ${String(conversationId)}]\n\n${descTrim}`;

  const report = await Report.create({
    reporterId,
    targetType: "User",
    targetId: targetUserId,
    reason,
    description: prefixedDescription,
    evidenceImages: imgs,
  });

  return { report };
};

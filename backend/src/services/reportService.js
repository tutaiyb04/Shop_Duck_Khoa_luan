const Report = require("../model/Report");

exports.createReportService = async (reporterId, reportData) => {
  try {
    const newReport = new Report({
      reporterId: reporterId,
      targetType: reportData.targetType,
      targetId: reportData.targetId,
      reason: reportData.reason,
      description: reportData.description || "",
      // evidenceImages: [] - Sau này nếu có làm chức năng đính kèm ảnh thì xử lý sau
    });

    await newReport.save();
    return { newReport };
  } catch (error) {
    console.error("Lỗi tại createReportService:", error);
    throw new Error("Không thể tạo báo cáo vi phạm");
  }
};

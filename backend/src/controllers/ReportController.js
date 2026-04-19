const reportService = require("../services/reportService");

exports.createReport = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Vui lòng đăng nhập để báo cáo!" });
    }

    const reporterId = req.user._id || req.user.id;
    const reportData = req.body;

    const { report } = await reportService.createReportService(
      reporterId,
      reportData,
    );

    return res.status(201).json({
      message: "Gửi báo cáo thành công",
      report,
    });
  } catch (error) {
    console.error("Lỗi tại ReportController:", error);
    return res.status(500).json({
      message: error.message || "Lỗi server khi gửi báo cáo",
    });
  }
};

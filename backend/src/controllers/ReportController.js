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

exports.getAdminReports = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit,
    };

    const result = await reportService.getAllReportsService(filters);

    return res.status(200).json({
      message: "Lấy báo cáo thành công",
      result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Lỗi Server" });
  }
};

exports.resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, adminNote } = req.body;
    const { report } = await reportService.resolveReportService(
      id,
      action,
      adminNote,
    );

    res.status(200).json({
      message: "Xử lý báo cáo thành công",
      report,
    });
  } catch (error) {
    res.status(400).json({ message: error.message || "Lỗi Server" });
  }
};

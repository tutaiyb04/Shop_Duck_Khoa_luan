const User = require("../model/User");
const Product = require("../model/Product");
const Category = require("../model/Category");
const Report = require("../model/Report");
const Transaction = require("../model/Transaction");

async function getAdminDashboardStats() {
  const userFilter = { role: "user" };

  const [
    usersTotal,
    usersActive,
    usersLocked,
    productsTotal,
    productGroup,
    categoriesTotal,
    reportsTotal,
    reportsPending,
    vipRevenueAgg,
    vipSuccessCount,
  ] = await Promise.all([
    User.countDocuments(userFilter), // tìm tổng số user (role: user)
    User.countDocuments({ ...userFilter, status: "active" }), // tìm tổng số user (role: user) và status: active
    User.countDocuments({ ...userFilter, status: "locked" }), // tìm tổng số user (role: user) và bị khóa tài khoản
    Product.countDocuments(), // tìm tổng số sản phẩm
    Product.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },   // tìm tổng số sản phẩm theo trạng thái
    ]),
    Category.countDocuments(), // tìm tổng số danh mục
    Report.countDocuments(), // tìm tổng số báo cáo
    Report.countDocuments({ status: "PENDING" }), // tìm tổng số báo cáo và trạng thái là PENDING
    Transaction.aggregate([
      { $match: { status: "SUCCESS" } }, // tìm tổng số giao dịch và trạng thái là SUCCESS
      { $group: { _id: null, total: { $sum: "$amount" } } }, // tìm tổng số giao dịch và trạng thái là SUCCESS
    ]),
    Transaction.countDocuments({ status: "SUCCESS" }), // tìm tổng số giao dịch và trạng thái là SUCCESS
  ]);

  // tạo object để lưu trữ tổng số sản phẩm theo trạng thái
  const productByStatus = {
    PENDING: 0,
    AVAILABLE: 0,
    REJECTED: 0,
    LOCKED: 0,
    SOLD: 0,
    HIDDEN: 0,
  };
  for (const row of productGroup) {
    if (row._id && Object.prototype.hasOwnProperty.call(productByStatus, row._id)) {
      productByStatus[row._id] = row.count;
    }
  }

  // tìm tổng số giao dịch và trạng thái là SUCCESS
  const totalRevenue =
    Array.isArray(vipRevenueAgg) &&
    vipRevenueAgg[0] &&
    Number.isFinite(vipRevenueAgg[0].total)
      ? vipRevenueAgg[0].total
      : 0;

  return {
    users: {
      total: usersTotal,
      active: usersActive,
      locked: usersLocked,
    },
    products: {
      total: productsTotal,
      byStatus: productByStatus,
      /** Cần xử lý: chờ duyệt */
      pending: productByStatus.PENDING,
    },
    categories: { total: categoriesTotal },
    reports: {
      total: reportsTotal,
      pending: reportsPending,
    },
    revenue: {
      totalVnd: totalRevenue,
      vipTransactionSuccess: vipSuccessCount,
    },
  };
}

module.exports = { getAdminDashboardStats };

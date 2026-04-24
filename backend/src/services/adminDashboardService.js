const User = require("../model/User");
const Product = require("../model/Product");
const Category = require("../model/Category");
const Report = require("../model/Report");
const Transaction = require("../model/Transaction");

/**
 * Số liệu tổng quan cho trang Admin Dashboard (một vòng gọi DB song song).
 */
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
    User.countDocuments(userFilter),
    User.countDocuments({ ...userFilter, status: "active" }),
    User.countDocuments({ ...userFilter, status: "locked" }),
    Product.countDocuments(),
    Product.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Category.countDocuments(),
    Report.countDocuments(),
    Report.countDocuments({ status: "PENDING" }),
    Transaction.aggregate([
      { $match: { status: "SUCCESS" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Transaction.countDocuments({ status: "SUCCESS" }),
  ]);

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

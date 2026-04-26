const mongoose = require("mongoose");
const Category = require("../model/Category");

/** Lọc query admin: category chỉ khi đúng ObjectId (bỏ slug "khac", mảng lỗi, …) */
function parseCategoryObjectIdFilter(category) {
  if (category == null) return null;

  // Xử lý nếu dữ liệu bị biến thành Mảng (Array)
  if (Array.isArray(category)) {
    for (const item of category) {
      const str = String(item ?? "").trim();

      if (str && mongoose.isValidObjectId(str)) return s;
    }

    return null;
  }

  // Xử lý chuỗi bình thường
  const str = String(category).trim();
  if (!str || !mongoose.isValidObjectId(str)) return null;
  return str;
}

/**
 * Sản phẩm thường gắn danh mục **con**. Khi lọc theo ID **cha** (parentId = null),
 * cần khớp mọi sản phẩm thuộc danh mục con (và chính id cha nếu có bản ghi trỏ thẳng).
 */
async function buildCategoryFilterQuery(categoryObjectId) {
  // kiểm tra id danh mục gửi vào
  if (!categoryObjectId) return null;

  // tìm danh mục hiện tại
  const category = await Category.findById(categoryObjectId)
    .select("parentId")
    .lean();

  // Xử lý nếu danh mục bị xóa/không tồn tại
  if (!category) {
    return { $in: [] };
  }

  // nếu là danh mục cha
  if (category.parentId == null) {
    const children = await Category.find({ parentId: categoryObjectId })
      .select("_id")
      .lean();

    // Gom ID của Cha và tất cả ID của Con lại thành 1 mảng
    const ids = [categoryObjectId, ...children.map((c) => c._id)];

    return { $in: ids };
  }

  return categoryObjectId;
}

// gán tên danh mục vào danh sách sản phẩm hiển thị
async function attachCategoryNamesToAdminProducts(products) {
  // kiểm tra danh sách sản phẩm
  if (!products?.length) return;
  const idSet = new Set(); // id không bị trùng lặp

  //Thu thập các ID danh mục duy nhất
  for (const product of products) {
    const category = product.category;

    if (category == null) continue;

    const idStr =
      typeof category === "object" && category?._id != null
        ? String(category._id)
        : String(category);

    if (mongoose.isValidObjectId(idStr)) idSet.add(idStr); // lọc bỏ các giá trị rác hoặc lỗi không phải ID hợp lệ
  }

  const byId = new Map();

  // tìm tên danh mục từ db
  if (idSet.size > 0) {
    const rows = await Category.find({ _id: { $in: [...idSet] } }) // lấy tất cả tên danh mục của các id đã gom 1 lần duy nhất
      .select("name")
      .lean();

    for (const r of rows) {
      byId.set(String(r._id), r);
    }
  }

  // Gắn tên danh mục ngược lại vào từng sản phẩm
  for (const product of products) {
    const category = product.category;

    if (category == null) {
      product.category = { name: "Khác" };
      continue;
    }

    const idStr =
      typeof category === "object" && category?._id != null
        ? String(category._id)
        : String(category);

    if (mongoose.isValidObjectId(idStr) && byId.has(idStr)) {
      product.category = byId.get(idStr);
    } else {
      product.category = { name: "Khác" };
    }
  }
}

module.exports = {
  parseCategoryObjectIdFilter,
  buildCategoryFilterQuery,
  attachCategoryNamesToAdminProducts,
};

const slugify = require("slugify");
const Category = require("../model/Category");

exports.getPublicCategories = async () => {
  try {
    const publicCategories = await Category.find({ status: "active" })
      .populate("parentId", "name")
      .select("-__v") // select('-__v') để ẩn trường nội bộ của mongo
      .lean(); // lean() chuyển Document Mongoose nặng nề thành plain JSON object, tăng tốc đọc gấp 3-5 lần và giảm tiêu thụ RAM.

    return { publicCategories };
  } catch (error) {
    console.log("Lỗi khi gọi getPublicCategories: ", error);
    throw new Error("Không thể lấy danh sách danh mục");
  }
};

exports.getAdminCategories = async () => {
  try {
    const adminCategories = await Category.find()
      .populate("parentId", "name")
      .sort({ createdAt: -1 })
      .select("-__v")
      .lean();

    return { adminCategories };
  } catch (error) {
    console.log("Lỗi khi gọi getAdminCategories: ", error);
    throw new Error("Không thể lấy danh sách danh mục");
  }
};

exports.createCategoryService = async (name, icon, description, parentId) => {
  try {
    if (!name) {
      throw new Error("Tên danh mục không được để trống");
    }

    const slug = slugify(name, { lower: true, strict: true, locale: "vi" });

    const newCategory = await Category.create({
      name,
      slug,
      description,
      icon: icon || "",
      parentId: parentId || null,
    });

    return { newCategory };
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("Tên danh mục này đã tồn tại");
    }
    console.log("Lỗi khi gọi createCategoryService: ", error);
    throw new Error("Không thể tạo danh mục");
  }
};

exports.updateCategoryService = async (
  id,
  name,
  icon,
  description,
  status,
  parentId,
) => {
  try {
    const updateData = {};

    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name, {
        lower: true,
        strict: true,
        locale: "vi",
      });
    }
    if (icon !== undefined) updateData.icon = icon;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (parentId !== undefined) {
      updateData.parentId = parentId === "" ? null : parentId;
    }

    const updateCategory = await Category.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!updateCategory) {
      throw new Error("Không tìm thấy danh mục này");
    }

    return { updateCategory };
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("Tên danh mục này đã tồn tại");
    }
    console.log("Lỗi khi gọi updateCategoryService: ", error);
    throw new Error("Không thể cập nhật danh mục");
  }
};

exports.deleteCategoryService = async (id) => {
  try {
    const deleteCategory = await Category.findByIdAndUpdate(
      id,
      { status: "hidden" },
      { new: true },
    );

    if (!deleteCategory) {
      throw new Error("Không tìm thấy danh mục này");
    }

    return { deleteCategory };
  } catch (error) {
    console.log("Lỗi khi gọi deleteCategoryService: ", error);
    throw new Error("Không thể xóa danh mục");
  }
};

exports.restoreCategoryService = async (id) => {
  try {
    const restoreCategory = await Category.findOneAndUpdate(
      { _id: id, status: { $ne: "active" } },
      { status: "active" },
      { new: true },
    );

    if (!restoreCategory) {
      throw new Error(
        "Danh mục không tồn tại hoặc đã ở trạng thái hoạt động rồi",
      );
    }

    return { restoreCategory };
  } catch (error) {
    console.log("Lỗi khi gọi restoreCategoryService: ", error);
    throw new Error("Không thể khôi phục danh mục");
  }
};

const slugify = require("slugify");
const Category = require("../model/Category");

exports.getPublicCategories = async () => {
  try {
    const publicCategories = await Category.find({ status: "active" })
      .populate("parentId", "name")
      .select("-__v"); // select('-__v') để ẩn trường nội bộ của mongo

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
      .select("-__v");

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

    const exitstingCategory = await Category.findOne({ name });

    if (exitstingCategory) {
      throw new Error("Tên danh mục này đã tồn tại");
    }

    const slug = slugify(name, {
      lower: true,
      strict: true,
      locale: "vi",
    });

    const newCategory = new Category({
      name,
      slug,
      description,
      icon: icon || "",
      parentId: parentId ? parentId : null,
    });

    await newCategory.save();

    return { newCategory };
  } catch (error) {
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
    if (!name) {
      throw new Error("Tên danh mục không được để trống");
    }

    const updateCategory = await Category.findById(id);

    if (!updateCategory) {
      throw new Error("Không tìm thấy danh mục này");
    }

    if (name && name !== updateCategory.name) {
      const exitstingCategory = await Category.findOne({ name });
      if (exitstingCategory) {
        throw new Error("Tên danh mục này đã tồn tại");
      }
      updateCategory.name = name;
      updateCategory.slug = slugify(name, {
        lower: true,
        strict: true,
        locale: "vi",
      });
    }
    if (icon !== undefined) updateCategory.icon = icon;
    if (description !== undefined) updateCategory.description = description;
    if (status !== undefined) updateCategory.status = status;
    if (parentId !== undefined) {
      updateCategory.parentId = parentId === "" ? null : parentId;
    }

    await updateCategory.save();
    return { updateCategory };
  } catch (error) {
    console.log("Lỗi khi gọi updateCategoryService: ", error);
    throw new Error("Không thể cập nhật danh mục");
  }
};

exports.deleteCategoryService = async (id) => {
  try {
    const deleteCategory = await Category.findById(id);

    if (!deleteCategory) {
      throw new Error("Không tìm thấy danh mục này");
    }

    deleteCategory.status = "hidden";
    await deleteCategory.save();

    return { deleteCategory };
  } catch (error) {
    console.log("Lỗi khi gọi deleteCategoryService: ", error);
    throw new Error("Không thể xóa danh mục");
  }
};

exports.restoreCategoryService = async (id) => {
  try {
    const restoreCategory = await Category.findById(id);
    if (!restoreCategory) {
      throw new Error("Không tìm thấy danh mục này");
    }

    // Kiểm tra nếu nó vốn đã active rồi thì báo lỗi
    if (restoreCategory.status === "active") {
      throw new Error("Danh mục này đang ở trạng thái hoạt động rồi");
    }

    // Thực hiện khôi phục
    restoreCategory.status = "active";
    await restoreCategory.save();

    return { restoreCategory };
  } catch (error) {
    console.log("Lỗi khi gọi restoreCategoryService: ", error);
    throw new Error("Không thể khôi phục danh mục");
  }
};

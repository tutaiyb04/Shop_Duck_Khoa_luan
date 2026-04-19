const categoryService = require("../services/categoryService");

// Hàm lấy danh sách tất cả các danh mục đang "active"
exports.getPublicCategories = async (req, res) => {
  try {
    const { publicCategories } = await categoryService.getPublicCategories();

    return res.status(200).json({
      message: "Lấy danh sách danh mục thành công",
      category: publicCategories,
    });
  } catch (error) {
    console.error("Lỗi khi gọi getPublicCategories: ", error);
    return res.status(500).json({
      message: error.message || "Lỗi server khi lấy danh sách danh mục",
    });
  }
};

exports.getAdminCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const type = req.query.type || "parent";

    const { adminCategories, totalPages, currentPage } =
      await categoryService.getAdminCategories(page, limit, type);

    return res.status(200).json({
      message: "Lấy danh sách mục cho admin thành công",
      category: adminCategories,
      totalPages,
      currentPage,
    });
  } catch (error) {
    console.error("Lỗi khi gọi getAdminCategories:", error);
    return res.status(500).json({
      message:
        error.message || "Lỗi server khi lấy danh sách danh mục cho admin",
    });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, icon, description, parentId } = req.body;

    const { newCategory } = await categoryService.createCategoryService(
      name,
      icon,
      description,
      parentId,
    );

    return res
      .status(201)
      .json({ message: "Tạo danh mục thành công", category: newCategory });
  } catch (error) {
    console.log("Lỗi khi gọi createCategory: ", error);
    return res
      .status(500)
      .json({ message: error.message || "Lỗi server tạo danh mục" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, description, status, parentId } = req.body;

    const { updateCategory } = await categoryService.updateCategoryService(
      id,
      name,
      icon,
      description,
      status,
      parentId,
    );

    return res.status(200).json({
      message: "Cập nhật danh mục thành công",
      category: updateCategory,
    });
  } catch (error) {
    console.log("Lỗi khi gọi updateCategory: ", error);
    return res
      .status(500)
      .json({ message: error.message || "Lỗi server khi cập nhật danh mục" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const { deleteCategory } = await categoryService.deleteCategoryService(id);

    return res.status(200).json({
      message: "Xóa danh mục thành công",
      category: deleteCategory,
    });
  } catch (error) {
    console.log("Lỗi khi gọi deleteCategory: ", error);
    return res
      .status(500)
      .json({ message: error.message || "Lỗi server khi xóa danh mục" });
  }
};

exports.restoreCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const { restoreCategory } =
      await categoryService.restoreCategoryService(id);

    return res.status(200).json({
      message: "Khôi phục thành công",
      category: restoreCategory,
    });
  } catch (error) {
    console.log("Lỗi khi gọi restoreCategory: ", error);
    return res
      .status(500)
      .json({ message: error.message || "Lỗi server khi khôi phục danh mục" });
  }
};

exports.getAllParentsForModal = async (req, res) => {
  try {
    const { parentsForModal } =
      await categoryService.getAllParentsForModalService();
    return res.status(200).json({
      message: "Thành công",
      category: parentsForModal,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

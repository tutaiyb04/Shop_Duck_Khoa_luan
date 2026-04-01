const Category = require("../model/Category");

const CategoryController = {
  // Hàm lấy danh sách tất cả các danh mục đang "active"
  getAllCategories: async (req, res) => {
    try {
      const categories = await Category.find({ status: "active" }).select(
        "-__v",
      ); // select('-__v') để ẩn trường nội bộ của mongo
      return res.status(200).json(categories);
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
      return res
        .status(500)
        .json({ message: "Lỗi server khi lấy danh sách danh mục" });
    }
  },
};

module.exports = CategoryController;

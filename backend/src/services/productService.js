const Product = require("../model/Product");

exports.getAllProductsService = async () => {
  try {
    const products = await Product.find({ status: "AVAILABLE" })
      .populate("sellerId", "username avatar")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    return { products };
  } catch (error) {
    console.error("Lỗi tại getAllProductsService: ", error);
    throw new Error("Không thể lấy danh sách sản phẩm");
  }
};

exports.createProductService = async (sellerId, productData, files) => {
  try {
    const { name, category, price, condition, description, shippingInfo } =
      productData;

    // Lấy danh sách link ảnh đã được Cloudinary xử lý
    const imageUrls = [];
    if (files && files.length > 0) {
      for (const file of files) {
        imageUrls.push(file.path);
      }
    }

    // Kiểm tra phải có ít nhất 1 ảnh
    if (imageUrls.length === 0) {
      throw new Error("Vui lòng tải lên ít nhất 1 hình ảnh sản phẩm.");
    }

    // Tạo mới sản phẩm
    const newProduct = new Product({
      name,
      category,
      price: Number(price), // Đảm bảo lưu dưới dạng số
      condition,
      description,
      shippingInfo,
      images: imageUrls,
      sellerId: sellerId,
    });

    // Lưu vào Database
    await newProduct.save();

    return { newProduct };
  } catch (error) {
    console.error("Lỗi tại createProductService: ", error);
    throw error; // Ném lỗi ra để Controller bắt đư
  }
};

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

exports.getAdminProductsService = async (filters) => {
  try {
    const { search, category, status } = filters;

    // Khởi tạo điều kiện truy vấn trống
    let query = {};

    // Nếu có từ khóa tìm kiếm -> Lọc gần đúng theo tên (không phân biệt hoa thường)
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Nếu có chọn danh mục
    if (category) {
      query.category = category;
    }

    // Nếu có chọn trạng thái
    if (status) {
      query.status = status;
    }

    const products = await Product.find(query)
      .populate("category", "name")
      .populate("sellerId", "username email avatar")
      .sort({ createdAt: -1 });

    return { products };
  } catch (error) {
    console.error("Lỗi tại getAdminProductsService: ", error);
    throw new Error("Không thể lấy danh sách sản phẩm");
  }
};

exports.getProductByIdService = async (id) => {
  try {
    const product = await Product.findById(id)
      .populate("sellerId", "username avatar") // Lấy tên và ảnh đại diện người bán
      .populate("category", "name"); // Lấy tên danh mục

    if (!product) {
      throw new Error("Không tìm thấy sản phẩm");
    }

    return { product };
  } catch (error) {
    console.error("Lỗi tại getProductByIdService: ", error);
    throw error;
  }
};

exports.updateProductStatusService = async (productId, status, note) => {
  try {
    // Tìm sản phẩm
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Không tìm thấy sản phẩm này");
    }

    // Cập nhật trạng thái
    product.status = status;

    // Nếu có ghi chú từ Admin
    if (note) {
      product.adminNote = note;
    }

    const updatedProduct = await product.save();
    return { updatedProduct };
  } catch (error) {
    console.error("Lỗi tại updateProductStatusService: ", error);
    throw new Error(`Không thể cập nhật trạng thái thành ${status}`);
  }
};

exports.createProductService = async (sellerId, productData, files) => {
  try {
    const {
      name,
      category,
      price,
      condition,
      description,
      location,
      lat,
      lng,
      address,
    } = productData;

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
      images: imageUrls,
      address,
      location: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)], // Lưu theo thứ tự [lng, lat]
      },
      sellerId: sellerId,
      status: "PENDING",
    });

    // Lưu vào Database
    await newProduct.save();

    return { newProduct };
  } catch (error) {
    console.error("Lỗi tại createProductService: ", error);
    throw error; // Ném lỗi ra để Controller bắt đư
  }
};

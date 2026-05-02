const mongoose = require("mongoose");
const Product = require("../model/Product");
const Order = require("../model/Order");
const Category = require("../model/Category");

const PRODUCT_CONDITIONS = ["Mới", "Như mới", "Tốt", "Trung bình", "Kém"];

const AGG_MAX_MS = Math.max(
  3000,
  parseInt(process.env.PRICING_AGG_MAX_TIME_MS || "", 10) || 8000,
);

// chuyển các thuộc tính sản phẩm thành 1 mảng các cặp [key, value]
const normalizeAttributePairs = (attributes) => {
  const pairs = [];

  if (!attributes || typeof attributes !== "object" || Array.isArray(attributes)) {
    return pairs;
  }

  // lặp qua từng cặp key, value trong attributes
  for (const [rawKey, rawVal] of Object.entries(attributes)) {
    // nếu key không phải là string, thì bỏ qua
    if (typeof rawKey !== "string") {
      continue;
    }

    // lấy key và value từ rawKey và rawVal
    const key = rawKey.trim().slice(0, 64);
    
    if (!key) {
      continue;
    }
    
    // lấy value từ rawVal
    const val =
      rawVal == null ? "" : String(rawVal).trim().slice(0, 256);
    
    if (!val) {
      continue;
    }

    pairs.push([key, val]);
  }
  return pairs;
}

// lấy mảng các cặp từ normalizeAttributePairs biến đổi thành dạng object mà MongoDB có thể hiểu
const attributeEqualityMatch = (pairs, pathPrefix) => {
  // tạo 1 object rỗng để lưu trữ các cặp key, value
  const out = {};

  // lặp qua từng cặp key, value trong pairs
  for (const [key, val] of pairs) {
    out[`${pathPrefix}.${key}`] = val;
  }

  return out;
}

// làm tròn giá thành VND
const roundVnd = (n) => {
  if (n == null || Number.isNaN(n)) return null;
  return Math.round(Number(n));
}


// nhận kết quả từ mongoDB và định dạng lại thành 1 object - sử dụng roundVnd để làm tròn giá thành VND
const statsRow = (count, avgPrice, minPrice, maxPrice) => {
  return {
    count: count || 0,
    avgPrice: avgPrice != null ? roundVnd(avgPrice) : null,
    minPrice: minPrice != null ? roundVnd(minPrice) : null,
    maxPrice: maxPrice != null ? roundVnd(maxPrice) : null,
  };
}

// xác định độ tin cậy của gợi ý giá dựa trên số lượng sản phẩm đang bán và đã bán
const confidenceFromCounts = (marketCount, soldCount) => {
  const total = (marketCount || 0) + (soldCount || 0);

  // Nếu có trên 30 mẫu tổng cộng và ít nhất 3 mẫu từ mỗi nguồn (đang bán và đã bán) -> high
  if (total >= 30 && marketCount >= 3 && soldCount >= 3) {
    return "high";
  }

  // nếu có trên 10 mẫu tổng cộng và ít nhất 2 mẫu từ mỗi nguồn (đang bán và đã bán) -> medium
  if (total >= 10 && (marketCount >= 2 || soldCount >= 2)) {
    return "medium";
  }

  // nếu có ít hơn 1 mẫu tổng cộng -> low
  if (total >= 1) {
    return "low";
  }

  return "none";
}

// thuật toán pha trộn gợi ý giá dựa trên giá trung bình của sản phẩm đang bán và đã bán - 45% giá đang bán và 55% dựa trên giá đã bán
const blendSuggestedPrice = (market, sold) => {
  const marketCount = market?.count || 0;  // số lượng sản phẩm đang bán
  const soldCount = sold?.count || 0;  // số lượng sản phẩm đã bán
  const marketAvgPrice = market?.avgPrice;  // giá trung bình của sản phẩm đang bán
  const soldAvgPrice = sold?.avgPrice;  // giá trung bình của sản phẩm đã bán

  // nếu tìm thấy cả sản phẩm tương tự đang bán (mc > 0) và đã bán (sc > 0) -> pha trộn giá trung bình của sản phẩm đang bán và đã bán
  if (marketCount > 0 && soldCount > 0 && marketAvgPrice != null && soldAvgPrice != null) {
    return roundVnd(0.45 * marketAvgPrice + 0.55 * soldAvgPrice);
  }

  // nếu chỉ có sản phẩm đã bán (sc > 0) -> dựa trên giá đã bán
  if (soldCount > 0 && soldAvgPrice != null) {
    return soldAvgPrice;
  }

  // nếu chỉ có sản phẩm đang bán (mc > 0) -> dựa trên giá đang bán
  if (marketCount > 0 && marketAvgPrice != null) {
    return marketAvgPrice;
  }

  return null;
}

// nhãn phương pháp dựa trên số lượng sản phẩm đang bán và đã bán
const methodLabel = (market, sold) => {
  const marketCount = market?.count || 0; 
  const soldCount = sold?.count || 0;

  if (marketCount > 0 && soldCount > 0) {
    return "blend_market_and_completed_orders"; // Giá gợi ý được tổng hợp từ cả các tin đang đăng và lịch sử giao dịch
  }

  if (soldCount > 0) {
    return "completed_orders_avg";  // Giá gợi ý được tính toán từ giá trung bình của tất cả đơn đã hoàn thành
  }

  if (marketCount > 0) {
    return "active_listings_avg"; // Giá gợi ý được tính toán từ giá trung bình của tất cả các tin đang đăng
  }

  return "insufficient_data";
}

// tính toán thống kê giá trung bình, giá thấp nhất, giá cao nhất của sản phẩm đang bán
const aggregateMarketStats = async (categoryOid, condition, attrPairs, excludeSellerOid) => {
  const match = {
    category: categoryOid,
    status: "AVAILABLE",
    ...attributeEqualityMatch(attrPairs, "attributes"),
  };
  // nếu có điều kiện -> thêm điều kiện vào match
  if (condition && PRODUCT_CONDITIONS.includes(condition)) {
    match.condition = condition;
  }

  // nếu có excludeSellerOid -> thêm điều kiện vào match
  if (excludeSellerOid) {
    match.sellerId = { $ne: excludeSellerOid }; // loại trừ sản phẩm của chính người bán
  }

  // tạo pipeline để tính toán thống kê giá trung bình, giá thấp nhất, giá cao nhất của sản phẩm đang bán
  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
  ];

  // thực thi pipeline và lấy kết quả
  const rows = await Product.aggregate(pipeline).option({ maxTimeMS: AGG_MAX_MS });

  const r = rows[0];

  if (!r) {
    return statsRow(0, null, null, null);
  }

  return statsRow(r.count, r.avgPrice, r.minPrice, r.maxPrice);
}

// tìm các đơn hàng đã thành công -> tổng hợp dữ liệu dựa trên giá thị trường
const aggregateSoldStats = async (categoryOid, condition, attrPairs) => {
  // tạo điều kiện cơ bản cho match
  const baseMatch = {
    status: "COMPLETED",
  };

  // tạo điều kiện cho productSlice
  const productSlice = {
    "product.category": categoryOid,
    ...attributeEqualityMatch(attrPairs, "product.attributes"),
  };

  // nếu có điều kiện -> thêm điều kiện vào productSlice
  if (condition && PRODUCT_CONDITIONS.includes(condition)) {
    productSlice["product.condition"] = condition;
  }

  const pipeline = [
    { $match: baseMatch },
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $unwind: {
        path: "$product",
        preserveNullAndEmptyArrays: false,
      },
    },
    { $match: productSlice },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        avgPrice: { $avg: "$unitPrice" },
        minPrice: { $min: "$unitPrice" },
        maxPrice: { $max: "$unitPrice" },
      },
    },
  ];

  const rows = await Order.aggregate(pipeline).option({ maxTimeMS: AGG_MAX_MS });

  const r = rows[0];
  
  if (!r) {
    return statsRow(0, null, null, null);
  }
  
  return statsRow(r.count, r.avgPrice, r.minPrice, r.maxPrice);
}

exports.getPricingSuggestion = async (opts = {}) => {
  // lấy các tham số từ opts
  const { categoryId, condition, attributes, excludeSellerId } = opts;

  if (!categoryId || typeof categoryId !== "string") {
    const err = new Error("Thiếu hoặc sai categoryId");
    err.statusCode = 400;
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    const err = new Error("categoryId không hợp lệ");
    err.statusCode = 400;
    throw err;
  }

  if (condition != null && condition !== "" && !PRODUCT_CONDITIONS.includes(condition)) {
    const err = new Error(`condition phải thuộc: ${PRODUCT_CONDITIONS.join(", ")}`);
    err.statusCode = 400;
    throw err;
  }

  const categoryOid = new mongoose.Types.ObjectId(categoryId);
  const catExists = await Category.exists({ _id: categoryOid });
  if (!catExists) {
    const err = new Error("Không tìm thấy danh mục");
    err.statusCode = 404;
    throw err;
  }

  // chuyển các thuộc tính sản phẩm thành 1 mảng các cặp [key, value]
  const attrPairs = normalizeAttributePairs(attributes);

  // nếu có excludeSellerId -> chuyển thành ObjectId
  let excludeSellerOid = null;
  if (excludeSellerId) {
    if (!mongoose.Types.ObjectId.isValid(excludeSellerId)) {
      const err = new Error("excludeSellerId không hợp lệ");
      err.statusCode = 400;
      throw err;
    }
    excludeSellerOid = new mongoose.Types.ObjectId(excludeSellerId);
  }

  // tính toán thống kê giá trung bình, giá thấp nhất, giá cao nhất của sản phẩm đang bán và đã bán
  const [market, sold] = await Promise.all([
    aggregateMarketStats(
      categoryOid,
      condition || null,
      attrPairs,
      excludeSellerOid,
    ),
    aggregateSoldStats(categoryOid, condition || null, attrPairs),
  ]);


  const suggestedPriceVnd = blendSuggestedPrice(market, sold); // tính mức giá trung bình
  const confidence = confidenceFromCounts(market.count, sold.count); // đánh giá độ tin cậy của gợi ý giá

  // tính toán giá thấp nhất và cao nhất -> tạo khoảng tham khảo
  const rangeMin =
    [market.minPrice, sold.minPrice].filter((x) => x != null).length > 0
      ? Math.min(...[market.minPrice, sold.minPrice].filter((x) => x != null))
      : null;
  const rangeMax =
    [market.maxPrice, sold.maxPrice].filter((x) => x != null).length > 0
      ? Math.max(...[market.maxPrice, sold.maxPrice].filter((x) => x != null))
      : null;

  // tạo kết quả gợi ý giá
  const suggestion = {
    suggestedPriceVnd,
    priceRangeVnd:
      rangeMin != null && rangeMax != null
        ? { min: rangeMin, max: rangeMax }
        : null,
    basedOn: {
      activeListings: market,
      completedOrders: sold,
    },
    confidence,
    method: methodLabel(market, sold),
    filtersApplied: {
      categoryId,
      condition: condition || null,
      attributeKeys: attrPairs.map(([k]) => k),
      excludedOwnListings: Boolean(excludeSellerOid),
    },
  };

  if (suggestedPriceVnd == null) {
    suggestion.insufficientData = true;
    suggestion.hint =
      "Chưa có đủ sản phẩm cùng bộ lọc (danh mục + tình trạng + thuộc tính). Thử bỏ thuộc tính hoặc điều kiện để có mẫu rộng hơn.";
  }

  return suggestion;
}


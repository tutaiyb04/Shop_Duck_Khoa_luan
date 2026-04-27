const { escapeRegexForSearch } = require("../utils/escapeRegex");

const PRODUCT_CONDITIONS = ["Mới", "Như mới", "Tốt", "Trung bình", "Kém"];

/** Lọc giá / tình trạng / tỉnh (chuỗi con trong địa chỉ) — dùng chung geo + find */
const applyExtraListingFilters = (query, extra) => {
  const { minPrice, maxPrice, condition, province } = extra || {};

  const minP =
    minPrice !== undefined && minPrice !== "" && minPrice != null
      ? Number(minPrice)
      : null;

  const maxP =
    maxPrice !== undefined && maxPrice !== "" && maxPrice != null
      ? Number(maxPrice)
      : null;

  const price = {};
  if (minP !== null && Number.isFinite(minP)) {
    price.$gte = minP
  };

  if (maxP !== null && Number.isFinite(maxP)) {
    price.$lte = maxP
  };

  if (Object.keys(price).length) {
    query.price = price;
  }

  const c = (condition || "").trim();
  
  if (c && PRODUCT_CONDITIONS.includes(c)) {
    query.condition = c;
  }
  
  const p = (province || "").trim();
  
  if (p) {
    query.address = {
      $regex: escapeRegexForSearch(p),
      $options: "i",
    };
  }
}

const truthyQueryFlag = (v) => {
  if (v === undefined || v === null || v === "") return false;
  const s = String(v).trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes";
}

module.exports = {
    PRODUCT_CONDITIONS,
    applyExtraListingFilters,
    truthyQueryFlag
  };
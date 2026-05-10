const mongoose = require("mongoose");
const User = require("../model/User");
const Category = require("../model/Category");

const POSITIVE_ORDER_STATUSES = ["COMPLETED"];
const POSITIVE_RATING_MIN = 3;  // mức đánh giá tối thiểu để được tính điểm
const VIP_BOOST = 2; // boost cho user VIP
const MAX_LIMIT = 48; // số sản phẩm tối đa trả về
const DEFAULT_LIMIT = 12; // số sản phẩm mặc định trả về

// Số similar users tối đa giữ lại sau AGG1. ~50 cho cân bằng chất lượng/tốc độ.
const MAX_SIMILAR_USERS = Math.max(
    10,
    parseInt(process.env.CF_MAX_SIMILAR_USERS || "", 10) || 50,
);
  
// giới hạn số lượng sản phẩm cũ cần loại trừ khi gợi ý
const MAX_INTERACTED_IDS = Math.max(
    100,
    parseInt(process.env.CF_MAX_INTERACTED_IDS || "", 10) || 500,
);
  
// Thời gian chờ tối đa cho mỗi aggregation (ms)
const AGG_MAX_TIME_MS = Math.max(
    1000,
    parseInt(process.env.CF_AGG_MAX_TIME_MS || "", 10) || 5000,
);

// thời gian tồn tại của cache trong Mongo (giây)
const MONGO_CACHE_TTL_SEC = Math.max(
    60 * 30,
    parseInt(process.env.CF_MONGO_CACHE_TTL_SEC || "", 10) || 6 * 60 * 60, // 6h
);
  
// ngưỡng thời gian ôi thiu của dữ liệu -> dữ liệu cũ hơn -> tính toán lại
const MONGO_CACHE_STALE_AFTER_SEC = Math.max(
    60 * 15,
    parseInt(process.env.CF_MONGO_CACHE_STALE_AFTER_SEC || "", 10) || 4 * 60 * 60,
);

// từ khóa dừng đơn giản (tiếng Việt) -> dùng cho CBF
const VI_STOPWORDS = new Set([
    "và",
    "của",
    "cho",
    "với",
    "một",
    "các",
    "được",
    "là",
    "có",
    "trong",
    "về",
    "này",
    "khi",
    "theo",
    "không",
    "người",
    "như",
    "từ",
    "đã",
    "ở",
    "sẽ",
    "bạn",
    "tôi",
    "em",
    "anh",
    "chị",
    "shop",
    "sp",
    "sản",
    "phẩm",
    "hàng",
    "mới",
    "cũ",
]);

// Chuyển đổi string thành ObjectId
const toObjectId = (raw) => new mongoose.Types.ObjectId(String(raw));

// Loại bỏ các ID trùng lặp
const dedupeObjectIds = (ids) =>
  Array.from(new Set(ids.map((id) => String(id))))
    .filter((id) => mongoose.isValidObjectId(id))
    .map(toObjectId);

// hàm băm nhỏ văn bản cho CBF
function tokenizeText(str) {
  const s = String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return s
    .split(/[^\p{L}\p{N}]+/u)
    .map((x) => x.trim())
    .filter((x) => x.length >= 2 && !VI_STOPWORDS.has(x));
}

// gom text từ sản phẩm thành các từ khóa cho CBF
function tokenizeProductText(product) {
  const chunks = [product.name, product.description]; // lấy tên và mô tả sản phẩm đưa vào mảng
  // lấy các thuộc tính của sản phẩm
  const attrs = product.attributes;
  // Mongoose Map trong lean thường là object thường
  if (attrs) {
    // nếu là Map thì lấy từng giá trị
    if (typeof attrs.get === "function") {
      attrs.forEach((v) => chunks.push(String(v))); // đưa từng giá trị vào mảng
    } 
    else if (typeof attrs === "object" && !Array.isArray(attrs)) {
      for (const v of Object.values(attrs)) {
        chunks.push(String(v));
      }
    }
  }
  return new Set(tokenizeText(chunks.join(" ")));
}

// tính toán độ tương đồng giữa hai tập từ khóa
function diceCoefficient(setA, setB) {
  if (!setA.size || !setB.size) return 0;
  let inter = 0;
  for (const t of setA) {
    if (setB.has(t)) inter += 1;
  }
  return (2 * inter) / (setA.size + setB.size);
}

// lấy danh sách sản phẩm yêu thích của user
const loadWishlistProductIds = async (userId) => {
  const u = await User.findById(userId)
    .select("buyerProfile.wishlist")
    .lean()
    .maxTimeMS(AGG_MAX_TIME_MS);
  const raw = u?.buyerProfile?.wishlist || [];
  return dedupeObjectIds(raw.map((x) => x));
};

// gắn seller (username, avatar) + category (name) cho danh sách sản phẩm lean
const hydrateRecommendationProducts = async (items) => {
  if (!items.length) return [];

  const sellerIds = [
    ...new Set(items.map((p) => String(p.sellerId?._id || p.sellerId))),
  ].filter((id) => mongoose.isValidObjectId(id));
  
  const catIds = [
    ...new Set(items.map((p) => String(p.category?._id || p.category))),
  ].filter((id) => mongoose.isValidObjectId(id));

  const [sellers, cats] = await Promise.all([
    User.find({ _id: { $in: sellerIds } })
      .select("username avatar")
      .lean()
      .maxTimeMS(AGG_MAX_TIME_MS),
    Category.find({ _id: { $in: catIds } })
      .select("name")
      .lean()
      .maxTimeMS(AGG_MAX_TIME_MS),
  ]);
  
  const sm = new Map(sellers.map((s) => [String(s._id), s])); // gom seller vào map
  const cm = new Map(cats.map((c) => [String(c._id), c])); // gom category vào map

  return items.map((p) => {
    const sid = String(p.sellerId?._id || p.sellerId);
    const cid = String(p.category?._id || p.category);
    return {
      ...p,
      sellerId: sm.get(sid) || p.sellerId,
      category: cm.get(cid) || p.category,
    };
  });
};

// hàm trộn gợi ý collaborative và content-based
const mergeCfAndCbf = (cfList, cbfList, limitN) => {
  const byId = new Map();

  for (const p of cfList) {
    const id = String(p._id);
    const raw = Number(p.recommendation?.score ?? 0) || 0;
    byId.set(id, { product: p, cf: raw, cbf: 0 });
  }

  for (const p of cbfList) {
    const id = String(p._id);
    const raw = Number(p.recommendation?.score ?? 0) || 0;
    const ex = byId.get(id);
    if (ex) {
      ex.cbf = raw;
    } else {
      byId.set(id, { product: p, cf: 0, cbf: raw });
    }
  }

  const rows = [];
  for (const { product, cf, cbf } of byId.values()) {
    const blend = Math.log1p(cf) * 1.25 + Math.log1p(cbf) * 1.0;
    let method = "hybrid";
    if (cf > 0 && cbf === 0) method = "collaborative";
    else if (cbf > 0 && cf === 0) method = "content";

    const baseRec =
      product.recommendation && typeof product.recommendation === "object"
        ? { ...product.recommendation }
        : {};

    rows.push({
      ...product,
      recommendation: {
        ...baseRec,
        score: Math.round(blend * 1000) / 1000,
        method,
        cfScore: cf,
        cbfScore: cbf,
      },
    });
  }

  rows.sort(
    (a, b) => (b.recommendation?.score || 0) - (a.recommendation?.score || 0),
  );
  return rows.slice(0, limitN);
};

module.exports = {
  // Hằng số lõi
  POSITIVE_ORDER_STATUSES,
  POSITIVE_RATING_MIN,
  VIP_BOOST,
  MAX_LIMIT,
  DEFAULT_LIMIT,
  MAX_SIMILAR_USERS,
  MAX_INTERACTED_IDS,
  AGG_MAX_TIME_MS,
  // Hằng số Cache
  MONGO_CACHE_TTL_SEC,
  MONGO_CACHE_STALE_AFTER_SEC,
  // Hàm Helper
  toObjectId,
  dedupeObjectIds,
  // Content-based
  tokenizeText,
  tokenizeProductText,
  diceCoefficient,
  loadWishlistProductIds,
  hydrateRecommendationProducts,
  mergeCfAndCbf
};
const mongoose = require("mongoose");

const POSITIVE_ORDER_STATUSES = ["PAID", "SHIPPING", "COMPLETED"];
const POSITIVE_RATING_MIN = 3;
const VIP_BOOST = 2;
const MAX_LIMIT = 48;
const DEFAULT_LIMIT = 12;

// Số similar users tối đa giữ lại sau AGG1. ~50 cho cân bằng chất lượng/tốc độ.
const MAX_SIMILAR_USERS = Math.max(
    10,
    parseInt(process.env.CF_MAX_SIMILAR_USERS || "", 10) || 50,
);
  
// Trần số sản phẩm trong "interactedIds" (tránh $nin với mảng quá lớn).
// Nếu user đã tương tác > N sản phẩm, ta giữ N gần nhất.
const MAX_INTERACTED_IDS = Math.max(
    100,
    parseInt(process.env.CF_MAX_INTERACTED_IDS || "", 10) || 500,
);
  
// Timeout cho mỗi aggregation (ms). Tránh treo connection pool.
const AGG_MAX_TIME_MS = Math.max(
    1000,
    parseInt(process.env.CF_AGG_MAX_TIME_MS || "", 10) || 5000,
);

  // Thời gian sống của 1 cache doc UserRecommendation (giây).
// Cron sẽ recompute trước khi tới hạn để giữ cache "ấm".
const MONGO_CACHE_TTL_SEC = Math.max(
    60 * 30,
    parseInt(process.env.CF_MONGO_CACHE_TTL_SEC || "", 10) || 6 * 60 * 60, // 6h
);
  
// Khi cache trong Mongo cũ hơn ngưỡng này (giây), coi là "stale" và compute lại
// realtime; nhỏ hơn TTL để có biên an toàn.
const MONGO_CACHE_STALE_AFTER_SEC = Math.max(
    60 * 15,
    parseInt(process.env.CF_MONGO_CACHE_STALE_AFTER_SEC || "", 10) || 4 * 60 * 60,
);

// Chuyển đổi string thành ObjectId
const toObjectId = (raw) => new mongoose.Types.ObjectId(String(raw));

// Loại bỏ các ID trùng lặp
const dedupeObjectIds = (ids) =>
  Array.from(new Set(ids.map((id) => String(id))))
    .filter((id) => mongoose.isValidObjectId(id))
    .map(toObjectId);

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
  dedupeObjectIds
};
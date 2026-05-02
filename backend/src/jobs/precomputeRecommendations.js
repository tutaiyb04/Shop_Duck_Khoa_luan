const Order = require("../model/Order");
const Review = require("../model/Review");
const recommendationService = require("../services/recommendationService");

// chu kỳ chạy - 6 tiếng 1 lần
const DEFAULT_INTERVAL_MS = Math.max(
  60 * 60 * 1000, // tối thiểu 1h để bảo vệ DB
  parseInt(process.env.CF_PRECOMPUTE_INTERVAL_MS || "", 10) ||
    6 * 60 * 60 * 1000, // 6h
);

// chỉ tìm những user có active - mua hoặc đánh giá trong 30 ngày qua
const ACTIVE_DAYS = Math.max(
  1,
  parseInt(process.env.CF_PRECOMPUTE_ACTIVE_DAYS || "", 10) || 30,
);


// số user xử lý mỗi tick - từng cụm 500 user
const BATCH_SIZE = Math.max(
  10,
  parseInt(process.env.CF_PRECOMPUTE_BATCH_SIZE || "", 10) || 500,
);

// đẩy cho 5 user chạy song song
const CONCURRENCY = Math.max(
  1,
  Math.min(20, parseInt(process.env.CF_PRECOMPUTE_CONCURRENCY || "", 10) || 5),
);

// số lượng gợi ý mỗi user - 24 gợi ý
const LIMIT_PER_USER = Math.max(
  6,
  parseInt(process.env.CF_PRECOMPUTE_LIMIT_PER_USER || "", 10) || 24,
);

let timer = null;
let running = false;

// lấy danh sách userId "active" trong N ngày qua
async function getActiveUserIds() {
  const since = new Date(Date.now() - ACTIVE_DAYS * 24 * 60 * 60 * 1000);

  // lấy danh sách userId đã mua và đánh giá trong 30 ngày qua
  const [orderUsers, reviewUsers] = await Promise.all([
    Order.distinct("buyerId", { createdAt: { $gte: since } }),
    Review.distinct("buyerId", { createdAt: { $gte: since } }),
  ]);

  const merged = new Set([
    ...orderUsers.map(String),
    ...reviewUsers.map(String),
  ]);
  return Array.from(merged).slice(0, BATCH_SIZE);
}

// chạy các task với giới hạn concurrency limit
async function runWithConcurrency(items, limit, worker) {
  const results = [];
  let cursor = 0;
  // tạo ra các runner để chạy song song
  const runners = Array.from({ length: Math.min(limit, items.length) }).map(
    async () => {
      while (cursor < items.length) {
        const myIndex = cursor;
        cursor += 1;
        const item = items[myIndex];

        try {
          results[myIndex] = { ok: true, value: await worker(item) };
        } catch (err) {
          results[myIndex] = { ok: false, error: err };
        }
      }
    },
  );
  await Promise.all(runners);
  return results;
}

// chạy 1 lần để tính toán và cache gợi ý cho các user "active"
async function runOnce() {
  if (running) return { skipped: true };
  running = true;

  const startedAt = Date.now();

  try {
    const userIds = await getActiveUserIds();
    if (userIds.length === 0) {
      return { computed: 0, scanned: 0 };
    }

    let okCount = 0;
    let failCount = 0;

    const results = await runWithConcurrency(
      userIds,
      CONCURRENCY,
      async (userId) => {
        await recommendationService.computeAndCacheRecommendations(userId, {
          limit: LIMIT_PER_USER,
        });
      },
    );

    for (const r of results) {
      if (r?.ok) okCount += 1;
      else failCount += 1;
    }

    const elapsed = Date.now() - startedAt;
    console.log(
      `[precomputeRecommendations] xong: ${okCount}/${userIds.length} user ` +
        `(fail=${failCount}), ${elapsed}ms`,
    );

    return {
      computed: okCount,
      failed: failCount,
      scanned: userIds.length,
      elapsedMs: elapsed,
    };
  } catch (err) {
    console.error("[precomputeRecommendations] lỗi:", err);
    return { error: err };
  } finally {
    running = false;
  }
}

// chạy job định kỳ để tính toán và cache gợi ý cho các user "active"
function startPrecomputeRecommendations(intervalMs = DEFAULT_INTERVAL_MS) {
  if (timer) return timer;

  // Chạy ngay 1 lần khi server boot (lệch nhẹ để không đè VIP/cron khác lúc start)
  setTimeout(() => {
    void runOnce();
  }, 30_000).unref?.();

  timer = setInterval(runOnce, intervalMs);
  if (typeof timer.unref === "function") timer.unref();

  console.log(
    `[precomputeRecommendations] Đã bật. Chu kỳ=${intervalMs / 60000} phút, ` +
      `active=${ACTIVE_DAYS}d, batch=${BATCH_SIZE}, concurrency=${CONCURRENCY}.`,
  );
  return timer;
}

// dừng job định kỳ để tính toán và cache gợi ý cho các user "active"
function stopPrecomputeRecommendations() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

module.exports = {
  startPrecomputeRecommendations,
  stopPrecomputeRecommendations,
  runPrecomputeRecommendationsOnce: runOnce,
};

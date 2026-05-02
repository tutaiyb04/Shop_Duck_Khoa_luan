const Redis = require("ioredis");

// thời gian tồn tại của dữ liệu - 30 phút
const TTL_SECONDS = Math.max(
  60,
  parseInt(process.env.REDIS_CF_TTL_SECONDS || "", 10) || 30 * 60,
);

// version để invalidate hàng loạt
const KEY_VERSION = (process.env.REDIS_CF_KEY_VERSION || "v1").trim();
const KEY_PREFIX = `cf:rec:${KEY_VERSION}:`;

let client = null;
let connectAttempted = false;
let healthy = false;

function isEnabled() {
  return Boolean(process.env.REDIS_URL);
}

// lấy client Redis
function getClient() {
  // nếu không bật redis, hoặc đã có kết nối rồi thì không tạo thêm
  if (!isEnabled()) return null;
  if (client) return client;

  // tạo kết nối mới
  connectAttempted = true;
  client = new Redis(process.env.REDIS_URL, {
    // Không retry vô hạn để tránh log nổ; nếu down thì giảm tần suất.
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false,
    retryStrategy: (times) => Math.min(times * 200, 5000),
    lazyConnect: false,
  });

  client.on("connect", () => {
    healthy = true;
    console.log("[redis] connected");
  });
  client.on("ready", () => {
    healthy = true;
  });
  client.on("error", (err) => {
    healthy = false;
    // Chỉ log lỗi đầu tiên, sau đó im lặng để tránh spam log production.
    if (!client.__errorLogged) {
      console.warn(
        "[redis] connection error (cache disabled, fallback to Mongo):",
        err.message,
      );
      client.__errorLogged = true;
    }
  });
  client.on("end", () => {
    healthy = false;
  });
  return client;
}

function buildKey(userId) {
  return `${KEY_PREFIX}${String(userId)}`;
}

// lấy cache
async function getCache(userId) {
  const c = getClient();
  if (!c || !healthy) return null;
  try {
    const raw = await c.get(buildKey(userId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("[redis] getCache error:", e.message);
    return null;
  }
}

// ghi cache
async function setCache(userId, payload, ttlSeconds = TTL_SECONDS) {
  const c = getClient();
  if (!c || !healthy) return false;
  try {
    await c.set(
      buildKey(userId),
      JSON.stringify(payload),
      "EX",
      Math.max(60, ttlSeconds),
    );
    return true;
  } catch (e) {
    console.warn("[redis] setCache error:", e.message);
    return false;
  }
}

// xoá cache
async function delCache(userId) {
  const c = getClient();
  if (!c || !healthy) return false;
  try {
    await c.del(buildKey(userId));
    return true;
  } catch (e) {
    console.warn("[redis] delCache error:", e.message);
    return false;
  }
}

// đóng kết nối
async function closeRedis() {
  if (!client) return;
  try {
    await client.quit();
  } catch {
    /* ignore */
  }
  client = null;
  healthy = false;
  connectAttempted = false;
}

module.exports = {
  getClient,
  getCache,
  setCache,
  delCache,
  closeRedis,
  isEnabled,
  isHealthy: () => healthy,
  KEY_PREFIX,
  TTL_SECONDS,
};

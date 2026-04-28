const {
  autoCancelExpiredPendingVip,
  VIP_PENDING_TTL_MS,
} = require("../services/paymentService");

/**
 * Job định kỳ tự hủy giao dịch VIP `PENDING` quá hạn (mặc định 15 phút).
 * - Chạy ngay khi server khởi động để dọn các bản ghi cũ.
 * - Sau đó lặp mỗi `intervalMs` (mặc định 60 giây).
 * Có cờ chống chạy chồng (overlap) khi DB phản hồi chậm.
 */
const DEFAULT_INTERVAL_MS = Math.max(
  10_000,
  parseInt(process.env.VIP_AUTOCANCEL_INTERVAL_MS || "", 10) || 60 * 1000,
);

let timer = null;
let running = false;

async function runOnce() {
  if (running) return { skipped: true };
  running = true;
  try {
    const { modifiedCount } = await autoCancelExpiredPendingVip();
    if (modifiedCount > 0) {
      console.log(
        `[autoCancelVipPending] Đã hủy ${modifiedCount} giao dịch quá ${
          VIP_PENDING_TTL_MS / 60_000
        } phút.`,
      );
    }
    return { modifiedCount };
  } catch (err) {
    console.error("[autoCancelVipPending]", err);
    return { error: err };
  } finally {
    running = false;
  }
}

function startAutoCancelVipPending(intervalMs = DEFAULT_INTERVAL_MS) {
  if (timer) return timer;
  void runOnce();
  timer = setInterval(runOnce, intervalMs);
  if (typeof timer.unref === "function") timer.unref();
  console.log(
    `[autoCancelVipPending] Đã bật. Hết hạn=${
      VIP_PENDING_TTL_MS / 60_000
    } phút, chu kỳ=${intervalMs / 1000}s.`,
  );
  return timer;
}

function stopAutoCancelVipPending() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

module.exports = {
  startAutoCancelVipPending,
  stopAutoCancelVipPending,
  runAutoCancelVipPendingOnce: runOnce,
};

const {
  expireVipProductsAndNotify,
  VIP_EXPIRE_INTERVAL_MS,
} = require("../services/vipExpiryService");

// biến để lưu trữ timer
let timer = null;
let running = false;

// job định kỳ hủy cờ VIP cho sản phẩm đã quá vipUntil và gửi thông báo cho người bán
async function runOnce() {
  // kiểm tra xem có job nào đang chạy không
  if (running) {
    return { skipped: true };
  }
  
  // đánh dấu là job đang chạy
  running = true;

  try {
    const { cleared } = await expireVipProductsAndNotify();

    if (cleared > 0) {
      console.log(
        `[expireVipProducts] Đã gỡ VIP và thông báo cho ${cleared} tin.`,
      );
    }

    return { cleared };
  } catch (err) {
    console.error("[expireVipProducts]", err);
    return { error: err };
  } finally {
    running = false;
  }
}

// bắt đầu job định kỳ hủy cờ VIP cho sản phẩm đã quá vipUntil và gửi thông báo cho người bán
function startExpireVipProductsJob(intervalMs = VIP_EXPIRE_INTERVAL_MS) {
  // kiểm tra xem có timer nào đang chạy không
  if (timer) {
    return timer;
  }
  
  // chạy job ngay lập tức
  void runOnce();
  // tạo timer định kỳ
  timer = setInterval(runOnce, intervalMs);
  
  // tắt timer khi server shutdown
  if (typeof timer.unref === "function") timer.unref();
  console.log(
    `[expireVipProducts] Đã bật. Chu kỳ=${intervalMs / 1000}s.`,
  );

  return timer;
}

function stopExpireVipProductsJob() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

module.exports = {
  startExpireVipProductsJob,
  stopExpireVipProductsJob,
  runExpireVipProductsOnce: runOnce,
};

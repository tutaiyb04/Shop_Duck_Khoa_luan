const Order = require("../model/Order");
const Review = require("../model/Review");
const Product = require("../model/Product");
const Notification = require("../model/Notification");
const notificationService = require("../services/notificationService");

/**
 * Job định kỳ nhắc người mua đánh giá đơn đã hoàn tất.
 *
 *   - Sau `REMIND_AFTER_HOURS` giờ kể từ khi đơn `COMPLETED`, nếu buyer chưa
 *     viết Review cho đơn đó thì gửi 1 thông báo `REVIEW_REMINDER`.
 *   - Mỗi đơn CHỈ được nhắc 1 lần (kiểm tra `Notification.exists` theo
 *     relatedId + type) ⇒ tránh spam mỗi tick.
 *   - Có cờ `running` chống chạy chồng (overlap) khi DB phản hồi chậm.
 *   - `setInterval` + `unref()` để Node có thể thoát sạch khi shutdown test.
 *
 * Cấu hình qua env (tuỳ chọn):
 *   - REVIEW_REMINDER_AFTER_HOURS  : số giờ chờ sau khi đơn COMPLETED (default 72)
 *   - REVIEW_REMINDER_INTERVAL_MS  : chu kỳ tick (default 1 giờ)
 *   - REVIEW_REMINDER_BATCH_SIZE   : số đơn xử lý mỗi tick (default 200)
 */

const REMIND_AFTER_HOURS = Math.max(
  1,
  parseInt(process.env.REVIEW_REMINDER_AFTER_HOURS || "", 10) || 72,
);

const DEFAULT_INTERVAL_MS = Math.max(
  60_000, // tối thiểu 1 phút (an toàn cho DB)
  parseInt(process.env.REVIEW_REMINDER_INTERVAL_MS || "", 10) || 60 * 60 * 1000,
);

const BATCH_SIZE = Math.max(
  10,
  parseInt(process.env.REVIEW_REMINDER_BATCH_SIZE || "", 10) || 200,
);

let timer = null;
let running = false;

// job định kỳ nhắc người mua đánh giá đơn đã hoàn tất
async function runOnce() {
  // khởi động và chống dẫm chân lên nhau - đảm bảo quét lần trước xong mới đến cái tiếp théo
  if (running) return { skipped: true };
  running = true;

  try {
    // tính thời gian cắt (cutoff) để lấy lô đơn COMPLETED đã quá hạn nhắc
    const cutoff = new Date(Date.now() - REMIND_AFTER_HOURS * 3600 * 1000);

    // Lấy lô đơn COMPLETED đã quá hạn nhắc, cũ nhất trước.
    const orders = await Order.find({
      status: "COMPLETED",
      createdAt: { $lte: cutoff },
    })
      .select("_id buyerId productId")
      .sort({ createdAt: 1 })
      .limit(BATCH_SIZE)
      .lean();

    if (orders.length === 0) return { sent: 0, scanned: 0 };

    const orderIds = orders.map((o) => o._id);

    // Loại các đơn đã có Review + đã từng được nhắc (chống spam).
    const [reviewed, reminded] = await Promise.all([
      Review.find({ orderId: { $in: orderIds } })
        .select("orderId")
        .lean(),
      Notification.find({
        type: "REVIEW_REMINDER",
        relatedId: { $in: orderIds },
      })
        .select("relatedId")
        .lean(),
    ]);

    const skipSet = new Set([
      ...reviewed.map((r) => String(r.orderId)),
      ...reminded.map((n) => String(n.relatedId)),
    ]);

    const todo = orders.filter((o) => !skipSet.has(String(o._id)));

    if (todo.length === 0) return { sent: 0, scanned: orders.length };

    // Lấy tên sản phẩm 1 lần cho cả batch (giảm số query).
    const productIds = [...new Set(todo.map((o) => String(o.productId)))];
    const products = await Product.find({ _id: { $in: productIds } })
      .select("name")
      .lean();
    const nameById = new Map(products.map((p) => [String(p._id), p.name]));

    let sent = 0;
    for (const o of todo) {
      try {
        await notificationService.notifyReviewReminder({
          buyerId: o.buyerId,
          orderId: o._id,
          productName: nameById.get(String(o.productId)),
        });
        sent += 1;
      } catch (e) {
        console.error("[reviewReminder] notify lỗi:", e.message);
      }
    }

    if (sent > 0) {
      console.log(
        `[reviewReminder] Đã nhắc ${sent}/${orders.length} đơn quá ${REMIND_AFTER_HOURS}h chưa đánh giá.`,
      );
    }

    return { sent, scanned: orders.length };
  } catch (err) {
    console.error("[reviewReminder]", err);
    return { error: err };
  } finally {
    running = false;
  }
}

function startReviewReminder(intervalMs = DEFAULT_INTERVAL_MS) {
  if (timer) return timer;

  // Chạy ngay 1 lần khi server boot để dọn các đơn cũ.
  void runOnce();

  timer = setInterval(runOnce, intervalMs);
  if (typeof timer.unref === "function") timer.unref();

  console.log(
    `[reviewReminder] Đã bật. Sau ${REMIND_AFTER_HOURS}h, chu kỳ=${
      intervalMs / 1000
    }s.`,
  );
  return timer;
}

function stopReviewReminder() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

module.exports = {
  startReviewReminder,
  stopReviewReminder,
  runReviewReminderOnce: runOnce,
  REMIND_AFTER_HOURS,
};

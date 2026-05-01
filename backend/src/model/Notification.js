const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 *  ORDER_CONFIRMED   – Người bán xác nhận chốt đơn  → gửi NGƯỜI MUA       (ref: Order)
 *  REVIEW_REMINDER   – Nhắc nhở đánh giá sau khi nhận hàng → gửi NGƯỜI MUA  (ref: Order)
 *  REVIEW_RECEIVED   – Có người đánh giá tin của bạn → gửi NGƯỜI BÁN       (ref: Review)
 *  PRODUCT_APPROVED  – Tin đăng được admin duyệt    → gửi NGƯỜI BÁN       (ref: Product)
 *  PRODUCT_REJECTED  – Tin bị từ chối / khóa (kèm lý do) → gửi NGƯỜI BÁN  (ref: Product)
 *  PRODUCT_HIDDEN    – Tin bị admin ẩn              → gửi NGƯỜI BÁN       (ref: Product)
 *  PRODUCT_LIKED     – Có người thích sản phẩm      → gửi NGƯỜI BÁN       (ref: Product)
 */
const NOTIFICATION_TYPES = [
  "ORDER_CONFIRMED",
  "REVIEW_REMINDER",
  "REVIEW_RECEIVED",
  "PRODUCT_APPROVED",
  "PRODUCT_REJECTED",
  "PRODUCT_HIDDEN",
  "PRODUCT_LIKED",
];

const REF_MODELS = ["Order", "Review", "Product", "User"];

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    relatedId: { type: Schema.Types.ObjectId, default: null },
    refModel: {
      type: String,
      enum: REF_MODELS,
      default: null,
    },
    groupKey: { type: String, default: null, trim: true, index: true },

    /**
     * Dữ liệu kèm theo, tùy theo type:
     *  - PRODUCT_REJECTED: { reason: string }
     *  - REVIEW_RECEIVED:  { rating: number, comment?: string }
     *  - ORDER_CONFIRMED:  { totalAmount: number }
     *  - PRODUCT_LIKED:    { likeCount?: number, lastActorIds?: ObjectId[] }
     */
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ relatedId: 1, type: 1 });
notificationSchema.index({ userId: 1, groupKey: 1, createdAt: -1 });

notificationSchema.statics.TYPES = NOTIFICATION_TYPES.reduce(
  (acc, t) => ({ ...acc, [t]: t }),
  {},
);
notificationSchema.statics.REF_MODELS = REF_MODELS.reduce(
  (acc, m) => ({ ...acc, [m]: m }),
  {},
);

module.exports = mongoose.model("Notification", notificationSchema);

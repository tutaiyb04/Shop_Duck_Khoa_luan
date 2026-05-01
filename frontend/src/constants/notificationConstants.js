import {
  Ban,
  Bell,
  BadgeCheck,
  Clock,
  EyeOff,
  Heart,
  Package,
  Star,
} from "lucide-react";

// có 1 thông báo MỚI tinh
export const NOTIFICATION_NEW_EVENT = "notification:new";

// 1 thông báo cũ được CỘNG DỒN (vd: thêm 1 lượt thích vào notification cũ)
export const NOTIFICATION_UPDATED_EVENT = "notification:updated";

// có thông báo vừa bị đánh dấu đã đọc (1 / nhiều / tất cả)
export const NOTIFICATION_READ_EVENT = "notification:read";

// có thông báo vừa bị xoá (1 hoặc tất-cả-đã-đọc)
export const NOTIFICATION_DELETED_EVENT = "notification:deleted";

// số badge unread mới — backend tự bắn sau mỗi lần thay đổi
export const NOTIFICATION_UNREAD_COUNT_EVENT = "notification:unread_count";

export const NOTIFICATION_TYPE_ICON = {
  ORDER_CONFIRMED: Package,
  REVIEW_REMINDER: Clock,
  REVIEW_RECEIVED: Star,
  PRODUCT_APPROVED: BadgeCheck,
  PRODUCT_REJECTED: Ban,
  PRODUCT_HIDDEN: EyeOff,
  PRODUCT_LIKED: Heart,
};

export const NOTIFICATION_DEFAULT_ICON = Bell;

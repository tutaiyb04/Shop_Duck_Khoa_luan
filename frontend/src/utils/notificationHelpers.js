// so sánh 2 id dạng string (vì backend trả id ObjectId đã stringify)
export const sameId = (a, b) => String(a) === String(b);

// lấy message lỗi đẹp nhất có thể từ axios error
export const extractErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

// thêm 1 thông báo mới vào ĐẦU mảng, bỏ qua nếu đã có - chống duplicate khi socket reconnect hoặc sự kiện đến 2 lần
export const unshiftUniqueNotification = (list, notif) => {
  if (list.some((n) => sameId(n.id, notif.id))) return list;

  return [notif, ...list];
};

// thay nội dung 1 thông báo cũ bằng bản mới rồi đẩy lên đầu mảng. Nếu chưa có trong list thì unshift như mới
export const replaceAndBumpToTop = (list, notif) => {
  const filtered = list.filter((n) => !sameId(n.id, notif.id));

  return [notif, ...filtered];
};

// đánh dấu nhiều thông báo trong list là đã đọc, bám theo payload socket có 3 dạng: { id }, { ids: [] }, hoặc { all: true }
export const markReadInList = (list, payload) => {
  const isAll = !!payload?.all;

  const ids = new Set(
    payload?.id
      ? [String(payload.id)]
      : Array.isArray(payload?.ids)
        ? payload.ids.map(String)
        : [],
  );

  return list.map((n) =>
    isAll || ids.has(String(n.id))
      ? { ...n, isRead: true, readAt: n.readAt || new Date().toISOString() }
      : n,
  );
};

// Quét qua danh sách và sửa isRead: true cho 1 hoặc toàn bộ thông báo
export const markOneReadInList = (list, id) =>
  list.map((n) =>
    sameId(n.id, id)
      ? { ...n, isRead: true, readAt: n.readAt || new Date().toISOString() }
      : n,
  );

export const markAllReadInList = (list) =>
  list.map((n) => ({ ...n, isRead: true }));

// đường dẫn điều hướng khi bấm 1 thông báo
export const getNotificationHref = (n) => {
  if (!n || typeof n !== "object") return null;

  const id = n.relatedId != null ? String(n.relatedId) : "";
  const type = typeof n.type === "string" ? n.type : "";

  switch (type) {
    case "ORDER_CONFIRMED":
    case "REVIEW_REMINDER":
      return "/orders";
    case "REVIEW_RECEIVED":
      return "/sales-history";
    case "PRODUCT_APPROVED":
    case "PRODUCT_REJECTED":
    case "PRODUCT_HIDDEN":
    case "PRODUCT_LIKED":
    case "VIP_EXPIRED":
      return id ? `/product/${id}` : "/my-products";
    default:
      break;
  }

  if (n.refModel === "Product" && id) return `/product/${id}`;
  if (n.refModel === "Order") return "/orders";
  if (n.refModel === "Review") return "/sales-history";

  return null;
};

// xoá thông báo theo payload socket: { id } → xoá 1; { allRead: true } → xoá tất cả những cái đã đọc
export const removeFromList = (list, payload) => {
  if (payload?.allRead) return list.filter((n) => !n.isRead);
  const id = payload?.id ? String(payload.id) : "";
  if (!id) return list;
  return list.filter((n) => !sameId(n.id, id));
};

// parse số unread từ payload { count: number } - có guard để không set NaN
export const parseUnreadFromPayload = (payload) => {
  const c = Number(payload?.count);
  return Number.isFinite(c) ? c : null;
};

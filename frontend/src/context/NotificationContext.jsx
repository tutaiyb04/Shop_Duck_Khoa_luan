import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { getSocket } from "@/services/socket";
import { AuthContext } from "@/context/AuthContext";
import {
  NOTIFICATION_NEW_EVENT,
  NOTIFICATION_UPDATED_EVENT,
  NOTIFICATION_READ_EVENT,
  NOTIFICATION_DELETED_EVENT,
  NOTIFICATION_UNREAD_COUNT_EVENT,
} from "@/constants/notificationConstants";
import {
  sameId,
  extractErrorMessage,
  unshiftUniqueNotification,
  replaceAndBumpToTop,
  markReadInList,
  markOneReadInList,
  markAllReadInList,
  removeFromList,
  parseUnreadFromPayload,
} from "@/utils/notificationHelpers";
import useNotificationApi from "@/hooks/notificationHooks/useNotificationApi";

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  // kiểm tra xem user đã đăng nhập hay chưa
  const { isAuthenticated } = useContext(AuthContext);

  const {
    fetchUnreadCountRequest,
    fetchNotificationsRequest,
    markAsReadRequest,
    markAllAsReadRequest,
    removeNotificationRequest,
    removeAllReadRequest,
  } = useNotificationApi();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const resetState = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    setPage(1);
    setTotalPages(1);
    setError("");
  }, []);

  // lấy số thông báo chưa đọc cho badge
  const fetchUnreadCount = useCallback(async () => {
    try {
      const { count } = await fetchUnreadCountRequest();
      setUnreadCount(count);
    } catch (e) {
      console.error("fetchUnreadCount:", e?.message);
    }
  }, [fetchUnreadCountRequest]);

  // lấy danh sách thông báo
  const fetchNotifications = useCallback(
    async (targetPage = 1, { append = false } = {}) => {
      setIsLoading(true);
      setError("");

      try {
        const { items, page: p, totalPages: tp, unreadCount: uc } =
          await fetchNotificationsRequest(targetPage);

        setNotifications((prev) => (append ? [...prev, ...items] : items));
        setPage(p);
        setTotalPages(tp);

        if (typeof uc === "number") {
          setUnreadCount(uc);
        }
      } catch (e) {
        setError(extractErrorMessage(e, "Không tải được thông báo"));
      } finally {
        setIsLoading(false);
      }
    },
    [fetchNotificationsRequest],
  );

  // tải thêm thông báo
  const loadMore = useCallback(() => {
    if (isLoading) return;

    if (page >= totalPages) return;

    return fetchNotifications(page + 1, { append: true });
  }, [page, totalPages, isLoading, fetchNotifications]);

  // tải lại trang
  const refresh = useCallback(
    () => fetchNotifications(1),
    [fetchNotifications],
  );

  // đánh dấu 1 thông báo đã đọc
  const markAsRead = useCallback(
    async (id) => {
      if (!id) return;

      try {
        await markAsReadRequest(id);

        setNotifications((prev) => markOneReadInList(prev, id));
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (e) {
        console.error("markAsRead:", e?.message);
      }
    },
    [markAsReadRequest],
  );

  // đánh dấu tất cả thông báo đã đọc
  const markAllAsRead = useCallback(async () => {
    try {
      await markAllAsReadRequest();

      setNotifications((prev) => markAllReadInList(prev));
      setUnreadCount(0);
    } catch (e) {
      console.error("markAllAsRead:", e?.message);
    }
  }, [markAllAsReadRequest]);

  // xoá 1 thông báo
  const removeOne = useCallback(
    async (id) => {
      if (!id) return;

      try {
        await removeNotificationRequest(id);

        setNotifications((prev) => prev.filter((n) => !sameId(n.id, id)));
      } catch (e) {
        console.error("removeOne:", e?.message);
      }
    },
    [removeNotificationRequest],
  );

  // xoá tất cả thông báo đã đọc
  const removeAllRead = useCallback(async () => {
    try {
      await removeAllReadRequest();

      setNotifications((prev) => prev.filter((n) => !n.isRead));
    } catch (e) {
      console.error("removeAllRead:", e?.message);
    }
  }, [removeAllReadRequest]);

  // khởi động / dừng store theo trạng thái đăng nhập
  useEffect(() => {
    if (!isAuthenticated) {
      resetState();
      return;
    }

    fetchUnreadCount();
    fetchNotifications(1);
  }, [isAuthenticated, fetchUnreadCount, fetchNotifications, resetState]);

  // lắng nghe 5 sự kiện socket (realtime)
  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const socket = getSocket();
    if (!socket) return undefined;

    // xử lý sự kiện mới
    const onNew = (notif) => {
      if (!notif?.id) return;
      setNotifications((prev) => {
        const next = unshiftUniqueNotification(prev, notif);
        if (next !== prev) {
          queueMicrotask(() => setUnreadCount((c) => c + 1));
        }
        return next;
      });
    };

    // xử lý sự kiện cũ được cộng dồn
    const onUpdated = (notif) => {
      if (!notif?.id) return;

      setNotifications((prev) => replaceAndBumpToTop(prev, notif));
    };

    // xử lý sự kiện đánh dấu đã đọc
    const onRead = (payload) => {
      setNotifications((prev) => markReadInList(prev, payload));
    };

    // xử lý sự kiện bị xoá
    const onDeleted = (payload) => {
      setNotifications((prev) => removeFromList(prev, payload));
    };

    // xử lý sự kiện số badge unread mới
    const onUnreadCount = (payload) => {
      const c = parseUnreadFromPayload(payload);

      if (c !== null) setUnreadCount(c);
    };

    socket.on(NOTIFICATION_NEW_EVENT, onNew);
    socket.on(NOTIFICATION_UPDATED_EVENT, onUpdated);
    socket.on(NOTIFICATION_READ_EVENT, onRead);
    socket.on(NOTIFICATION_DELETED_EVENT, onDeleted);
    socket.on(NOTIFICATION_UNREAD_COUNT_EVENT, onUnreadCount);

    return () => {
      socket.off(NOTIFICATION_NEW_EVENT, onNew);
      socket.off(NOTIFICATION_UPDATED_EVENT, onUpdated);
      socket.off(NOTIFICATION_READ_EVENT, onRead);
      socket.off(NOTIFICATION_DELETED_EVENT, onDeleted);
      socket.off(NOTIFICATION_UNREAD_COUNT_EVENT, onUnreadCount);
    };
  }, [isAuthenticated]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        page,
        totalPages,
        hasMore: page < totalPages,
        isLoading,
        error,
        fetchUnreadCount,
        fetchNotifications,
        loadMore,
        refresh,
        markAsRead,
        markAllAsRead,
        removeOne,
        removeAllRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

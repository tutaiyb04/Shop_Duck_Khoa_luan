import { useCallback } from "react";
import { API } from "@/services/axios";

const PAGE_SIZE = 15;

function useNotificationApi() {
  // lấy số thông báo chưa đọc cho badge
  const fetchUnreadCountRequest = useCallback(async () => {
    const res = await API.get("/notifications/unread-count");
    const count = Number(res.data?.count) || 0;
    return { count };
  }, []);

 // lấy danh sách thông báo
  const fetchNotificationsRequest = useCallback(
    async (targetPage = 1) => {
      const res = await API.get("/notifications", {
        params: { page: targetPage, limit: PAGE_SIZE },
      });

      const data = res.data || {};
      const items = Array.isArray(data.items) ? data.items : [];

      return {
        items,
        page: data.page || targetPage,
        totalPages: data.totalPages || 1,
        unreadCount:
          typeof data.unreadCount === "number" ? data.unreadCount : undefined,
      };
    },
    [],
  );

  // đánh dấu 1 thông báo đã đọc
  const markAsReadRequest = useCallback(async (id) => {
    await API.patch(`/notifications/${id}/read`);
  }, []);

  // đánh dấu tất cả thông báo đã đọc
  const markAllAsReadRequest = useCallback(async () => {
    await API.patch("/notifications/read-all");
  }, []);

  // xoá 1 thông báo
  const removeNotificationRequest = useCallback(async (id) => {
    await API.delete(`/notifications/${id}`);
  }, []);

  // xoá tất cả thông báo đã đọc
  const removeAllReadRequest = useCallback(async () => {
    await API.delete("/notifications/read");
  }, []);

  return {
    PAGE_SIZE,
    fetchUnreadCountRequest,
    fetchNotificationsRequest,
    markAsReadRequest,
    markAllAsReadRequest,
    removeNotificationRequest,
    removeAllReadRequest,
  };
}

export default useNotificationApi;

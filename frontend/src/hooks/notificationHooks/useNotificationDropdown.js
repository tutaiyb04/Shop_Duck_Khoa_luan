import { useCallback, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "@/context/AuthContext";
import { getNotificationHref } from "@/utils/notificationHelpers";
import useNotifications from "./useNotification";

function useNotificationDropdown() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    hasMore,
    isLoading,
    error,
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,
    removeOne,
    removeAllRead,
  } = useNotifications();

  const unreadLabel = unreadCount > 99 ? "99+" : String(unreadCount);
  const showBadge = Boolean(user && unreadCount > 0);

  const hasUnread = useMemo(
    () => notifications.some((n) => !n.isRead),
    [notifications],
  );

  const hasRead = useMemo(
    () => notifications.some((n) => n.isRead),
    [notifications],
  );

  const panelSubtitle = useMemo(() => {
    if (!user) return null;
    if (hasUnread) return `${unreadCount} tin chưa đọc`;
    if (notifications.length === 0) {
      return "Bạn đã xem hết trong trang này";
    }
    return "Tất cả đã được xem";
  }, [user, hasUnread, unreadCount, notifications.length]);

  const onOpenChange = useCallback(
    (next) => {
      setOpen(next);
      if (next && user) refresh();
    },
    [refresh, user],
  );

  const onActivate = useCallback(
    async (notif) => {
      if (!notif?.id) return;
      const href = getNotificationHref(notif);
      if (!notif.isRead) await markAsRead(notif.id);
      if (href) navigate(href);
      setOpen(false);
    },
    [markAsRead, navigate],
  );

  const onRemove = useCallback(
    async (e, id) => {
      e.stopPropagation();
      e.preventDefault();
      if (!id) return;
      await removeOne(id);
    },
    [removeOne],
  );

  const onGoLogin = useCallback(() => {
    setOpen(false);
    navigate("/login");
  }, [navigate]);

  return {
    open,
    onOpenChange,
    user,
    notifications,
    unreadLabel,
    showBadge,
    hasUnread,
    hasRead,
    panelSubtitle,
    hasMore,
    isLoading,
    error,
    loadMore,
    markAllAsRead,
    removeAllRead,
    onActivate,
    onRemove,
    onGoLogin,
  };
}

export default useNotificationDropdown;

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import useNotificationDropdown from "@/hooks/notificationHooks/useNotificationDropdown";
import { cn } from "@/lib/utils";
import NotificationBellTrigger from "./NotificationBellTrigger";
import NotificationFeed from "./NotificationFeed";
import NotificationGuestPrompt from "./NotificationGuestPrompt";
import NotificationPanelChrome from "./NotificationPanelChrome";

const SUBTITLE_GUEST_CHROME =
  "Đăng nhập để nhận cập nhật đơn hàng & tin đăng";

export default function NotificationDropdown() {
  const {
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
  } = useNotificationDropdown();

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange} modal={false}>
      <DropdownMenuTrigger asChild>
        <NotificationBellTrigger
          unreadLabel={unreadLabel}
          showBadge={showBadge}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        collisionPadding={12}
        className={cn(
          "w-[min(calc(100vw-1.5rem),23rem)] overflow-hidden rounded-2xl border border-amber-200/50 p-0 shadow-xl shadow-amber-900/10",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        )}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <NotificationPanelChrome
          title="Thông báo"
          subtitle={user ? panelSubtitle : SUBTITLE_GUEST_CHROME}
          actions={
            user && hasUnread ? (
              <Button
                type="button"
                variant="secondary"
                size="xs"
                className="h-7 !border !border-amber-200/80 !bg-white text-xxs font-medium !text-amber-950 shadow-sm"
                disabled={isLoading}
                onClick={() => void markAllAsRead()}
              >
                Đọc hết
              </Button>
            ) : null
          }
        />

        <Separator className="!bg-amber-100/80 !border-1 !border-amber-200/80" />

        {!user ? (
          <NotificationGuestPrompt onLogin={onGoLogin} />
        ) : (
          <div className="bg-white">
            <NotificationFeed
              notifications={notifications}
              error={error}
              isLoading={isLoading}
              hasMore={hasMore}
              hasRead={hasRead}
              onActivate={onActivate}
              onRemove={onRemove}
              onLoadMore={loadMore}
              onRemoveAllRead={removeAllRead}
            />
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

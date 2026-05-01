import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import NotificationEmptyState from "./NotificationEmptyState";
import NotificationItem from "./NotificationItem";
import NotificationListSkeleton from "./NotificationListSkeleton";

export default function NotificationFeed({
  notifications,
  error,
  isLoading,
  hasMore,
  hasRead,
  onActivate,
  onRemove,
  onLoadMore,
  onRemoveAllRead,
}) {
  if (error) {
    return (
      <p className="px-4 py-6 text-center text-sm text-destructive">{error}</p>
    );
  }

  if (isLoading && notifications.length === 0) {
    return <NotificationListSkeleton />;
  }

  if (notifications.length === 0) {
    return <NotificationEmptyState />;
  }

  return (
    <>
      <div className="max-h-[min(360px,calc(100vh-11rem))] overflow-y-auto overscroll-contain">
        <ul>
          {notifications.map((n) => (
            <NotificationItem
              key={String(n.id)}
              item={n}
              onActivate={onActivate}
              onRemove={onRemove}
            />
          ))}
        </ul>
      </div>

      {hasMore || hasRead ? (
        <>
          <Separator className="bg-amber-100/80 border-1 border-amber-200/80" />
          <div className="flex flex-col gap-1.5 px-2 py-2.5">
            {hasMore ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full rounded-xl !border-amber-200/80 !bg-white/70 text-xs font-medium hover:!bg-amber-50 !transition-colors"
                disabled={isLoading}
                onClick={() => void onLoadMore()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Đang tải…
                  </>
                ) : (
                  "Tải thêm"
                )}
              </Button>
            ) : null}
            {hasRead ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full rounded-xl text-xxs !transition-colors !border-1 !border-gray-300 text-muted-foreground hover:!bg-destructive/10 hover:!text-destructive"
                disabled={isLoading}
                onClick={() => void onRemoveAllRead()}
              >
                Xóa tất cả thông báo đã đọc
              </Button>
            ) : null}
          </div>
        </>
      ) : null}
    </>
  );
}

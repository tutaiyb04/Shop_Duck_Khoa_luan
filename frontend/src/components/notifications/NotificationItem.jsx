import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getNotificationHref } from "@/utils/notificationHelpers";
import { formatNotificationRelativeTime } from "@/utils/notificationFormat";
import {
  NOTIFICATION_DEFAULT_ICON,
  NOTIFICATION_TYPE_ICON,
} from "@/constants/notificationConstants";

export default function NotificationItem({ item, onActivate, onRemove }) {
  const n = item;
  const Icon = NOTIFICATION_TYPE_ICON[n.type] || NOTIFICATION_DEFAULT_ICON;
  const time = formatNotificationRelativeTime(n.createdAt, n.updatedAt);
  const interactive = !!getNotificationHref(n);

  return (
    <li
      className={cn(
        "border-b-3 !border-amber-100/80 last:border-0",
        !n.isRead &&
          "bg-gradient-to-r from-amber-50/90 via-amber-50/40 to-transparent",
      )}
    >
      <div
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={() => interactive && void onActivate(n)}
        onKeyDown={(e) => {
          if (!interactive) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            void onActivate(n);
          }
        }}
        className={cn(
          "group flex gap-3 px-3 py-2.5 outline-none transition-colors",
          interactive &&
            "cursor-pointer hover:bg-amber-100/35 focus-visible:bg-amber-100/45 focus-visible:ring-2 focus-visible:ring-amber-400/40 focus-visible:ring-inset",
        )}
      >
        <div
          className={cn(
            "mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-colors",
            n.isRead
              ? "!border-amber-100/80 !bg-white !text-muted-foreground"
              : "!border-amber-200/80 !bg-gradient-to-br from-amber-100 to-amber-50 !text-amber-900",
          )}
        >
          <Icon className="size-5" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "line-clamp-2 text-[13px] leading-snug",
              n.isRead
                ? "font-medium text-foreground/85"
                : "font-semibold text-foreground",
            )}
          >
            {n.title || "Thông báo"}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed !text-muted-foreground">
            {n.content}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xxs text-muted-foreground">
            {time ? <span>{time}</span> : null}
            {!n.isRead ? (
              <span className="rounded-full !bg-amber-400/25 px-2 py-px text-s font-semibold uppercase tracking-wide !text-amber-900">
                Chưa đọc
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col opacity-70 transition-opacity group-hover:opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="rounded-lg !border-1 !border-gray-200 !text-muted-foreground !transition-colors hover:!bg-destructive/10 hover:!text-destructive"
            aria-label="Xóa"
            onClick={(e) => void onRemove(e, n.id)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </li>
  );
}

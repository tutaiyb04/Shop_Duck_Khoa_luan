import { Bell, BellRing } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotificationBellTrigger({
  unreadLabel,
  showBadge,
  className,
  ...props
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn(
        "relative rounded-full !border-1 !border-gray-200 !bg-gray-200 !text-gray-600 !transition-colors hover:!bg-yellow-300 hover:!text-yellow-900",
        showBadge &&
          "ring-2 ring-amber-400/50 ring-offset-2 ring-offset-amber-50 !bg-yellow-200",
        className,
      )}
      aria-label="Thông báo"
      {...props}
    >
      {showBadge ? (
        <BellRing className="h-5 w-5 !text-yellow-600 md:h-6 md:w-6" />
      ) : (
        <Bell className="h-5 w-5 md:h-6 md:w-6" />
      )}
      {showBadge ? (
        <Badge
          variant="destructive"
          className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] animate-pulse items-center justify-center rounded-full px-1 text-s font-semibold tabular-nums shadow-sm sm:animate-none text-white"
        >
          {unreadLabel}
        </Badge>
      ) : null}
    </Button>
  );
}

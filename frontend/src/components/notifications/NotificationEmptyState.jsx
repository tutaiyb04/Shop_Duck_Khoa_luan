import { Inbox } from "lucide-react";

export default function NotificationEmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      <div className="rounded-2xl border border-amber-100 bg-white p-3 shadow-sm">
        <Inbox className="size-8 text-muted-foreground/55" />
      </div>
      <p className="text-sm text-muted-foreground">
        Chưa có thông báo — bạn sẽ thấy tin mới ngay khi có sự kiện.
      </p>
    </div>
  );
}

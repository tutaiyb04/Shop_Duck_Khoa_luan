import { Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotificationGuestPrompt({ onLogin }) {
  return (
    <div className="space-y-4 px-4 py-6 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-dashed border-amber-200 bg-amber-50/50">
        <Inbox className="size-7 text-amber-700/60" />
      </div>
      <p className="text-sm text-muted-foreground">
        Đăng nhập để theo dõi đơn hàng, duyệt tin và lượt thích.
      </p>
      <Button
        type="button"
        size="sm"
        className="w-full rounded-xl bg-yellow-500 font-semibold text-white shadow hover:bg-yellow-600"
        onClick={onLogin}
      >
        Đăng nhập
      </Button>
    </div>
  );
}

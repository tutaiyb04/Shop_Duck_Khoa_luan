import { NavLink } from "react-router-dom";
import { Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomeVipBanner() {
  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-amber-300/50 bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 p-6 sm:p-8 text-white shadow-lg"
      aria-label="Gói hiển thị VIP"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-black/10 blur-xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-100">
            <Sparkles className="h-3.5 w-3.5" />
            Đẩy tin · Gói VIP
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Nổi bật trên trang chủ, ưu tiên trong bảng quản trị
          </h2>
          <p className="text-sm text-amber-50/95 sm:text-base">
            Gói 7 ngày hoặc 30 ngày — thanh toán PayOS. Tin hiển thị{" "}
            <strong className="font-bold">HOT</strong> như trên các sàn đồ cũ uy
            tín.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:shrink-0 sm:items-end">
          <Button
            asChild
            size="lg"
            className="w-full bg-white text-amber-800 shadow-md hover:bg-amber-50 sm:w-auto"
          >
            <NavLink to="/my-products">
              Nâng cấp VIP ngay
              <ChevronRight className="ml-1 h-4 w-4" />
            </NavLink>
          </Button>
          <p className="text-center text-[11px] text-amber-100/90 sm:text-right">
            Quản lý tại mục &quot;Tất cả sản phẩm&quot; → Nâng cấp VIP
          </p>
        </div>
      </div>
    </section>
  );
}

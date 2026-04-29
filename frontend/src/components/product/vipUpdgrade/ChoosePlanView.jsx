import { cn } from "@/lib/utils";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PLANS } from "@/hooks/productHooks/useVipUpgradeLogic";

function ChoosePlanView({
  product,
  selectedPlan,
  setSelectedPlan,
  submitting,
  handlePay,
  onClose,
}) {
  return (
    <>
      <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50/30 px-6 pt-6 pb-4">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold tracking-tight sm:text-xl">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-yellow-600">
              <Sparkles className="h-5 w-5" />
            </span>
            Nâng cấp hiển thị VIP
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground line-clamp-2">
            {product?.name ? (
              <>
                Sản phẩm:{" "}
                <span className="font-medium text-foreground">
                  {product.name}
                </span>
              </>
            ) : (
              "Chọn gói để ưu tiên hiển thị (PayOS)"
            )}
          </DialogDescription>
        </DialogHeader>
      </div>

      <div className="space-y-4 px-6 pb-2">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Gói VIP đưa tin nổi bật trên trang chủ và ưu tiên trong bảng quản trị.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {PLANS.map((p) => {
            const active = selectedPlan === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPlan(p.id)}
                className={cn(
                  "rounded-xl border-2 p-3.5 text-left !transition-all outline-none focus-visible:ring-2 focus-visible:!ring-amber-500/50",
                  active
                    ? "!border-amber-500 !bg-amber-50/80 shadow-sm ring-1 !ring-amber-200/50"
                    : "border-border !bg-card hover:!border-amber-200 hover:!bg-amber-50/30",
                )}
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {p.label}
                </div>
                <div className="mt-1.5 text-xl font-extrabold tabular-nums text-yellow-600">
                  {p.price.toLocaleString("vi-VN")}
                  <span className="text-sm ml-1 font-bold text-yellow-600">
                    đ
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{p.hint}</p>
              </button>
            );
          })}
        </div>
      </div>

      <DialogFooter className="gap-2 border-t bg-muted/30 px-6 py-4 sm:justify-stretch sm:space-x-0">
        <Button
          type="button"
          variant="ghost"
          onClick={() => onClose(false)}
          className="w-full sm:flex-1 !border-1 !transition-colors !border-gray-200 !bg-gray-200 hover:!bg-gray-300"
        >
          Hủy
        </Button>
        <Button
          type="button"
          disabled={submitting}
          onClick={handlePay}
          className="w-full flex-1 !transition-colors !bg-yellow-500 hover:!bg-yellow-600 text-white font-semibold shadow !border-0"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang tạo hóa đơn…
            </>
          ) : (
            "Thanh toán ngay"
          )}
        </Button>
      </DialogFooter>
    </>
  );
}

export default ChoosePlanView;

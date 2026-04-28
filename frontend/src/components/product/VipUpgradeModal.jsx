// src/components/product/VipUpgradeModal.jsx
import { Loader2, Sparkles, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useVipUpgradeLogic, {
  PLANS,
  formatMmSs,
} from "@/hooks/productHooks/useVipUpgradeLogic";

export default function VipUpgradeModal({
  open,
  onOpenChange,
  product,
  onPaidRefresh,
}) {
  // Gọi "bộ não" ra để xài
  const {
    selectedPlan,
    setSelectedPlan,
    step,
    submitting,
    checkoutUrl,
    countdown,
    handlePay,
    plan,
    iframeRef,
    handleIframeLoad,
    handleCancelTransaction,
  } = useVipUpgradeLogic({ open, onOpenChange, product, onPaidRefresh });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "gap-0 p-0 overflow-hidden flex flex-col",
          step === "pay"
            ? "h-[min(90vh,720px)] max-h-[min(90vh,720px)] w-[min(100%-0.5rem,42rem)] sm:max-w-2xl"
            : "max-w-[min(100%-1rem,28rem)] sm:max-w-md",
        )}
        showCloseButton
      >
        {step === "choose" && (
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
                Gói VIP đưa tin nổi bật trên trang chủ và ưu tiên trong bảng
                quản trị.
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
                      <p className="mt-1 text-xs text-muted-foreground">
                        {p.hint}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="gap-2 border-t bg-muted/30 px-6 py-4 sm:justify-stretch sm:space-x-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
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
        )}

        {step === "pay" && plan && (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="shrink-0 border-b bg-gradient-to-r from-amber-500/10 to-orange-500/5 px-4 py-3 sm:px-6">
              <p className="text-xs font-medium text-muted-foreground">
                Thanh toán gói VIP
              </p>
              <p className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground">
                {plan.price.toLocaleString("vi-VN")}
                <span className="ml-0.5 text-lg font-bold text-amber-700/90">
                  đ
                </span>
              </p>
              <p className="text-sm text-muted-foreground">{plan.label}</p>
            </div>

            <div className="shrink-0 space-y-2 border-b border-border/60 px-4 py-2.5 sm:px-6">
              {product?.name && (
                <p className="line-clamp-1 text-sm text-muted-foreground">
                  <span className="text-foreground/80">Sản phẩm: </span>
                  {product.name}
                </p>
              )}
              <div
                className={cn(
                  "inline-flex w-full items-center justify-center gap-2 rounded-full border border-amber-200/60 bg-amber-50/90 px-3 py-1.5 text-sm",
                  countdown === 0 && "border-amber-300/80 bg-amber-100/50",
                )}
              >
                <Clock className="h-3.5 w-3.5 shrink-0 text-amber-700" />
                <span className="text-amber-950/90">Ước tính còn</span>
                <span className="font-mono text-sm font-bold tabular-nums text-amber-900">
                  {formatMmSs(countdown)}
                </span>
              </div>
              {countdown === 0 && (
                <p className="text-center text-[11px] text-amber-900/80">
                  Có thể đóng hộp thoại và tạo lại gói mới nếu cần.
                </p>
              )}
            </div>

            {checkoutUrl && (
              <div className="relative min-h-0 flex-1 bg-muted/30">
                <iframe
                  ref={iframeRef}
                  onLoad={handleIframeLoad}
                  title="Trang thanh toán PayOS (nhúng trong ứng dụng)"
                  src={checkoutUrl}
                  className="absolute inset-0 h-full w-full border-0 bg-white"
                />
              </div>
            )}

            <div className="shrink-0 flex flex-wrap items-center gap-2 border-t border-border/60 bg-white px-3 py-2 sm:px-4">
              {checkoutUrl && (
                <a
                  href={checkoutUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-xs font-medium text-amber-700 underline-offset-2 hover:underline"
                >
                  Iframe lỗi? Mở PayOS trong tab mới
                </a>
              )}
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancelTransaction}
                className="ml-auto h-8 px-3 text-xs !bg-gray-100 hover:!bg-gray-200 !text-gray-700 !border-0"
              >
                Hủy giao dịch
              </Button>
            </div>

            <p className="shrink-0 border-t border-border/50 bg-muted/20 px-3 py-2 text-center text-[11px] leading-relaxed text-muted-foreground">
              Giao dịch do PayOS xử lý. Sau khi trừ tiền thành công, gói VIP cập
              nhật trong vài giây (không cần thao tác thêm, có thể đóng hộp
              thoại sau thông báo thành công).
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatMmSs } from "@/hooks/productHooks/useVipUpgradeLogic";

export default function PaymentView({
  plan,
  product,
  countdown,
  checkoutUrl,
  iframeRef,
  handleIframeLoad,
  onCancel,
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 border-b bg-gradient-to-r from-amber-500/10 to-orange-500/5 px-4 py-3 sm:px-6">
        <p className="text-xs font-medium text-muted-foreground">
          Thanh toán gói VIP
        </p>
        <p className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground">
          {plan.price.toLocaleString("vi-VN")}
          <span className="ml-0.5 text-lg font-bold text-amber-700/90">đ</span>
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
          onClick={onCancel}
          className="ml-auto h-8 px-3 text-xs !bg-gray-100 hover:!bg-gray-200 !text-gray-700 !border-0"
        >
          Hủy giao dịch
        </Button>
      </div>

      <p className="shrink-0 border-t border-border/50 bg-muted/20 px-3 py-2 text-center text-[11px] leading-relaxed text-muted-foreground">
        Giao dịch do PayOS xử lý. Sau khi trừ tiền thành công, gói VIP cập nhật
        trong vài giây (không cần thao tác thêm, có thể đóng hộp thoại sau thông
        báo thành công).
      </p>
    </div>
  );
}

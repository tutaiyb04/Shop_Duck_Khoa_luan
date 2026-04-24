import { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import { Loader2, Sparkles, Clock } from "lucide-react";
import { API } from "@/services/axios";
import { getSocket } from "@/services/socket";
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

const PLANS = [
  { id: "7", label: "Gói 7 ngày", days: 7, price: 50_000, hint: "Phù hợp thử nghiệm" },
  { id: "30", label: "Gói 30 ngày", days: 30, price: 150_000, hint: "Tiết kiệm hơn" },
];

const COUNTDOWN_START = 15 * 60;
const VIP_POLL_MS = 4000;
const VIP_POLL_MAX = 50;

function formatMmSs(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function VipUpgradeModal({ open, onOpenChange, product, onPaidRefresh }) {
  const [selectedPlan, setSelectedPlan] = useState("7");
  const [step, setStep] = useState("choose");
  const [submitting, setSubmitting] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [orderCode, setOrderCode] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const closeTimerRef = useRef(null);
  const successHandled = useRef(false);
  const countIntervalRef = useRef(null);
  const vipPollRef = useRef(null);
  const pollAttempts = useRef(0);

  const reset = useCallback(() => {
    setStep("choose");
    setSelectedPlan("7");
    setSubmitting(false);
    setCheckoutUrl("");
    setOrderCode(null);
    setCountdown(0);
    successHandled.current = false;
    pollAttempts.current = 0;
    if (vipPollRef.current) {
      clearInterval(vipPollRef.current);
      vipPollRef.current = null;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (countIntervalRef.current) {
      clearInterval(countIntervalRef.current);
      countIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  /* Nếu state orderCode bị mất, đọc từ session (ví dụ re-render) — bắt buộc cho poll confirm */
  useEffect(() => {
    if (step !== "pay" || orderCode != null) return;
    try {
      const s = sessionStorage.getItem("vip_checkout_order_code");
      if (s != null && s !== "" && Number.isFinite(Number(s))) {
        setOrderCode(Number(s));
      }
    } catch {
      // ignore
    }
  }, [step, orderCode]);

  useEffect(() => {
    if (step !== "pay") {
      if (countIntervalRef.current) {
        clearInterval(countIntervalRef.current);
        countIntervalRef.current = null;
      }
      return;
    }
    setCountdown(COUNTDOWN_START);
    countIntervalRef.current = setInterval(() => {
      setCountdown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => {
      if (countIntervalRef.current) {
        clearInterval(countIntervalRef.current);
        countIntervalRef.current = null;
      }
    };
  }, [step]);

  const handlePay = async () => {
    if (!product?._id) return;
    setSubmitting(true);
    try {
      const { data } = await API.post("/payment/create-vip-link", {
        productId: product._id,
        plan: selectedPlan,
      });
      if (data.checkoutUrl) {
        if (data.orderCode != null && data.orderCode !== undefined) {
          setOrderCode(data.orderCode);
          try {
            sessionStorage.setItem(
              "vip_checkout_order_code",
              String(data.orderCode),
            );
          } catch {
            // ignore
          }
        }
        setCheckoutUrl(data.checkoutUrl);
        setStep("pay");
        return;
      }
      toast.error("Không nhận được dữ liệu thanh toán từ server");
    } catch (e) {
      toast.error(
        e?.response?.data?.message ||
          e?.message ||
          "Không tạo được link (PayOS chưa cấu hình?)",
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!open || !product?._id) return;
    const socket = getSocket();
    if (!socket) return;

    const onVipSuccess = (payload) => {
      if (String(payload?.productId) !== String(product._id)) return;
      if (successHandled.current) return;
      successHandled.current = true;
      confetti({ particleCount: 160, spread: 80, origin: { y: 0.65 } });
      toast.success("Thanh toán thành công! Gói VIP đã được kích hoạt.");
      onPaidRefresh?.();
      closeTimerRef.current = setTimeout(() => {
        onOpenChange(false);
        reset();
      }, 3000);
    };

    socket.on("payment:vip_success", onVipSuccess);
    return () => {
      socket.off("payment:vip_success", onVipSuccess);
    };
  }, [open, product?._id, onOpenChange, onPaidRefresh, reset]);

  /**
   * Nhúng PayOS trong iframe: redirect sau thành công nằm TRONG iframe, trang cha không có
   * ?vip_payment=success nên gọi confirm-vip (poll) tới khi PayOS báo PAID + backend kích hoạt VIP.
   */
  useEffect(() => {
    if (!open || step !== "pay" || orderCode == null) return;
    if (!Number.isFinite(Number(orderCode))) return;

    const runConfirm = async () => {
      if (successHandled.current) return;
      if (pollAttempts.current >= VIP_POLL_MAX) {
        if (vipPollRef.current) {
          clearInterval(vipPollRef.current);
          vipPollRef.current = null;
        }
        return;
      }
      pollAttempts.current += 1;
      try {
        const { data } = await API.post("/payment/confirm-vip", {
          orderCode: Number(orderCode),
        });
        if (successHandled.current) return;
        successHandled.current = true;
        if (vipPollRef.current) {
          clearInterval(vipPollRef.current);
          vipPollRef.current = null;
        }
        try {
          sessionStorage.removeItem("vip_checkout_order_code");
        } catch {
          // ignore
        }
        confetti({ particleCount: 160, spread: 80, origin: { y: 0.65 } });
        toast.success(
          data?.already
            ? "Gói VIP đã kích hoạt."
            : "Thanh toán thành công! Tin HOT đã bật trên trang chủ.",
        );
        onPaidRefresh?.();
        closeTimerRef.current = setTimeout(() => {
          onOpenChange(false);
          reset();
        }, 3000);
      } catch (e) {
        const st = e?.response?.status;
        if (st === 401) {
          toast.error("Hết phiên đăng nhập — tải lại trang rồi thử lại.");
          if (vipPollRef.current) {
            clearInterval(vipPollRef.current);
            vipPollRef.current = null;
          }
        } else if (st !== 409 && st !== 502) {
          if (st === 400 || st === 404) {
            if (vipPollRef.current) {
              clearInterval(vipPollRef.current);
              vipPollRef.current = null;
            }
            const msg = e?.response?.data?.message;
            if (st === 400 && msg) {
              toast.error(msg);
            }
          }
        }
      }
    };

    void runConfirm();
    vipPollRef.current = setInterval(runConfirm, VIP_POLL_MS);
    return () => {
      if (vipPollRef.current) {
        clearInterval(vipPollRef.current);
        vipPollRef.current = null;
      }
    };
  }, [open, step, orderCode, onOpenChange, onPaidRefresh, reset]);

  const plan = PLANS.find((p) => p.id === selectedPlan);

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
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  Nâng cấp hiển thị VIP
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground line-clamp-2">
                  {product?.name ? (
                    <>
                      Sản phẩm:{" "}
                      <span className="font-medium text-foreground">{product.name}</span>
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
                        "rounded-xl border-2 p-3.5 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50",
                        active
                          ? "border-amber-500 bg-amber-50/80 shadow-sm ring-1 ring-amber-200/50"
                          : "border-border bg-card hover:border-amber-200 hover:bg-amber-50/30",
                      )}
                    >
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {p.label}
                      </div>
                      <div className="mt-1.5 text-xl font-extrabold tabular-nums text-amber-800">
                        {p.price.toLocaleString("vi-VN")}
                        <span className="text-sm font-bold text-amber-700/90">đ</span>
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
                onClick={() => onOpenChange(false)}
                className="w-full sm:flex-1"
              >
                Hủy
              </Button>
              <Button
                type="button"
                disabled={submitting}
                onClick={handlePay}
                className="w-full flex-1 !bg-gradient-to-r !from-amber-500 !to-orange-600 hover:!from-amber-600 hover:!to-orange-700 text-white font-semibold shadow"
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
              <p className="text-xs font-medium text-muted-foreground">Thanh toán gói VIP</p>
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
                  title="Trang thanh toán PayOS (nhúng trong ứng dụng)"
                  src={checkoutUrl}
                  className="absolute inset-0 h-full w-full border-0 bg-white"
                />
              </div>
            )}
            <p className="shrink-0 border-t border-border/50 bg-muted/20 px-3 py-2 text-center text-[11px] leading-relaxed text-muted-foreground">
              Giao dịch do PayOS xử lý. Sau khi trừ tiền thành công, gói VIP cập nhật trong vài
              giây (không cần thao tác thêm, có thể đóng hộp thoại sau thông báo thành công).
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

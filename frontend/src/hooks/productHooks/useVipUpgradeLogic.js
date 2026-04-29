import { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import { API } from "@/services/axios";
import useCountdown from "./vipUpgrade/useCountdown";
import usePaymentMonitor from "./vipUpgrade/usePaymentMonitor";

// thời gian đếm ngược mặc định của gói VIP (17 phút)
const DEFAULT_COUNTDOWN_SEC = 17 * 60;

export const PLANS = [
  {
    id: "7",
    label: "Gói 7 ngày",
    days: 7,
    price: 50_000,
    hint: "Phù hợp thử nghiệm",
  },
  {
    id: "30",
    label: "Gói 30 ngày",
    days: 30,
    price: 150_000,
    hint: "Tiết kiệm hơn",
  },
];

export function formatMmSs(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const cancelVipOrder = (orderCode) => {
  if (!Number.isFinite(Number(orderCode))) return Promise.resolve();
  return API.post("/payment/cancel-vip", {
    orderCode: Number(orderCode),
  }).catch((e) => {
    if (e?.response?.status === 409 || e?.response?.status === 404) return;
    console.error("cancel-vip:", e);
  });
};

export default function useVipUpgradeLogic({
  open,
  onOpenChange,
  product,
  onPaidRefresh,
}) {
  const [selectedPlan, setSelectedPlan] = useState("7");
  const [step, setStep] = useState("choose");
  const [submitting, setSubmitting] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [orderCode, setOrderCode] = useState(null);
  const [expiresInSec, setExpiresInSec] = useState(DEFAULT_COUNTDOWN_SEC);

  const closeTimerRef = useRef(null);
  const iframeRef = useRef(null);
  const orderCodeRef = useRef(null);
  const stepRef = useRef("choose");

  useEffect(() => {
    orderCodeRef.current = orderCode;
  }, [orderCode]);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  // Đếm ngược thời gian còn lại của gói VIP
  const countdown = useCountdown(
    expiresInSec || DEFAULT_COUNTDOWN_SEC,
    step === "pay",
  );

  // reset logic khi đóng modal
  const reset = useCallback(() => {
    setStep("choose");
    setSelectedPlan("7");
    setSubmitting(false);
    setCheckoutUrl("");
    setOrderCode(null);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  // theo dõi thanh toán gói VIP
  const { successHandled, cancelHandled, vipPollRef } = usePaymentMonitor({
    isActive: open && step === "pay",
    orderCode,
    productId: product?._id,
    onSuccess: ({ isAlreadyPaid }) => {
      try {
        sessionStorage.removeItem("vip_checkout_order_code");
      } catch {
        // ignore
      }
      confetti({ particleCount: 160, spread: 80, origin: { y: 0.65 } });
      toast.success(
        isAlreadyPaid
          ? "Gói VIP đã kích hoạt."
          : "Thanh toán thành công! Tin HOT đã bật trên trang chủ.",
      );
      onPaidRefresh?.();
      closeTimerRef.current = setTimeout(() => {
        onOpenChange(false);
        reset();
      }, 3000);
    },
    onExpired: (msg) => {
      try {
        sessionStorage.removeItem("vip_checkout_order_code");
      } catch {
        // ignore
      }
      toast(msg || "Giao dịch đã hết hạn. Vui lòng tạo gói mới.", {
        icon: "⏰",
      });
      onPaidRefresh?.();
      onOpenChange(false);
      reset();
    },
    onError: (status, msg) => {
      if (status === 401)
        toast.error("Hết phiên đăng nhập — tải lại trang rồi thử lại.");
      else if (msg) toast.error(msg);
    },
  });

  // hủy giao dịch chờ thanh toán nếu vẫn chưa thanh toán
  const cancelIfStillPending = useCallback(async () => {
    if (successHandled.current || cancelHandled.current) return;
    if (stepRef.current !== "pay") return;
    const code = orderCodeRef.current;
    if (!Number.isFinite(Number(code))) return;

    cancelHandled.current = true;
    try {
      sessionStorage.removeItem("vip_checkout_order_code");
    } catch {
      // ignore
    }

    await cancelVipOrder(code);
    onPaidRefresh?.();
    toast("Đã hủy giao dịch chờ thanh toán.", { icon: "ℹ️" });
  }, [onPaidRefresh, successHandled, cancelHandled]);

  useEffect(() => {
    if (!open) {
      void cancelIfStillPending();
      reset();
    }
  }, [open, reset, cancelIfStillPending]);

  useEffect(() => {
    if (step !== "pay" || orderCode != null) return;
    try {
      const s = sessionStorage.getItem("vip_checkout_order_code");
      if (s != null && s !== "" && Number.isFinite(Number(s)))
        setOrderCode(Number(s));
    } catch {
      // ignore
    }
  }, [step, orderCode]);

  // tạo link thanh toán gói VIP
  const handlePay = async () => {
    if (!product?._id) return;
    setSubmitting(true);
    try {
      const { data } = await API.post("/payment/create-vip-link", {
        productId: product._id,
        plan: selectedPlan,
      });
      if (data.checkoutUrl) {
        if (data.orderCode != null) {
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
        if (Number.isFinite(Number(data.expiresInSec)))
          setExpiresInSec(Number(data.expiresInSec));
        setCheckoutUrl(data.checkoutUrl);
        setStep("pay");
        return;
      }
      toast.error("Không nhận được dữ liệu thanh toán từ server");
    } catch (e) {
      toast.error(
        e?.response?.data?.message || e?.message || "Không tạo được link",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // hủy giao dịch chờ thanh toán
  const handleCancelTransaction = useCallback(async () => {
    if (successHandled.current || cancelHandled.current) {
      onOpenChange(false);
      return;
    }
    const code = orderCodeRef.current;
    if (!Number.isFinite(Number(code))) {
      onOpenChange(false);
      return;
    }

    cancelHandled.current = true;
    if (vipPollRef.current) clearInterval(vipPollRef.current);
    try {
      sessionStorage.removeItem("vip_checkout_order_code");
    } catch {
      // ignore
    }

    try {
      await cancelVipOrder(code);
      toast("Đã hủy giao dịch chờ thanh toán.", { icon: "ℹ️" });
    } catch (e) {
      toast.error("Không hủy được giao dịch — thử lại sau.");
      console.error("Lỗi khi gọi cancel-vip:", e);
    }
    onPaidRefresh?.();
    onOpenChange(false);
    reset();
  }, [
    onOpenChange,
    onPaidRefresh,
    reset,
    successHandled,
    cancelHandled,
    vipPollRef,
  ]);

  // hủy giao dịch chờ thanh toán nếu người dùng đóng iframe thanh toán
  const handleIframeLoad = useCallback(() => {
    if (successHandled.current || cancelHandled.current) return;
    const frame = iframeRef.current;
    if (!frame) return;

    let href = "";
    try {
      href = frame.contentWindow?.location?.href || "";
    } catch {
      return;
    }
    if (!href || !href.includes("vip_payment=cancel")) return;

    cancelHandled.current = true;
    const code = orderCodeRef.current;
    try {
      sessionStorage.removeItem("vip_checkout_order_code");
    } catch {
      // ignore
    }

    void cancelVipOrder(code).then(() => {
      onPaidRefresh?.();
      toast("Đã hủy giao dịch chờ thanh toán.", { icon: "ℹ️" });
      onOpenChange(false);
      reset();
    });
  }, [onOpenChange, onPaidRefresh, reset, successHandled, cancelHandled]);

  const plan = PLANS.find((p) => p.id === selectedPlan);

  return {
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
  };
}

// src/hooks/productHooks/useVipUpgradeLogic.js
import { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import { API } from "@/services/axios";
import { getSocket } from "@/services/socket";

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

const COUNTDOWN_START = 15 * 60;
const VIP_POLL_MS = 4000;
const VIP_POLL_MAX = 50;

export function formatMmSs(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

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

  /* Đọc orderCode từ session */
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

  /* Đếm ngược */
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

  /* Lắng nghe Socket */
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

  /* Polling API */
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

  return {
    selectedPlan,
    setSelectedPlan,
    step,
    submitting,
    checkoutUrl,
    countdown,
    handlePay,
    plan,
  };
}

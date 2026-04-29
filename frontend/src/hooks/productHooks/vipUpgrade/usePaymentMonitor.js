import { useEffect, useRef } from "react";
import { API } from "@/services/axios";
import { getSocket } from "@/services/socket";

// tần suất hỏi thăm API để kiểm tra trạng thái thanh toán gói VIP
const VIP_POLL_MS = 4000;
// số lần hỏi thăm API tối đa
const VIP_POLL_MAX = 50;

export default function usePaymentMonitor({
  isActive,
  orderCode,
  productId,
  onSuccess,
  onExpired,
  onError,
}) {
  const successHandled = useRef(false);
  const cancelHandled = useRef(false);
  const pollAttempts = useRef(0);
  const vipPollRef = useRef(null);

  // Reset state khi tắt theo dõi
  useEffect(() => {
    if (!isActive) {
      successHandled.current = false;
      cancelHandled.current = false;
      pollAttempts.current = 0;
      if (vipPollRef.current) clearInterval(vipPollRef.current);
    }
  }, [isActive]);

  // theo dõi sự kiện thanh toán thành công gói VIP qua Socket
  useEffect(() => {
    if (!isActive || !productId) return;
    const socket = getSocket();
    if (!socket) return;

    const onVipSuccess = (payload) => {
      if (String(payload?.productId) !== String(productId)) return;
      if (successHandled.current) return;

      successHandled.current = true;
      onSuccess({ isAlreadyPaid: false });
    };

    socket.on("payment:vip_success", onVipSuccess);
    return () => socket.off("payment:vip_success", onVipSuccess);
  }, [isActive, productId, onSuccess]);

  // theo dõi trạng thái thanh toán gói VIP qua API
  useEffect(() => {
    if (!isActive || orderCode == null || !Number.isFinite(Number(orderCode)))
      return;

    const runConfirm = async () => {
      if (successHandled.current) return;

      if (pollAttempts.current >= VIP_POLL_MAX) {
        if (vipPollRef.current) clearInterval(vipPollRef.current);
        return;
      }

      pollAttempts.current += 1;

      try {
        const { data } = await API.post("/payment/confirm-vip", {
          orderCode: Number(orderCode),
        });

        if (successHandled.current) return;
        successHandled.current = true;
        if (vipPollRef.current) clearInterval(vipPollRef.current);

        onSuccess({ isAlreadyPaid: data?.already });
      } catch (e) {
        const st = e?.response?.status;
        const expired = st === 410 || e?.response?.data?.expired === true;

        if (expired) {
          if (cancelHandled.current) return;
          cancelHandled.current = true;
          if (vipPollRef.current) clearInterval(vipPollRef.current);
          onExpired(e?.response?.data?.message);
          return;
        }

        if (st === 401 || st === 400 || st === 404) {
          if (vipPollRef.current) clearInterval(vipPollRef.current);
          onError(st, e?.response?.data?.message);
        }
      }
    };

    void runConfirm();
    vipPollRef.current = setInterval(runConfirm, VIP_POLL_MS);

    return () => {
      if (vipPollRef.current) clearInterval(vipPollRef.current);
    };
  }, [isActive, orderCode, onSuccess, onExpired, onError]);

  return { successHandled, cancelHandled, vipPollRef };
}

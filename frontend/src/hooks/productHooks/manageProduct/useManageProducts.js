import toast from "react-hot-toast";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { API } from "@/services/axios";
import { getSocket } from "@/services/socket";
import useMyProducts from "./useMyProducts";

const PRODUCT_STATUS = {
  PENDING: {
    label: "Chờ duyệt",
    className: "bg-amber-100 text-amber-900 border-amber-200",
  },
  AVAILABLE: {
    label: "Đang bán",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  REJECTED: {
    label: "Bị từ chối",
    className: "bg-gray-200 text-gray-800 border-gray-300",
  },
  LOCKED: {
    label: "Bị khóa",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  SOLD: {
    label: "Đã bán",
    className: "bg-slate-200 text-slate-800 border-slate-300",
  },
  HIDDEN: {
    label: "Đã ẩn",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
};

function useManageProducts() {
  const { user } = useContext(AuthContext);
  const { products, loading, handleUpdateStatus, refresh } = useMyProducts();
  const [vipTarget, setVipTarget] = useState(null);
  const navigate = useNavigate();

  // Xử lý logic thanh toán VIP khi redirect từ PayOS về
  useEffect(() => {
    // Dọn dẹp URL trên thanh trình duyệt
    const params = new URLSearchParams(window.location.search);
    const vip = params.get("vip_payment");
    if (!vip) return;

    params.delete("vip_payment");
    const next = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${next ? `?${next}` : ""}`,
    );

    if (vip === "success") {
      const raw = (() => {
        try {
          return sessionStorage.getItem("vip_checkout_order_code");
        } catch {
          return null;
        }
      })();
      const orderCode = raw != null && raw !== "" ? Number(raw) : NaN;

      if (user && Number.isFinite(orderCode)) {
        (async () => {
          for (let attempt = 0; attempt < 8; attempt += 1) {
            if (attempt > 0) {
              // Lần 1 nghỉ 2s, lần 2 nghỉ 2.5s, lần 3 nghỉ 3s...
              await new Promise((r) => setTimeout(r, 1500 + attempt * 500));
            }

            try {
              const { data } = await API.post("/payment/confirm-vip", {
                orderCode,
              });
              // Xóa mã cũ đi, báo thành công và load lại bảng
              sessionStorage.removeItem("vip_checkout_order_code");

              if (data?.already) {
                toast.success("Gói VIP đã kích hoạt.");
              } else {
                toast.success(
                  "Gói VIP đã kích hoạt. Tin hiển thị nổi bật trên trang chủ.",
                );
              }

              await refresh();
              return;
            } catch (e) {
              const status = e?.response?.status;
              const msg = e?.response?.data?.message;
              if (status === 409) continue;
              if (status === 404) break;

              toast.error(
                msg || "Chưa đồng bộ được VIP. Tải lại trang sau vài phút.",
              );
              await refresh();
              return;
            }
          }

          sessionStorage.removeItem("vip_checkout_order_code");

          toast(
            "Nếu đã trừ tiền mà trạng thái chưa đổi, hãy tải lại trang sau 1 phút (PayOS có thể trễ vài giây).",
            { icon: "ℹ️" },
          );

          await refresh();
        })();
      } else {
        toast(
          "Thanh toán đã ghi nhận. Tải lại trang nếu gói VIP chưa cập nhật (cần webhook PayOS công khai).",
        );
        refresh();
      }
    } else {
      toast("Bạn đã hủy thanh toán gói VIP.", { icon: "ℹ️" });
    }
  }, [refresh, user]);

  // Xử lý lắng nghe Socket ngầm
  useEffect(() => {
    if (!user) return;

    const socket = getSocket();

    if (!socket) return;

    const onVip = () => refresh();
    socket.on("payment:vip_success", onVip);

    return () => {
      socket.off("payment:vip_success", onVip);
    };
  }, [user, refresh]);

  const getStatusInfo = (status) => {
    if (status && PRODUCT_STATUS[status]) return PRODUCT_STATUS[status];

    return {
      label: status || "—",
      className: "bg-gray-100 text-gray-600 border-gray-200",
    };
  };

  const shouldShowVipUpgrade = (product) => {
    if (product.status !== "PENDING" && product.status !== "AVAILABLE") {
      return false;
    }

    if (!product.isVIP) return true;

    if (!product.vipUntil) return true;

    const end = new Date(product.vipUntil);

    const daysLeft = (end.getTime() - Date.now()) / 86_400_000;

    return daysLeft <= 7;
  };

  return {
    products,
    loading,
    handleUpdateStatus,
    refresh,
    navigate,
    vipTarget,
    setVipTarget,
    getStatusInfo,
    shouldShowVipUpgrade,
  };
}

export default useManageProducts;

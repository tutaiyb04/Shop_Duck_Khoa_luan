import { useState, useEffect } from "react";
import { API } from "@/services/axios";

export function useHeaderRecommendations(visible, user, { limit = 8 } = {}) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [source, setSource] = useState(null);
  const [error, setError] = useState(null);

  const userId = user?._id || user?.id;

  useEffect(() => {
    // nếu chưa mở thanh tìm kiếm hoặc chưa có user (chưa đăng nhập) thì không gọi API lấy gợi ý
    if (!visible || !userId) {
      if (!userId) {
        setProducts([]); // không có mảng sản phẩm
        setSource(null); // không có nguồn sản phẩm (hybrid, cf, cbf)
      }
      setError(null); // ko hiển thị lỗi
      return undefined;
    }

    let cancelled = false; // cờ để hàm cleanup ko cập nhật state khi unmount -> tránh đóng panel rồi vẫn còn gợi ý
    setLoading(true);
    setError(null);

    // lấy gợi ý sản phẩm cho user - Tạo hàm bất đồng bộ và gọi luôn, useEffect callback ko đc là async trực tiếp
    // -> tránh promise bỏ qua và khó cleanup đúng cách
    (async () => {
      try {
        const { data } = await API.get("/products/recommendations", {
          params: { limit },
        });

        if (cancelled) return; // user đóng panel / đổi user -> ko cần lấy gợi ý

        setProducts(Array.isArray(data.products) ? data.products : []); // cập nhật mảng sản phẩm
        setSource(data.source ?? null); // cập nhật nguồn sản phẩm
      } catch (e) {
        if (cancelled) return;

        const msg = e.response?.data?.message || e.message || "Không tải được gợi ý";
          
        setError(msg);
        setProducts([]);
        setSource(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    // user đóng panel / đổi user -> hàm cleanup đc gọi, cờ cancelled đc set thành true -> hàm bất đồng bộ bị cancel
    return () => {
      cancelled = true;
    };
  }, [visible, limit, userId]);

  return { loading, products, source, error };
}

import { useState, useEffect } from "react";
import { API } from "@/services/axios";

export function useHeaderRecommendations(visible, user, { limit = 8 } = {}) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [source, setSource] = useState(null);
  const [error, setError] = useState(null);

  const userId = user?._id || user?.id;

  useEffect(() => {
    // nếu không có user hoặc không có visible thì không lấy gợi ý
    if (!visible || !userId) {
      if (!userId) {
        setProducts([]);
        setSource(null);
      }
      setError(null);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    // lấy gợi ý sản phẩm cho user
    (async () => {
      try {
        const { data } = await API.get("/products/recommendations", {
          params: { limit },
        });

        if (cancelled) return; // nếu đã bị cancel thì không lấy gợi ý

        setProducts(Array.isArray(data.products) ? data.products : []);
        setSource(data.source ?? null);
      } catch (e) {
        if (cancelled) return;

        const msg =
          e.response?.data?.message || e.message || "Không tải được gợi ý";
          
        setError(msg);
        setProducts([]);
        setSource(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, limit, userId]);

  return { loading, products, source, error };
}

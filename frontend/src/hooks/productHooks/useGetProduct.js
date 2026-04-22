import { API } from "@/services/axios";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

export function useGetProduct() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const search = (searchParams.get("search") || "").trim();
  const lat = searchParams.get("lat") || "";
  const lng = searchParams.get("lng") || "";
  const radius = searchParams.get("radius") || "";

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (search) params.search = search;
      if (lat && lng) {
        params.lat = lat;
        params.lng = lng;
        params.radius = radius || "5000";
      }
      const response = await API.get("/products", { params });
      setProducts(response.data.products || []);
    } catch (error) {
      console.log("Lỗi tải sản phẩm: ", error);
      toast.error("Lỗi khi tải sản phẩm");
    } finally {
      setIsLoading(false);
    }
  }, [search, lat, lng, radius]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    refresh: fetchProducts,
    /** Từ khóa đang lọc (từ URL), dùng cho UI */
    activeSearch: search,
    /** Đang lọc theo vị trí gần đây */
    hasLocationFilter: Boolean(lat && lng),
  };
}

import { API } from "@/services/axios";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

export function useGetProduct() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const search = (searchParams.get("search") || "").trim(); // từ khóa tìm kiếm từ URL (backend regex)
  const category = (searchParams.get("category") || "").trim(); // danh mục từ URL (ObjectId)
  const lat = searchParams.get("lat") || "";
  const lng = searchParams.get("lng") || "";
  const radius = searchParams.get("radius") || "";

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {};

      if (search) params.search = search;
      if (category) params.category = category;
      if (lat && lng) {
        params.lat = lat;
        params.lng = lng;
        params.radius = radius || "5000";
      }
      // nếu có bộ lọc thì giới hạn số sản phẩm hiển thị - thu hẹp kết quả có thì hiển thị 24 sản phẩm, không thì hiển thị 48 sản phẩm
      const narrow = Boolean(search) || Boolean(category) || (Boolean(lat) && Boolean(lng)); 
      params.limit = narrow ? 24 : 48; 

      const response = await API.get("/products", { params });
      setProducts(response.data.products || []);
    } catch (error) {
      console.log("Lỗi tải sản phẩm: ", error);
      toast.error("Lỗi khi tải sản phẩm");
    } finally {
      setIsLoading(false);
    }
  }, [search, category, lat, lng, radius]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    refresh: fetchProducts, // Gọi lại fetchProducts() tay (pull-to-refresh / nút làm mới nếu có)
    activeSearch: search, // Từ khóa đang lọc (từ URL), dùng cho UI
    activeCategory: category, // Danh mục đang lọc (từ URL), dùng cho UI
    hasLocationFilter: Boolean(lat && lng), // Đang lọc theo vị trí gần đây
  };
}

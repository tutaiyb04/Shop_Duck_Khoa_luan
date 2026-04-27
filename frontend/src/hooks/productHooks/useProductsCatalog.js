import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { API } from "@/services/axios";
import toast from "react-hot-toast";

const PAGE_SIZE = 20;

export function useProductsCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  const category = (searchParams.get("category") || "").trim();
  const minPrice = (searchParams.get("minPrice") || "").trim();
  const maxPrice = (searchParams.get("maxPrice") || "").trim();
  const province = (searchParams.get("province") || "").trim();
  const condition = (searchParams.get("condition") || "").trim();
  const vipOnly = searchParams.get("vip") === "1";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  // hàm dùng thay đổi bộ lọc
  const setParams = useCallback(
    (updates, { resetPage = true } = {}) => {
      setSearchParams(
        (prev) => {
          // đọc các thông số trên URL
          const next = new URLSearchParams(prev);

          Object.entries(updates).forEach(([key, value]) => {
            const v = value != null ? String(value).trim() : "";

            if (v) {
              next.set(key, v);
            }
            else {
              next.delete(key);
            }
          });
          
          if (resetPage) { 
            next.set("page", "1");
          }
          return next;
        },

        { replace: true },
      );
    },
    [setSearchParams],
  );

  // chuyển trang
  const goToPage = useCallback(
    (p) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          
          next.set("page", String(Math.max(1, p)));
          
          return next;
        },
        
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // lấy danh mục
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await API.get("/categories");

        const list = res.data?.category || res.data || [];

        if (!cancelled) { 
          setCategories(Array.isArray(list) ? list : []);
        }
      } catch {
        if (!cancelled) {
          setCategories([]);
        }
      } finally {
        if (!cancelled) { 
          setLoadingCats(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const parentCategories = useMemo(() => {
    const roots = categories.filter((c) => c.parentId == null);

    return [...roots].sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""), "vi", {
        sensitivity: "base",
      }),
    );
  }, [categories]);

  // lấy sản phẩm
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);

        const params = { page, limit: PAGE_SIZE };

        if (category) {
          params.category = category;
        }
          
        if (minPrice) {
          params.minPrice = minPrice;
        }
          
        if (maxPrice) {
          params.maxPrice = maxPrice;
        }

        if (province) {
          params.province = province;
        }

        if (condition) {
          params.condition = condition;
        }

        if (vipOnly) {
          params.vip = "1";
        }

        const { data } = await API.get("/products", { params });
        
        if (cancelled) return;
        setProducts(data.products || []);
        const pag = data.pagination || {};
        setPagination({
          currentPage: pag.currentPage || page,
          totalPages: pag.totalPages || 1,
        });
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          toast.error("Không tải được danh sách sản phẩm");
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category, minPrice, maxPrice, province, condition, vipOnly, page]);

  const activePriceRangeId = useMemo(() => {
    if (!minPrice && !maxPrice) {
      return "all";
    }
    const found = [
      { id: "lt100k", min: "", max: "100000" },
      { id: "100k-500k", min: "100000", max: "500000" },
      { id: "500k-1m", min: "500000", max: "1000000" },
      { id: "1m-5m", min: "1000000", max: "5000000" },
      { id: "gt5m", min: "5000000", max: "" },
    ].find((r) => r.min === minPrice && r.max === maxPrice);
    
    return found ? found.id : "custom";
  }, [minPrice, maxPrice]);

  const activeCategoryName = useMemo(() => {
    if (!category) return "";
    const found = categories.find((c) => String(c._id) === category);
    return found?.name?.trim() || "";
  }, [category, categories]);

  return {
    products,
    loading,
    loadingCats,
    parentCategories,
    pagination,
    filters: {
      category,
      minPrice,
      maxPrice,
      province,
      condition,
      page,
      vipOnly,
    },
    activePriceRangeId,
    activeCategoryName,
    setParams,
    goToPage,
  };
}

import { useEffect, useMemo, useState } from "react";
import { useGetProduct } from "@/hooks/productHooks/useGetProduct";
import { API } from "@/services/axios";

function sortByNewest(a, b) {
  const ta = new Date(a?.createdAt || 0).getTime();
  const tb = new Date(b?.createdAt || 0).getTime();
  return tb - ta;
}

export function useHomePage() {
  const {
    products,
    isLoading,
    activeSearch,
    activeCategory,
    hasLocationFilter,
  } = useGetProduct();

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [categoryRows, setCategoryRows] = useState([]);

  const isFiltered = Boolean(
    activeSearch || hasLocationFilter || activeCategory,
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await API.get("/categories");
        const list = res.data?.category || res.data || [];
        if (!cancelled) setCategories(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setLoadingCats(false);
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

  const activeCategoryName = useMemo(() => {
    if (!activeCategory) return "";
    const found = categories.find((c) => String(c._id) === activeCategory);
    return found?.name || "Danh mục";
  }, [activeCategory, categories]);

  useEffect(() => {
    if (isFiltered) {
      setCategoryRows([]);
      return;
    }
    if (parentCategories.length === 0) {
      setCategoryRows([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const rows = await Promise.all(
          parentCategories.map(async (c) => {
            const { data } = await API.get("/products", {
              params: { category: c._id, limit: 5 },
            });
            return {
              _id: c._id,
              name: c.name,
              products: data.products || [],
            };
          }),
        );
        if (!cancelled) setCategoryRows(rows);
      } catch {
        if (!cancelled) setCategoryRows([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [parentCategories, isFiltered]);

  const vipProducts = useMemo(
    () => products.filter((p) => p.isVIP),
    [products],
  );
  const newProducts = useMemo(() => {
    const nonVip = products.filter((p) => !p.isVIP);
    return [...nonVip].sort(sortByNewest);
  }, [products]);

  /** Chỉ hiển thị 10 tin mới nhất trên trang chủ (2 hàng × 5 cột trên desktop) */
  const newProductsPreview = useMemo(
    () => newProducts.slice(0, 10),
    [newProducts],
  );

  const sectionTitle = useMemo(() => {
    let title = "Sản phẩm mới đăng";
    if (activeSearch && hasLocationFilter) {
      title = `Kết quả “${activeSearch}” gần bạn`;
    } else if (activeSearch) {
      title = `Kết quả cho “${activeSearch}”`;
    } else if (hasLocationFilter) {
      title = "Sản phẩm gần bạn";
    } else if (activeCategory) {
      title = `Danh mục: ${activeCategoryName}`;
    }
    return title;
  }, [
    activeSearch,
    hasLocationFilter,
    activeCategory,
    activeCategoryName,
  ]);

  const emptyMessage = useMemo(() => {
    let message = "Chưa có sản phẩm nào được rao bán.";
    if (isFiltered) {
      message = activeSearch
        ? `Không tìm thấy sản phẩm phù hợp với “${activeSearch}”.`
        : "Không có sản phẩm nào trong bán kính đã chọn.";
      if (activeCategory && !activeSearch && !hasLocationFilter) {
        message = "Chưa có sản phẩm trong danh mục này.";
      }
    }
    return message;
  }, [isFiltered, activeSearch, activeCategory, hasLocationFilter]);

  const showDiscovery =
    !isFiltered &&
    !isLoading &&
    (vipProducts.length > 0 || newProducts.length > 0);

  return {
    products,
    isLoading,
    activeSearch,
    activeCategory,
    hasLocationFilter,
    loadingCats,
    parentCategories,
    categoryRows,
    isFiltered,
    vipProducts,
    newProducts,
    newProductsPreview,
    showDiscovery,
    sectionTitle,
    emptyMessage,
  };
}

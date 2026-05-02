import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { API } from "@/services/axios";

const PRODUCT_PAGE_SIZE = 12;
const REVIEW_PAGE_SIZE = 8;

export function useShopCatalog(sellerId) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [seller, setSeller] = useState(null);
  const [filterCategories, setFilterCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [productPagination, setProductPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [reviewPagination, setReviewPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);

  const shopHydratedRef = useRef(false);

  const category = (searchParams.get("category") || "").trim();
  const condition = (searchParams.get("condition") || "").trim();
  const minPrice = (searchParams.get("minPrice") || "").trim();
  const maxPrice = (searchParams.get("maxPrice") || "").trim();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  useEffect(() => {
    shopHydratedRef.current = false;
    setSeller(null);
    setFilterCategories([]);
    setProducts([]);
    setProductPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
    setError(null);
    setReviewPage(1);
    setLoading(true);
  }, [sellerId]);

  const setParams = useCallback(
    (updates, { resetPage = true } = {}) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(updates).forEach(([key, value]) => {
            const v = value != null ? String(value).trim() : "";
            if (v) next.set(key, v);
            else next.delete(key);
          });
          if (resetPage) next.set("page", "1");
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const goToProductPage = useCallback(
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

  const goToReviewPage = useCallback((p) => {
    setReviewPage(Math.max(1, p));
  }, []);

  const loadProducts = useCallback(async () => {
    if (!sellerId?.trim()) {
      setSeller(null);
      setFilterCategories([]);
      setProducts([]);
      setError("Shop không hợp lệ.");
      setLoading(false);
      setProductsLoading(false);
      return;
    }

    const fullPage = !shopHydratedRef.current;
    if (fullPage) {
      setLoading(true);
    } else {
      setProductsLoading(true);
    }
    setError(null);

    try {
      const { data } = await API.get(
        `/products/shop/${encodeURIComponent(sellerId.trim())}`,
        {
          params: {
            page,
            limit: PRODUCT_PAGE_SIZE,
            ...(category ? { category } : {}),
            ...(condition ? { condition } : {}),
            ...(minPrice ? { minPrice } : {}),
            ...(maxPrice ? { maxPrice } : {}),
          },
        },
      );
      setSeller(data.seller || null);
      setFilterCategories(
        Array.isArray(data.filterCategories) ? data.filterCategories : [],
      );
      setProducts(Array.isArray(data.products) ? data.products : []);
      const pag = data.pagination || {};
      setProductPagination({
        currentPage: pag.currentPage || page,
        totalPages: pag.totalPages || 1,
        totalItems: pag.totalItems ?? 0,
      });
      if (fullPage) shopHydratedRef.current = true;
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Không tải được gian hàng.";
      if (fullPage) {
        setError(msg);
        setSeller(null);
        setFilterCategories([]);
        setProducts([]);
        setProductPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
        });
      }
    } finally {
      if (fullPage) {
        setLoading(false);
      } else {
        setProductsLoading(false);
      }
    }
  }, [sellerId, page, category, condition, minPrice, maxPrice]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (!sellerId?.trim()) {
      setReviews([]);
      setReviewPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
      return;
    }

    let cancelled = false;

    (async () => {
      setReviewsLoading(true);
      try {
        const { data } = await API.get(
          `/reviews/seller/${encodeURIComponent(sellerId.trim())}`,
          { params: { page: reviewPage, limit: REVIEW_PAGE_SIZE } },
        );
        if (cancelled) return;
        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
        const pag = data.pagination || {};
        setReviewPagination({
          currentPage: pag.currentPage || reviewPage,
          totalPages: pag.totalPages || 1,
          totalItems: pag.totalItems ?? 0,
        });
      } catch {
        if (!cancelled) {
          setReviews([]);
          setReviewPagination({
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
          });
        }
      } finally {
        if (!cancelled) setReviewsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sellerId, reviewPage]);

  const activePriceRangeId = useMemo(() => {
    if (!minPrice && !maxPrice) return "all";
    const found = [
      { id: "lt100k", min: "", max: "100000" },
      { id: "100k-500k", min: "100000", max: "500000" },
      { id: "500k-1m", min: "500000", max: "1000000" },
      { id: "1m-5m", min: "1000000", max: "5000000" },
      { id: "gt5m", min: "5000000", max: "" },
    ].find((r) => r.min === minPrice && r.max === maxPrice);
    return found ? found.id : "custom";
  }, [minPrice, maxPrice]);

  return {
    seller,
    filterCategories,
    products,
    productPagination,
    loading,
    productsLoading,
    error,
    filters: { category, condition, minPrice, maxPrice, page },
    setParams,
    goToProductPage,
    activePriceRangeId,
    reviews,
    reviewPagination,
    reviewsLoading,
    goToReviewPage,
  };
}

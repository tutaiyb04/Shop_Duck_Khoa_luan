import { useEffect, useMemo, useRef, useState } from "react";
import { API } from "@/services/axios";

const DEBOUNCE_MS = 600;
const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/;

export function usePricingSuggestion(form) {
  // theo dõi trạng thái form
  const categoryId = form.watch("category");
  const condition = form.watch("condition");
  const sizeAttr = form.watch("attributes.size");

  // chuyển đổi categoryId thành chuỗi
  const categoryStr =
    categoryId == null ? "" : String(categoryId).trim();

  // kiểm tra xem categoryStr có phải là ObjectId không
  const categoryOk = OBJECT_ID_RE.test(categoryStr);

  // chuyển đổi condition thành chuỗi
  const conditionStr =
    condition == null ? "" : String(condition).trim().normalize("NFC");
  const conditionOk = conditionStr.length > 0;

  // kiểm soát tránh gọi API liên tục
  const ready = categoryOk && conditionOk;

  const payload = useMemo(() => {
    if (!ready) return null;
    const attrs = {};
    if (sizeAttr != null && String(sizeAttr).trim() !== "") {
      attrs.size = String(sizeAttr).trim();
    }
    return {
      categoryId: categoryStr,
      condition: conditionStr,
      excludeOwnListings: true,
      ...(Object.keys(attrs).length > 0 ? { attributes: attrs } : {}),
    };
  }, [ready, categoryStr, conditionStr, sizeAttr]);

  // dùng để gom categoryId, condition, sizeAttr thành một object duy nhất
  const payloadKey = useMemo(
    () => (ready && payload ? JSON.stringify(payload) : ""),
    [ready, payload],
  );

  const [request, setRequest] = useState({
    resolvedKey: "",
    loading: false,
    error: null,
    suggestion: null,
  });

  const abortRef = useRef(null);
  const debounceRef = useRef(null);
  const fetchGenRef = useRef(0);

  // gọi API để lấy gợi ý giá
  useEffect(() => {
    if (!ready || !payload || !payloadKey) {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }

      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;
      const key = payloadKey;
      const gen = ++fetchGenRef.current;

      setRequest((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      API.post("/products/pricing-suggestion", payload, {
        signal: controller.signal,
      })
        .then((res) => {
          if (controller.signal.aborted || gen !== fetchGenRef.current) return;
          setRequest({
            resolvedKey: key,
            loading: false,
            error: null,
            suggestion: res.data?.suggestion ?? null,
          });
        })
        .catch((err) => {
          if (
            err.name === "CanceledError" ||
            err.code === "ERR_CANCELED" ||
            controller.signal.aborted
          ) {
            if (gen === fetchGenRef.current) {
              setRequest((prev) => ({ ...prev, loading: false }));
            }
            return;
          }
          if (gen !== fetchGenRef.current) return;
          const msg =
            err.response?.data?.message ||
            "Không lấy được gợi ý giá. Thử lại sau.";
          setRequest({
            resolvedKey: key,
            loading: false,
            error: msg,
            suggestion: null,
          });
        });
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [ready, payload, payloadKey]);

  // hủy request khi component unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // trạng thái gợi ý giá
  const dormant = !ready;

  // kiểm tra xem có request đang chạy hoặc request cũ không
  const inFlightOrStale =
    ready &&
    payloadKey !== "" &&
    (request.loading || request.resolvedKey !== payloadKey);

  // tổng hợp mọi tình huống lại thành 4 "màu sắc" trạng thái rõ ràng
  const phase = dormant
    ? "dormant"
    : inFlightOrStale
      ? "loading"
      : request.error && request.resolvedKey === payloadKey
        ? "error"
        : "success";

  const suggestion =
    dormant || request.resolvedKey !== payloadKey
      ? null
      : request.suggestion;

  const errorMessage =
    !dormant && request.resolvedKey === payloadKey ? request.error : null;

  return {
    phase,
    suggestion,
    errorMessage,
    ready,
  };
}

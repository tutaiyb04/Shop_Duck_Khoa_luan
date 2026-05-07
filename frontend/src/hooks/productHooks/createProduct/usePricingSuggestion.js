import { useEffect, useMemo, useRef, useState } from "react";
import { API } from "@/services/axios";

const DEBOUNCE_MS = 600; // user thay đổi category / condition / size, chờ 600ms không đổi nữa mới gọi API
const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/; // kiểm tra xem chuỗi có đúng dạng Mongo ObjectId không

export function usePricingSuggestion(form) {
  // theo dõi mỗi khi user đổi field, hook chạy lại và tính lại
  const categoryId = form.watch("category");
  const condition = form.watch("condition");
  const sizeAttr = form.watch("attributes.size");

  // chuyển đổi categoryId thành chuỗi
  const categoryStr = categoryId == null ? "" : String(categoryId).trim();

  // kiểm tra xem categoryStr có phải là Mongo ObjectId hợp lệ không
  const categoryOk = OBJECT_ID_RE.test(categoryStr);

  // chuyển đổi condition thành chuỗi
  const conditionStr =
    condition == null ? "" : String(condition).trim().normalize("NFC");
  const conditionOk = conditionStr.length > 0; // đã chọn tình trạng hay chưa

  // chỉ gọi API khi đã chọn danh mục và tình trạng
  const ready = categoryOk && conditionOk;

  const payload = useMemo(() => {
    if (!ready) return null; // chỉ build body khi ready

    const attrs = {};

    // Nếu user điền size -> gợi ý theo cùng danh mục + bộ lọc + size
    if (sizeAttr != null && String(sizeAttr).trim() !== "") {
      attrs.size = String(sizeAttr).trim();
    }

    return {
      categoryId: categoryStr,
      condition: conditionStr,
      excludeOwnListings: true, // backend sẽ không tính các tin đăng bán của chính user đó
      ...(Object.keys(attrs).length > 0 ? { attributes: attrs } : {}),
    };
  }, [ready, categoryStr, conditionStr, sizeAttr]);

  // chuỗi đại diện duy nhất -> ktra res trả về có khớp với lần gọi mới nhất không
  const payloadKey = useMemo(
    () => (ready && payload ? JSON.stringify(payload) : ""),
    [ready, payload],
  );

  // kết quả 1 vòng gọi API gần nhất
  const [request, setRequest] = useState({
    resolvedKey: "", // payloadKey tại thời điểm req đó hoàn thành -> so sánh với payloadKey hiện tại
    loading: false, // đang chờ res
    error: null,
    suggestion: null, // obj gợi ý
  });

  const abortRef = useRef(null); // giữ AbortController hiện tại -> khi đổi nhanh bộ lọc có thể hủy req cũ
  const debounceRef = useRef(null); // clear khi tác dụng phụ chạy lại hoặc unmount
  const fetchGenRef = useRef(0); // số tăng dần mỗi lần bắt đầu fetch mới -> res về sau 1 lần fetch mới hơn thì bỏ qua

  // gọi API để lấy gợi ý giá
  useEffect(() => {
    // nếu chưa ready / không có payload / không có payloadKey -> hủy mọi debounce/abort đang treo, không fetch
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

    // clear API cũ để setTimeout mới chạy
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // chạy sau 600ms kể từ khi user thay đổi bộ lọc và không sửa
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null; // timeout đã kích hoạt -> ref ko cần giữ id timeout nữa

      // hủy request HTTP Request trước nếu còn sau 600ms đã chọn bộ lọc
      if (abortRef.current) {
        abortRef.current.abort();
      }

      // tạo AbortController mới -> cho mỗi req mới để có thể dùng
      const controller = new AbortController();
      abortRef.current = controller; // giữ AbortController hiện tại -> để abort() đúng controller của req vừa gửi

      const key = payloadKey; // payloadKey tại thời điểm req đó hoàn thành -> so sánh với payloadKey hiện tại
      const gen = ++fetchGenRef.current; // số tăng dần mỗi lần bắt đầu fetch mới -> res về sau 1 lần fetch mới hơn thì bỏ qua

      // báo ui -> đang tải gợi ý
      setRequest((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      API.post("/products/pricing-suggestion", payload, {
        signal: controller.signal,
      })
        .then((res) => {
          // đã hủy thì không cập nhật state || đã có fetch mới hơn -> res cũ lỗi thời, ko setRequest
          if (controller.signal.aborted || gen !== fetchGenRef.current) return;

          setRequest({
            resolvedKey: key,
            loading: false,
            error: null,
            suggestion: res.data?.suggestion ?? null,
          });
        })
        .catch((err) => {
          // nhánh hủy (cancel)
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

          // nhánh lỗi
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

    // clean upp -> tránh gọi lại API
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

  //  chưa đủ category/condition → panel có thể mờ / “chưa kích hoạt”
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

  // tránh flash dữ liệu cũ
  const suggestion =
    dormant || request.resolvedKey !== payloadKey ? null : request.suggestion;

  const errorMessage =
    !dormant && request.resolvedKey === payloadKey ? request.error : null;

  return {
    phase,
    suggestion,
    errorMessage,
    ready,
  };
}

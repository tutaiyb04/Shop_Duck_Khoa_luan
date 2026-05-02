import { NavLink, useNavigate } from "react-router-dom";
import { Sparkles, Loader2, ChevronRight } from "lucide-react";

// dịch mã nguồn của danh sách gợi ý
const sourceHint = (src) => {
  if (src === "hybrid") return "CF + CBF";
  if (src === "cbf") return "theo nội dung";
  if (src === "cf") return "theo cộng đồng";
  return null;
}

// hàm hiển thị giá sản phẩm
const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

// hàm hiển thị label cho nguồn gợi ý
const methodLabel = (m) => {
  if (m === "hybrid") return "CF+CBF";
  if (m === "content") return "CBF";
  if (m === "collaborative") return "CF";
  return null;
}

export default function HeaderSearchRecommendations({
  user,
  loading,
  products,
  source,
  error,
  compact = false,
  onPickProduct,
}) {
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="px-3 py-3 border-t border-amber-100/80 bg-amber-50/40">
        <p className="text-xs text-amber-900/90 font-medium leading-snug">
          Đăng nhập để xem gợi ý theo lịch sử mua, đánh giá, wishlist — kết hợp
          Collaborative Filtering &amp; Content-Based.
        </p>
        <div className="mt-2 flex gap-2">
          <NavLink
            to="/login"
            className="text-xs font-semibold !transition-colors !text-yellow-600 hover:!text-yellow-700"
          >
            Đăng nhập
          </NavLink>
          <span className="text-muted-foreground text-xs">·</span>
          <NavLink
            to="/register"
            className="text-xs font-semibold !transition-colors !text-yellow-600 hover:!text-yellow-700"
          >
            Đăng ký
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-100">
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gradient-to-r from-amber-50/90 to-white">
        <div className="flex items-center gap-1.5 min-w-0">
          <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span className="text-xs font-semibold text-gray-800 truncate">
            Gợi ý cho bạn
          </span>
          {sourceHint(source) && (
            <span className="text-xxs text-muted-foreground shrink-0 hidden sm:inline">
              ({sourceHint(source)})
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => navigate("/products")}
          className="text-xxs font-medium text-yellow-700 hover:underline flex items-center gap-0.5 shrink-0 !transition-colors !border-gray-300 !bg-white hover:!bg-gray-100"
        >
          Xem thêm
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      {error && (
        <p className="px-3 py-2 text-xs text-destructive">{error}</p>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs">Đang tải gợi ý…</span>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="px-3 py-3 text-xs text-muted-foreground leading-relaxed">
          Chưa có gợi ý. Thử thêm vào yêu thích, hoặc hoàn tất đơn / đánh giá — hệ
          thống sẽ học từ danh mục, từ khóa trong tin bạn quan tâm.
        </p>
      )}

      {!loading && products.length > 0 && (
        <ul
          className={
            compact
              ? "max-h-[240px] overflow-y-auto divide-y divide-gray-50"
              : "max-h-[280px] overflow-y-auto divide-y divide-gray-50"
          }
        >
          {products.map((p) => (
            <li key={p._id}>
              <button
                type="button"
                className="w-full flex gap-2.5 px-3 py-2 text-left hover:bg-amber-50/50 transition-colors"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onPickProduct?.();
                  navigate(`/product/${p._id}`);
                }}
              >
                <div className="h-12 w-12 shrink-0 rounded-md overflow-hidden bg-muted">
                  <img
                    src={p.images?.[0]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-900 line-clamp-2 leading-snug">
                    {p.name}
                  </p>
                  <p className="text-xs font-bold text-gray-900 mt-0.5">
                    {formatPrice(p.price)}
                  </p>
                  {p.condition && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span>{p.condition}</span>
                      {methodLabel(p.recommendation?.method) && (
                        <span className="rounded bg-amber-100/90 px-1 py-px text-[9px] font-semibold text-amber-900">
                          {methodLabel(p.recommendation?.method)}
                        </span>
                      )}
                    </p>
                  )}
                  {!p.condition && methodLabel(p.recommendation?.method) && (
                    <p className="text-[10px] mt-0.5">
                      <span className="rounded bg-amber-100/90 px-1 py-px text-[9px] font-semibold text-amber-900">
                        {methodLabel(p.recommendation?.method)}
                      </span>
                    </p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { Link } from "react-router-dom";
import { Leaf, Mail, MapPin, Phone, ShieldCheck, Truck } from "lucide-react";
import logoImage from "@/assets/logo1.png";

/** Chỉnh thông tin liên hệ tại đây (dự án / demo). */
const CONTACT = {
  /** Gán số thật + dùng `telHref` (vd. +84901234567) để bật gọi trên mobile. */
  phoneDisplay: "0900 xxx xxx",
  telHref: null,
  email: "hotro@duckshop.vn",
  address: "Việt Nam",
};

const linkClass =
  "text-sm text-slate-600 transition-colors hover:text-amber-700 hover:underline";
const headingClass =
  "mb-3 text-xs font-bold uppercase tracking-wider text-slate-800";

function FooterLink({ to, children }) {
  return (
    <Link to={to} className={`${linkClass} block py-0.5`}>
      {children}
    </Link>
  );
}

function FooterNote({ children }) {
  return (
    <span className="block py-0.5 text-sm text-slate-500">{children}</span>
  );
}

/**
 * Chân trang nhiều cột (tham khảo cấu trúc sàn C2C như Oreka) — đặt trong layout flex column.
 */
export default function Footer({ className = "" }) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={`shrink-0 border-t border-slate-200/90 bg-linear-to-b from-slate-50/80 to-white text-slate-600 ${className}`}
    >
      <div className="mx-auto max-w-6xl px-4 pb-8 pt-10 lg:px-6 lg:pb-10 lg:pt-12">
        {/* Dải cam kết ngắn — tương tự USP trên sàn đồ cũ */}
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          <div className="flex gap-3 rounded-xl border border-amber-100/80 bg-white/90 px-4 py-3 shadow-sm">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
              aria-hidden
            />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Mua bán có đảm bảo
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                Duck Shop hướng tới giao dịch minh bạch; khiếu nại được xử lý
                theo quy trình nền tảng.
              </p>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl border border-amber-100/80 bg-white/90 px-4 py-3 shadow-sm">
            <Truck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Giao nhận thuận tiện
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                Thỏa thuận giao hàng giữa người mua và người bán, cập nhật trạng
                thái đơn trong tài khoản.
              </p>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl border border-amber-100/80 bg-white/90 px-4 py-3 shadow-sm">
            <Leaf className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Vì môi trường xanh hơn
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                Tái sử dụng đồ cũ giúp kéo dài vòng đời sản phẩm, giảm rác thải
                ra môi trường.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-10 border-t border-slate-200/80 pt-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Cột thương hiệu */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-2">
              <img
                src={logoImage}
                alt="Duck Shop"
                className="h-9 w-auto object-contain opacity-95"
              />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              <span className="font-semibold text-slate-800">Duck Shop</span> —
              nền tảng mua bán đồ cũ, kết nối người bán và người mua với trải
              nghiệm đơn giản, an toàn hơn.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Duck Shop cam kết hướng tới nhận sản phẩm như mô tả hoặc hỗ trợ
              hoàn tiền theo chính sách áp dụng trên từng giao dịch.
            </p>
          </div>

          {/* Khám phá */}
          <nav className="lg:col-span-2" aria-label="Khám phá">
            <h2 className={headingClass}>Khám phá</h2>
            <FooterLink to="/">Trang chủ</FooterLink>
            <FooterLink to="/sell">Đăng bán</FooterLink>
            <FooterLink to="/wishlist">Yêu thích</FooterLink>
            <FooterLink to="/orders">Đơn hàng của tôi</FooterLink>
            <FooterLink to="/my-products">Sản phẩm đang bán</FooterLink>
          </nav>

          {/* Tài khoản & hỗ trợ */}
          <nav className="lg:col-span-2" aria-label="Tài khoản">
            <h2 className={headingClass}>Tài khoản</h2>
            <FooterLink to="/profile">Hồ sơ</FooterLink>
            <FooterLink to="/messages">Tin nhắn</FooterLink>
            <FooterLink to="/login">Đăng nhập</FooterLink>
            <FooterLink to="/register">Đăng ký</FooterLink>
          </nav>

          {/* Chính sách — placeholder văn bản (chưa có trang riêng) */}
          <nav className="lg:col-span-2" aria-label="Chính sách">
            <h2 className={headingClass}>Chính sách</h2>
            <FooterNote>Điều khoản dịch vụ</FooterNote>
            <FooterNote>Chính sách bảo mật</FooterNote>
            <FooterNote>Quy chế giải quyết tranh chấp</FooterNote>
            <FooterNote>Hướng dẫn an toàn khi giao dịch</FooterNote>
            <p className="mt-2 text-xs italic text-slate-400">
              Nội dung chi tiết sẽ được bổ sung theo phiên bản chính thức.
            </p>
          </nav>

          {/* Liên hệ */}
          <div className="lg:col-span-2">
            <h2 className={headingClass}>Liên hệ</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <Phone
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                  aria-hidden
                />
                {CONTACT.telHref ? (
                  <a href={`tel:${CONTACT.telHref}`} className={linkClass}>
                    {CONTACT.phoneDisplay}
                  </a>
                ) : (
                  <span className="text-sm text-slate-600">
                    {CONTACT.phoneDisplay}
                  </span>
                )}
              </li>
              <li className="flex gap-2">
                <Mail
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                  aria-hidden
                />
                <a href={`mailto:${CONTACT.email}`} className={linkClass}>
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex gap-2">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                  aria-hidden
                />
                <span className="text-slate-600">{CONTACT.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Thanh phụ: phương thức / vận chuyển — dạng text, không cần logo thương hiệu */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 border-t border-slate-200/60 pt-8 text-center sm:justify-start">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
            Thanh toán: COD · Chuyển khoản
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
            Giao hàng: Theo thỏa thuận
          </span>
        </div>

        <div className="mt-8 border-t border-slate-200/80 pt-6 text-center text-xs text-slate-500 sm:text-left">
          <p>
            © {year}{" "}
            <span className="font-semibold text-slate-700">Duck Shop</span>. Đã
            đăng ký bản quyền nội dung giao diện thuộc dự án.
          </p>
        </div>
      </div>
    </footer>
  );
}

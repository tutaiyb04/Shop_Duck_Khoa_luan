import { Link } from "react-router-dom";
import {
  CreditCard,
  Leaf,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import logoImage from "@/assets/logo1.png";
import { cn } from "@/lib/utils";

/** Chỉnh thông tin liên hệ tại đây (dự án / demo). */
const CONTACT = {
  /** Gán số thật + dùng `telHref` (vd. +84901234567) để bật gọi trên mobile. */
  phoneDisplay: "0344 076 552",
  telHref: null,
  email: "tutai241104@gmail.com",
  address: "Việt Nam",
};

const linkClass =
  "text-sm text-slate-600 transition-colors duration-200 hover:text-amber-800 hover:underline decoration-amber-600/30 underline-offset-2";

const sectionTitleClass =
  "mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-800";

function SectionTitle({ children }) {
  return (
    <h2 className={sectionTitleClass}>
      <span
        className="h-3 w-0.5 rounded-full bg-gradient-to-b from-amber-500 to-amber-600"
        aria-hidden
      />
      {children}
    </h2>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className={cn(
        linkClass,
        "block py-0.5 rounded-sm -mx-0.5 px-0.5",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-500/50",
      )}
    >
      {children}
    </Link>
  );
}

function FooterNote({ children }) {
  return (
    <span className="block py-0.5 text-sm text-slate-500 leading-snug">
      {children}
    </span>
  );
}

function UspCard({ icon, title, children }) {
  const UspIcon = icon;
  return (
    <div
      className={cn(
        "group flex gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm",
        "transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-amber-200/70 hover:shadow-md",
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          "bg-gradient-to-br from-amber-50 to-amber-100/60 text-amber-700",
          "ring-1 ring-amber-200/50 shadow-inner",
        )}
      >
        <UspIcon className="h-5 w-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 leading-snug">
          {title}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500 text-balance">
          {children}
        </p>
      </div>
    </div>
  );
}

/**
 * Chân trang nhiều cột (tham khảo cấu trúc sàn C2C như Oreka) — đặt trong layout flex column.
 */
export default function Footer({ className = "" }) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "relative shrink-0 overflow-hidden border-t border-slate-200/90",
        "bg-gradient-to-b from-slate-50/95 via-white to-slate-50/30 text-slate-600",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/35 to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 pb-6 pt-10 lg:px-6 lg:pb-8 lg:pt-12">
        {/* Dải cam kết — USP */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <UspCard icon={ShieldCheck} title="Mua bán có đảm bảo">
            Duck Shop hướng tới giao dịch minh bạch; khiếu nại được xử lý
            theo quy trình nền tảng.
          </UspCard>
          <UspCard icon={Truck} title="Giao nhận thuận tiện">
            Thỏa thuận giao hàng giữa người mua và người bán, cập nhật trạng
            thái đơn trong tài khoản.
          </UspCard>
          <UspCard icon={Leaf} title="Vì môi trường xanh hơn">
            Tái sử dụng đồ cũ giúp kéo dài vòng đời sản phẩm, giảm rác thải
            ra môi trường.
          </UspCard>
        </div>

        <div className="grid gap-10 border-t border-slate-200/70 pt-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg transition-transform duration-200 hover:opacity-90 active:scale-[0.99]"
            >
              <img
                src={logoImage}
                alt="Duck Shop"
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              <span className="font-semibold text-slate-800">Duck Shop</span>{" "}
              — nền tảng mua bán đồ cũ, kết nối người bán và người mua với
              trải nghiệm đơn giản, an toàn hơn.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Duck Shop cam kết hướng tới nhận sản phẩm như mô tả hoặc hỗ trợ
              hoàn tiền theo chính sách áp dụng trên từng giao dịch.
            </p>
          </div>

          <nav className="lg:col-span-2" aria-label="Khám phá">
            <SectionTitle>Khám phá</SectionTitle>
            <FooterLink to="/">Trang chủ</FooterLink>
            <FooterLink to="/sell">Đăng bán</FooterLink>
            <FooterLink to="/wishlist">Yêu thích</FooterLink>
            <FooterLink to="/orders">Đơn hàng của tôi</FooterLink>
            <FooterLink to="/my-products">Sản phẩm đang bán</FooterLink>
          </nav>

          <nav className="lg:col-span-2" aria-label="Tài khoản">
            <SectionTitle>Tài khoản</SectionTitle>
            <FooterLink to="/profile">Hồ sơ</FooterLink>
            <FooterLink to="/messages">Tin nhắn</FooterLink>
            <FooterLink to="/login">Đăng nhập</FooterLink>
            <FooterLink to="/register">Đăng ký</FooterLink>
          </nav>

          <nav className="lg:col-span-2" aria-label="Chính sách">
            <SectionTitle>Chính sách</SectionTitle>
            <FooterNote>Điều khoản dịch vụ</FooterNote>
            <FooterNote>Chính sách bảo mật</FooterNote>
            <FooterNote>Quy chế giải quyết tranh chấp</FooterNote>
            <FooterNote>Hướng dẫn an toàn khi giao dịch</FooterNote>
          </nav>

          <div className="lg:col-span-2">
            <SectionTitle>Liên hệ</SectionTitle>
            <ul className="space-y-0.5 text-sm">
              <li className="flex items-start gap-2.5 rounded-lg px-1 py-1.5 transition-colors hover:bg-slate-100/60">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50/90 text-amber-700 ring-1 ring-amber-100/80">
                  <Phone className="h-3.5 w-3.5" aria-hidden />
                </span>
                {CONTACT.telHref ? (
                  <a href={`tel:${CONTACT.telHref}`} className={linkClass}>
                    {CONTACT.phoneDisplay}
                  </a>
                ) : (
                  <span className="pt-0.5 text-sm text-slate-600">
                    {CONTACT.phoneDisplay}
                  </span>
                )}
              </li>
              <li className="flex items-start gap-2.5 rounded-lg px-1 py-1.5 transition-colors hover:bg-slate-100/60">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50/90 text-amber-700 ring-1 ring-amber-100/80">
                  <Mail className="h-3.5 w-3.5" aria-hidden />
                </span>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className={cn(linkClass, "pt-0.5 break-all")}
                >
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5 rounded-lg px-1 py-1.5 transition-colors hover:bg-slate-100/60">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50/90 text-amber-700 ring-1 ring-amber-100/80">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span className="pt-0.5 text-slate-600 leading-snug">
                  {CONTACT.address}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-1 rounded-2xl border border-slate-200/50 bg-slate-50/60 px-4 py-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-xs text-slate-500">
            © {year}{" "}
            <span className="font-semibold text-slate-700">Duck Shop</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}

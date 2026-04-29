import {
  CONTACT,
  EXPLORE_LINKS,
  ACCOUNT_LINKS,
  POLICY_LINKS,
} from "@/constants/footerData";
import { NavLink } from "react-router-dom";
import { Leaf, Mail, MapPin, Phone, ShieldCheck, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo1.png";
import UspCard from "./footer/UspCard";

const CURRENT_YEAR = new Date().getFullYear();

const linkClass =
  "mt-2 text-sm !text-slate-600 !transition-colors duration-200 hover:!text-yellow-600 hover:!underline decoration-yellow-600 underline-offset-2";

function SectionTitle({ children }) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-800">
      <span className="h-3 w-0.5 rounded-full bg-yellow-500" aria-hidden />
      {children}
    </h2>
  );
}

function FooterLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={cn(
        linkClass,
        "block py-0.5 rounded-sm -mx-0.5 px-0.5",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-500/50",
      )}
    >
      {children}
    </NavLink>
  );
}

export default function Footer({ className = "" }) {
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
            Duck Shop hướng tới giao dịch minh bạch; khiếu nại được xử lý theo
            quy trình nền tảng.
          </UspCard>
          <UspCard icon={Truck} title="Giao nhận thuận tiện">
            Thỏa thuận giao hàng giữa người mua và người bán, cập nhật trạng
            thái đơn trong tài khoản.
          </UspCard>
          <UspCard icon={Leaf} title="Vì môi trường xanh hơn">
            Tái sử dụng đồ cũ giúp kéo dài vòng đời sản phẩm, giảm rác thải ra
            môi trường.
          </UspCard>
        </div>

        <div className="grid gap-10 border-t border-slate-200/70 pt-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-3">
            <NavLink
              to="/"
              className="inline-flex items-center gap-2 rounded-lg transition-transform duration-200 hover:opacity-90 active:scale-[0.99]"
            >
              <img
                src={logoImage}
                alt="Duck Shop"
                className="h-9 w-auto object-contain"
              />
            </NavLink>
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

          <nav className="lg:col-span-2" aria-label="Khám phá">
            <SectionTitle>Khám phá</SectionTitle>
            {EXPLORE_LINKS.map((link) => (
              <FooterLink key={link.to} to={link.to}>
                {link.label}
              </FooterLink>
            ))}
          </nav>

          <nav className="lg:col-span-2" aria-label="Tài khoản">
            <SectionTitle>Tài khoản</SectionTitle>
            {ACCOUNT_LINKS.map((link) => (
              <FooterLink key={link.to} to={link.to}>
                {link.label}
              </FooterLink>
            ))}
          </nav>

          <nav className="lg:col-span-2" aria-label="Chính sách">
            <SectionTitle>Chính sách</SectionTitle>
            {POLICY_LINKS.map((item) =>
              item.to ? (
                <FooterLink key={item.to} to={item.to}>
                  {item.label}
                </FooterLink>
              ) : (
                <span
                  key={item.label}
                  className={cn(
                    "mt-2 block py-0.5 text-sm text-slate-500",
                    "rounded-sm -mx-0.5 px-0.5",
                  )}
                >
                  {item.label}
                </span>
              ),
            )}
          </nav>

          <div className="lg:col-span-3">
            <SectionTitle>Liên hệ</SectionTitle>
            <ul className="space-y-0.5 text-sm">
              <li className="flex items-center gap-2.5 rounded-lg px-1 py-1.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50/90 text-yellow-700 ring-1 ring-amber-100/80">
                  <Phone className="h-3.5 w-3.5" aria-hidden />
                </span>
                {CONTACT.telHref ? (
                  <NavLink to={`tel:${CONTACT.telHref}`} className={linkClass}>
                    {CONTACT.phoneDisplay}
                  </NavLink>
                ) : (
                  <span className="pt-0.5 text-sm text-slate-600">
                    {CONTACT.phoneDisplay}
                  </span>
                )}
              </li>
              <li className="flex items-center gap-2.5 rounded-lg px-1 py-1.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50/90 text-yellow-700 ring-1 ring-amber-100/80">
                  <Mail className="h-3.5 w-3.5" aria-hidden />
                </span>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className={cn(linkClass, "pt-0.5 break-all")}
                >
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5 rounded-lg px-1 py-1.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50/90 text-yellow-700 ring-1 ring-amber-100/80">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span className="pt-0.5 text-slate-600 leading-snug">
                  {CONTACT.address}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-center">
          <p className="text-sm text-slate-600">
            © {CURRENT_YEAR}{" "}
            <span className="font-semibold text-yellow-700">Duck Shop</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}

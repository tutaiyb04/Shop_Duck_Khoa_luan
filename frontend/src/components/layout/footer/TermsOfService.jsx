import { NavLink } from "react-router-dom";
import { FileText } from "lucide-react";

const SECTIONS = [
  {
    title: "1. Giới thiệu",
    body: [
      "Chúng tôi là Duck Shop — nền tảng kết nối người mua và người bán đồ đã qua sử dụng.",
      "Bằng việc truy cập, đăng ký tài khoản hoặc sử dụng dịch vụ trên Duck Shop, bạn xác nhận đã đọc, hiểu và đồng ý bị ràng buộc bởi các điều khoản dưới đây cùng các chính sách liên quan được Duck Shop công bố trên website.",
    ],
  },
  {
    title: "2. Định nghĩa",
    body: [
      '"Nền tảng" là website và các kênh/ứng dụng chính thức do Duck Shop vận hành.',
      '"Người dùng" là cá nhân hoặc tổ chức sử dụng Nền tảng, bao gồm người mua và người bán.',
      '"Giao dịch" là thỏa thuận mua bán giữa các Người dùng thông qua các công cụ hỗ trợ trên Nền tảng (đặt hàng, tin nhắn, v.v.).',
    ],
  },
  {
    title: "3. Tài khoản và bảo mật",
    body: [
      "Bạn cam kết cung cấp thông tin đăng ký trung thực và cập nhật khi có thay đổi.",
      "Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động phát sinh từ tài khoản của mình. Duck Shop có thể tạm khóa hoặc chấm dứt quyền sử dụng khi phát hiện dấu hiệu lạm dụng hoặc vi phạm.",
    ],
  },
  {
    title: "4. Nội dung và hành vi không được phép",
    body: [
      "Cấm đăng tải, mô tả hoặc rao bán hàng hóa vi phạm pháp luật Việt Nam; hàng giả, hàng cấm; nội dung lừa đảo, xâm phạm quyền sở hữu trí tuệ, quyền riêng tư hoặc danh dự người khác.",
      "Cấm sử dụng Nền tảng để spam, quấy rối, phát tán mã độc, tấn công kỹ thuật hoặc can thiệp vào hoạt động bình thường của hệ thống.",
    ],
  },
  {
    title: "5. Sản phẩm và giao dịch",
    body: [
      "Người bán chịu trách nhiệm về tính chính xác của mô tả, hình ảnh, tình trạng sản phẩm và việc thực hiện giao hàng/đổi trả theo thỏa thuận với người mua.",
      "Người mua có nghĩa vụ kiểm tra thông tin, liên hệ làm rõ (nếu cần) và thanh toán theo thỏa thuận. Hình thức vận chuyển, nhận hàng và thanh toán ngoài Nền tảng do hai bên tự thỏa thuận và chịu rủi ro tương ứng.",
      "Duck Shop có thể hỗ trợ khiếu nại theo quy trình nội bộ nhưng không phải là bên trực tiếp trong hợp đồng mua bán giữa Người dùng, trừ khi có quy định khác được công bố rõ trên Nền tảng.",
    ],
  },
  {
    title: "6. Miễn trừ và giới hạn trách nhiệm",
    body: [
      'Nền tảng được cung cấp "như hiện có". Trong phạm vi pháp luật cho phép, Duck Shop không bảo đảm Nền tảng không gián đoạn hoặc không có lỗi.',
      "Duck Shop không chịu trách nhiệm về tranh chấp trực tiếp giữa Người dùng, trừ trường hợp bắt buộc theo quy định pháp luật.",
    ],
  },
  {
    title: "7. Thay đổi điều khoản",
    body: [
      "Duck Shop có thể cập nhật Điều khoản dịch vụ. Phiên bản mới có hiệu lực kể từ thời điểm đăng trên Nền tảng. Việc bạn tiếp tục sử dụng dịch vụ sau khi thay đổi được coi là chấp nhận điều khoản mới.",
    ],
  },
  {
    title: "8. Liên hệ",
    body: [
      "Mọi thắc mắc liên quan Điều khoản dịch vụ, vui lòng liên hệ Duck Shop qua thông tin trên trang web (mục Liên hệ tại chân trang).",
    ],
  },
];

export default function TermsOfService() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 lg:px-6 lg:py-14">
      <div className="rounded-2xl border border-slate-200/90 bg-white/90 shadow-sm ring-1 ring-slate-100/80">
        <div className="border-b-1 border-slate-200 px-6 py-8 sm:px-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-yellow-700 ring-1 ring-amber-200">
              <FileText className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-yellow-600 sm:text-3xl">
                Điều khoản dịch vụ
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Áp dụng cho việc sử dụng nền tảng Duck Shop. Vui lòng đọc kỹ
                trước khi tiếp tục.
              </p>
              <p className="mt-3 text-xs text-slate-500">
                Cập nhật lần cuối: 29/04/2026
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8 px-6 py-8 sm:px-8">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-base font-semibold text-slate-900">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
                {section.body.map((paragraph, i) => (
                  <p key={`${section.title}-${i}`}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-b-2xl border-t border-slate-100 bg-slate-50/60 px-6 py-5 sm:px-8 sm:flex-row sm:items-center sm:justify-between">
          <NavLink
            to="/"
            className="text-sm font-medium !text-yellow-700 !transition-colors hover:!text-yellow-800"
          >
            ← Về trang chủ
          </NavLink>
        </div>
      </div>
    </div>
  );
}

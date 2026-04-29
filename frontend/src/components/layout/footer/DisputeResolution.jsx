import { NavLink } from "react-router-dom";
import { Scale } from "lucide-react";

const SECTIONS = [
  {
    title: "1. Mục đích và phạm vi",
    body: [
      "Quy chế này hướng dẫn cách Duck Shop hỗ trợ người dùng giải quyết mâu thuẫn, khiếu nại phát sinh liên quan giao dịch mua bán đồ đã qua sử dụng trên Nền tảng.",
      "Quy chế áp dụng cho tranh chấp giữa người mua và người bán khi hai bên đã sử dụng hoặc ghi nhận giao dịch thông qua Duck Shop, trong phạm vi quy định của pháp luật Việt Nam và Điều khoản dịch vụ của Duck Shop.",
    ],
  },
  {
    title: "2. Vai trò của Duck Shop",
    body: [
      "Duck Shop là bên trung gian kỹ thuật, cung cấp công cụ đăng tin, liên lạc và (khi có) kênh khiếu nại. Hợp đồng mua bán chủ yếu được xác lập giữa người mua và người bán.",
      "Các biện pháp xử lý của Duck Shop (tạm khóa tài khoản, gỡ tin, hỗ trợ hoàn tác…) mang tính hỗ trợ và vận hành Nền tảng, không thay thế phán quyết của Tòa án hoặc Trọng tài, trừ khi pháp luật có quy định khác.",
    ],
  },
  {
    title: "3. Nguyên tắc giải quyết",
    body: [
      "Ưu tiên đối thoại trực tiếp giữa các bên qua tin nhắn hoặc thỏa thuận ngoài Nền tảng khi phù hợp, nhằm thống nhất giao hàng, đổi trả hoặc hoàn tiền.",
      "Cung cấp thông tin trung thực, có bằng chứng (ảnh chụp, mã đơn, nội dung trao đổi trên hệ thống khi còn lưu được) để Duck Shop và các bên xem xét khách quan.",
      "Tuân thủ pháp luật về bảo vệ quyền lợi người tiêu dùng, hợp đồng và xử lý vi phạm hành chính/dân sự khi có căn cứ.",
    ],
  },
  {
    title: "4. Quy trình khiếu nại gợi ý",
    body: [
      "Bước 1 — Liên hệ đối tác giao dịch: trình bày vấn đề, đề xuất phương án trong thời gian sớm nhất sau khi phát hiện sai lệch so với mô tả hoặc không nhận được hàng.",
      "Bước 2 — Gửi yêu cầu hỗ trợ tới Duck Shop (qua kênh liên hệ công bố trên website, ví dụ email tại mục Liên hệ): ghi rõ mã đơn hoặc tin đăng, mô tả sự việc, đính kèm bằng chứng nếu có.",
      "Bước 3 — Duck Shop xem xét hồ sơ trong thời hạn hợp lý theo khả năng vận hành, có thể yêu cầu bổ sung thông tin hoặc làm việc với các bên. Kết quả được thông báo qua kênh liên hệ bạn đăng ký hoặc theo quy trình hiện hành trên Nền tảng.",
    ],
  },
  {
    title: "5. Trường hợp gian lận, hàng không đúng mô tả",
    body: [
      "Khi có dấu hiệu lừa đảo, hàng cấm hoặc vi phạm nghiêm trọng Điều khoản dịch vụ, Duck Shop có thể áp dụng biện pháp kỹ thuật và quản trị (cảnh báo, hạn chế tài khoản, gỡ nội dung) và hỗ trợ bạn lưu giữ thông tin cần thiết để tố cáo theo quy định pháp luật.",
    ],
  },
  {
    title: "6. Tranh chấp ra Tòa án hoặc Trọng tài",
    body: [
      "Nếu không đạt được thỏa thuận, các bên có quyền khởi kiện tại Tòa án có thẩm quyền theo quy định của Bộ luật Tố tụng Dân sự và pháp luật liên quan, hoặc giải quyết theo thỏa thuận trọng tài (nếu có) giữa các bên.",
    ],
  },
  {
    title: "7. Hiệu lực và cập nhật",
    body: [
      "Duck Shop có thể sửa đổi Quy chế này; phiên bản mới có hiệu lực kể từ khi đăng tải trên website. Việc tiếp tục sử dụng dịch vụ sau thay đổi được hiểu là bạn đã nắm được nội dung cập nhật trong phạm vi pháp luật cho phép.",
    ],
  },
  {
    title: "8. Liên hệ",
    body: [
      "Mọi yêu cầu liên quan khiếu nại và giải quyết tranh chấp, vui lòng liên hệ Duck Shop qua thông tin tại mục Liên hệ ở chân trang website.",
    ],
  },
];

export default function DisputeResolution() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 lg:px-6 lg:py-14">
      <div className="rounded-2xl border border-slate-200/90 bg-white/90 shadow-sm ring-1 ring-slate-100/80">
        <div className="border-b border-slate-200 px-6 py-8 sm:px-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-yellow-700 ring-1 ring-amber-200">
              <Scale className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-yellow-600 sm:text-3xl">
                Quy chế giải quyết tranh chấp
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Quy trình hỗ trợ khiếu nại và nguyên tắc xử lý tranh chấp trên
                Duck Shop.
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

        <div className="flex flex-col gap-3 rounded-b-2xl border-t border-slate-100 bg-slate-50/60 px-6 py-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-6 sm:gap-y-2">
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

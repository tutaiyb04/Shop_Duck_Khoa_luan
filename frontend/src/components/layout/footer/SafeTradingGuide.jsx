import { NavLink } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

const SECTIONS = [
  {
    title: "1. Giới thiệu",
    body: [
      "Tài liệu này tóm tắt gợi ý thực hành để bạn mua bán đồ đã qua sử dụng trên Duck Shop an toàn hơn. Đây là khuyến nghị mang tính hỗ trợ, không thay thế quy định pháp luật hay Điều khoản dịch vụ.",
    ],
  },
  {
    title: "2. Trước khi đặt mua hoặc liên hệ",
    body: [
      "Đọc kỹ mô tả, hình ảnh, tình trạng sản phẩm và các điều kiện đi kèm (đổi trả, phụ kiện). Nếu thiếu thông tin, hỏi rõ qua tin nhắn trên Nền tảng trước khi chốt.",
      'Xem hồ sơ người bán, thời gian tham gia và lịch sử tương tác (nếu hiển thị). Thận trọng với tài khoản mới, không có đánh giá hoặc tin quá "giá tốt bất thường" so với thị trường.',
      "Không chia sẻ mật khẩu, mã OTP ngân hàng hay mã xác thực tài khoản Duck Shop với bất kỳ ai — Duck Shop không bao giờ yêu cầu các thông tin này qua tin nhắn riêng.",
    ],
  },
  {
    title: "3. Thanh toán và cam kết trước khi giao hàng",
    body: [
      "Ưu tiên ghi nhận thỏa thuận bằng lời văn rõ ràng trên hệ thống (giá, phí ship, cách thanh toán, thời gian giao nhận).",
      "Hạn chế chuyển tiền trước toàn bộ khi chưa có tin cậy với đối tác hoặc chưa thống nhất cụ thể về hàng hóa. Cân nhắc cọc có giới hạn hoặc thanh toán khi nhận hàng nếu phù hợp.",
      'Không nhấp link lạ, không cài ứng dụng giả mạo theo hướng dẫn người lạ để "xác minh giao dịch" hay "nhận tiền".',
    ],
  },
  {
    title: "4. Khi giao nhận trực tiếp",
    body: [
      "Nên hẹn gặp ở nơi công cộng, có người qua lại; tránh đến địa chỉ xa, hẻm vắng nếu bạn không quen hoặc cảm thấy không an toàn.",
      "Kiểm tra hàng tại chỗ khi có thể: model, chức năng cơ bản, phụ kiện đúng với thỏa thuận. Giữ điện thoại đầy pin và thông báo cho người thân địa điểm, giờ gặp nếu cần.",
    ],
  },
  {
    title: "5. Giao hàng qua đơn vị vận chuyển",
    body: [
      "Thống nhất đóng gói, mã vận đơn và trách nhiệm khi hàng hỏng/mất trên đường. Người bán nên chụp ảnh sản phẩm trước khi gửi; người mua nên quay/chụp khi mở hàng nếu cần làm bằng chứng.",
      "Không gửi tiền qua kênh không rõ nguồn hoặc tài khoản cá nhân khác với thông tin người bán đã thỏa thuận.",
    ],
  },
  {
    title: "6. Dấu hiệu cần dừng giao dịch",
    body: [
      "Ép chuyển tiền gấp, đe dọa hoặc từ chối gặp/trả lời qua kênh chính thức của Nền tảng.",
      "Giá chào bán thấp hẳn so với mặt bằng, yêu cầu thanh toán ra nước ngoài hoặc ví không rõ danh tính.",
      "Đề nghị bạn cung cấp mã đăng nhập, thông tin thẻ hoặc cài phần mềm kiểm soát máy.",
    ],
  },
  {
    title: "7. Khi có sự cố",
    body: [
      "Lưu ảnh chụp màn hình tin nhắn, mã đơn, trạng thái thanh toán và mô tả ngắn vấn đề. Liên hệ đối phương để tìm phương án trước; nếu không được, gửi khiếu nại qua kênh Duck Shop và tham khảo Quy chế giải quyết tranh chấp.",
    ],
  },
];

export default function SafeTradingGuide() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 lg:px-6 lg:py-14">
      <div className="rounded-2xl border border-slate-200/90 bg-white/90 shadow-sm ring-1 ring-slate-100/80">
        <div className="border-b border-slate-200 px-6 py-8 sm:px-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-yellow-700 ring-1 ring-amber-200">
              <ShieldAlert className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-yellow-600 sm:text-3xl">
                Hướng dẫn an toàn khi giao dịch
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Gợi ý mua bán có trách nhiệm và giảm rủi ro lừa đảo trên Duck
                Shop.
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
          <NavLink
            to="/disputes"
            className="text-sm font-medium !text-slate-600 !transition-colors hover:!text-yellow-700"
          >
            Quy chế giải quyết tranh chấp
          </NavLink>
        </div>
      </div>
    </div>
  );
}

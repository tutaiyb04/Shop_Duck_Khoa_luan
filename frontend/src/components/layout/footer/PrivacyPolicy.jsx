import { NavLink } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const SECTIONS = [
  {
    title: "1. Giới thiệu",
    body: [
      "Chính sách bảo mật này mô tả cách Duck Shop thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân khi bạn sử dụng nền tảng mua bán đồ đã qua sử dụng của chúng tôi.",
      "Bằng việc sử dụng dịch vụ, bạn đồng ý với các nội dung dưới đây. Nếu không đồng ý, vui lòng ngừng sử dụng Nền tảng.",
    ],
  },
  {
    title: "2. Thông tin chúng tôi có thể thu thập",
    body: [
      "Thông tin tài khoản: họ tên, email, số điện thoại, mật khẩu đã được bảo vệ (dạng băm), loại đăng nhập (ví dụ email hoặc Google), trạng thái xác minh email, vai trò người dùng.",
      "Thông tin hồ sơ & giao dịch: nội dung đăng bán (mô tả, hình ảnh), lịch sử đơn hàng, tin nhắn trao đổi trên Nền tảng, danh sách yêu thích và các thao tác liên quan đến mua bán.",
      "Kỹ thuật & thiết bị: địa chỉ IP, loại trình duyệt, thời gian truy cập, nhật ký lỗi cơ bản — nhằm vận hành, bảo mật và cải thiện dịch vụ.",
      "Cookie và công nghệ tương tự: có thể được dùng để duy trì phiên đăng nhập, ghi nhớ tùy chọn hoặc phân tích lưu lượng (nếu được bật). Bạn có thể điều chỉnh cookie trong cài đặt trình duyệt.",
    ],
  },
  {
    title: "3. Mục đích sử dụng",
    body: [
      "Cung cấp và duy trì tài khoản, xác thực danh tính khi cần (ví dụ xác minh email để đăng bán).",
      "Hiển thị tin đăng, kết nối người mua và người bán, xử lý đơn hàng và hỗ trợ khiếu nại theo quy trình của Nền tảng.",
      "Gửi thông báo kỹ thuật, bảo mật hoặc cập nhật quan trọng liên quan đến dịch vụ.",
      "Phòng chống gian lận, lạm dụng, vi phạm Điều khoản dịch vụ và tuân thủ nghĩa vụ pháp luật.",
    ],
  },
  {
    title: "4. Chia sẻ thông tin",
    body: [
      "Chúng tôi không bán dữ liệu cá nhân của bạn.",
      "Thông tin có thể được chia sẻ với nhà cung cấp dịch vụ tin cậy (ví dụ lưu trữ, email giao dịch) trong phạm vi cần thiết để vận hành Nền tảng, theo hợp đồng và nghĩa vụ bảo mật.",
      "Một số thông tin (tên hiển thị, tin đăng) do bạn công khai trên Nền tảng có thể được người dùng khác xem trong phạm vi sử dụng dịch vụ.",
      "Khi có yêu cầu hợp pháp của cơ quan nhà nước có thẩm quyền, Duck Shop có thể cung cấp thông tin theo quy định pháp luật Việt Nam.",
    ],
  },
  {
    title: "5. Lưu trữ và thời gian lưu",
    body: [
      "Dữ liệu được lưu trên hệ thống máy chủ và cơ sở hạ tầng do Duck Shop hoặc đối tác vận hành, trong thời gian cần thiết để cung cấp dịch vụ và tuân thủ nghĩa vụ lưu trữ theo quy định.",
      "Bạn có thể yêu cầu chỉnh sửa hoặc xóa một phần thông tin thông qua tài khoản hoặc liên hệ với chúng tôi; việc xóa có thể bị giới hạn nếu còn giao dịch đang xử lý hoặc theo yêu cầu pháp luật.",
    ],
  },
  {
    title: "6. Bảo mật",
    body: [
      "Duck Shop áp dụng các biện pháp kỹ thuật và tổ chức phù hợp (mã hóa kết nối khi có thể, kiểm soát truy cập, sao lưu) nhằm giảm rủi ro truy cập trái phép, mất mát hoặc thay đổi dữ liệu.",
      "Không có hệ thống nào an toàn tuyệt đối; bạn nên dùng mật khẩu mạnh, không chia sẻ tài khoản và báo ngay khi phát hiện truy cập lạ.",
    ],
  },
  {
    title: "7. Quyền của người dùng",
    body: [
      "Bạn có thể truy cập, cập nhật thông tin hồ sơ trong phần cài đặt tài khoản (khi Nền tảng hỗ trợ).",
      "Bạn có thể rút lại đồng ý cho các xử lý dựa trên đồng ý, hoặc phản đối xử lý không phù hợp, trong phạm vi pháp luật.",
      "Để thực hiện các yêu cầu khác (sao chép dữ liệu, giải thích xử lý), vui lòng liên hệ Duck Shop qua thông tin cuối chính sách này.",
    ],
  },
  {
    title: "8. Trẻ em",
    body: [
      "Dịch vụ Duck Shop hướng tới người từ đủ tuổi theo quy định pháp luật. Chúng tôi không cố ý thu thập thông tin từ trẻ vị thành niên mà không có sự đồng ý hợp lệ.",
    ],
  },
  {
    title: "9. Thay đổi chính sách",
    body: [
      "Chúng tôi có thể cập nhật Chính sách bảo mật. Phiên bản mới được đăng trên trang này kèm ngày cập nhật. Việc bạn tiếp tục sử dụng dịch vụ sau thay đổi được hiểu là bạn đã biết và chấp nhận phần không trái với quy định bắt buộc.",
    ],
  },
  {
    title: "10. Liên hệ",
    body: [
      "Mọi câu hỏi về bảo mật và dữ liệu cá nhân, vui lòng liên hệ Duck Shop qua email hoặc thông tin tại mục Liên hệ ở chân trang website.",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 lg:px-6 lg:py-14">
      <div className="rounded-2xl border border-slate-200/90 bg-white/90 shadow-sm ring-1 ring-slate-100/80">
        <div className="border-b-1 border-slate-200 px-6 py-8 sm:px-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-yellow-700 ring-1 ring-amber-200">
              <ShieldCheck className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-yellow-600 sm:text-3xl">
                Chính sách bảo mật
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Cam kết minh bạch trong việc xử lý thông tin của bạn trên Duck
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
        </div>
      </div>
    </div>
  );
}

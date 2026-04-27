import { CheckCircle2, XCircle } from "lucide-react";
import LoadingBlock from "@/components/shared/LoadingBlock";
import { Button } from "@/components/ui/button";
import { useVerifyEmail } from "@/hooks/userHooks/authHooks/useVerifyEmail";

function VerifyEmail() {
  const { status, message, navigate } = useVerifyEmail();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
        {/* TRẠNG THÁI 1: ĐANG LOAD */}
        {status === "loading" && (
          <LoadingBlock
            message="Đang xác minh. Vui lòng đợi trong giây lát — Duck Shop đang kiểm tra mã của bạn."
            className="px-2 py-8 text-base font-medium text-foreground"
          />
        )}

        {/* TRẠNG THÁI 2: THÀNH CÔNG */}
        {status === "success" && (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Xác minh thành công!
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">{message}</p>

            {/* KIỂM TRA ĐĂNG NHẬP THÔNG MINH */}
            <Button
              onClick={() => {
                // Kiểm tra xem trình duyệt hiện tại có token không
                const hasToken = localStorage.getItem("token");
                if (hasToken) {
                  navigate("/profile"); // Đã đăng nhập -> Cho vào trang cá nhân
                } else {
                  navigate("/login"); // Chưa đăng nhập -> Bắt đi đăng nhập
                }
              }}
              className="mt-6 w-full h-12 !bg-yellow-500 hover:!bg-yellow-600 text-white rounded-xl font-medium !transition-colors !border-0 !ring-0 !outline-none"
            >
              {/* Đổi text nút bấm tương ứng */}
              {localStorage.getItem("token")
                ? "Vào trang cá nhân"
                : "Đăng nhập để tiếp tục"}
            </Button>
          </div>
        )}

        {/* TRẠNG THÁI 3: THẤT BẠI / LỖI TOKEN */}
        {status === "error" && (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
              <XCircle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Xác minh thất bại
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              {message.includes("xác minh trước đó")
                ? "Có vẻ như bạn đã hoàn tất việc xác minh từ trước. Hãy kiểm tra lại trạng thái trong hồ sơ nhé!"
                : message}
            </p>
            <div className="flex gap-3 w-full mt-6">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="w-1/2 h-12 rounded-xl font-medium !transition-colors !border-1 !bg-gray-200 hover:!bg-gray-300 hover:!border-gray-200 !ring-0 !outline-none"
              >
                Về trang chủ
              </Button>
              <Button
                onClick={() => navigate("/login")}
                className="w-1/2 h-12 !bg-yellow-500 hover:!bg-yellow-600 text-white rounded-xl font-medium !transition-colors !border-0 !ring-0 !outline-none"
              >
                Đăng nhập lại
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;

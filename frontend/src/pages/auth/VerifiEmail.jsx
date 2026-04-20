import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVerifyEmail } from "@/hooks/userHooks/useVerifyEmail";

function VerifyEmail() {
  const { status, message, navigate } = useVerifyEmail();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
        {/* TRẠNG THÁI 1: ĐANG LOAD */}
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader2 className="w-16 h-16 text-yellow-500 animate-spin" />
            <h2 className="text-xl font-bold text-gray-800">
              Đang xác minh...
            </h2>
            <p className="text-gray-500 text-sm">
              Vui lòng đợi trong giây lát, Duck Shop đang kiểm tra mã xác minh
              của bạn.
            </p>
          </div>
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
            <Button
              onClick={() => navigate("/profile")}
              className="mt-6 w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium"
            >
              Vào trang cá nhân
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
            <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
            <div className="flex gap-3 w-full mt-6">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="w-1/2 h-12 rounded-xl font-medium"
              >
                Về trang chủ
              </Button>
              <Button
                onClick={() => navigate("/login")}
                className="w-1/2 h-12 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium"
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

import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, AlertCircle, ShieldCheck } from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import { API } from "@/services/axios";
import toast from "react-hot-toast";
import UserSidebar from "@/components/shared/UserSidebar";

const AccountVerification = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handleRequestVerify = async () => {
    setLoading(true);
    try {
      const res = await API.post("/user/request-verify");
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể gửi email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <UserSidebar />

        <div className="flex-1 w-full">
          <div className="max-w-2xl mx-auto md:mx-0 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6">Xác minh danh tính</h2>

            {user?.role === "admin" ? (
              <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100 flex gap-4">
                <ShieldCheck className="w-6 h-6 text-purple-500 shrink-0" />
                <div>
                  <p className="text-purple-700 font-medium">
                    Quyền Quản trị viên
                  </p>
                  <p className="text-purple-600 text-sm">
                    Tài khoản Admin của hệ thống được bỏ qua bước xác minh này.
                  </p>
                </div>
              </div>
            ) : user?.isEmailVerified ? (
              <div className="flex flex-col items-center py-10 bg-green-50 rounded-2xl border border-green-100">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <p className="text-green-700 font-medium">
                  Tài khoản của bạn đã được xác minh thành công!
                </p>
                <p className="text-green-600 text-sm">
                  Bạn đã có đầy đủ quyền hạn để đăng bán sản phẩm.
                </p>
              </div>
            ) : user?.authType === "google" ? (
              <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
                <CheckCircle className="w-6 h-6 text-blue-500 shrink-0" />
                <div>
                  <p className="text-blue-700 font-medium">
                    Xác minh qua Google
                  </p>
                  <p className="text-blue-600 text-sm">
                    Tài khoản Google được coi là đã xác minh tự động.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex gap-4 p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-yellow-700">
                  <AlertCircle className="w-6 h-6 shrink-0" />
                  <p className="text-sm">
                    Tài khoản của bạn chưa được xác minh. Bạn cần xác minh email
                    để có thể bắt đầu kinh doanh trên Duck Shop.
                  </p>
                </div>

                <div className="border rounded-2xl p-6 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-gray-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-lg">{user?.email}</p>
                    <p className="text-gray-500 text-sm">
                      Chúng tôi sẽ gửi một liên kết xác nhận đến email này.
                    </p>
                  </div>
                  <Button
                    onClick={handleRequestVerify}
                    disabled={loading}
                    className="w-full md:w-auto px-10 !bg-yellow-500 hover:!bg-yellow-600 !transition-colors !border-0 !ring-0 !outline-none"
                  >
                    {loading ? "Đang gửi..." : "Gửi email xác minh ngay"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountVerification;

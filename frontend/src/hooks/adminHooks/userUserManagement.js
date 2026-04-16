import { API } from "@/services/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function useUserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // lấy danh sách tài khoản User
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await API.get("/user/admin/all");

      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách user:", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Xử lý khóa tài khoản
  const handleToggleLock = async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "locked" : "active";

    const confirmMsg =
      newStatus === "locked"
        ? "Bạn có chắc chắn muốn KHÓA tài khoản này?"
        : "Bạn muốn MỞ KHÓA tài khoản này?";

    if (!window.confirm(confirmMsg)) return;

    try {
      // Gọi API cập nhật trạng thái
      await API.put(`/user/admin/${userId}/status`, { status: newStatus });
      toast.success(
        `Đã ${newStatus === "locked" ? "khóa" : "mở khóa"} tài khoản!`,
      );

      fetchUsers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Lỗi khi cập nhật trạng thái",
      );
    }
  };

  return {
    users,
    isLoading,
    handleToggleLock,
  };
}

export default useUserManagement;

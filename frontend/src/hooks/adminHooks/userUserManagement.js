import { API } from "@/services/axios";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

function useUserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  // lấy danh sách tài khoản User
  const fetchUsers = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      // Truyền thêm query params page và limit
      const res = await API.get(`/user/admin/all?page=${page}&limit=15`);
      setUsers(res.data.users);

      // Cập nhật thông tin phân trang từ Backend trả về
      setPagination({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

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
    pagination,
    handleToggleLock,
    fetchUsers,
  };
}

export default useUserManagement;

import { API } from "@/services/axios";
import { disconnectSocket } from "@/services/socket";
import LoadingBlock from "@/components/shared/LoadingBlock";
import { useCallback, useEffect } from "react";
import { useState } from "react";
import { createContext } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hàm lấy thông tin profile từ Server
  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem("token");

    // Nếu không có token, dừng việc load và báo là chưa đăng nhập
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      // 🚀 Luôn lấy dữ liệu mới nhất từ DB
      const res = await API.get("/user/profile");
      setUser(res.data.user);
    } catch (error) {
      console.log("Phiên đăng nhập hết hạn hoặc Token lỗi", error);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = (userData) => {
    localStorage.setItem("token", userData.token);
    disconnectSocket();
    setUser(userData.user);
  };

  const logout = () => {
    disconnectSocket();
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateUser = (newUserData) => {
    // Chỉ cập nhật trong RAM (State), không cần lưu xuống máy
    setUser(newUserData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        updateUser,
      }}
    >
      {!isLoading ? (
        children
      ) : (
        <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
          <LoadingBlock message="Loading..." className="py-8" />
        </div>
      )}
    </AuthContext.Provider>
  );
};

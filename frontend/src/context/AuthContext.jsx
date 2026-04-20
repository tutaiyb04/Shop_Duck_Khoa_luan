import { API } from "@/services/axios";
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
    setUser(userData.user);
  };

  const logout = () => {
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
        isLoading,
      }}
    >
      {!isLoading ? (
        children
      ) : (
        <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">
              Đang khởi tạo Duck Shop...
            </p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

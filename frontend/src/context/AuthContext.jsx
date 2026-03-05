import { useEffect } from "react";
import { useState } from "react";
import { createContext } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Kiểm tra xem có user trong localStorage không khi load trang
    const savedUser = localStorage.getItem("user");

    // Thêm điều kiện chặn rác "undefined"
    if (savedUser && savedUser !== "undefined") {
      try {
        // Cố gắng dịch dữ liệu
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(JSON.parse(savedUser));
      } catch (error) {
        // Nếu dữ liệu bị hỏng (lỗi JSON), tự động dọn rác luôn để cứu web
        console.log(
          "Dữ liệu user trong máy bị lỗi, đang tự động dọn dẹp...",
          error,
        );
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem("token", userData.token);
    localStorage.setItem("user", JSON.stringify(userData.user));
    setUser(userData.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

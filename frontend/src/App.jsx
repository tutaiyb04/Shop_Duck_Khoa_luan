import { Toaster } from "react-hot-toast";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Header from "./components/layout/Header";
import Profile from "./pages/Profile";
import CreateProduct from "./pages/products/CreateProduct";
import Orders from "./pages/products/Orders";
import AdminLayout from "./components/layout/AdminLayout";
import AdminCategories from "./pages/admin/AdminCategories";

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Toaster position="top-right" reverseOrder={false} />
        <Header />

        <main className="w-full min-h-screen overflow-x-hidden bg-amber-50">
          <Routes>
            {/* Home Page */}
            <Route path="/" element={<Home />} />

            {/* Login Page */}
            <Route path="/login" element={<Login />} />

            {/* Register Page */}
            <Route path="/register" element={<Register />} />

            {/* ForgotPassword Page */}
            <Route path="/reset-password" element={<ForgotPassword />} />

            {/* ResetPassword Page */}
            <Route path="/reset-password-confirm" element={<ResetPassword />} />

            {/* Profile Page */}
            <Route path="/profile" element={<Profile />} />

            {/* Trang Đăng bán sản phẩm */}
            <Route path="/sell" element={<CreateProduct />} />

            {/* Quản lý đơn hàng */}
            <Route path="/orders" element={<Orders />} />

            {/* THÊM PHÂN HỆ ROUTE DÀNH CHO ADMIN */}
            <Route path="/admin" element={<AdminLayout />}>
              {/* URL: /admin/categories */}
              <Route path="categories" element={<AdminCategories />} />
            </Route>
          </Routes>
        </main>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;

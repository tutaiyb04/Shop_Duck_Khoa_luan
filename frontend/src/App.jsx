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
import AdminLayout from "./components/admin/AdminLayout";
import CategoryManagement from "./pages/admin/CategoryManagement";
import ClientLayout from "./components/layout/ClientLayout";
import AdminProfile from "./pages/admin/AdminProfile";
import UserManagement from "./pages/admin/UserManagement";
import ProductManagement from "./pages/admin/ProductManagement";
import ProductDetails from "./pages/products/ProductDetails";
import ReportManagement from "./pages/admin/ReportManagement";
import Wishlist from "./pages/products/Wishlist";

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Toaster position="top-right" reverseOrder={false} />

        <main className="w-full min-h-screen overflow-x-hidden bg-amber-50">
          <Routes>
            <Route element={<ClientLayout />}>
              {/* Home Page */}
              <Route path="/" element={<Home />} />

              {/* Login Page */}
              <Route path="/login" element={<Login />} />

              {/* Register Page */}
              <Route path="/register" element={<Register />} />

              {/* ForgotPassword Page */}
              <Route path="/reset-password" element={<ForgotPassword />} />

              {/* ResetPassword Page */}
              <Route
                path="/reset-password-confirm"
                element={<ResetPassword />}
              />

              {/* Profile Page */}
              <Route path="/profile" element={<Profile />} />

              {/* Trang Đăng bán sản phẩm */}
              <Route path="/sell" element={<CreateProduct />} />

              {/* Chi Tiết Sản Phẩm */}
              <Route path="/product/:id" element={<ProductDetails />} />

              {/* Quản lý đơn hàng */}
              <Route path="/orders" element={<Orders />} />

              {/* Yêu thích */}
              <Route path="/wishlist" element={<Wishlist />} />
            </Route>

            <Route path="/admin" element={<AdminLayout />}>
              <Route path="profile" element={<AdminProfile />} />

              <Route path="dashboard" element={<div>Trang tổng quan</div>} />

              <Route path="categories" element={<CategoryManagement />} />

              <Route path="users" element={<UserManagement />} />

              <Route path="products" element={<ProductManagement />} />

              <Route path="reports" element={<ReportManagement />} />
            </Route>
          </Routes>
        </main>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;

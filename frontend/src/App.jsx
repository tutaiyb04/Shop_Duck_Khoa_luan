import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Header from "./components/layout/Header";

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Toaster position="top-right" reverseOrder={false} />
        <Header />

        <main className="w-full min-h-screen overflow-x-hidden">
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
          </Routes>
        </main>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;

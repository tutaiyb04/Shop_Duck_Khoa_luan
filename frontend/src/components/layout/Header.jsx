import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Search,
  UserCircle,
  Package,
  LogOut,
  ShoppingCart,
  ChevronDown,
  CirclePlus,
  Heart,
  ShieldCheck,
  Bell,
  Menu,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoImage from "@/assets/logo1.png";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      {/* Giảm chiều cao header trên mobile h-14, desktop h-16 */}
      <div className="max-w-6xl mx-auto flex h-14 md:h-16 items-center justify-between px-2 sm:px-4 md:px-6">
        {/* NỬA TRÁI: Logo + Tìm kiếm (Desktop) */}
        <div className="flex w-full items-center">
          <NavLink to="/">
            <img
              src={logoImage}
              alt="Duck Shop"
              className="h-8 md:h-11 w-auto object-contain"
            />
          </NavLink>

          {/* Thanh Tìm kiếm Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-lg relative mx-8 items-center"
          >
            <Input
              type="text"
              placeholder="Tìm kiếm trên Duck Shop..."
              className="w-full pr-10 rounded-full bg-gray-50 focus-visible:border-yellow-500 focus-visible:ring-0 !outline-none h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full !text-gray-500 hover:!text-yellow-600 !border-0 !outline-none"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* NỬA PHẢI: Menu, Icons */}
        <div className="flex items-center gap-2 md:gap-6 shrink-0">
          {/* Menu User Desktop (Ẩn trên Mobile) */}
          <div className="hidden md:block">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="relative flex items-center gap-2 h-10 w-auto px-2 rounded-full !outline-none !ring-0 !border-0 !bg-white cursor-pointer hover:bg-gray-50">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.username} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      {user.username}
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.username}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="cursor-pointer"
                  >
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Thông tin cá nhân</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/verify")}
                    className="cursor-pointer"
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    <span>Xác minh tài khoản</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/orders")}
                    className="cursor-pointer"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    <span>Đơn hàng của tôi</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/wishlist")}
                    className="cursor-pointer"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Yêu thích</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-4 text-sm font-medium whitespace-nowrap">
                <NavLink
                  to="/login"
                  className="hover:!underline !text-yellow-600 transition-all"
                >
                  Đăng nhập
                </NavLink>
                <NavLink
                  to="/register"
                  className="hover:!underline !text-yellow-600 transition-all"
                >
                  Đăng ký
                </NavLink>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-gray-300 hidden md:block"></div>

          {/* Icons dùng chung (Thông báo, Giỏ hàng) */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Nút Thông báo (Mới thêm) */}
            <button className="!text-gray-600 hover:!text-yellow-600 relative p-2 cursor-pointer !bg-transparent !border-0 !outline-none transition-colors">
              <Bell className="w-5 h-5 md:w-6 md:h-6" />
              {/* Chấm đỏ báo có thông báo mới (Ví dụ) */}
              <span className="absolute top-1 right-1.5 flex h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            {/* Nút Giỏ hàng */}
            <NavLink
              to="/cart"
              className="!text-gray-600 hover:!text-yellow-600 relative p-2 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
            </NavLink>

            {/* Nút Đăng bán (Chỉ hiện Icon trên Mobile, hiện Button đầy đủ trên Desktop) */}
            <NavLink to="/sell" className="flex items-center">
              <Button className="hidden md:flex h-9 px-6 rounded-full !bg-yellow-500 text-white hover:!bg-yellow-600 transition-colors !border-0 !outline-none shadow-sm cursor-pointer">
                Đăng bán
              </Button>
              <button className="md:hidden !text-yellow-600 hover:!text-yellow-700 p-2 cursor-pointer !bg-transparent !border-0 !outline-none">
                <CirclePlus className="w-5 h-5" />
              </button>
            </NavLink>

            {/* HAMBURGER MENU (Chỉ hiện trên Mobile) */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 !text-gray-600 hover:!text-yellow-600 cursor-pointer !bg-transparent !border-0 !outline-none">
                    <Menu className="w-6 h-6" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-64 mt-2"
                  align="end"
                  forceMount
                >
                  {/* Thanh tìm kiếm bên trong Mobile Menu */}
                  <div className="p-2">
                    <form
                      onSubmit={handleSearch}
                      className="relative flex items-center"
                    >
                      <Input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="w-full pr-8 h-9 text-sm rounded-md bg-gray-50 focus-visible:ring-yellow-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-9 w-9 rounded-md !text-gray-500"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                  <DropdownMenuSeparator />

                  {/* Các lựa chọn cá nhân */}
                  {user ? (
                    <>
                      <DropdownMenuLabel className="font-normal flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/profile")}>
                        <UserCircle className="mr-2 h-4 w-4" /> Thông tin cá
                        nhân
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/verify")}>
                        <ShieldCheck className="mr-2 h-4 w-4" /> Xác minh tài
                        khoản
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/orders")}>
                        <Package className="mr-2 h-4 w-4" /> Đơn hàng của tôi
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/wishlist")}>
                        <Heart className="mr-2 h-4 w-4" /> Yêu thích
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-600"
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/login")}>
                        Đăng nhập
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/register")}>
                        Đăng ký
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

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
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="w-full flex items-center">
          {/* Logo */}
          <NavLink to="/">
            <img
              src={logoImage}
              alt="Duck Shop"
              className="h-11 w-auto object-contain"
            />
          </NavLink>

          {/* thanh Tìm kiếm */}
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

        <div className="flex items-center gap-6 shrink-0">
          {/*  Đăng nhập / User */}
          <div>
            {user ? (
              // Giao diện khi đã đăng nhập
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="relative flex items-center gap-2 h-10 w-auto px-2 rounded-full !outline-none !ring-0 !border-0 !bg-white">
                    <Avatar className="h-8 w-8">
                      {/* Nếu user có avatar thì hiện, không có thì lấy ảnh mặc định của shadcn */}
                      <AvatarImage
                        src={user.avatar || "https://github.com/shadcn.png"}
                        alt={user.username}
                      />
                      {/* AvatarFallback sẽ lấy chữ cái đầu tiên của tên để làm ảnh đại diện nếu ảnh bị lỗi */}
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700 hidden sm:flex items-center gap-1">
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
                    onClick={() => navigate("/orders")}
                    className="cursor-pointer"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    <span>Đơn hàng của tôi</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Giao diện khi chưa đăng nhập
              <div className="flex items-center gap-4 text-sm font-medium whitespace-nowrap">
                <NavLink
                  to="/login"
                  className="hover:!underline !text-yellow-600 hover:!text-yellow-700 transition-all"
                >
                  Đăng nhập
                </NavLink>
                <NavLink
                  to="/register"
                  className="hover:!underline !text-yellow-600 hover:!text-yellow-700 transition-all"
                >
                  Đăng ký
                </NavLink>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-gray-300 hidden md:block"></div>

          {/* đăng bán / giỏ hàng */}
          <div className="flex items-center gap-4">
            <NavLink className="!text-yellow-600 hover:!text-yellow-700 relative p-1">
              <ShoppingCart />
            </NavLink>
            <NavLink to="/sell" className="hidden sm:block">
              <Button className="h-9 px-6 rounded-full !bg-yellow-500 text-white hover:!bg-yellow-600 transition-colors  !border-0 !outline-none shadow-sm">
                Đăng bán
              </Button>
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
}

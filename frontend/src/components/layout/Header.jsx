import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, ChevronDown, CirclePlus, Menu, MapPin } from "lucide-react";
import logoImage from "@/assets/logo1.png";
import useHeader from "@/hooks/header/useHeader";
import UserMenuLinks from "./header/UserMenuLinks";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";

export default function Header() {
  const {
    user,
    navigate,
    searchQuery,
    setSearchQuery,
    location,
    radius,
    setRadius,
    isLocating,
    handleGetLocation,
    handleSearch,
    handleLogout,
  } = useHeader();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="max-w-6xl mx-auto flex h-14 md:h-16 items-center justify-between px-2 sm:px-4 md:px-6">
        <div className="flex w-full items-center">
          <NavLink to="/">
            <img
              src={logoImage}
              alt="Duck Shop"
              className="h-8 md:h-11 w-auto object-contain"
            />
          </NavLink>

          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl items-center gap-2 relative mx-6"
          >
            {/* Nút Bật/Tắt Vị trí */}
            <Button
              type="button"
              variant={location ? "default" : "outline"}
              size="icon"
              aria-busy={isLocating}
              className={`rounded-full shrink-0 !transition-colors !bg-gray-200 hover:!bg-gray-300 !border-1 !border-gray-200 !ring-0 !outline-none ${
                location
                  ? "!bg-yellow-500 hover:!bg-yellow-600 text-white !transition-colors"
                  : "border-primary/20"
              } ${isLocating ? "pointer-events-auto opacity-80" : ""}`}
              onClick={handleGetLocation}
              title={
                isLocating
                  ? "Đang lấy vị trí"
                  : location
                    ? "Tắt tìm quanh đây"
                    : "Bật tìm quanh đây"
              }
            >
              <MapPin
                className={`h-4 w-4 ${isLocating ? "animate-pulse" : ""}`}
              />
            </Button>

            {/* Dropdown chọn Bán kính */}
            {location && (
              <select
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="h-10 px-3 py-2 text-sm rounded-full bg-background shrink-0 cursor-pointer"
              >
                <option value="5000">~ 5 km</option>
                <option value="10000">~ 10 km</option>
                <option value="20000">~ 20 km</option>
              </select>
            )}

            {/* Ô Nhập Từ khóa */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm sản phẩm, danh mục..."
                className="pl-9 w-full bg-muted/50 focus-visible:bg-background rounded-full border-primary/20 !ring-0 focus-visible:border-yellow-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="hidden">
              Tìm
            </button>
          </form>
        </div>

        <div className="flex items-center gap-2 md:gap-6 shrink-0">
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

                <DropdownMenuContent
                  className="w-56 max-h-[50vh] overflow-y-auto"
                  align="end"
                  forceMount
                >
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

                  {/* Nhúng UI Component vào đây */}
                  <UserMenuLinks
                    navigate={navigate}
                    handleLogout={handleLogout}
                  />
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

          <div className="flex items-center gap-1 sm:gap-3">
            <NotificationDropdown />

            <NavLink to="/sell" className="flex items-center">
              <Button className="hidden md:flex h-9 px-6 rounded-full !bg-yellow-500 text-white hover:!bg-yellow-600 !transition-colors !border-0 !outline-none shadow-sm cursor-pointer">
                Đăng bán
              </Button>
              <button className="md:hidden !text-yellow-600 hover:!text-yellow-700 p-2 cursor-pointer !bg-transparent !border-0 !outline-none">
                <CirclePlus className="w-5 h-5" />
              </button>
            </NavLink>

            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 !text-gray-600 hover:!text-yellow-600 cursor-pointer !bg-transparent !border-0 !outline-none">
                    <Menu className="w-6 h-6" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-64 mt-2 max-h-[80vh] overflow-y-auto"
                  align="end"
                  forceMount
                >
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
                      <UserMenuLinks
                        navigate={navigate}
                        handleLogout={handleLogout}
                      />
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

import { useProductDetails } from "@/hooks/productHooks/useProductDetails";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  ImageIcon,
  Check,
  Globe,
  ShieldCheck,
  MessageCircle,
  Truck,
  BadgeCheck,
  Mail,
  Smartphone,
  Star,
  Store,
  MapPin,
} from "lucide-react";
import UserAvatar from "@/components/shared/UserAvatar";
import ReportDialog from "@/components/product/ReportDialog";
import { NavLink } from "react-router-dom";

function ProductDetails() {
  const {
    product,
    isLoading,
    isReporting,
    handleSendReport,
    handlePrevImage,
    handleNextImage,
    handleDecrease,
    handleIncrease,
    buyQuantity,
    maxQuantity,
    activeImage,
    isReportModalOpen,
    setIsReportModalOpen,
    setActiveImage,
  } = useProductDetails();

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải dữ liệu...
      </div>
    );
  if (!product)
    return (
      <div className="text-center mt-20 text-gray-500">
        Sản phẩm không tồn tại hoặc đã bị ẩn.
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 bg-gray-50/30 min-h-screen space-y-6">
      {/* BREADCRUMB */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <NavLink
              to="/"
              className="hover:!text-yellow-600 !text-black !transition-colors"
            >
              Trang chủ
            </NavLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <NavLink
              to="#"
              className="hover:!text-yellow-600 !text-black !transition-colors"
            >
              {product.category?.name || "Danh mục"}
            </NavLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-gray-800 line-clamp-1">
              {product.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/*  ẢNH + THÔNG TIN CƠ BẢN */}
      <Card className="border shadow-sm overflow-hidden bg-white rounded-xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 flex flex-col">
              <div className="aspect-[3/4] md:aspect-square bg-gray-50 flex items-center justify-center relative mb-4">
                <img
                  src={product.images[activeImage]}
                  className="max-w-full max-h-full object-contain mix-blend-multiply"
                  alt={product.name}
                />
                <button className="absolute bottom-4 left-4 !bg-black/60 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm hover:bg-black/80 transition-colors cursor-pointer !border-0 !ring-0 !outline-none">
                  <ImageIcon className="w-4 h-4" /> Xem tất cả ảnh
                </button>
              </div>

              <div className="flex items-center gap-2 w-full">
                <button
                  onClick={handlePrevImage}
                  className="p-1 cursor-pointer !border-0 !ring-0 !outline-none !bg-transparent"
                >
                  <ChevronLeft className="w-6 h-6 !text-black" />
                </button>

                <div className="flex gap-2 overflow-hidden flex-1 justify-start">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`w-16 h-16 rounded overflow-hidden shrink-0 !transition-all hover:scale-105 hover:!border-0 cursor-pointer !border !ring-0 !outline-none ${
                        activeImage === index
                          ? "!border-yellow-800 shadow-sm"
                          : "!border-yellow-200 hover:!border-yellow-300 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNextImage}
                  className="p-1 cursor-pointer !border-0 !ring-0 !outline-none !bg-transparent"
                >
                  <ChevronRight className="w-6 h-6 !text-black" />
                </button>
              </div>

              <div className="flex items-start justify-between mt-6 pt-4 text-sm text-gray-500">
                <div className="mr-3">
                  <div className="whitespace-nowrap">
                    Bạn có sản phẩm muốn bán?{" "}
                  </div>
                  <NavLink
                    to="/sell"
                    className="!text-yellow-600 font-medium hover:!underline p-0 whitespace-nowrap "
                  >
                    Đăng bán
                  </NavLink>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="flex items-center gap-1 hover:text-yellow-500 !transition-colors p-0 whitespace-nowrap cursor-pointer !border-0 !ring-0 !outline-none !bg-transparent"
                  >
                    <ShieldAlert className="w-5 h-5" /> Báo cáo
                  </button>
                  <button className="flex items-center gap-1 hover:text-yellow-500 !transition-colors p-0 whitespace-nowrap cursor-pointer !border-0 !ring-0 !outline-none !bg-transparent">
                    <Share2 className="w-5 h-5" /> Chia sẻ
                  </button>
                  <button className="flex items-center gap-1 hover:text-yellow-500 !transition-colors p-0 whitespace-nowrap cursor-pointer !border-0 !ring-0 !outline-none !bg-transparent">
                    <Heart className="w-5 h-5" /> Yêu thích
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col pl-0 lg:pl-4">
              <h1 className="text-2xl font-bold text-gray-800 leading-snug mb-4">
                {product.name}
              </h1>
              <p className="text-3xl font-bold text-yellow-600 mb-8">
                {product.price.toLocaleString("vi-VN")}đ
              </p>

              <div className="flex items-center gap-8 mb-8">
                <span className="text-4sm text-gray-500 min-w-[5rem]">
                  Số lượng:
                </span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white">
                    <button
                      onClick={handleDecrease}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 border-r border-gray-300 !transition-colors disabled:opacity-50 cursor-pointer"
                      disabled={buyQuantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="text"
                      value={buyQuantity}
                      readOnly
                      className="w-12 h-8 text-center text-sm outline-none text-gray-800"
                    />
                    <button
                      onClick={handleIncrease}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 border-l border-gray-300 !transition-colors disabled:opacity-50 cursor-pointer"
                      disabled={buyQuantity >= maxQuantity}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-4sm text-gray-500">
                    {maxQuantity} sản phẩm có sẵn
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <Button
                  variant="outline"
                  className="h-12 text-base font-medium !border-yellow-500 !text-yellow-500 !border-yellow-50 hover:!text-yellow-600 !border-yellow-500 rounded-md !bg-white cursor-pointer !border-1 !ring-0 !outline-none !transition-all"
                >
                  Thêm vào giỏ hàng
                </Button>
                <Button className="h-12 text-base font-medium !bg-yellow-500 !border-yellow-500 hover:!bg-yellow-600 text-white rounded-md shadow-sm cursor-pointer !border-0 !ring-0 !outline-none !transition-all">
                  Mua ngay
                </Button>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 text-green-600 rounded-full p-1 mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <p className="text-4sm text-gray-600 leading-relaxed">
                    Duck Shop cam kết nhận sản phẩm như mô tả hoặc nhận tiền
                    hoàn. Mọi thông tin thanh toán của bạn được bảo mật tuyệt
                    đối.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 text-green-600 rounded-full p-1 mt-0.5 shrink-0">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-4sm text-gray-600 leading-relaxed">
                    Duck Shop - Nền tảng mua bán đồ cũ!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CARD THÔNG TIN NGƯỜI BÁN */}
      <Card className="border shadow-sm bg-white overflow-hidden rounded-xl p-0">
        <CardContent className="px-10 py-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Thông tin người bán
          </h2>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <UserAvatar
                    user={product.sellerId}
                    className="w-24 h-24 shadow-sm text-2xl"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-600 text-white text-sm font-medium px-2 py-1 rounded flex items-center gap-1 whitespace-nowrap z-10 border border-white">
                    <BadgeCheck className="w-4 h-4" /> Đã xác minh
                  </div>
                </div>
              </div>

              {/* Thông tin chi tiết */}
              <div className="flex flex-col mt-1 ml-5">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-800 uppercase leading-none">
                    {product.sellerId?.username || "TÊN NGƯỜI BÁN"}
                  </h3>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <div className="relative">
                      <Mail className="w-4 h-4" />
                      <div className="absolute -top-1 -right-1.5 bg-white rounded-full">
                        <Check className="w-3 h-3 text-yellow-600" />
                      </div>
                    </div>
                    <div className="relative">
                      <Smartphone className="w-4 h-4" />
                      <div className="absolute -top-1 -right-1.5 bg-white rounded-full">
                        <Check className="w-3 h-3 text-yellow-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Số liệu: Đánh giá, Sản phẩm, Đã bán */}
                <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600 mb-3">
                  <div className="flex items-center text-yellow-400">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    <span className="font-medium text-gray-700">5,0</span>
                  </div>
                  <NavLink href="#" className="text-blue-500 hover:!underline">
                    (1222 đánh giá)
                  </NavLink>
                  <span className="text-gray-300">•</span>
                  <span>3093 sản phẩm</span>
                  <span className="text-gray-300">•</span>
                  <span>1118 đã bán</span>
                </div>

                <div>
                  <Button
                    variant="secondary"
                    className="w-35 h-8 text-xs !bg-gray-200 hover:!bg-gray-300 !border-gray-200 text-black px-3 flex items-center gap-2 cursor-pointer !border-1 !ring-0 !outline-none"
                  >
                    <Store className="w-4 h-4" /> Xem shop
                  </Button>
                </div>
              </div>
            </div>

            <div className="hidden md:block w-px h-30 bg-gray-200 mx-2 shrink-0"></div>

            <div className="flex items-start justify-between md:justify-end gap-2 md:gap-8 flex-1">
              <div className="flex flex-col items-center gap-2 w-20 shrink-0">
                <div className="w-15 h-15 rounded-full bg-amber-50 text-yellow-500 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-xs text-gray-500 font-bold text-center leading-tight">
                  Đáng tin cậy
                </span>
              </div>

              {/* Tiêu chí 2 */}
              <div className="flex flex-col items-center gap-2 w-20 shrink-0">
                <div className="w-15 h-15 rounded-full bg-amber-50 text-yellow-500 flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <span className="text-xs text-gray-500 font-bold text-center leading-tight">
                  Uy tín
                </span>
              </div>

              {/* Tiêu chí 3 */}
              <div className="flex flex-col items-center gap-2 w-20 shrink-0">
                <div className="w-15 h-15 rounded-full bg-amber-50 text-yellow-500 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-xs text-gray-500 font-bold text-center leading-tight">
                  Phản hồi nhanh
                </span>
              </div>

              {/* Tiêu chí 4 */}
              <div className="flex flex-col items-center gap-2 w-20 shrink-0">
                <div className="w-15 h-15 rounded-full bg-amber-50 text-yellow-500 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-xs text-gray-500 font-bold text-center leading-tight">
                  Giao hàng nhanh
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-9 flex flex-col gap-6">
          {/* Thông tin nổi bật */}
          <Card className="border shadow-sm bg-white overflow-hidden rounded-xl">
            <CardContent className="px-10 py-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Thông tin nổi bật
              </h2>
              <div className="flex flex-col text-sm text-gray-700">
                <div className="flex py-3 border-b border-gray-100 items-center">
                  <span className="w-1/3 text-gray-500">Danh mục</span>
                  <span className="w-2/3 text-yellow-600 cursor-pointer hover:underline">
                    {product.category?.name || "Danh mục"}
                  </span>
                </div>
                <div className="flex py-3 border-b border-gray-100 items-center">
                  <span className="w-1/3 text-gray-500">Tình trạng</span>
                  <span className="w-2/3">
                    {product.condition || "Đã sử dụng - Tốt"}
                  </span>
                </div>
                <div className="flex py-3 items-center">
                  <span className="w-1/3 text-gray-500">Kích thước</span>
                  <span className="w-2/3">
                    {product.attributes?.size || "Đang cập nhật"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mô tả sản phẩm */}
          <Card className="border shadow-sm bg-white overflow-hidden rounded-xl">
            <CardContent className="px-10 py-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Mô tả sản phẩm
              </h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm">
                {product.description}
              </p>
            </CardContent>
          </Card>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Sản phẩm liên quan
              </h2>
              <NavLink to="#" className="text-blue-500 text-sm hover:underline">
                Xem tất cả
              </NavLink>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                {
                  id: 1,
                  title:
                    "Lô lịch thi đấu & tờ tin nhanh của báo Tuổi Trẻ về sự kiện...",
                  price: "700.000đ",
                  location: "Hồ Chí Minh",
                  isFreeship: true,
                },
                {
                  id: 2,
                  title: "TẠP CHÍ TOUT L'UNIVERS – 1964 (1)",
                  price: "150.000đ",
                  location: "Hồ Chí Minh",
                  isFreeship: false,
                },
                {
                  id: 3,
                  title: "TẠP CHÍ TOUT L'UNIVERS – 1962 (2)",
                  price: "100.000đ",
                  location: "Hồ Chí Minh",
                  isFreeship: false,
                },
                {
                  id: 4,
                  title: "HỌC MONTESSORI ĐỂ DẠY TRẺ THEO PHƯƠNG PHÁP...",
                  price: "50.000đ",
                  location: "Hồ Chí Minh",
                  isFreeship: false,
                },
              ].map((item) => (
                <Card
                  key={item.id}
                  className="border border-gray-100 shadow-sm bg-white overflow-hidden rounded-xl hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group p-0"
                >
                  <div className="aspect-[3/4] bg-gray-50 relative overflow-hidden flex items-center justify-center">
                    {item.isFreeship && (
                      <div className="absolute top-0 left-0 bg-[#00a885] text-white text-[11px] font-medium px-2 py-1 flex items-center gap-1 z-10">
                        <Truck className="w-3 h-3" /> Freeship
                      </div>
                    )}
                    <ImageIcon className="w-10 h-10 text-gray-200 group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <CardContent className="p-3">
                    <h3 className="text-[13px] text-gray-800 line-clamp-2 min-h-[39px] leading-relaxed mb-2 group-hover:text-yellow-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm font-bold text-gray-800 mb-3">
                      {item.price}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-gray-500">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{item.location}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          {/* Hết phần Sản phẩm liên quan */}
        </div>

        <div className="lg:col-span-3">
          <Card className="border shadow-sm bg-white rounded-xl h-fit sticky top-6">
            <CardContent className="p-4 flex flex-col gap-4">
              <h2 className="text-base font-bold text-gray-800">
                Có thể bạn sẽ thích
              </h2>

              <div className="group cursor-pointer rounded-lg border border-gray-100 overflow-hidden hover:shadow-md hover:border-yellow-400 transition-all bg-white">
                <div className="aspect-[4/5] bg-gray-50 flex items-center justify-center relative overflow-hidden">
                  <ImageIcon className="w-8 h-8 text-gray-200 animate-pulse group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="p-3 space-y-2.5">
                  <div className="space-y-1.5">
                    <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                  </div>
                  <div className="h-3.5 bg-yellow-100 rounded w-1/2 animate-pulse mt-1"></div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="h-2.5 bg-gray-100 rounded w-2/3 animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div className="group cursor-pointer rounded-lg border border-gray-100 overflow-hidden hover:shadow-md hover:border-yellow-400 transition-all bg-white">
                <div className="aspect-[4/5] bg-gray-50 flex items-center justify-center relative overflow-hidden">
                  <ImageIcon className="w-8 h-8 text-gray-200 animate-pulse group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="p-3 space-y-2.5">
                  <div className="space-y-1.5">
                    <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                  </div>
                  <div className="h-3.5 bg-yellow-100 rounded w-1/3 animate-pulse mt-1"></div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="h-2.5 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* MODAL BÁO CÁO VI PHẠM */}
      <ReportDialog
        open={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        onSend={handleSendReport}
        isReporting={isReporting}
      />
    </div>
  );
}

export default ProductDetails;

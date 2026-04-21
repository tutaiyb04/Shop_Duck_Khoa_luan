import { useProductDetails } from "@/hooks/productHooks/useProductDetails";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { NavLink } from "react-router-dom";
import ProductGallery from "@/components/product/productDetails/ProductGallery";
import ProductPurchasePanel from "@/components/product/productDetails/ProductPurchasePanel";
import SellerInfoCard from "@/components/product/productDetails/SellerInfoCard";
import ProductDescription from "@/components/product/productDetails/ProductDescription";
import RecommendedProducts from "@/components/product/productDetails/RecommendedProducts";
import ReportDialog from "@/components/product/ReportDialog";
import RelatedProducts from "@/components/product/productDetails/RelatedProducts";

function ProductDetails() {
  const {
    product,
    relatedProducts,
    recommendedProducts,
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
    isLiked,
    isLiking,
    handleToggleLike,
    handleShare,
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
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 md:py-6 bg-gray-50/30 min-h-screen space-y-4 sm:space-y-6">
      {/* BREADCRUMB */}
      <div className="overflow-x-auto whitespace-nowrap scrollbar-hide pb-1">
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
      </div>

      {/* ẢNH + BẢNG MUA HÀNG */}
      <Card className="border shadow-sm overflow-hidden bg-white rounded-xl">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="md:col-span-1 lg:col-span-5">
              <ProductGallery
                product={product}
                activeImage={activeImage}
                setActiveImage={setActiveImage}
                handlePrevImage={handlePrevImage}
                handleNextImage={handleNextImage}
                setIsReportModalOpen={setIsReportModalOpen}
                isLiked={isLiked}
                isLiking={isLiking}
                handleToggleLike={handleToggleLike}
                handleShare={handleShare}
              />
            </div>
            <div className="md:col-span-1 lg:col-span-7">
              <ProductPurchasePanel
                product={product}
                buyQuantity={buyQuantity}
                maxQuantity={maxQuantity}
                handleDecrease={handleDecrease}
                handleIncrease={handleIncrease}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* THÔNG TIN NGƯỜI BÁN */}
      <SellerInfoCard seller={product.sellerId} />

      {/* CHI TIẾT SẢN PHẨM & CÁC MỤC GỢI Ý */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-4 sm:gap-6 mt-4 sm:mt-6">
        <div className="md:col-span-2 lg:col-span-9 flex flex-col gap-4 sm:gap-6">
          <ProductDescription product={product} />
          <RelatedProducts products={relatedProducts} />
        </div>

        <div className="md:col-span-1 lg:col-span-3">
          <RecommendedProducts products={recommendedProducts} />
        </div>
      </div>

      {/* MODAL BÁO CÁO */}
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

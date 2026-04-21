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

      {/* ẢNH + BẢNG MUA HÀNG */}
      <Card className="border shadow-sm overflow-hidden bg-white rounded-xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
            <ProductPurchasePanel
              product={product}
              buyQuantity={buyQuantity}
              maxQuantity={maxQuantity}
              handleDecrease={handleDecrease}
              handleIncrease={handleIncrease}
            />
          </div>
        </CardContent>
      </Card>

      {/* THÔNG TIN NGƯỜI BÁN */}
      <SellerInfoCard seller={product.sellerId} />

      {/* CHI TIẾT SẢN PHẨM & CÁC MỤC GỢI Ý */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-9 flex flex-col gap-6">
          <ProductDescription product={product} />
          <RelatedProducts products={relatedProducts} />
        </div>

        <div className="lg:col-span-3">
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

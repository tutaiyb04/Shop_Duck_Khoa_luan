import { useParams } from "react-router-dom";
import { useEditProductForm } from "@/hooks/productHooks/editProduct/useEditProductFrom";
import { PRODUCT_CONFIG } from "@/config/constains";
import LoadingBlock from "@/components/shared/LoadingBlock";
import ImageUploader from "@/components/product/createProduct/ImageUploader";
import ProductForm from "@/components/product/createProduct/ProductForm";

const EditProduct = () => {
  const { id } = useParams();

  const {
    initialData,
    categories,
    loading,
    isUpdating,
    isPreparingUpload,
    form,
    images,
    imageError,
    fileInputRef,
    setCoords,
    handleFileChange,
    removeImage,
    onSubmit,
  } = useEditProductForm(id);

  const conditions = ["Mới", "Như mới", "Tốt", "Trung bình", "Kém"];

  if (loading || !initialData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <LoadingBlock message="Đang tải thông tin sản phẩm…" className="py-8" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border mt-10 mb-20">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">
        Chỉnh sửa tin đăng
      </h2>

      <ImageUploader
        images={images || []}
        imageError={imageError}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        removeImage={removeImage}
        maxImages={PRODUCT_CONFIG.MAX_IMAGES}
        maxFileSizeMB={PRODUCT_CONFIG.MAX_FILE_SIZE_MB}
      />

      <ProductForm
        form={form}
        onSubmit={onSubmit}
        isSubmitting={isUpdating || isPreparingUpload}
        categories={categories}
        conditions={conditions}
        setCoords={setCoords}
        images={images}
        imageError={imageError}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        removeImage={removeImage}
      />
    </div>
  );
};

export default EditProduct;

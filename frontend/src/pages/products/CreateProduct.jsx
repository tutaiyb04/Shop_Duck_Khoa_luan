import { useCreateProduct } from "@/hooks/productHooks/createProduct/useCreateProduct";
import React from "react";

import ImageUploader from "@/components/product/createProduct/ImageUploader";
import ProductForm from "@/components/product/createProduct/ProductForm";

function CreateProduct() {
  const {
    form,
    images,
    imageError,
    fileInputRef,
    isSubmitting,
    isLoadingData,
    setCoords,
    handleFileChange,
    removeImage,
    onSubmit,
    MAX_IMAGES,
    MAX_FILE_SIZE_MB,
    categories = [],
    conditions = ["Mới", "Như mới", "Tốt", "Trung bình", "Kém"],
  } = useCreateProduct();

  if (isLoadingData) {
    return (
      <div className="text-center mt-20 text-gray-500">
        Đang chuẩn bị biểu mẫu...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border mt-10 mb-20">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">
        Đăng tin bán sản phẩm mới
      </h2>

      <ImageUploader
        images={images}
        imageError={imageError}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        removeImage={removeImage}
        maxImages={MAX_IMAGES}
        maxFileSizeMB={MAX_FILE_SIZE_MB}
      />

      <ProductForm
        form={form}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        categories={categories}
        conditions={conditions}
        setCoords={setCoords}
      />
    </div>
  );
}

export default CreateProduct;

import { useCreateProduct } from "@/hooks/productHooks/useCreateProduct";
import React from "react";

import ImageUploader from "@/components/product/ImageUploader";
import ProductForm from "@/components/product/ProductForm";

function CreateProduct() {
  const {
    form,
    images,
    imageError,
    fileInputRef,
    isSubmitting,
    handleFileChange,
    removeImage,
    onSubmit,
    MAX_IMAGES,
    MAX_FILE_SIZE_MB,
  } = useCreateProduct();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border mt-10 mb-20">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
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
      />
    </div>
  );
}

export default CreateProduct;

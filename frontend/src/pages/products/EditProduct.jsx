import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useEditProductForm } from "@/hooks/productHooks/editProduct/useEditProductFrom";
import ImageUploader from "@/components/product/createProduct/ImageUploader";
import ProductForm from "@/components/product/createProduct/ProductForm";

const EditProduct = () => {
  const { id } = useParams();

  const {
    initialData,
    categories,
    loading,
    isUpdating,
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
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
        <span className="ml-2 text-lg text-gray-500">
          Đang tải thông tin sản phẩm...
        </span>
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
        maxImages={5}
        maxFileSizeMB={5}
      />

      <ProductForm
        form={form}
        onSubmit={onSubmit}
        isSubmitting={isUpdating}
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

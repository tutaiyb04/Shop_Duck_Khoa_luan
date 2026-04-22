import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useCategoryMenu } from "@/hooks/productHooks/useCategoryMenu";
import { useEditProduct } from "@/hooks/productHooks/useEditProduct";
import ProductForm from "@/components/product/createProduct/ProductForm";

const EditProduct = () => {
  const { id } = useParams();
  const { initialData, loading, isUpdating, handleUpdate } = useEditProduct(id);

  const [coords, setCoords] = useState({ lat: null, lng: null });

  const form = useForm({
    values: initialData || {},
  });

  const { categories } = useCategoryMenu(form);
  const conditions = ["Mới", "Như mới", "Tốt", "Trung bình", "Kém"];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("name", data.title || data.name);
    formData.append("price", data.price);
    formData.append("category", data.category);
    formData.append("condition", data.condition);
    formData.append("quantity", data.quantity);
    formData.append("description", data.description);
    formData.append("address", data.location || data.address);
    const finalLat = coords.lat || initialData?.lat;
    const finalLng = coords.lng || initialData?.lng;

    if (finalLat && finalLng) {
      formData.append("lat", finalLat);
      formData.append("lng", finalLng);
    }

    handleUpdate(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border mt-10 mb-20">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">
        Chỉnh sửa tin đăng
      </h2>

      <ProductForm
        form={form}
        onSubmit={onSubmit}
        isSubmitting={isUpdating}
        categories={categories}
        conditions={conditions}
        setCoords={setCoords}
      />
    </div>
  );
};

export default EditProduct;

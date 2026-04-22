/* eslint-disable react-hooks/set-state-in-effect */
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { useEditProduct } from "@/hooks/productHooks/useEditProduct";
import ProductForm from "@/components/product/createProduct/ProductForm";
import toast from "react-hot-toast";
import ImageUploader from "@/components/product/createProduct/ImageUploader";

const EditProduct = () => {
  const { id } = useParams();
  const { initialData, categories, loading, isUpdating, handleUpdate } =
    useEditProduct(id);
  const [coords, setCoords] = useState({ lat: null, lng: null });

  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);

  const form = useForm({
    defaultValues: {
      title: "",
      parentCategory: "",
      category: "",
      price: "",
      quantity: 1,
      condition: "",
      description: "",
      location: "",
      attributes: { size: "" },
    },
  });

  const conditions = ["Mới", "Như mới", "Tốt", "Trung bình", "Kém"];

  useEffect(() => {
    // Chỉ chạy khi initialData thực sự có dữ liệu từ API trả về
    if (initialData && Object.keys(initialData).length > 0) {
      // 1. Đổ dữ liệu vào React Hook Form (Cái này sẽ giúp thẻ Select hiện chữ "Tốt")
      form.reset(initialData);

      // 2. Đổ dữ liệu Ảnh cũ
      if (initialData.existingImages) {
        const formattedImages = initialData.existingImages.map((url) => ({
          preview: url,
          file: null,
          isExisting: true,
        }));
        setImages(formattedImages);
      }

      // 3. Đổ dữ liệu tọa độ Bản đồ
      if (initialData.lat && initialData.lng) {
        setCoords({ lat: initialData.lat, lng: initialData.lng });
      }
    }
    // Mảng dependency CHỈ phụ thuộc vào initialData và form.
    // Không cho images.length vào đây!
  }, [initialData, form]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 5;
    const maxFileSizeMB = 5;

    if (images.length + files.length > maxImages) {
      setImageError(`Chỉ được tải lên tối đa ${maxImages} ảnh.`);
      return;
    }

    let hasError = false;
    const validFiles = files.filter((file) => {
      if (file.size / (1024 * 1024) > maxFileSizeMB) {
        hasError = true;
        return false;
      }
      return true;
    });

    if (hasError)
      setImageError(`Một số ảnh vượt quá dung lượng ${maxFileSizeMB}MB.`);
    else setImageError("");

    const newImages = validFiles.map((file) => ({
      preview: URL.createObjectURL(file), // Tạo link preview tạm thời
      file: file,
      isExisting: false, // Đánh dấu đây là ảnh mới
    }));

    setImages((prev) => [...prev, ...newImages]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const newImgs = [...prev];
      const removed = newImgs.splice(index, 1)[0];
      // Xóa bộ nhớ cache nếu là ảnh local
      if (!removed.isExisting) URL.revokeObjectURL(removed.preview);
      return newImgs;
    });
    setImageError("");
  };

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

  const onSubmit = (data) => {
    if (images.length === 0) {
      setImageError("Vui lòng tải lên ít nhất 1 hình ảnh sản phẩm.");
      toast.error("Sản phẩm phải có ít nhất 1 ảnh!");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.title);
    formData.append("price", data.price);
    formData.append("category", data.category);
    formData.append("condition", data.condition);
    formData.append("quantity", data.quantity);
    formData.append("description", data.description);
    formData.append("address", data.location);
    if (data.attributes?.size)
      formData.append("attributes", JSON.stringify(data.attributes));

    const finalLat = coords.lat || initialData?.lat;
    const finalLng = coords.lng || initialData?.lng;
    if (finalLat) formData.append("lat", finalLat);
    if (finalLng) formData.append("lng", finalLng);

    // --- GẮN ẢNH VÀO FORMDATA ĐỂ GỬI LÊN BACKEND ---
    images.forEach((img) => {
      if (img.isExisting) {
        formData.append("existingImages", img.preview); // Ảnh cũ: Gửi URL
      } else {
        formData.append("images", img.file); // Ảnh mới: Gửi File
      }
    });

    handleUpdate(formData);
  };

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

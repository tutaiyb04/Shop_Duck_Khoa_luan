/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useEditProduct } from "./useEditProduct";

export const useEditProductForm = (id) => {
  // Lấy data và hàm update từ hook API
  const { initialData, categories, loading, isUpdating, handleUpdate } =
    useEditProduct(id);

  // States quản lý Form
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);

  // Khởi tạo React Hook Form
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

  // Đổ dữ liệu cũ vào Form khi API tải xong
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      form.reset(initialData);

      // Đổ dữ liệu Ảnh cũ
      if (initialData.existingImages) {
        const formattedImages = initialData.existingImages.map((url) => ({
          preview: url,
          file: null,
          isExisting: true,
        }));
        setImages(formattedImages);
      }

      // Đổ dữ liệu tọa độ Bản đồ
      if (initialData.lat && initialData.lng) {
        setCoords({ lat: initialData.lat, lng: initialData.lng });
      }
    }
  }, [initialData, form]);

  // Xử lý logic thêm ảnh
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

    if (hasError) {
      setImageError(`Một số ảnh vượt quá dung lượng ${maxFileSizeMB}MB.`);
    } else {
      setImageError("");
    }

    const newImages = validFiles.map((file) => ({
      preview: URL.createObjectURL(file), // Tạo link preview tạm thời
      file: file,
      isExisting: false, // Đánh dấu đây là ảnh mới
    }));

    setImages((prev) => [...prev, ...newImages]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Xử lý logic xóa ảnh
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

  // Xử lý Submit dữ liệu lên Backend
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

    if (data.attributes?.size) {
      formData.append("attributes", JSON.stringify(data.attributes));
    }

    const finalLat = coords.lat || initialData?.lat;
    const finalLng = coords.lng || initialData?.lng;
    if (finalLat) formData.append("lat", finalLat);
    if (finalLng) formData.append("lng", finalLng);

    // Gắn ảnh vào FormData
    images.forEach((img) => {
      if (img.isExisting) {
        formData.append("existingImages", img.preview); // Ảnh cũ: Gửi URL
      } else {
        formData.append("images", img.file); // Ảnh mới: Gửi File
      }
    });

    handleUpdate(formData);
  };

  // Trả về tất cả State và Func cần thiết cho UI
  return {
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
  };
};

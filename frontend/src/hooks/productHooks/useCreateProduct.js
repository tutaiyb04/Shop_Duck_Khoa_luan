import * as z from "zod";
import toast from "react-hot-toast";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { API } from "@/services/axios";

import { PRODUCT_CONFIG } from "@/config/constains";

const productSchema = z.object({
  title: z
    .string()
    .min(10, { message: "Tên sản phẩm phải có ít nhất 10 ký tự" }),
  categoryId: z.string().min(1, { message: "Vui lòng chọn danh mục" }),
  price: z.coerce
    .number()
    .min(1000, { message: "Giá bán phải lớn hơn 1.000đ" }),
  quantity: z.coerce.number().min(1, { message: "Số lượng ít nhất là 1" }),
  condition: z.string().min(1, { message: "Vui lòng chọn tình trạng" }),
  description: z
    .string()
    .min(20, { message: "Mô tả chi tiết ít nhất 20 ký tự" }),
  shippingInfo: z
    .string()
    .min(1, { message: "Vui lòng nhập thông tin vận chuyển" }),
});

export function useCreateProduct() {
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoadingData(true);
        const res = await API.get("/categories");
        setCategories(res.data.category || res.data); // Lưu mảng danh mục vào state
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
        toast.error("Không thể tải dữ liệu danh mục!");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchInitialData();
  }, []);

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      categoryId: "",
      price: "",
      quantity: 1,
      condition: "",
      description: "",
      shippingInfo: "",
    },
  });

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setImageError("");

    if (images.length + selectedFiles.length > PRODUCT_CONFIG.MAX_IMAGES) {
      setImageError(
        `Bạn chỉ được phép tải lên tối đa ${PRODUCT_CONFIG.MAX_IMAGES} hình ảnh.`,
      );
      return;
    }

    const newImages = [];
    const filesTooLarge = [];

    selectedFiles.forEach((file) => {
      if (file.size > PRODUCT_CONFIG.MAX_FILE_SIZE_BYTES) {
        filesTooLarge.push(file.name);
        return;
      }
      newImages.push({
        file: file,
        preview: URL.createObjectURL(file),
      });
    });

    if (filesTooLarge.length > 0) {
      setImageError(
        `Các file sau quá lớn (>${PRODUCT_CONFIG.MAX_FILE_SIZE_MB}MB) và đã bị bỏ qua: ${filesTooLarge.join(", ")}`,
      );
    }

    setImages((prev) => [...prev, ...newImages]);
    event.target.value = null;
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => {
      const imageUrlToRevoke = prev[indexToRemove].preview;
      URL.revokeObjectURL(imageUrlToRevoke);
      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  const onSubmit = async (data) => {
    if (images.length === 0) {
      toast.error("Vui lòng tải lên ít nhất 1 hình ảnh sản phẩm.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", data.title);
      formData.append("category", data.categoryId);
      formData.append("price", data.price);
      formData.append("quantity", data.quantity);
      formData.append("condition", data.condition);
      formData.append("description", data.description);
      formData.append("shippingInfo", data.shippingInfo);

      images.forEach((img) => {
        formData.append("images", img.file);
      });

      await API.post("/products/create-product", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Đăng bán sản phẩm thành công!");
      navigate("/");
    } catch (error) {
      console.error("Lỗi đăng bán:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi đăng bán sản phẩm!",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    images,
    imageError,
    fileInputRef,
    categories,
    isLoadingData,
    isSubmitting,
    handleFileChange,
    removeImage,
    onSubmit,
    MAX_IMAGES: PRODUCT_CONFIG.MAX_IMAGES,
    MAX_FILE_SIZE_MB: PRODUCT_CONFIG.MAX_FILE_SIZE_MB,
  };
}

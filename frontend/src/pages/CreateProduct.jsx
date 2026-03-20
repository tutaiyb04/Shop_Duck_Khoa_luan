import React, { useState, useRef } from "react"; // 1. Import thêm useState và useRef
import toast from 'react-hot-toast';
import { API } from '@/services/axios'; // Đảm bảo đường dẫn này khớp với cấu trúc thư mục của bạn
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Plus, Image as ImageIcon } from "lucide-react"; // Import icon đẹp mắt từ lucide-react (có sẵn khi cài shadcn)
import { useNavigate } from "react-router-dom";

// Import các component của shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Nhớ check xem bạn đã cài component Alert của shadcn chưa nhé: npx shadcn@latest add alert
import { Alert, AlertDescription } from "@/components/ui/alert"; 

// Hằng số cấu hình theo SRS
const MAX_IMAGES = 5;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; // Đổi ra Bytes để so sánh

// 1. Khai báo Zod Schema (giữ nguyên như cũ)
const productSchema = z.object({
  title: z.string().min(10, { message: "Tên sản phẩm phải có ít nhất 10 ký tự" }),
  categoryId: z.string().min(1, { message: "Vui lòng chọn danh mục" }),
  price: z.coerce.number().min(1000, { message: "Giá bán phải lớn hơn 1.000đ" }),
  quantity: z.coerce.number().min(1, { message: "Số lượng ít nhất là 1" }),
  condition: z.string().min(1, { message: "Vui lòng chọn tình trạng" }),
  description: z.string().min(20, { message: "Mô tả chi tiết ít nhất 20 ký tự" }),
  shippingInfo: z.string().min(1, { message: "Vui lòng nhập thông tin vận chuyển" }),
});

function CreateProduct() {
  // --- [PHẦN MỚI] BƯỚC 2: LOGIC XỬ LÝ ẢNH ---
  const navigate = useNavigate();
  // 1. State lưu trữ mảng các file ảnh và link preview nháp
  // Mỗi item trong mảng sẽ có cấu trúc: { file: FileObject, preview: "blob:..." }
  const [images, setImages] = useState([]);
  
  // 2. State lưu lỗi liên quan đến ảnh (vd: quá 5 ảnh, ảnh > 5MB)
  const [imageError, setImageError] = useState("");
  
  // 3. Dùng useRef để tham chiếu đến ô input file ẩn
  const fileInputRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 4. Hàm xử lý khi người dùng chọn file từ máy tính
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files); // Chuyển FileList thành Array
    setImageError(""); // Reset lỗi cũ

    // --- LUỒNG NGOẠI LỆ 1 (SRS): Chặn nếu tổng số ảnh > 5 ---
    if (images.length + selectedFiles.length > MAX_IMAGES) {
      setImageError(`Bạn chỉ được phép tải lên tối đa ${MAX_IMAGES} hình ảnh.`);
      return; // Dừng xử lý
    }

    const newImages = [];
    const filesTooLarge = [];

    // Duyệt qua từng file người dùng vừa chọn
    selectedFiles.forEach((file) => {
      // --- LUỒNG NGOẠI LỆ 2 (SRS): Chặn file quá lớn (> 5MB) ---
      if (file.size > MAX_FILE_SIZE_BYTES) {
        filesTooLarge.push(file.name); // Lưu tên file lỗi để báo người dùng
        return; // Bỏ qua file này
      }

      // --- XỬ LÝ CHÍNH: Tạo ảnh nháp (Preview) ---
      // Dùng URL.createObjectURL(file) để tạo ra một link tạm thời (blob:...)
      // Link này trỏ trực tiếp vào file trong bộ nhớ trình duyệt, giúp hiển thị ngay mà không cần upload lên server
      newImages.push({
        file: file, // Lưu file gốc để sau này gửi lên API
        preview: URL.createObjectURL(file), // Lưu link nháp để hiển thị <img src=...>
      });
    });

    // Cập nhật state lỗi nếu có file quá lớn
    if (filesTooLarge.length > 0) {
      setImageError(`Các file sau quá lớn (>${MAX_FILE_SIZE_MB}MB) và đã bị bỏ qua: ${filesTooLarge.join(", ")}`);
    }

    // Cập nhật danh sách ảnh hiện tại (ảnh cũ + ảnh mới hợp lệ)
    setImages((prev) => [...prev, ...newImages]);

    // Quan trọng: Reset giá trị của ô input file về rỗng
    // Để nếu người dùng chọn lại đúng file đó, sự kiện onChange vẫn được kích hoạt
    event.target.value = null; 
  };

  // 5. Hàm xóa một bức ảnh khỏi danh sách preview
  const removeImage = (indexToRemove) => {
    setImages((prev) => {
      // 1. Lấy link preview của ảnh sắp xóa
      const imageUrlToRevoke = prev[indexToRemove].preview;
      
      // 2. [TỐI ƯU BỘ NHỚ]: Thu hồi link tạm thời để trình duyệt giải phóng bộ nhớ
      URL.revokeObjectURL(imageUrlToRevoke); 
      
      // 3. Xóa ảnh khỏi mảng state
      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  // --- [KẾT THÚC PHẦN MỚI] ---

  // 2. Khởi tạo React Hook Form (giữ nguyên)
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

  // 3. Hàm xử lý khi bấm Submit thành công
  const onSubmit = async (data) => {
    // 1. Chặn nếu chưa có ảnh
    if (images.length === 0) {
      toast.error("Vui lòng tải lên ít nhất 1 hình ảnh sản phẩm.");
      return; 
    }

    setIsSubmitting(true);
    
    try {
      // 2. Khởi tạo túi chứa dữ liệu (FormData) để có thể gửi cả chữ lẫn file
      const formData = new FormData();

      // Nhét các thông tin chữ vào túi
      formData.append("name", data.title); 
      formData.append("category", data.categoryId);
      formData.append("price", data.price);
      formData.append("quantity", data.quantity);
      formData.append("condition", data.condition);
      formData.append("description", data.description);
      formData.append("shippingInfo", data.shippingInfo);

      // 3. Nhét các file ảnh vào túi
      // Quan trọng: Tên key "images" này phải khớp với tên biến multer ở Backend nhóm bạn quy định
      images.forEach((img) => {
        formData.append("images", img.file); 
      });

      // 4. Gửi túi dữ liệu này lên Backend
      // Lưu ý: Sửa "/api/products" thành đúng đường dẫn API đăng bán của Backend nhóm bạn nhé
      const response = await API.post("/api/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Bắt buộc phải có dòng này khi gửi file
        },
      });

      // 5. Xử lý khi thành công
      toast.success("Đăng bán sản phẩm thành công!");
      
      // TODO: Có thể dùng useNavigate của react-router-dom để chuyển hướng về trang chủ hoặc trang quản lý tin
      navigate('/');

    } catch (error) {
      console.error("Lỗi đăng bán:", error);
      // Hiển thị lỗi từ Backend gửi về (nếu có), không thì báo lỗi chung
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi đăng bán sản phẩm!");
    } finally {
      setIsSubmitting(false); // Xong việc thì tắt loading
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border mt-10 mb-20">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Đăng tin bán sản phẩm mới</h2>

      {/* --- [PHẦN MỚI] GIAO DIỆN UPLOAD VÀ PREVIEW ẢNH --- */}
      <div className="mb-8 p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
        <div className="flex items-center justify-between mb-4">
          <label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-500" />
            Hình ảnh sản phẩm <span className="text-red-500">*</span>
          </label>
          <span className="text-sm text-gray-500">
            ({images.length} / {MAX_IMAGES} ảnh) - Tối đa {MAX_FILE_SIZE_MB}MB/ảnh
          </span>
        </div>

        {/* Hiển thị lỗi liên quan đến ảnh (nếu có) */}
        {imageError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{imageError}</AlertDescription>
          </Alert>
        )}

        {/* Khu vực Grid hiển thị ảnh Preview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {/* Ô NÚT BẤM "THÊM ẢNH" */}
          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInputRef.current.click()} // Kích hoạt click vào input ẩn
              className="group aspect-square flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white hover:border-amber-400 hover:bg-amber-50/50 transition-all text-gray-500 hover:text-amber-600"
            >
              <Plus className="w-8 h-8 " />
              <span className="text-xs font-medium">Thêm ảnh</span>
            </button>
          )}

          {/* HIỂN THỊ CÁC ẢNH ĐÃ CHỌN (PREVIEW) */}
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white group shadow-sm">
              <img
                src={image.preview} // ĐÂY LÀ CHỖ DÙNG URL.createObjectURL() để hiển thị ảnh nháp
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Nút xóa ảnh (Hiện khi hover) */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Ô INPUT FILE ẨN (Thực hiện chức năng chọn file) */}
        <input
          type="file"
          ref={fileInputRef} // Tham chiếu đến useRef ban nãy
          multiple // Cho phép chọn nhiều file cùng lúc
          accept="image/png, image/jpeg, image/jpg" // Chỉ nhận file ảnh
          onChange={handleFileChange} // Gọi hàm xử lý logic khi chọn xong
          className="hidden" // Ẩn đi vì giao diện xấu
        />
      </div>
      {/* --- [KẾT THÚC PHẦN MỚI GIAO DIỆN ẢNH] --- */}


      {/* PHẦN FORM TEXT (Giữ nguyên như cũ) */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* TÊN SẢN PHẨM */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên sản phẩm <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="VD: iPhone 13 Pro Max 256GB VN/A..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DANH MỤC */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="dien-thoai">Điện thoại</SelectItem>
                      <SelectItem value="lap-top">Laptop</SelectItem>
                      <SelectItem value="thoi-trang">Thời trang</SelectItem>
                      <SelectItem value="khac">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* TÌNH TRẠNG */}
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tình trạng <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn tình trạng" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Mới">Mới (Chưa sử dụng)</SelectItem>
                      <SelectItem value="Cũ (Like New)">Cũ (Like New 99%)</SelectItem>
                      <SelectItem value="Cũ (Khá)">Cũ (Khá 90-95%)</SelectItem>
                      <SelectItem value="Cũ (Trầy xước)">Cũ (Trầy xước nhiều)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* GIÁ BÁN */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giá bán (VNĐ) <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input type="number" placeholder="VD: 15000000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
            {/* SỐ LƯỢNG */}
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số lượng <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input type="number" placeholder="VD: 1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* MÔ TẢ */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả chi tiết <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Textarea 
                    rows={5} 
                    placeholder="Mô tả chi tiết về ngoại hình, phụ kiện, chức năng, lỗi (nếu có)..." 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* THÔNG TIN VẬN CHUYỂN */}
          <FormField
            control={form.control}
            name="shippingInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thông tin vận chuyển <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phương thức giao hàng" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Giao hàng toàn quốc">Giao hàng toàn quốc (GHN/GHTK)</SelectItem>
                    <SelectItem value="Chỉ giao dịch trực tiếp">Chỉ giao dịch trực tiếp</SelectItem>
                    <SelectItem value="Thỏa thuận">Thỏa thuận với người mua</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* NÚT SUBMIT */}
          <Button type="submit" disabled={isSubmitting} className="w-full bg-amber-400 text-black hover:bg-amber-500 font-bold h-12 text-lg mt-4">
            Đăng tin bán
          </Button>

        </form>
      </Form>
    </div>
  );
}

export default CreateProduct;
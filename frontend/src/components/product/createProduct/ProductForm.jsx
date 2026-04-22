import React from "react";
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
import CategoryMegaMenu from "./CategoryMageMenu";
import MapPicker from "./MapPicker";

function ProductForm({
  form,
  onSubmit,
  isSubmitting,
  categories,
  conditions,
  setCoords,
}) {
  const addressValue = form.watch("location");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-bold text-gray-900">
                Tên sản phẩm <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className="h-10 text-md !ring-0 focus-visible:border-yellow-500"
                  placeholder="VD: iPhone 13 Pro Max 256GB VN/A..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <CategoryMegaMenu form={form} categories={categories} />

          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => {
              // 1. Loại bỏ khoảng trắng thừa và ép đồng bộ chuẩn Unicode tiếng Việt
              const safeValue = field.value
                ? String(field.value).trim().normalize("NFC")
                : "";

              return (
                <FormItem>
                  <FormLabel className="text-lg font-bold text-gray-900">
                    Tình trạng <span className="text-red-500">*</span>
                  </FormLabel>

                  <Select
                    onValueChange={field.onChange}
                    value={safeValue} // Dùng giá trị đã được làm sạch
                  >
                    <FormControl>
                      <SelectTrigger className="!h-10 !text-md hover:!border-yellow-500 focus:!border-yellow-500 transition-colors !border-1 !border-gray-200">
                        <SelectValue placeholder="Chọn tình trạng" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {conditions.map((cond, index) => {
                        // 2. Làm sạch tương tự cho các Option trong menu
                        const safeCond = String(cond).trim().normalize("NFC");

                        return (
                          <SelectItem key={index} value={safeCond}>
                            {cond}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Giá bán (VNĐ) <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className="h-10 text-md !ring-0 focus-visible:border-yellow-500"
                  type="number"
                  placeholder="VD: 15000000"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-bold text-gray-900">
                Số lượng <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className="h-10 text-md !ring-0 focus-visible:border-yellow-500"
                  type="number"
                  placeholder="VD: 1"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="attributes.size"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-bold text-gray-900">
                Kích thước{" "}
                <span className="text-sm font-normal text-gray-500">
                  (Không bắt buộc)
                </span>
              </FormLabel>
              <FormControl>
                <Input
                  className="h-10 text-md bg-gray-50 !ring-0 focus-visible:border-yellow-500"
                  placeholder="XL, 24x24, 15 inch..."
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-bold text-gray-900">
                Mô tả chi tiết <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  className="h-30 text-md !ring-0 focus-visible:border-yellow-500"
                  rows={5}
                  placeholder="Mô tả chi tiết về ngoại hình, phụ kiện, chức năng, lỗi (nếu có)..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-bold text-gray-900">
                Vị trí sản phẩm <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <Input
                    className="h-10 text-md bg-gray-50 !ring-0 focus-visible:border-yellow-500"
                    placeholder="Địa chỉ tự động hiện khi chọn trên bản đồ"
                    {...field}
                  />
                  {/* Hiển thị bản đồ OpenStreetMap */}
                  <MapPicker
                    searchAddress={addressValue}
                    onLocationSelect={(loc) => {
                      form.setValue("location", loc.address); // Điền địa chỉ vào input
                      setCoords({ lat: loc.lat, lng: loc.lng }); // Lưu tọa độ vào Hook
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full !bg-yellow-500 text-white hover:!bg-yellow-600 transition-colors h-10 !border-0 !ring-0 !outline-none"
        >
          Đăng tin bán
        </Button>
      </form>
    </Form>
  );
}

export default ProductForm;

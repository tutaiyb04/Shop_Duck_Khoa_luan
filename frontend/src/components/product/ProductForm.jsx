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

function ProductForm({ form, onSubmit, isSubmitting }) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Tên sản phẩm <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="VD: iPhone 13 Pro Max 256GB VN/A..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Danh mục <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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

          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tình trạng <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tình trạng" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Mới">Mới (Chưa sử dụng)</SelectItem>
                    <SelectItem value="Cũ (Like New)">
                      Cũ (Like New 99%)
                    </SelectItem>
                    <SelectItem value="Cũ (Khá)">Cũ (Khá 90-95%)</SelectItem>
                    <SelectItem value="Cũ (Trầy xước)">
                      Cũ (Trầy xước nhiều)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
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
                <Input type="number" placeholder="VD: 15000000" {...field} />
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
              <FormLabel>
                Số lượng <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input type="number" placeholder="VD: 1" {...field} />
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
              <FormLabel>
                Mô tả chi tiết <span className="text-red-500">*</span>
              </FormLabel>
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

        <FormField
          control={form.control}
          name="shippingInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Thông tin vận chuyển <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phương thức giao hàng" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Giao hàng toàn quốc">
                    Giao hàng toàn quốc (GHN/GHTK)
                  </SelectItem>
                  <SelectItem value="Chỉ giao dịch trực tiếp">
                    Chỉ giao dịch trực tiếp
                  </SelectItem>
                  <SelectItem value="Thỏa thuận">
                    Thỏa thuận với người mua
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-amber-400 text-black hover:bg-amber-500 font-bold h-12 text-lg mt-4"
        >
          Đăng tin bán
        </Button>
      </form>
    </Form>
  );
}

export default ProductForm;

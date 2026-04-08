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

function ProductForm({
  form,
  onSubmit,
  isSubmitting,
  categories,
  conditions,
  shippingMethods,
}) {
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
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-bold text-gray-900">
                  Danh mục <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="!h-10 !text-md hover:!border-yellow-500 focus:!border-yellow-500 transition-colors !border-1 !border-gray-200">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.isArray(categories) &&
                      categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
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
                <FormLabel className="text-lg font-bold text-gray-900">
                  Tình trạng <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="!h-10 !text-md hover:!border-yellow-500 focus:!border-yellow-500 transition-colors !border-1 !border-gray-200">
                      <SelectValue placeholder="Chọn tình trạng" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {conditions.map((cond, index) => (
                      <SelectItem key={index} value={cond}>
                        {cond}
                      </SelectItem>
                    ))}
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
          name="shippingInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-bold text-gray-900">
                Thông tin vận chuyển <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="!h-10 !text-md hover:!border-yellow-500 focus:!border-yellow-500 transition-colors !border-1 !border-gray-200">
                    <SelectValue placeholder="Chọn phương thức giao hàng" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {shippingMethods.map((method, index) => (
                    <SelectItem key={index} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";

function RecommendedProducts() {
  return (
    <Card className="border shadow-sm bg-white rounded-xl h-fit sticky top-6">
      <CardContent className="p-4 flex flex-col gap-4">
        <h2 className="text-base font-bold text-gray-800">
          Có thể bạn sẽ thích
        </h2>
        {/* Skeleton loaders hiển thị tạm */}
        {[1, 2].map((skeleton) => (
          <div
            key={skeleton}
            className="group cursor-pointer rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-all bg-white"
          >
            <div className="aspect-[4/5] bg-gray-50 flex items-center justify-center relative">
              <ImageIcon className="w-8 h-8 text-gray-200 animate-pulse" />
            </div>
            <div className="p-3 space-y-2.5">
              <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
              <div className="h-3.5 bg-yellow-100 rounded animate-pulse w-1/2 mt-1"></div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default RecommendedProducts;

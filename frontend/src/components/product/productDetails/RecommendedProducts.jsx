import { Card, CardContent } from "@/components/ui/card";

function RecommendedProducts({ products }) {
  if (!products || products.length === 0) return null;

  return (
    <Card className="border shadow-sm bg-white rounded-xl h-fit sticky top-6">
      <CardContent className="p-4 flex flex-col gap-4">
        <h2 className="text-base font-bold text-gray-800">
          Có thể bạn sẽ thích
        </h2>
        <div className="flex flex-col gap-4">
          {products.map((item) => (
            <ProductCard key={item._id} product={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default RecommendedProducts;

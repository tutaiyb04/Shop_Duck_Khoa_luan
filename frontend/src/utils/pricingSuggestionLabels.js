export const PRICING_METHOD_LABEL_VI = {
  blend_market_and_completed_orders:
    "Kết hợp giá tin đang bán & giao dịch hoàn thành (45% / 55%)",
  completed_orders_avg: "Theo giá các đơn đã hoàn thành",
  active_listings_avg: "Theo giá tin đang bán trên sàn",
  insufficient_data: "Chưa đủ dữ liệu để ước lượng",
};

export const PRICING_CONFIDENCE_LABEL_VI = {
  high: "Độ tin cậy: cao",
  medium: "Độ tin cậy: trung bình",
  low: "Độ tin cậy: thấp",
  none: "Chưa đủ mẫu để đánh giá độ tin cậy",
};

// nhãn phương pháp dựa trên số lượng sản phẩm đang bán và đã bán
export const pricingMethodVi = (method) => {
  if (method == null || method === "") return "—";
  return PRICING_METHOD_LABEL_VI[method] || method;
}

// nhãn độ tin cậy của gợi ý giá
export const pricingConfidenceVi = (confidence) => {
  if (confidence == null || confidence === "") return "—";
  return PRICING_CONFIDENCE_LABEL_VI[confidence] || confidence;
}

// định dạng số tiền thành định dạng tiền tệ
export const formatVnd = (n) => {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return new Intl.NumberFormat("vi-VN").format(Number(n)) + " đ";
}

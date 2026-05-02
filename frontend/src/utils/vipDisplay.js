// kiểm tra xem sản phẩm có VIP còn hiệu lực không
export function isProductVipActive(product) {
  if (!product?.isVIP) {
    return false;
  }

  // lấy ngày hết hạn VIP
  const raw = product.vipUntil;
  
  // nếu không có ngày hết hạn VIP thì coi là VIP còn hiệu lực
  if (!raw) {
    return true;
  }

  // kiểm tra xem ngày hết hạn VIP có hợp lệ không
  const t = new Date(raw).getTime();

  // nếu ngày hết hạn VIP không hợp lệ thì coi là VIP không còn hiệu lực
  if (!Number.isFinite(t)) {
    return false;
  }

  return t > Date.now();
}

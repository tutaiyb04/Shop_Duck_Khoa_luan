import {
    BookOpen, Shirt, Sparkles, Smartphone, Home, Baby,
    Gamepad2, Car, Footprints, Dog, Watch, Music,
    Camera, Dumbbell, Briefcase, Flower2, Package,
  } from "lucide-react";
  
  const ICON_RULES = [
    { test: /sách/, Icon: BookOpen },
    { test: /thời trang nữ|đồ nữ|váy|giày nữ/, Icon: Sparkles },
    { test: /thời trang nam|đồ nam|giày nam/, Icon: Shirt },
    { test: /làm đẹp|mỹ phẩm|trang sức|nước hoa/, Icon: Flower2 },
    { test: /mẹ và bé|mẹ & bé|em bé|trẻ em/, Icon: Baby },
    { test: /đồ chơi|trò chơi|game/, Icon: Gamepad2 },
    { test: /nhà cửa|gia dụng|nội thất/, Icon: Home },
    { test: /điện tử|laptop|máy tính|pc|tivi/, Icon: Smartphone },
    { test: /văn phòng|vp/, Icon: Briefcase },
    { test: /xe|ô tô|phụ kiện ô/, Icon: Car },
    { test: /thú cưng|chó|mèo/, Icon: Dog },
    { test: /thể thao|dã ngoại|cắm trại/, Icon: Dumbbell },
    { test: /máy ảnh|camera/, Icon: Camera },
    { test: /âm thanh|nhạc cụ/, Icon: Music },
    { test: /giày|dép/, Icon: Footprints },
    { test: /đồng hồ/, Icon: Watch },
    { test: /khác/, Icon: Package },
  ];
  
  export const iconForCategoryName = (name) => {
    const n = String(name || "").toLowerCase();
    for (const { test, Icon } of ICON_RULES) {
      if (test.test(n)) return Icon;
    }
    return Package;
  };
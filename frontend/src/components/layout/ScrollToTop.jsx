import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Mỗi lần đổi pathname hoặc query, kéo viewport về đầu trang (SPA mặc định giữ scroll).
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
}

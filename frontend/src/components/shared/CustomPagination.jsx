import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";

function CustomPagination({ pagination, onPageChange }) {
  const currentPage = pagination?.currentPage || 1;
  const totalPages = pagination?.totalPages || 1;

  // Không có dữ liệu hoặc chỉ có 1 trang thì không hiển thị thanh phân trang
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 1; // Số lượng nút hiển thị bên trái/phải của trang hiện tại
    const range = [];
    const rangeWithDots = [];
    let l;

    // Lấy các trang cố định (Trang đầu, Trang cuối, và các trang lân cận trang hiện tại)
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    // Chèn dấu "..." vào những chỗ bị đứt quãng
    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1); // Nếu khoảng cách chỉ là 1 số thì điền luôn số đó (vd: 1, 2, 3)
        } else if (i - l !== 1) {
          rangeWithDots.push("..."); // Nếu khoảng cách > 1 thì chèn dấu "..."
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const pages = getPageNumbers();
  return (
    <div className="flex items-center justify-center space-x-2 mt-6 pt-4 border-t border-gray-100 w-full">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="text-gray-500 hover:text-yellow-600 !cursor-pointe !border-0 !ring-0 !outline-none !bg-transparent"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
      </button>

      <div className="flex items-center gap-1 overflow-x-auto max-w-[60vw] px-1 hide-scrollbar">
        {pages.map((page, index) => {
          // Xử lý render dấu 3 chấm
          if (page === "...") {
            return (
              <span
                key={`dots-${index}`}
                className="px-2 text-gray-400 flex items-center justify-center"
              >
                <MoreHorizontal className="w-4 h-4" />
              </span>
            );
          }

          return (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className={`flex items-center justify-center !rounded-full !w-10 !h-10 !p-0 shrink-0 !transition-all ${
                currentPage === page
                  ? "!bg-yellow-500 hover:!bg-yellow-600 !text-white !font-bold !border-0 !ring-0 !outline-none"
                  : "!text-gray-600 hover:!bg-yellow-200 !bg-yellow-100 !border-0 !ring-0 !outline-none"
              }`}
            >
              {page}
            </Button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="text-gray-500 hover:text-yellow-600 !cursor-pointe !border-0 !ring-0 !outline-none !bg-transparent"
      >
        <ChevronRight className="w-5 h-5 ml-1" />
      </button>
    </div>
  );
}

export default CustomPagination;

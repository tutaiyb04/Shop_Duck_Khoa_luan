import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import * as LucideIcons from "lucide-react";

function CategoryTable({ categories, type, onEdit, onDelete }) {
  const isParent = type === "parent";
  const title = isParent ? "Danh mục chính (Gốc)" : "Danh mục phụ (Con)";
  const borderColor = isParent ? "border-yellow-500" : "border-blue-500";

  // Hàm render Icon nằm trực tiếp trong function chính
  const renderIcon = (iconName) => {
    if (iconName?.length <= 2) {
      return <span className="text-xl sm:text-2xl">{iconName}</span>;
    }
    const cleanName = iconName?.replace(/[<>/\s]/g, "");
    const IconComponent = LucideIcons[cleanName] || LucideIcons.Box;
    return <IconComponent className="w-6 h-6 text-gray-600" />;
  };

  return (
    <div className="animate-in fade-in duration-300">
      <h2
        className={`text-lg font-bold text-gray-800 mb-3 border-l-4 pl-3 ${borderColor}`}
      >
        {title}
      </h2>
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full border-collapse text-sm sm:text-base">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 sm:p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
                Icon
              </th>
              <th className="p-3 sm:p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
                Tên danh mục
              </th>
              {!isParent && (
                <th className="p-3 sm:p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
                  Thuộc danh mục
                </th>
              )}
              <th className="p-3 sm:p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
                Mô tả
              </th>
              <th className="p-3 sm:p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
                Slug
              </th>
              <th className="p-3 sm:p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
                Trạng thái
              </th>
              <th className="p-3 sm:p-4 text-center font-semibold text-gray-600 whitespace-nowrap">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr
                key={cat._id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="p-3 sm:p-4">
                  {/* Gọi trực tiếp hàm renderIcon */}
                  {renderIcon(cat.icon)}
                </td>
                <td className="p-3 sm:p-4 font-semibold text-gray-800 whitespace-nowrap">
                  {cat.name}
                </td>

                {!isParent && (
                  <td className="p-3 sm:p-4 whitespace-nowrap">
                    <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-xs font-semibold border border-blue-100">
                      {cat.parentId?.name || "Lỗi tham chiếu"}
                    </span>
                  </td>
                )}

                <td className="p-3 sm:p-4 text-gray-600 min-w-[150px] max-w-[200px] truncate">
                  {cat.description || (
                    <span className="text-gray-400 italic text-xs">
                      Không có mô tả
                    </span>
                  )}
                </td>
                <td className="p-3 sm:p-4 text-gray-500 whitespace-nowrap">
                  {cat.slug}
                </td>
                <td className="p-3 sm:p-4 whitespace-nowrap">
                  <span
                    className={`px-2.5 py-1 text-xxs sm:text-xs font-bold rounded-full uppercase tracking-wider ${
                      cat.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {cat.status === "active" ? "Hoạt động" : "Đã ẩn"}
                  </span>
                </td>
                <td className="p-3 sm:p-4 flex justify-center gap-2 whitespace-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(cat)}
                    className="h-8 w-8 p-0 hover:!bg-gray-200 !border-1 !border-gray-200 !ring-0 !outline-none"
                  >
                    <Edit className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(cat._id)}
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200 hover:!bg-gray-200 !border-1 !border-gray-200 !ring-0 !outline-none"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}

            {categories.length === 0 && (
              <tr>
                <td
                  colSpan={isParent ? "6" : "7"}
                  className="p-8 text-center text-gray-500"
                >
                  Chưa có danh mục {isParent ? "chính" : "phụ"} nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CategoryTable;

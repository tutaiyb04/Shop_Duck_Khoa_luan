import React from "react";
import { ChevronRight, ListTree } from "lucide-react";
import { useCategoryMenu } from "@/hooks/productHooks/useCategoryMenu";

export default function CategoryMegaMenu({ form, categories }) {
  const {
    isCategoryOpen,
    setIsCategoryOpen,
    hoveredParent,
    setHoveredParent,
    categoryRef,
    mainCategories,
    getSubCategories,
    displayCategory,
    selectedParentId,
    selectedCategoryId,
    handleSelectChild,
  } = useCategoryMenu(form, categories);

  const activeParentId = hoveredParent || selectedParentId;
  const currentSubCategories = activeParentId
    ? getSubCategories(activeParentId)
    : [];

  return (
    <div className="space-y-2 relative" ref={categoryRef}>
      <label className="text-lg font-bold text-gray-900 block">
        Danh mục <span className="text-red-500">*</span>
      </label>

      <div
        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
        className={`w-full flex h-10 items-center justify-between rounded-md border bg-white px-3 py-2 text-sm cursor-pointer transition-colors shadow-sm ${
          form.formState.errors.category
            ? "border-red-500"
            : "border-gray-200 hover:border-yellow-500"
        }`}
      >
        <span
          className={
            selectedCategoryId ? "text-gray-900 font-medium" : "text-gray-400"
          }
        >
          {displayCategory}
        </span>
        <ListTree className="w-4 h-4 text-gray-400" />
      </div>

      {form.formState.errors.category && (
        <p className="text-[0.8rem] font-medium text-red-500 mt-2">
          {form.formState.errors.category.message}
        </p>
      )}

      {/* Bảng Mega Menu (Popover) */}
      {isCategoryOpen && (
        <div
          className="absolute top-[70px] left-0 z-50 bg-white border border-gray-200 shadow-2xl rounded-lg flex h-[350px] animate-in fade-in zoom-in-95 duration-200 max-w-[calc(100vw-2rem)]"
          onMouseLeave={() => setHoveredParent(null)}
        >
          <div className="w-[280px] sm:w-[300px] border-r border-gray-100 overflow-y-auto bg-gray-50/50 py-2 shrink-0">
            {mainCategories.map((cat) => {
              const isActive =
                hoveredParent === cat._id ||
                (!hoveredParent && selectedParentId === cat._id);
              // Kiểm tra xem mục này có danh mục con hay không
              const hasChildren = getSubCategories(cat._id).length > 0;

              return (
                <div
                  key={cat._id}
                  onMouseEnter={() => setHoveredParent(cat._id)}
                  className={`px-4 py-3 flex justify-between items-center cursor-pointer transition-all ${
                    isActive
                      ? "bg-white text-yellow-600 font-bold border-l-4 border-yellow-500 shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 border-l-4 border-transparent"
                  }`}
                >
                  <span className="text-sm">{cat.name}</span>
                  {hasChildren && (
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${isActive ? "opacity-100" : "opacity-40"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {currentSubCategories.length > 0 && (
            <div className="w-[280px] sm:w-[300px] overflow-y-auto bg-white py-2 shrink-0 animate-in slide-in-from-left-2 duration-200">
              {currentSubCategories.map((child) => (
                <div
                  key={child._id}
                  onClick={() => handleSelectChild(child._id, activeParentId)}
                  className={`px-5 py-2.5 cursor-pointer text-sm transition-colors ${
                    selectedCategoryId === child._id
                      ? "text-yellow-600 font-bold bg-yellow-50"
                      : "text-gray-700 hover:text-yellow-600 hover:bg-yellow-50"
                  }`}
                >
                  {child.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from "react";

export function useCategoryMenu(form, categories) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [hoveredParent, setHoveredParent] = useState(null);
  const categoryRef = useRef(null);

  // 1. Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Phân loại danh mục
  const mainCategories = categories?.filter((cat) => !cat.parentId) || [];
  const getSubCategories = (pId) => {
    return (
      categories?.filter(
        (cat) => (cat.parentId?._id || cat.parentId) === pId,
      ) || []
    );
  };

  // 3. Lấy dữ liệu từ Form
  let selectedParentId = form.watch("parentCategory");
  const selectedCategoryId = form.watch("category");

  // FIX: Nếu đang Edit (có category con nhưng thiếu parentId), tự động tìm parentId
  useEffect(() => {
    if (selectedCategoryId && !selectedParentId && categories?.length > 0) {
      const currentCat = categories.find((c) => c._id === selectedCategoryId);
      if (currentCat && currentCat.parentId) {
        const pId = currentCat.parentId._id || currentCat.parentId;
        form.setValue("parentCategory", pId);
      }
    }
  }, [selectedCategoryId, selectedParentId, categories, form]);

  // 4. Tạo chuỗi hiển thị "Cha > Con"
  const parentName = categories?.find((c) => c._id === selectedParentId)?.name;
  const childName = categories?.find((c) => c._id === selectedCategoryId)?.name;

  const displayCategory = childName
    ? parentName
      ? `${parentName} > ${childName}`
      : childName
    : "Vui lòng chọn ngành hàng...";

  const handleSelectChild = (childId, parentId) => {
    form.setValue("parentCategory", parentId, { shouldValidate: true });
    form.setValue("category", childId, { shouldValidate: true });
    setIsCategoryOpen(false);
  };

  return {
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
  };
}

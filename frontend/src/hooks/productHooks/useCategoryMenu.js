import { useState, useRef, useEffect } from "react";

export function useCategoryMenu(form, categories) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [hoveredParent, setHoveredParent] = useState(null);
  const categoryRef = useRef(null);

  // 1. Logic xử lý click ra ngoài để đóng Menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Logic lọc danh mục chính và phụ
  const mainCategories = categories?.filter((cat) => !cat.parentId) || [];

  const getSubCategories = (parentId) => {
    return (
      categories?.filter((cat) => {
        const pId = cat.parentId?._id || cat.parentId;
        return pId === parentId;
      }) || []
    );
  };

  // 3. Logic lấy giá trị đang chọn từ Form (Zod)
  const selectedParentId = form.watch("parentCategory");
  const selectedCategoryId = form.watch("category");

  const selectedParentName = categories?.find(
    (c) => c._id === selectedParentId,
  )?.name;
  const selectedCategoryName = categories?.find(
    (c) => c._id === selectedCategoryId,
  )?.name;

  // 4. Logic tạo chuỗi hiển thị
  const displayCategory = selectedCategoryId
    ? `${selectedParentName} > ${selectedCategoryName}`
    : "Vui lòng chọn ngành hàng...";

  // 5. Hàm xử lý khi người dùng click chọn 1 danh mục con
  const handleSelectChild = (childId, parentId) => {
    form.setValue("parentCategory", parentId, { shouldValidate: true });
    form.setValue("category", childId, { shouldValidate: true });
    setIsCategoryOpen(false); // Chọn xong thì đóng menu
  };

  // 6. Trả về toàn bộ "Đồ nghề" cho UI sử dụng
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

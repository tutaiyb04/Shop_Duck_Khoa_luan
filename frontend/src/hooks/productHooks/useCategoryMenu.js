import { useState, useRef, useEffect } from "react";

export function useCategoryMenu(form, categories) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [hoveredParent, setHoveredParent] = useState(null);
  const categoryRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mainCategories = categories?.filter((cat) => !cat.parentId) || [];

  const getSubCategories = (parentId) => {
    return (
      categories?.filter((cat) => {
        const pId = cat.parentId?._id || cat.parentId;
        return pId === parentId;
      }) || []
    );
  };

  let selectedParentId = form.watch("parentCategory");
  const selectedCategoryId = form.watch("category");

  if (selectedCategoryId && !selectedParentId && categories) {
    const currentCat = categories.find((c) => c._id === selectedCategoryId);
    if (currentCat && currentCat.parentId) {
      selectedParentId = currentCat.parentId._id || currentCat.parentId;
    }
  }

  const selectedParentName = categories?.find(
    (c) => c._id === selectedParentId,
  )?.name;
  const selectedCategoryName = categories?.find(
    (c) => c._id === selectedCategoryId,
  )?.name;

  let displayCategory = "Vui lòng chọn danh mục...";
  if (selectedCategoryId) {
    if (selectedParentName && selectedCategoryName) {
      displayCategory = `${selectedParentName} > ${selectedCategoryName}`;
    } else if (selectedCategoryName) {
      displayCategory = selectedCategoryName;
    }
  }
  const handleSelectChild = (childId, parentId) => {
    form.setValue("parentCategory", parentId, { shouldValidate: true });
    form.setValue("category", childId, { shouldValidate: true });
    setIsCategoryOpen(false);
  };

  return {
    isCategoryOpen,
    hoveredParent,
    categoryRef,
    mainCategories,
    displayCategory,
    selectedParentId,
    selectedCategoryId,
    setHoveredParent,
    getSubCategories,
    setIsCategoryOpen,
    handleSelectChild,
  };
}

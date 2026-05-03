import { useState, useRef, useEffect } from "react";

export const idEquals = (a, b) => String(a ?? "") === String(b ?? "");

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
  const getSubCategories = (pId) => {
    return (
      categories?.filter((cat) =>
        idEquals(cat.parentId?._id || cat.parentId, pId),
      ) || []
    );
  };

  let selectedParentId = form.watch("parentCategory");
  const selectedCategoryId = form.watch("category");

  useEffect(() => {
    if (selectedCategoryId && !selectedParentId && categories?.length > 0) {
      const currentCat = categories.find((c) =>
        idEquals(c._id, selectedCategoryId),
      );
      if (currentCat && currentCat.parentId) {
        const pId = currentCat.parentId._id || currentCat.parentId;
        form.setValue("parentCategory", String(pId ?? ""));
      }
    }
  }, [selectedCategoryId, selectedParentId, categories, form]);

  const parentName = categories?.find((c) => idEquals(c._id, selectedParentId))
    ?.name;
  const childName = categories?.find((c) => idEquals(c._id, selectedCategoryId))
    ?.name;

  const displayCategory = childName
    ? parentName
      ? `${parentName} > ${childName}`
      : childName
    : "Vui lòng chọn ngành hàng...";

  const handleSelectChild = (childId, parentId) => {
    form.setValue("parentCategory", String(parentId ?? ""), {
      shouldValidate: true,
    });
    form.setValue("category", String(childId ?? ""), { shouldValidate: true });
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

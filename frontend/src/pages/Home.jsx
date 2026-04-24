import { useHomePage } from "@/hooks/home/useHomePage";
import HomeCategoryBar from "@/components/home/HomeCategoryBar";
import HomeDiscoveryView from "@/components/home/HomeDiscoveryView";
import HomeFilteredView from "@/components/home/HomeFilteredView";

function Home() {
  const {
    products,
    isLoading,
    activeCategory,
    loadingCats,
    parentCategories,
    categoryRows,
    isFiltered,
    vipProducts,
    newProducts,
    showDiscovery,
    sectionTitle,
    emptyMessage,
  } = useHomePage();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-amber-50/80 via-stone-50 to-amber-50/40 pb-12 sm:pb-20">
      <HomeCategoryBar
        activeCategory={activeCategory}
        loadingCats={loadingCats}
        parentCategories={parentCategories}
      />

      <div className="container mx-auto max-w-7xl px-2 sm:px-4 pt-4 sm:pt-6 space-y-10 sm:space-y-12">
        {!isFiltered && (
          <HomeDiscoveryView
            isLoading={isLoading}
            showDiscovery={showDiscovery}
            vipProducts={vipProducts}
            newProducts={newProducts}
            categoryRows={categoryRows}
            products={products}
            emptyMessage={emptyMessage}
          />
        )}

        {isFiltered && (
          <HomeFilteredView
            isLoading={isLoading}
            products={products}
            sectionTitle={sectionTitle}
            emptyMessage={emptyMessage}
          />
        )}
      </div>
    </div>
  );
}

export default Home;

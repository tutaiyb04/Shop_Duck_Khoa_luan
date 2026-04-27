import { useHomePage } from "@/hooks/home/useHomePage";
import HomeCategoryShowcase from "@/components/home/HomeCategoryShowcase";
import HomeDiscoveryView from "@/components/home/HomeDiscoveryView";
import HomeFilteredView from "@/components/home/HomeFilteredView";
import HomeVipBanner from "@/components/home/HomeVipBanner";

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
    newProductsPreview,
    showDiscovery,
    sectionTitle,
    emptyMessage,
  } = useHomePage();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-amber-50/80 via-stone-50 to-amber-50/40 pb-12 sm:pb-20">
      <div className="container mx-auto max-w-7xl px-2 sm:px-4 pt-4 sm:pt-6 space-y-10 sm:space-y-12">
        <HomeVipBanner />

        <HomeCategoryShowcase
          activeCategory={activeCategory}
          loadingCats={loadingCats}
          parentCategories={parentCategories}
        />

        {!isFiltered && (
          <HomeDiscoveryView
            isLoading={isLoading}
            showDiscovery={showDiscovery}
            vipProducts={vipProducts}
            newProductsPreview={newProductsPreview}
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

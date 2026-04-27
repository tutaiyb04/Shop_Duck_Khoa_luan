import HomeProductGrid from "./HomeProductGrid";
import LoadingBlock from "@/components/shared/LoadingBlock";
import EmptyState from "../shared/EmptyState";

export default function HomeFilteredView({
  isLoading,
  products,
  sectionTitle,
  emptyMessage,
}) {
  return (
    <>
      {isLoading && <LoadingBlock />}

      {!isLoading && products.length === 0 && (
        <EmptyState message={emptyMessage} />
      )}

      {!isLoading && products.length > 0 && (
        <section aria-label={sectionTitle}>
          <h2 className="mb-4 text-xl font-bold text-gray-900 sm:text-2xl pl-1 sm:pl-0">
            {sectionTitle}
          </h2>
          <HomeProductGrid products={products} />
        </section>
      )}
    </>
  );
}

import { cn } from "@/lib/utils";
import {
  CATALOG_PRICE_RANGES,
  VIETNAM_PROVINCES,
  PRODUCT_CONDITIONS,
} from "@/constants/catalogFilters";

const FilterSection = ({ title, children })  => {
  return (
    <div className="border-b-2 border-gray-200 pb-4 ">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-amber-900/80">
        {title}
      </h3>
      {children}
    </div>
  );
}

const FilterButton = ({ active, onClick, children, className }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border px-3 py-2 text-left text-sm !transition-colors",
        active
          ? "!border-amber-500 !bg-amber-50 font-semibold text-yellow-800"
          : "!border-gray-200 !bg-white text-gray-700 hover:!border-amber-300 hover:!bg-amber-50/60",
        className,
      )}
    >
      {children}
    </button>
  );
}

export default function ProductsCatalogSidebar({
  parentCategories,
  loadingCats,
  filters,
  activePriceRangeId,
  setParams,
}) {
  const { category, province, condition } = filters;

  return (
    <div className="space-y-5">
      <FilterSection title="Danh mục">
        {loadingCats ? (
          <p className="text-sm text-muted-foreground">Đang tải…</p>
        ) : (
          <div className="flex max-h-64 flex-col gap-1.5 overflow-y-auto pr-1">
            <FilterButton
              active={!category}
              onClick={() => setParams({ category: "" })}
            >
              Tất cả danh mục
            </FilterButton>
            {parentCategories.map((c) => (
              <FilterButton
                key={c._id}
                active={String(c._id) === category}
                onClick={() => setParams({ category: String(c._id) })}
              >
                {c.name}
              </FilterButton>
            ))}
          </div>
        )}
      </FilterSection>

      <FilterSection title="Giá">
        <div className="flex flex-col gap-1.5">
          {CATALOG_PRICE_RANGES.map((r) => (
            <FilterButton
              key={r.id}
              active={
                r.id === "all"
                  ? activePriceRangeId === "all"
                  : activePriceRangeId === r.id
              }
              onClick={() =>
                setParams({ minPrice: r.min || "", maxPrice: r.max || "" })
              }
            >
              {r.label}
            </FilterButton>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Nơi bán">
        <div className="flex max-h-52 flex-col gap-1.5 overflow-y-auto pr-1">
          <FilterButton
            active={!province}
            onClick={() => setParams({ province: "" })}
          >
            Toàn quốc
          </FilterButton>
          {VIETNAM_PROVINCES.map((p) => (
            <FilterButton
              key={p}
              active={province === p}
              onClick={() => setParams({ province: p })}
            >
              {p}
            </FilterButton>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Tình trạng">
        <div className="flex flex-col gap-1.5">
          <FilterButton
            active={!condition}
            onClick={() => setParams({ condition: "" })}
          >
            Tất cả
          </FilterButton>
          {PRODUCT_CONDITIONS.map((cnd) => (
            <FilterButton
              key={cnd}
              active={condition === cnd}
              onClick={() => setParams({ condition: cnd })}
            >
              {cnd}
            </FilterButton>
          ))}
        </div>
      </FilterSection>

      <button
        type="button"
        onClick={() =>
          setParams({
            category: "",
            minPrice: "",
            maxPrice: "",
            province: "",
            condition: "",
            vip: "",
          })
        }
        className="w-full rounded-lg border border-dashed border-amber-300 bg-amber-50/50 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100/80"
      >
        Xóa bộ lọc
      </button>
    </div>
  );
}

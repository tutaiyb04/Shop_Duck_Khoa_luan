import { NavLink } from "react-router-dom";
import HomeProductGrid from "./HomeProductGrid";

export default function HomeProductSection({
  id,
  title,
  icon,
  seeAllTo = "/",
  products,
  ariaLabelledBy,
}) {
  return (
    <section aria-labelledby={ariaLabelledBy || id}>
      <div className="mb-4 flex items-end justify-between gap-2 pl-1 sm:pl-0">
        <h2
          id={ariaLabelledBy || id}
          className="flex items-center gap-2 text-xl font-bold text-gray-900 sm:text-2xl"
        >
          {icon}
          {title}
        </h2>
        <NavLink
          to={seeAllTo}
          className="text-sm font-medium !text-amber-700 hover:!underline"
        >
          Xem tất cả
        </NavLink>
      </div>
      <HomeProductGrid products={products} />
    </section>
  );
}

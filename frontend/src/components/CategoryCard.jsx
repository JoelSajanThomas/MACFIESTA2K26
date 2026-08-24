import { Link } from "react-router-dom";
import CategoryIcon from "./CategoryIcon";
import FestIcon from "./icons/FestIcon";
import { SUPERHERO_THEME } from "../theme/superheroTheme";

function displayLabel(category) {
  const key = String(category?.slug || category?.id || "").toLowerCase();
  return SUPERHERO_THEME.categoryDisplay[key] || category?.label || category?.name || "Events";
}

export default function CategoryCard({ category }) {
  const count = category.count ?? category.event_count;
  return (
    <div className="category-card comic-panel comic-panel--blue mf-division-card" style={{ "--cat-color": category.color }}>
      <div className="category-icon-wrap" aria-hidden="true">
        {category.icon ? (
          <FestIcon name={category.icon} size={24} className="category-fest-icon" />
        ) : (
          <CategoryIcon id={category.id || category.slug} />
        )}
      </div>
      <h3>{displayLabel(category)}</h3>
      {category.label && displayLabel(category) !== category.label && (
        <p className="category-canonical" style={{ color: "var(--muted)", fontSize: "0.8rem", margin: "0 0 0.5rem" }}>
          {category.label}
        </p>
      )}
      {typeof count === "number" && (
        <p className="mf-division-sub">{count} missions</p>
      )}
      <Link to={`/events?category=${category.slug}`} className="category-link">
        View Events →
      </Link>
    </div>
  );
}

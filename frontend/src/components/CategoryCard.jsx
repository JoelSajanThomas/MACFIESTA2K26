import { Link } from "react-router-dom";
import CategoryIcon from "./CategoryIcon";
import FestIcon from "./icons/FestIcon";

export default function CategoryCard({ category }) {
  return (
    <div className="category-card" style={{ "--cat-color": category.color }}>
      <div className="category-icon-wrap">
        {category.icon ? (
          <FestIcon name={category.icon} size={24} className="category-fest-icon" />
        ) : (
          <CategoryIcon id={category.id || category.slug} />
        )}
      </div>
      <h3>{category.label}</h3>
      <Link to={`/events?category=${category.slug}`} className="category-link">
        Explore →
      </Link>
    </div>
  );
}

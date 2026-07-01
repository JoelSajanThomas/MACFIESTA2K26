import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import CategoryIcon from "./CategoryIcon";

export default function CategoryCard({ category, index = 0 }) {
  return (
    <motion.div
      className="category-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      whileHover={{ y: -8, transition: { duration: 0.25 } }}
      style={{ "--cat-color": category.color }}
    >
      <div className="category-icon-wrap">
        <CategoryIcon id={category.id} />
      </div>
      <h3>{category.label}</h3>
      <Link to={`/events?category=${category.slug}`} className="category-link">
        Explore →
      </Link>
    </motion.div>
  );
}

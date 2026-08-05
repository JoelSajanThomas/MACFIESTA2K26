export default function SkeletonGrid({ count = 3, className = "skeleton-grid" }) {
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-block skeleton-image" />
          <div className="skeleton-block skeleton-line wide" />
          <div className="skeleton-block skeleton-line" />
        </div>
      ))}
    </div>
  );
}

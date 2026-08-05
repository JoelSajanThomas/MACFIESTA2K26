export default function AdminTableToolbar({ search, onSearchChange, searchPlaceholder, children }) {
  return (
    <div className="admin-toolbar">
      <div className="admin-search-wrap">
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder || "Search…"}
          className="admin-search"
        />
      </div>
      {children && <div className="admin-toolbar-filters">{children}</div>}
    </div>
  );
}

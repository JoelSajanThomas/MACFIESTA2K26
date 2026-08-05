import { Navigate } from "react-router-dom";

/** Legacy route — coordinator dashboard lives at /admin/insights */
export default function AdminDashboard() {
  return <Navigate to="/admin/insights" replace />;
}

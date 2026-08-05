import { createContext, useContext } from "react";

export const AdminStaffContext = createContext(null);

export function useAdminStaff() {
  return useContext(AdminStaffContext);
}

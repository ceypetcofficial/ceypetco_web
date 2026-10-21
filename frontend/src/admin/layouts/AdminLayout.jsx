import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { canAccessAdminPath } from "../roleAccess";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  if (!canAccessAdminPath(user?.role, location.pathname)) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:ml-[270px] min-h-screen flex flex-col">
        <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

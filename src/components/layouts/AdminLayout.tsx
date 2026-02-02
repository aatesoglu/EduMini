import React from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  LogOut,
  BookOpen,
  Mail,
  Settings,
} from "lucide-react";

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    navigate("/");
  };

  // Check if the current route is an admin route
  const isAdminRoute = location.pathname.startsWith("/admin");

  // If not an admin route, redirect to admin dashboard
  React.useEffect(() => {
    if (!isAdminRoute) {
      navigate("/admin", { replace: true });
    }
  }, [isAdminRoute, navigate]);

  // Navigation items
  const navItems = [
    { to: "/admin", icon: <LayoutDashboard size={20} />, label: "Panel" },
    { to: "/admin/courses", icon: <BookOpen size={20} />, label: "Kurslar" },
    { to: "/admin/users", icon: <Users size={20} />, label: "Kullanıcılar" },
    {
      to: "/admin/announcements",
      icon: <Megaphone size={20} />,
      label: "Duyurular",
    },
    { to: "/admin/messages", icon: <Mail size={20} />, label: "Mesajlar" },
    {
      to: "/admin/settings",
      icon: <Settings size={20} />,
      label: "Site Ayarları",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col h-full">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">EduMini Admin</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 p-3 rounded transition ${
                  isActive ? "bg-blue-600 text-white" : "hover:bg-gray-800"
                }`
              }
              end={item.to === "/admin"}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-3 p-3 w-full rounded hover:bg-red-600 transition text-red-100"
          >
            <LogOut size={20} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Menu,
  Search,
  Bell,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";

const pageTitles = {
  "/admin": "Overview",
  "/admin/news": "News Management",
  "/admin/notices": "Notices Management",
  "/admin/projects": "Projects Management",
  "/admin/tenders": "Tenders Management",
  "/admin/careers": "Careers Management",
  "/admin/publications": "Publications Management",
  "/admin/services-page": "Services Management",
  "/admin/services-page/divisions": "Division Pages",
  "/admin/products-page": "Products Management",
  "/admin/fuel-prices": "Fuel Prices",
  "/admin/price-audit": "Price Change History",
  "/admin/fuel-stations": "Fuel Stations",
  "/admin/regional-offices": "Regional Offices",
  "/admin/messages": "Contact Us Details",
  "/admin/media": "Media Library",
  "/admin/users": "User Management",
  "/admin/recycle-bin": "Recycle Bin",
  "/admin/page-revisions": "Page Version History",
  "/admin/popup-notices": "Popup Notice Management",
  "/admin/settings": "Site Settings",
  "/admin/home": "Home Page Services",
  "/admin/about": "About Page",
  "/admin/history": "History Page",
  "/admin/pages": "Website Page Editor",
};

const AdminHeader = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const dropdownRef = useRef(null);

  const pageTitle =
    pageTitles[location.pathname] ||
    location.pathname
      .split("/")
      .pop()
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden text-slate-500 hover:text-[#092f3b] p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-[#092f3b] font-extrabold text-lg font-['Manrope'] hidden sm:block">
          {pageTitle}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-[#092f3b] placeholder-slate-400 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
          />
        </div>

        <button
          onClick={() => setShowSearch(!showSearch)}
          className="md:hidden text-slate-500 hover:text-[#092f3b] p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button className="relative text-slate-500 hover:text-[#092f3b] p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full" />
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 bg-[#062e3b] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-[#092f3b] leading-tight">
                {user?.name || "Administrator"}
              </p>
              <p className="text-[11px] text-[#66767d] capitalize">
                {user?.role?.replace("_", " ") || "Admin"}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/50 py-2 z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-[#092f3b]">
                  {user?.name || "Administrator"}
                </p>
                <p className="text-xs text-[#66767d] mt-0.5">
                  {user?.email || ""}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

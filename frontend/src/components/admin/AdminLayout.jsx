import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaChartLine,
  FaBookOpen,
  FaUserGraduate,
  FaMoneyBillWave,
  FaCog,
  FaSyncAlt,
  FaExternalLinkAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaShieldAlt,
  FaDatabase,
  FaAward,
  FaNewspaper,
} from "react-icons/fa";
const logo = "/logo.png";
import api from "../../lib/api";

export default function AdminLayout({ children, title, subtitle, onSyncComplete }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState(null);

  const admin = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    const isSeoEditor = admin.role === "seo_admin";
    localStorage.clear();
    navigate(isSeoEditor ? "/post/seo" : "/login");
  };

  const handleSyncDatabase = async () => {
    try {
      setIsSyncing(true);
      setSyncNotice("Syncing...");
      const response = await api.post("/api/admin/sync-database", {}, { timeout: 180000 });
      const message =
        response.data?.message ||
        `Database synchronized! Found ${response.data?.count || 17} courses.`;
      setSyncNotice("Synced ✅");
      if (onSyncComplete) onSyncComplete(response.data);
    } catch (err) {
      console.error("Admin sync error:", err);
      setSyncNotice("Sync Failed ❌");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncNotice(null), 4000);
    }
  };

  // Core admin sections
  const navTabs = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <FaChartLine className="inline mr-2" />,
    },
    {
      name: "Students",
      path: "/admin/students",
      icon: <FaUserGraduate className="inline mr-2" />,
    },
    {
      name: "Courses & Video Studio",
      path: "/admin/courses",
      icon: <FaBookOpen className="inline mr-2" />,
    },
    {
      name: "Certificates",
      path: "/admin/certificates",
      icon: <FaAward className="inline mr-2" />,
    },
    {
      name: "Blogs",
      path: "/admin/blogs",
      icon: <FaNewspaper className="inline mr-2" />,
    },
    {
      name: "Payments",
      path: "/admin/payments",
      icon: <FaMoneyBillWave className="inline mr-2" />,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: <FaCog className="inline mr-2" />,
    },
  ];
  const isSeoEditor = admin.role === "seo_admin";
  const visibleNavTabs = isSeoEditor
    ? navTabs.filter((tab) => tab.path === "/admin/blogs").map((tab) => ({ ...tab, path: "/post/seo" }))
    : navTabs;

  return (
    <div className="bg-[#f8fafc] min-h-screen text-slate-800 flex flex-col font-sans">
      {/* ============================================================ */}
      {/* VIKSHIT BHARAT / DIZITAL ADDA TOP BRAND HEADER (Exact Landing Style) */}
      {/* ============================================================ */}
      <header className="bg-[#0B1220] text-white border-b-4 border-[#D4A017] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* LOGO & BRAND TITLE */}
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="h-14 rounded-lg border border-slate-700 overflow-hidden bg-white px-2 py-1 shrink-0 shadow-md flex items-center justify-center">
              <img src={logo} alt="CS Factory" className="h-12 w-auto object-contain" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                CS FACTORY LMS
              </h1>
              <p className="text-xs sm:text-sm font-bold text-[#D4A017] tracking-wider uppercase mt-0.5">
                The Guidance Sanctuary • Admin Console
              </p>
            </div>
          </div>

          {/* ACTION BUTTONS & ADMIN PROFILE */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5">
            {/* 1-Click Database Sync */}
            {!isSeoEditor && <button
              onClick={handleSyncDatabase}
              disabled={isSyncing}
              className={
                "bg-[#1E293B] border border-[#D4A017] py-2 px-3.5 rounded-lg text-xs font-bold text-white hover:bg-[#7C2D12] hover:border-amber-400 transition shadow-sm flex items-center gap-2 cursor-pointer " +
                (isSyncing ? "opacity-75 cursor-not-allowed animate-pulse" : "")
              }
            >
              <FaSyncAlt className={isSyncing ? "animate-spin" : ""} />
              <span>{isSyncing ? "Syncing..." : syncNotice || "Sync Live DB 🔄"}</span>
            </button>}

            {/* Visit Public Site */}
            <Link
              to="/"
              target="_blank"
              className="bg-[#1E293B] border border-[#D4A017] py-2 px-3.5 rounded-lg text-xs font-bold text-orange-200 hover:bg-[#7C2D12] hover:text-white transition shadow-sm flex items-center gap-1.5"
            >
              <span>Visit Public Site</span>
              <FaExternalLinkAlt className="text-[10px]" />
            </Link>

            {/* Admin User Badge */}
            <div className="bg-[#1E293B] border border-slate-700 py-1.5 px-3 rounded-lg flex items-center gap-2 text-xs">
              <div className="w-6 h-6 rounded-full bg-[#D4A017] text-[#0B1220] flex items-center justify-center font-bold text-xs">
                A
              </div>
              <div className="hidden sm:block text-left">
                <div className="font-bold text-white text-[11px] leading-tight">
                  {admin.name || "Administrator"}
                </div>
                <div className="text-[10px] text-[#D4A017] uppercase tracking-wider font-semibold">
                  {isSeoEditor ? "SEO Editor" : "Super Admin"}
                </div>
              </div>
            </div>

            {/* Direct Logout */}
            <button
              onClick={handleLogout}
              className="bg-red-950/60 border border-red-500/50 hover:bg-red-700 text-red-100 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-sm"
              title="Logout from Admin"
            >
              <FaSignOutAlt />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 5-TAB STICKY NAVIGATION BAR (Exact Landing Page Grid Styling) */}
      {/* ============================================================ */}
      <nav className="bg-[#0B1220] sticky top-0 z-40 border-b border-orange-400/20 shadow-md">
        <div className="max-w-7xl mx-auto">
          {/* DESKTOP 7-COLUMN GRID */}
          <div className={`hidden md:grid ${isSeoEditor ? "grid-cols-1" : "grid-cols-7"} text-center`}>
            {visibleNavTabs.map((tab) => {
              const isActive =
                tab.path === "/admin"
                  ? location.pathname === "/admin"
                  : location.pathname.startsWith(tab.path);

              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={
                    "py-3.5 border-r border-orange-400/20 text-sm sm:text-base font-bold transition block " +
                    (isActive
                      ? "bg-[#7C2D12] text-white border-b-4 border-[#D4A017] shadow-inner"
                      : "text-orange-200 hover:bg-[#7C2D12]/70 hover:text-white")
                  }
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </Link>
              );
            })}
          </div>

          {/* MOBILE NAVBAR TOGGLE */}
          <div className="md:hidden flex items-center justify-between px-4 py-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
              Admin Menu ({visibleNavTabs.find((t) => (t.path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(t.path)))?.name || "Portal"})
            </span>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-white p-2 border border-slate-700 rounded-lg"
            >
              {mobileOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>

          {/* MOBILE DROPDOWN */}
          {mobileOpen && (
            <div className="md:hidden bg-[#0B1220] border-t border-orange-400/20 flex flex-col">
              {visibleNavTabs.map((tab) => {
                const isActive =
                  tab.path === "/admin"
                    ? location.pathname === "/admin"
                    : location.pathname.startsWith(tab.path);

                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    onClick={() => setMobileOpen(false)}
                    className={
                      "py-3 px-6 text-sm font-bold border-b border-white/5 transition flex items-center gap-2 " +
                      (isActive
                        ? "bg-[#7C2D12] text-white border-l-4 border-[#D4A017]"
                        : "text-orange-200 hover:bg-[#7C2D12]/60 hover:text-white")
                    }
                  >
                    {tab.icon}
                    <span>{tab.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* ============================================================ */}
      {/* PAGE HEADER STRIP (Like Landing Page Section Headers) */}
      {/* ============================================================ */}
      {(title || subtitle) && (
        <div className="bg-white border-b border-slate-200 py-6 px-4 sm:px-6 shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              {title && (
                <h2 className="text-2xl sm:text-3xl font-black text-[#0B1220] tracking-tight">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                  {subtitle}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live DB Connected
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MAIN BODY CONTENT */}
      {/* ============================================================ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {children}
      </main>

      {/* ============================================================ */}
      {/* CLASSICAL FOOTER (Exact Landing Page Style) */}
      {/* ============================================================ */}
      <footer className="bg-[#0B1220] text-white border-t-4 border-[#D4A017] py-6 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 text-center sm:text-left">
          <div>
            <span className="font-bold text-white">DIZITAL ADDA LMS PORTAL</span> • Authoritative Database Superadmin System
          </div>
          <div className="text-[#D4A017] font-semibold">
            Associated by Timeless Foundation • Vikshit Bharat 2047
          </div>
        </div>
      </footer>
    </div>
  );
}

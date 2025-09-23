import { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  TruckIcon,
  UserGroupIcon,
  DocumentTextIcon,
  DocumentCurrencyDollarIcon,
  Bars3Icon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

import Cars from "./pages/Cars.jsx";
import Customers from "./pages/Customers.jsx";
import Rentals from "./pages/Rentals.jsx";
import Invoices from "./pages/Invoices.jsx";
import MaintenancePage from "./pages/Maintenance.jsx";
import CompliancePage from "./pages/Compliance.jsx";
import UsersPage from "./pages/Users.jsx";
import SettingsPage from "./pages/Settings.jsx";
import Login from "./pages/Login.jsx";
import HelpNSupport from "./pages/HelpNSupport.jsx";

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

// Center text plugin for donut charts (color is configurable via opts.color)
const centerTextPlugin = {
  id: "centerText",
  afterDatasetDraw(chart, args, opts) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    if (!meta || !meta.data || !meta.data[0]) return;
    const { x, y } = meta.data[0];
    const total = (chart.data?.datasets?.[0]?.data || []).reduce(
      (a, b) => a + (Number(b) || 0),
      0
    );
    ctx.save();
    ctx.font =
      "600 16px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
    ctx.fillStyle = opts?.color || "#111827"; // configurable center text color
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(total), x, y);
    ctx.restore();
  },
};

// Chart UI theme helpers
const palette = {
  indigo: "#0466c8",
  emerald: "#0353a4",
  amber: "#023e7d",
  rose: "#002855",
  cyan: "#001845",
};
const chartTheme = {
  grid: { light: "#F3F4F6", lighter: "#F9FAFB" },
  ticks: { primary: "#0F172A", secondary: "#475569" },
  tooltipBg: "#0F172A",
  tooltipFg: "#FFFFFF",
  border: "#FFFFFF",
};

function getAuth() {
  try {
    const raw = localStorage.getItem("auth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setAuth(data) {
  localStorage.setItem("auth", JSON.stringify(data));
}

function Protected({ isAuthed, children }) {
  const loc = useLocation();
  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  return children;
}

// APP CONTENT
function AppContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [auth, setAuthState] = useState(getAuth());
  const token = auth?.token;
  const user = auth?.user;
  const [stats, setStats] = useState({
    vehicles: 0,
    customers: 0,
    rentals_active: 0,
    invoices: 0,
    revenue: 0,
    insurance_expiring: 0,
    docs_expiring: 0,
    maintenance_due: 0,
    users_active: 0,
  });

  const touchStartX = useRef(null);
  const handleTouchStart = (e) => {
    if (!mobileMenuOpen) return;
    if (e.touches && e.touches.length > 0) {
      touchStartX.current = e.touches[0].clientX;
    }
  };
  const handleTouchEnd = (e) => {
    if (!mobileMenuOpen) return;
    if (touchStartX.current === null) return;
    const endX = (e.changedTouches && e.changedTouches[0]?.clientX) || 0;
    const deltaX = touchStartX.current - endX; // positive if swiping left
    if (deltaX > 50) {
      setMobileMenuOpen(false);
    }
    touchStartX.current = null;
  };

  // Patch fetch to include Authorization automatically
  useEffect(() => {
    const orig = window.fetch;
    window.fetch = async (input, init = {}) => {
      try {
        const url = typeof input === "string" ? input : input?.url || "";
        const needsAuth = token && url.startsWith("http://localhost:8000");
        const headers = new Headers(init.headers || {});
        if (needsAuth) headers.set("Authorization", `Bearer ${token}`);
        return await orig(input, { ...init, headers });
        // eslint-disable-next-line no-unused-vars
      } catch (e) {
        return orig(input, init);
      }
    };
    return () => {
      window.fetch = orig;
    };
  }, [token]);

  // Use React Router's useLocation hook
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleLogin = (data) => {
    setAuth(data);
    setAuthState(data);
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/auth/logout", { method: "POST" });
    } catch {
      /* empty */
    }
    setAuthState(null);
    localStorage.removeItem("auth");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:8000/stats");
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("/stats error", err);
      }
    };
    fetchStats();
  }, []);

  const navItems = [
    { path: "/", label: "Home", icon: HomeIcon },
    { path: "/cars", label: "Vehicles", icon: TruckIcon },
    { path: "/customers", label: "Customers", icon: UserGroupIcon },
    { path: "/rentals", label: "Rentals", icon: DocumentTextIcon },
    { path: "/invoices", label: "Invoices", icon: DocumentCurrencyDollarIcon },
    { path: "/compliance", label: "Compliance", icon: DocumentTextIcon },
    { path: "/maintenance", label: "Maintenance", icon: DocumentTextIcon },
    ...(user?.role === "admin"
      ? [{ path: "/admin-users", label: "Users", icon: UserGroupIcon }]
      : []),
  ];

  // eslint-disable-next-line no-unused-vars
  const currentNavItem =
    navItems.find((item) => item.path === location.pathname) || navItems[0];

  // eslint-disable-next-line no-unused-vars
  const cardColors = [
    { bg: "bg-gradient-to-br from-white to-gray-100", icon: "text-gray-800" },
    { bg: "bg-gradient-to-br from-white to-gray-100", icon: "text-gray-800" },
    { bg: "bg-gradient-to-br from-white to-gray-100", icon: "text-gray-800" },
    { bg: "bg-gradient-to-br from-white to-gray-100", icon: "text-gray-800" },
  ];

  // Derived insights for dashboard
  const totalExpiring =
    (stats.insurance_expiring ?? 0) +
    (stats.docs_expiring ?? 0) +
    (stats.maintenance_due ?? 0);
  const utilization = stats.vehicles
    ? stats.rentals_active / stats.vehicles
    : 0;
  const utilizationPct = Math.round(utilization * 100);
  const avgRevenue = stats.invoices ? stats.revenue / stats.invoices : 0;
  const estAvailable = Math.max(
    (stats.vehicles ?? 0) - (stats.rentals_active ?? 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 flex poppins">
      {/* Mobile menu toggle (authed only, only when menu is closed) */}
      {user && !mobileMenuOpen && (
        <button
          className="md:hidden fixed top-4 left-4 z-50 rounded-md p-2 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      )}

      {/* Mobile overlay */}
      {user && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      {user && (
        <aside
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`fixed inset-y-0 left-0 z-40 w-72 bg-gray-900/80 backdrop-blur-xl border-r border-white/10 text-white transform transition-transform duration-300 md:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-label="Sidebar"
        >
          {/* Header / Brand */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="leading-tight">
                <div className="text-2xl font-semibold tracking-tight">
                  Dashboard
                </div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="mt-3 px-2 pb-3 overflow-y-auto h-[calc(100%-8rem)]">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ring-1 ${
                    active
                      ? "bg-white/10 ring-white/15 text-white shadow-inner"
                      : "ring-transparent text-white/80 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all ${
                      active
                        ? "bg-gradient-to-b from-indigo-400 to-cyan-400 opacity-100"
                        : "opacity-0 group-hover:opacity-60 bg-white/30"
                    }`}
                  />
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="font-medium tracking-tight">
                    {item.label}
                  </span>
                </Link>
              );
            })}

            <div className="mt-4 border-t border-white/10 pt-3 space-y-1">
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 ring-1 ring-transparent hover:ring-white/10"
              >
                <Cog6ToothIcon className="h-5 w-5" />
                <span className="font-medium">Settings</span>
              </Link>
              <Link
                to="/help"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 ring-1 ring-transparent hover:ring-white/10"
              >
                <QuestionMarkCircleIcon className="h-5 w-5" />
                <span className="font-medium">Help & Support</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 ring-1 ring-transparent hover:ring-white/10"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </nav>

          {/* User / Footer */}
          <div className="absolute bottom-0 inset-x-0 p-3 border-t border-white/10 bg-gradient-to-t from-black/20 to-transparent">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 ring-1 ring-white/20" />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">
                  {user?.name || "User"}
                </div>
                <div className="truncate text-xs text-white/60">
                  {user?.email || ""}
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main content */}
      <main className={`flex-1 w-full ${user ? "md:ml-72" : ""}`}>
        <div className="container mx-auto px-4 py-10">
          <AnimatePresence>
            <Routes>
              <Route
                path="/cars"
                element={
                  <Protected isAuthed={!!user}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Cars />
                    </motion.div>
                  </Protected>
                }
              />
              <Route
                path="/customers"
                element={
                  <Protected isAuthed={!!user}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Customers />
                    </motion.div>
                  </Protected>
                }
              />
              <Route
                path="/rentals"
                element={
                  <Protected isAuthed={!!user}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Rentals />
                    </motion.div>
                  </Protected>
                }
              />
              <Route
                path="/invoices"
                element={
                  <Protected isAuthed={!!user}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Invoices />
                    </motion.div>
                  </Protected>
                }
              />
              <Route
                path="/settings"
                element={
                  <Protected isAuthed={!!user}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SettingsPage />
                    </motion.div>
                  </Protected>
                }
              />
              <Route
                path="/help"
                element={
                  <Protected isAuthed={!!user}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <HelpNSupport />
                    </motion.div>
                  </Protected>
                }
              />
              <Route
                path="/compliance"
                element={
                  <Protected isAuthed={!!user}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CompliancePage />
                    </motion.div>
                  </Protected>
                }
              />
              <Route
                path="/maintenance"
                element={
                  <Protected isAuthed={!!user}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MaintenancePage />
                    </motion.div>
                  </Protected>
                }
              />
              <Route
                path="/admin-users"
                element={
                  <Protected isAuthed={!!user}>
                    {user?.role === "admin" ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <UsersPage />
                      </motion.div>
                    ) : (
                      <Login onLogin={handleLogin} />
                    )}
                  </Protected>
                }
              />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              {/* HOME PAGE */}
              <Route
                path="/"
                element={
                  <Protected isAuthed={!!user}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="flex flex-col items-center justify-center text-gray-800 min-h-[80vh] px-10"
                    >
                      <div className="text-center justify-center mb-20 px-4 mt-10">
                        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-gray-800 to-gray-500 bg-clip-text text-transparent">
                          Welcome to <br /> Rental Dashboard
                        </h1>

                        {/* Stats section */}
                        <div className="flex md:flex-row flex-col justify-center gap-12 text-gray-800">
                          <div className="flex flex-col items-center">
                            <span className="text-3xl font-extrabold text-[#013a63]">
                              {stats.vehicles}
                            </span>
                            <span className="uppercase text-sm tracking-wider">
                              Vehicles
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-3xl font-extrabold text-[#013a63]">
                              {stats.customers}
                            </span>
                            <span className="uppercase text-sm tracking-wider">
                              Customers
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-3xl font-extrabold text-[#013a63]">
                              {stats.rentals_active}
                            </span>
                            <span className="uppercase text-sm tracking-wider">
                              Rentals
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-3xl font-extrabold text-[#013a63]">
                              {stats.invoices}
                            </span>
                            <span className="uppercase text-sm tracking-wider">
                              Invoices
                            </span>
                          </div>
                        </div>
                        <div className="mt-10 flex justify-center">
                          <div className="rounded-full px-4 py-2 text-sm bg-gray-200 text-gray-800">
                            Total Revenue:{" "}
                            <span className="font-semibold">
                              LKR{" "}
                              {stats.revenue?.toLocaleString?.() ??
                                stats.revenue}
                            </span>
                          </div>
                        </div>
                        {/* <div className="mt-8 grid gap-6 md:grid-cols-3">
                          <div className="p-4 rounded-xl bg-white border border-gray-200">
                            <div className="text-sm text-gray-500">
                              Insurance expiring (30 days)
                            </div>
                            <div className="text-2xl font-bold text-[#013a63]">
                              {stats.insurance_expiring ?? 0}
                            </div>
                          </div>
                          <div className="p-4 rounded-xl bg-white border border-gray-200">
                            <div className="text-sm text-gray-500">
                              Legal docs expiring (30 days)
                            </div>
                            <div className="text-2xl font-bold text-[#013a63]">
                              {stats.docs_expiring ?? 0}
                            </div>
                          </div>
                          <div className="p-4 rounded-xl bg-white border border-gray-200">
                            <div className="text-sm text-gray-500">
                              Maintenance due (30 days)
                            </div>
                            <div className="text-2xl font-bold text-[#013a63]">
                              {stats.maintenance_due ?? 0}
                            </div>
                          </div>
                        </div> */}
                        <div className="mt-3 flex justify-center">
                          <div className="rounded-full px-4 py-2 text-sm bg-gray-200 text-gray-800">
                            Active Users:{" "}
                            <span className="font-semibold">
                              {stats.users_active ?? 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="max-w-[800px]">
                        {/* Charts Section */}
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Pie Chart: Overview */}
                          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <h2 className="text-lg font-semibold tracking-tight mb-3 text-gray-900">
                              System Overview
                            </h2>
                            <div className="h-64">
                              <Pie
                                data={{
                                  labels: [
                                    "Vehicles",
                                    "Customers",
                                    "Active Rentals",
                                    "Invoices",
                                  ],
                                  datasets: [
                                    {
                                      data: [
                                        stats.vehicles ?? 0,
                                        stats.customers ?? 0,
                                        stats.rentals_active ?? 0,
                                        stats.invoices ?? 0,
                                      ],
                                      backgroundColor: [
                                        palette.indigo,
                                        palette.emerald,
                                        palette.amber,
                                        palette.cyan,
                                      ],
                                      borderColor: chartTheme.border,
                                      borderWidth: 6,
                                      borderRadius: 6,
                                      hoverOffset: 10,
                                    },
                                  ],
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  cutout: "72%",
                                  layout: { padding: 12 },
                                  plugins: {
                                    legend: {
                                      position: "bottom",
                                      align: "center",
                                      labels: {
                                        color: chartTheme.ticks.primary,
                                        boxWidth: 12,
                                        boxHeight: 12,
                                        usePointStyle: true,
                                        padding: 16,
                                      },
                                    },
                                    tooltip: {
                                      backgroundColor: chartTheme.tooltipBg,
                                      titleColor: chartTheme.tooltipFg,
                                      bodyColor: chartTheme.tooltipFg,
                                      borderColor: "#E5E7EB",
                                      borderWidth: 1,
                                      cornerRadius: 10,
                                    },
                                  },
                                  animation: {
                                    duration: 650,
                                    easing: "easeOutQuart",
                                  },
                                }}
                                plugins={[{ ...centerTextPlugin, color: palette.indigo }]}
                              />
                            </div>
                          </div>

                          {/* Bar Chart: Expiring Soon */}
                          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <h2 className="text-lg font-semibold tracking-tight mb-3 text-gray-900">
                              Expiring in 30 Days
                            </h2>
                            <div className="h-64">
                              <Bar
                                data={{
                                  labels: [
                                    "Insurance",
                                    "Legal Docs",
                                    "Maintenance",
                                  ],
                                  datasets: [
                                    {
                                      label: "Count",
                                      data: [
                                        stats.insurance_expiring ?? 0,
                                        stats.docs_expiring ?? 0,
                                        stats.maintenance_due ?? 0,
                                      ],
                                      backgroundColor: [
                                        palette.emerald,
                                        palette.amber,
                                        palette.rose,
                                      ],
                                      borderColor: [
                                        palette.emerald,
                                        palette.amber,
                                        palette.rose,
                                      ],
                                      borderWidth: 2,
                                      borderRadius: 10,
                                      borderSkipped: false,
                                      barThickness: 36,
                                      maxBarThickness: 44,
                                    },
                                  ],
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  interaction: {
                                    intersect: false,
                                    mode: "index",
                                  },
                                  plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                      backgroundColor: chartTheme.tooltipBg,
                                      titleColor: chartTheme.tooltipFg,
                                      bodyColor: chartTheme.tooltipFg,
                                      borderColor: "#E5E7EB",
                                      borderWidth: 1,
                                      cornerRadius: 10,
                                    },
                                  },
                                  scales: {
                                    x: {
                                      grid: { display: false },
                                      ticks: {
                                        color: chartTheme.ticks.primary,
                                        font: { weight: "600" },
                                        padding: 8,
                                      },
                                    },
                                    y: {
                                      beginAtZero: true,
                                      grid: { color: chartTheme.grid.lighter },
                                      ticks: {
                                        color: chartTheme.ticks.secondary,
                                        precision: 0,
                                        padding: 8,
                                      },
                                    },
                                  },
                                  animation: {
                                    duration: 650,
                                    easing: "easeOutQuart",
                                  },
                                }}
                              />
                            </div>
                          </div>

                          {/* Pie Chart: Fleet Utilization */}
                          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <h2 className="text-lg font-semibold tracking-tight mb-3 text-gray-900">
                              Fleet Utilization
                            </h2>
                            <div className="h-64">
                              <Pie
                                data={{
                                  labels: ["Active", "Available"],
                                  datasets: [
                                    {
                                      data: [
                                        stats.rentals_active ?? 0,
                                        estAvailable,
                                      ],
                                      backgroundColor: [
                                        palette.indigo,
                                        palette.emerald,
                                      ],
                                      borderColor: chartTheme.border,
                                      borderWidth: 6,
                                      borderRadius: 6,
                                      hoverOffset: 10,
                                    },
                                  ],
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  cutout: "72%",
                                  layout: { padding: 12 },
                                  plugins: {
                                    legend: {
                                      position: "bottom",
                                      labels: {
                                        color: chartTheme.ticks.primary,
                                        boxWidth: 12,
                                        boxHeight: 12,
                                        usePointStyle: true,
                                        padding: 16,
                                      },
                                    },
                                    tooltip: {
                                      backgroundColor: chartTheme.tooltipBg,
                                      titleColor: chartTheme.tooltipFg,
                                      bodyColor: chartTheme.tooltipFg,
                                      borderColor: "#E5E7EB",
                                      borderWidth: 1,
                                      cornerRadius: 10,
                                    },
                                  },
                                  animation: {
                                    duration: 650,
                                    easing: "easeOutQuart",
                                  },
                                }}
                              />
                            </div>
                          </div>

                          {/* Bar Chart: Quick Insights */}
                          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow  md:col-span-2 lg:col-span-2">
                            <h2 className="text-lg font-semibold tracking-tight mb-3 text-gray-900">
                              Quick Insights (Chart)
                            </h2>
                            <div className="h-64">
                              <Bar
                                data={{
                                  labels: [
                                    "Utilization %",
                                    "Avg Rev / Invoice",
                                    "Total Expiring",
                                    "Available Vehicles",
                                  ],
                                  datasets: [
                                    {
                                      label: "Value",
                                      data: [
                                        utilizationPct,
                                        Math.round(avgRevenue),
                                        totalExpiring,
                                        estAvailable,
                                      ],
                                      backgroundColor: [
                                        palette.cyan,
                                        palette.indigo,
                                        palette.rose,
                                        palette.amber,
                                      ],
                                      borderColor: [
                                        palette.cyan,
                                        palette.indigo,
                                        palette.rose,
                                        palette.amber,
                                      ],
                                      borderWidth: 2,
                                      borderRadius: 10,
                                      borderSkipped: false,
                                    },
                                  ],
                                }}
                                options={{
                                  indexAxis: "y",
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                      backgroundColor: chartTheme.tooltipBg,
                                      titleColor: chartTheme.tooltipFg,
                                      bodyColor: chartTheme.tooltipFg,
                                      borderColor: "#E5E7EB",
                                      borderWidth: 1,
                                      cornerRadius: 10,
                                    },
                                  },
                                  scales: {
                                    x: {
                                      grid: { color: chartTheme.grid.light },
                                      ticks: {
                                        color: chartTheme.ticks.secondary,
                                      },
                                    },
                                    y: {
                                      grid: { display: false },
                                      ticks: {
                                        color: chartTheme.ticks.primary,
                                      },
                                    },
                                  },
                                  animation: {
                                    duration: 650,
                                    easing: "easeOutQuart",
                                  },
                                }}
                              />
                            </div>
                          </div>

                          {/* Line Chart: Revenue */}
                          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
                            <h2 className="text-lg font-semibold tracking-tight mb-3 text-gray-900">
                              Revenue
                            </h2>
                            <div className="h-64">
                              <Line
                                data={{
                                  labels: [
                                    "Jan",
                                    "Feb",
                                    "Mar",
                                    "Apr",
                                    "May",
                                    "Jun",
                                  ],
                                  datasets: [
                                    {
                                      label: "Revenue (LKR)",
                                      data: [
                                        0,
                                        0,
                                        0,
                                        0,
                                        0,
                                        Number(stats.revenue ?? 0),
                                      ],
                                      borderColor: palette.cyan,
                                      backgroundColor:
                                        "rgba(6, 182, 212, 0.15)",
                                      pointBackgroundColor: palette.cyan,
                                      pointBorderColor: palette.cyan,
                                      borderWidth: 3,
                                      pointRadius: 3,
                                      pointHoverRadius: 6,
                                      pointHitRadius: 12,
                                      tension: 0.4,
                                      fill: true,
                                      spanGaps: true,
                                    },
                                  ],
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  interaction: {
                                    intersect: false,
                                    mode: "index",
                                  },
                                  plugins: {
                                    legend: {
                                      position: "bottom",
                                      labels: {
                                        color: chartTheme.ticks.primary,
                                        usePointStyle: true,
                                        padding: 16,
                                      },
                                    },
                                    tooltip: {
                                      backgroundColor: chartTheme.tooltipBg,
                                      titleColor: chartTheme.tooltipFg,
                                      bodyColor: chartTheme.tooltipFg,
                                      borderColor: "#E5E7EB",
                                      borderWidth: 1,
                                      cornerRadius: 10,
                                    },
                                  },
                                  scales: {
                                    x: {
                                      grid: { display: false },
                                      ticks: {
                                        color: chartTheme.ticks.primary,
                                      },
                                    },
                                    y: {
                                      grid: { color: chartTheme.grid.light },
                                      ticks: {
                                        color: chartTheme.ticks.secondary,
                                      },
                                      beginAtZero: true,
                                    },
                                  },
                                  animation: {
                                    duration: 700,
                                    easing: "easeOutQuart",
                                  },
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Protected>
                }
              />
            </Routes>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// MAIN APP
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

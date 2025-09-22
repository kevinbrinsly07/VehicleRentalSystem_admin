import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
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
  XMarkIcon,
} from "@heroicons/react/24/outline";

import Cars from "./pages/Cars.jsx";
import Customers from "./pages/Customers.jsx";
import Rentals from "./pages/Rentals.jsx";
import Invoices from "./pages/Invoices.jsx";
import MaintenancePage from "./pages/Maintenance.jsx";
import CompliancePage from "./pages/Compliance.jsx";
import UsersPage from "./pages/Users.jsx";



// APP CONTENT
function AppContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: HomeIcon },
    { path: "/cars", label: "Vehicles", icon: TruckIcon },
    { path: "/customers", label: "Customers", icon: UserGroupIcon },
    { path: "/rentals", label: "Rentals", icon: DocumentTextIcon },
    { path: "/invoices", label: "Invoices", icon: DocumentCurrencyDollarIcon },
    { path: "/compliance", label: "Compliance", icon: DocumentTextIcon },
    { path: "/maintenance", label: "Maintenance", icon: DocumentTextIcon },
    { path: "/admin-users", label: "Users", icon: UserGroupIcon },
  ];

  const currentNavItem =
    navItems.find((item) => item.path === location.pathname) || navItems[0];

  const cardColors = [
    { bg: "bg-gradient-to-br from-white to-gray-100", icon: "text-gray-800" },
    { bg: "bg-gradient-to-br from-white to-gray-100", icon: "text-gray-800" },
    { bg: "bg-gradient-to-br from-white to-gray-100", icon: "text-gray-800" },
    { bg: "bg-gradient-to-br from-white to-gray-100", icon: "text-gray-800" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex poppins">
      {/* Mobile menu toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 rounded-md p-2 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-gray-900 text-white transform transition-transform duration-300 md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center px-4 text-xl uppercase font-bold tracking-tight border-b border-gray-800">
          <currentNavItem.icon className="h-6 w-6 mr-2" />
          Dashboard
        </div>
        <nav className="px-2 py-3 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? "bg-gray-800 text-red-500"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-72 w-full">
        <div className="container mx-auto px-4 py-8">
          <AnimatePresence>
            <Routes>
              <Route
                path="/cars"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Cars />
                  </motion.div>
                }
              />
              <Route
                path="/customers"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Customers />
                  </motion.div>
                }
              />
              <Route
                path="/rentals"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Rentals />
                  </motion.div>
                }
              />
              <Route
                path="/invoices"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Invoices />
                  </motion.div>
                }
              />
              <Route
                path="/compliance"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CompliancePage />
                  </motion.div>
                }
              />
              <Route
                path="/maintenance"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MaintenancePage />
                  </motion.div>
                }
              />
              <Route
                path="/admin-users"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <UsersPage />
                  </motion.div>
                }
              />
              {/* HOME PAGE */}
              <Route
                path="/"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center justify-center text-gray-800 min-h-[80vh]"
                  >
                    <div className="text-center mb-20 px-4">
                      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-gray-800 to-gray-500 bg-clip-text text-transparent">
                        Welcome to <br /> Rental Dashboard
                      </h1>

                      {/* Stats section */}
                      <div className="flex md:flex-row flex-col justify-center gap-12 text-gray-800">
                        <div className="flex flex-col items-center">
                          <span className="text-3xl font-extrabold text-red-500">
                            {stats.vehicles}
                          </span>
                          <span className="uppercase text-sm tracking-wider">
                            Vehicles
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-3xl font-extrabold text-red-500">
                            {stats.customers}
                          </span>
                          <span className="uppercase text-sm tracking-wider">
                            Customers
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-3xl font-extrabold text-red-500">
                            {stats.rentals_active}
                          </span>
                          <span className="uppercase text-sm tracking-wider">
                            Rentals
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-3xl font-extrabold text-red-500">
                            {stats.invoices}
                          </span>
                          <span className="uppercase text-sm tracking-wider">
                            Invoices
                          </span>
                        </div>
                      </div>
                      <div className="mt-6 flex justify-center">
                        <div className="rounded-full px-4 py-2 text-sm bg-gray-200 text-gray-800">
                          Total Revenue:{" "}
                          <span className="font-semibold">
                            LKR{" "}
                            {stats.revenue?.toLocaleString?.() ?? stats.revenue}
                          </span>
                        </div>
                      </div>
                      <div className="mt-8 grid gap-6 md:grid-cols-3">
                        <div className="p-4 rounded-xl bg-white border border-gray-200">
                          <div className="text-sm text-gray-500">
                            Insurance expiring (30 days)
                          </div>
                          <div className="text-2xl font-bold text-red-500">
                            {stats.insurance_expiring ?? 0}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white border border-gray-200">
                          <div className="text-sm text-gray-500">
                            Legal docs expiring (30 days)
                          </div>
                          <div className="text-2xl font-bold text-red-500">
                            {stats.docs_expiring ?? 0}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white border border-gray-200">
                          <div className="text-sm text-gray-500">
                            Maintenance due (30 days)
                          </div>
                          <div className="text-2xl font-bold text-red-500">
                            {stats.maintenance_due ?? 0}
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 flex justify-center">
                        <div className="rounded-full px-4 py-2 text-sm bg-gray-100 text-gray-800">
                          Active Users:{" "}
                          <span className="font-semibold">
                            {stats.users_active ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
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
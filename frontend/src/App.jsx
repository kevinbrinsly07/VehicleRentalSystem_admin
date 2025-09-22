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

// USERS PAGE
function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "staff",
    active: true,
  });

  const load = async () => {
    const res = await fetch("http://localhost:8000/users");
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ name: "", email: "", role: "staff", active: true });
      load();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">User Management</h2>
      <form
        onSubmit={submit}
        className="grid gap-3 md:grid-cols-4 bg-white p-4 rounded-xl border"
      >
        <input
          className="border rounded px-3 py-2"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <select
          className="border rounded px-3 py-2"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="admin">admin</option>
          <option value="manager">manager</option>
          <option value="staff">staff</option>
        </select>
        <div className="flex items-center gap-2">
          <input
            id="active"
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          <label htmlFor="active">Active</label>
        </div>
        <button className="md:col-span-4 bg-gray-900 text-white rounded px-4 py-2 hover:bg-red-600 transition">
          Add User
        </button>
      </form>
      <div className="overflow-x-auto bg-white rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.id}</td>
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-200">
                    {u.role}
                  </span>
                </td>
                <td className="p-3">{u.active ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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

                    {/* <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 px-4">
                      {[
                        {
                          title: "Vehicles",
                          desc: "View and manage all available vehicles in your fleet.",
                          icon: TruckIcon,
                          path: "/cars",
                        },
                        {
                          title: "Customers",
                          desc: "Manage customer details and rental history.",
                          icon: UserGroupIcon,
                          path: "/customers",
                        },
                        {
                          title: "Rentals",
                          desc: "Track current and past rental transactions.",
                          icon: DocumentTextIcon,
                          path: "/rentals",
                        },
                        {
                          title: "Invoices",
                          desc: "Generate and manage billing invoices.",
                          icon: DocumentCurrencyDollarIcon,
                          path: "/invoices",
                        },
                      ].map((item, index) => (
                        <Link to={item.path} key={item.title} className="h-full">
                          <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className={`${cardColors[index].bg} p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-md hover:shadow-red-500 hover:border-red-500 transition cursor-pointer h-full group`}
                          >
                            <item.icon
                              className={`h-8 w-8 ${cardColors[index].icon} mb-4 group-hover:text-red-500`}
                            />
                            <h2 className="text-xl font-semibold mb-2 group-hover:text-red-500">
                              {item.title}
                            </h2>
                            <p className="text-sm text-gray-700 group-hover:text-red-500">
                              {item.desc}
                            </p>
                          </motion.div>
                        </Link>
                      ))}
                    </div> */}
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
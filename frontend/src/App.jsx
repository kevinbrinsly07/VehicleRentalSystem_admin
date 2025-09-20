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
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

import Cars from "./pages/Cars.jsx";
import Customers from "./pages/Customers.jsx";
import Rentals from "./pages/Rentals.jsx";
import Invoices from "./pages/Invoices.jsx";


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

function MaintenancePage() {
  const [days, setDays] = useState(30);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    car_id: "",
    maint_type: "Oil Change",
    due_date: "",
    status: "pending",
    cost: 0,
    notes: "",
  });
  const load = async () => {
    const res = await fetch(
      `http://localhost:8000/maintenance/upcoming?days=${days}`
    );
    const data = await res.json();
    setItems(data);
  };
  useEffect(() => {
    load();
  }, [days]);
  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8000/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        car_id: Number(form.car_id),
        cost: Number(form.cost),
      }),
    });
    if (res.ok) {
      setForm({
        car_id: "",
        maint_type: "Oil Change",
        due_date: "",
        status: "pending",
        cost: 0,
        notes: "",
      });
      load();
    }
  };
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Vehicle Maintenance</h2>
      <form
        onSubmit={submit}
        className="grid gap-3 md:grid-cols-6 bg-white p-4 rounded-xl border"
      >
        <input
          className="border rounded px-3 py-2"
          placeholder="Car ID"
          value={form.car_id}
          onChange={(e) => setForm({ ...form, car_id: e.target.value })}
          required
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Type (e.g. Oil Change)"
          value={form.maint_type}
          onChange={(e) => setForm({ ...form, maint_type: e.target.value })}
        />
        <input
          className="border rounded px-3 py-2"
          type="date"
          value={form.due_date}
          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          required
        />
        <select
          className="border rounded px-3 py-2"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="pending">pending</option>
          <option value="completed">completed</option>
        </select>
        <input
          className="border rounded px-3 py-2"
          type="number"
          step="0.01"
          placeholder="Cost"
          value={form.cost}
          onChange={(e) => setForm({ ...form, cost: e.target.value })}
        />
        <input
          className="border rounded px-3 py-2 md:col-span-6"
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <button className="md:col-span-6 bg-gray-900 text-white rounded px-4 py-2 hover:bg-red-600 transition">
          Add Maintenance
        </button>
      </form>

      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-600">Show upcoming for</label>
        <select
          className="border rounded px-3 py-2"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          {[7, 14, 30, 60, 90].map((d) => (
            <option key={d} value={d}>
              {d} days
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Due Date</th>
              <th className="text-left p-3">Car</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Cost</th>
              <th className="text-left p-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t">
                <td className="p-3">{it.due_date}</td>
                <td className="p-3">
                  {it.car.make} {it.car.model} ({it.car.year})
                </td>
                <td className="p-3">{it.maint_type}</td>
                <td className="p-3">{it.status}</td>
                <td className="p-3">{it.cost ?? 0}</td>
                <td className="p-3">{it.notes ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CompliancePage() {
  const [carId, setCarId] = useState("");
  const [insurance, setInsurance] = useState([]);
  const [legalDocs, setLegalDocs] = useState([]);
  const [insForm, setInsForm] = useState({
    car_id: "",
    provider: "",
    policy_number: "",
    start_date: "",
    end_date: "",
    coverage: "",
  });
  const [docForm, setDocForm] = useState({
    car_id: "",
    doc_type: "Registration",
    number: "",
    issue_date: "",
    expiry_date: "",
    file_url: "",
  });

  const load = async (cid) => {
    if (!cid) return;
    const [insRes, docRes] = await Promise.all([
      fetch(`http://localhost:8000/cars/${cid}/insurance`),
      fetch(`http://localhost:8000/cars/${cid}/legal-docs`),
    ]);
    setInsurance(await insRes.json());
    setLegalDocs(await docRes.json());
  };

  const search = async (e) => {
    e.preventDefault();
    await load(carId);
  };

  const addInsurance = async (e) => {
    e.preventDefault();
    const payload = { ...insForm, car_id: Number(insForm.car_id) };
    const res = await fetch(
      `http://localhost:8000/cars/${payload.car_id}/insurance`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (res.ok) {
      setInsForm({
        car_id: insForm.car_id,
        provider: "",
        policy_number: "",
        start_date: "",
        end_date: "",
        coverage: "",
      });
      load(payload.car_id);
    }
  };

  const addDoc = async (e) => {
    e.preventDefault();
    const payload = { ...docForm, car_id: Number(docForm.car_id) };
    const res = await fetch(
      `http://localhost:8000/cars/${payload.car_id}/legal-docs`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (res.ok) {
      setDocForm({
        car_id: docForm.car_id,
        doc_type: "Registration",
        number: "",
        issue_date: "",
        expiry_date: "",
        file_url: "",
      });
      load(payload.car_id);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold">Insurance & Legal Documents</h2>

      <form onSubmit={search} className="flex gap-3 items-end">
        <div>
          <label className="text-xs text-gray-600">Car ID</label>
          <input
            className="border rounded px-3 py-2 ml-2"
            placeholder="e.g. 1"
            value={carId}
            onChange={(e) => {
              setCarId(e.target.value);
              setInsForm((f) => ({ ...f, car_id: e.target.value }));
              setDocForm((f) => ({ ...f, car_id: e.target.value }));
            }}
          />
        </div>
        <button className="bg-gray-900 text-white rounded px-4 py-2 hover:bg-red-600 transition">
          Load
        </button>
      </form>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Insurance */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Insurance</h3>
          <form
            onSubmit={addInsurance}
            className="grid gap-3 bg-white p-4 rounded-xl border"
          >
            <input
              className="border rounded px-3 py-2"
              placeholder="Provider"
              value={insForm.provider}
              onChange={(e) =>
                setInsForm({ ...insForm, provider: e.target.value })
              }
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Policy Number"
              value={insForm.policy_number}
              onChange={(e) =>
                setInsForm({ ...insForm, policy_number: e.target.value })
              }
            />
            <div className="grid md:grid-cols-2 gap-3">
              <input
                className="border rounded px-3 py-2"
                type="date"
                value={insForm.start_date}
                onChange={(e) =>
                  setInsForm({ ...insForm, start_date: e.target.value })
                }
              />
              <input
                className="border rounded px-3 py-2"
                type="date"
                value={insForm.end_date}
                onChange={(e) =>
                  setInsForm({ ...insForm, end_date: e.target.value })
                }
              />
            </div>
            <input
              className="border rounded px-3 py-2"
              placeholder="Coverage"
              value={insForm.coverage}
              onChange={(e) =>
                setInsForm({ ...insForm, coverage: e.target.value })
              }
            />
            <button className="bg-gray-900 text-white rounded px-4 py-2 hover:bg-red-600 transition">
              Add Insurance
            </button>
          </form>
          <div className="overflow-x-auto bg-white rounded-xl border">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">Provider</th>
                  <th className="text-left p-3">Policy</th>
                  <th className="text-left p-3">Start</th>
                  <th className="text-left p-3">End</th>
                  <th className="text-left p-3">Coverage</th>
                </tr>
              </thead>
              <tbody>
                {insurance.map((i) => (
                  <tr key={i.id} className="border-t">
                    <td className="p-3">{i.provider}</td>
                    <td className="p-3">{i.policy_number}</td>
                    <td className="p-3">{i.start_date}</td>
                    <td className="p-3">{i.end_date}</td>
                    <td className="p-3">{i.coverage ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legal Documents */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Legal Documents</h3>
          <form
            onSubmit={addDoc}
            className="grid gap-3 bg-white p-4 rounded-xl border"
          >
            <input
              className="border rounded px-3 py-2"
              placeholder="Type (e.g. Registration)"
              value={docForm.doc_type}
              onChange={(e) =>
                setDocForm({ ...docForm, doc_type: e.target.value })
              }
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Number"
              value={docForm.number}
              onChange={(e) =>
                setDocForm({ ...docForm, number: e.target.value })
              }
            />
            <div className="grid md:grid-cols-2 gap-3">
              <input
                className="border rounded px-3 py-2"
                type="date"
                value={docForm.issue_date}
                onChange={(e) =>
                  setDocForm({ ...docForm, issue_date: e.target.value })
                }
              />
              <input
                className="border rounded px-3 py-2"
                type="date"
                value={docForm.expiry_date}
                onChange={(e) =>
                  setDocForm({ ...docForm, expiry_date: e.target.value })
                }
              />
            </div>
            <input
              className="border rounded px-3 py-2"
              placeholder="File URL (optional)"
              value={docForm.file_url}
              onChange={(e) =>
                setDocForm({ ...docForm, file_url: e.target.value })
              }
            />
            <button className="bg-gray-900 text-white rounded px-4 py-2 hover:bg-red-600 transition">
              Add Document
            </button>
          </form>
          <div className="overflow-x-auto bg-white rounded-xl border">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Number</th>
                  <th className="text-left p-3">Issue</th>
                  <th className="text-left p-3">Expiry</th>
                  <th className="text-left p-3">File</th>
                </tr>
              </thead>
              <tbody>
                {legalDocs.map((d) => (
                  <tr key={d.id} className="border-t">
                    <td className="p-3">{d.doc_type}</td>
                    <td className="p-3">{d.number ?? "-"}</td>
                    <td className="p-3">{d.issue_date ?? "-"}</td>
                    <td className="p-3">{d.expiry_date ?? "-"}</td>
                    <td className="p-3">
                      {d.file_url ? (
                        <a
                          className="text-blue-600 underline"
                          href={d.file_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    {
      bg: "bg-gradient-to-br from-white to-gray-100",
      icon: "text-gray-800",
    },
    {
      bg: "bg-gradient-to-br from-white to-gray-100",
      icon: "text-gray-800",
    },
    {
      bg: "bg-gradient-to-br from-white to-gray-100",
      icon: "text-gray-800",
    },
    {
      bg: "bg-gradient-to-br from-white to-gray-100",
      icon: "text-gray-800",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col poppins">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900 text-white shadow-lg"
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            to="/"
            className="text-xl uppercase font-bold tracking-tight text-white hover:text-red-500 transition flex items-center gap-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            <currentNavItem.icon className="h-6 w-6" />
            Dashboard
          </Link>

          {/* Desktop menu */}
          <div className="hidden 2xl:flex space-x-6">
            {navItems.map((item) => (
              <motion.div
                key={item.path}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={item.path}
                  className="flex items-center gap-2 font-[600] text-gray-300 hover:text-red-500 transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            className="2xl:hidden focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6 text-white" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-white" />
            )}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="2xl:hidden bg-gray-800"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 border-b border-gray-700 text-gray-300 hover:text-red-500 transition-colors"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </motion.nav>

      {/* Main Content */}
      <div className="flex-grow container mx-auto px-4 py-8">
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

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 px-4">
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
                  </div>
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

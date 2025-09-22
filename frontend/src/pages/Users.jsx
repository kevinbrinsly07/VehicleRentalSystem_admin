import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "staff",
    active: true,
    password: "",
    confirm: "",
  });

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`);
      const data = await res.json();
      setUsers(data || []);
    } catch (e) {
      console.error("Failed to load users", e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!form.password || form.password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
      }
      if (form.password !== form.confirm) {
        alert("Passwords do not match.");
        return;
      }
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        active: form.active,
        password: form.password,
      };
      const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      if (!res.ok) {
        console.error("Add user failed:", text);
        try {
          const data = JSON.parse(text);
          alert(data?.detail || "Failed to add user.");
        } catch {
          alert(text || "Failed to add user.");
        }
        return;
      }
      setForm({ name: "", email: "", role: "staff", active: true, password: "", confirm: "" });
      setShowForm(false);
      await load();
    } catch (err) {
      console.error(err);
      alert("Network error while adding user.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-gray-900 mb-6"
      >
        User Management
      </motion.h1>

      {/* Top action bar */}
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition-colors"
        >
          {showForm ? 'Close' : 'Add'}
        </button>
      </div>

      {/* Add User Form Card */}
      {showForm && (
        <div className="bg-white p-5 rounded-[10px] shadow-lg border border-gray-200 overflow-hidden mb-6">
          <div className="">
            <form onSubmit={submit} className="grid gap-5 md:grid-cols-6">
              <input
                className="border border-[#E1E4E8] rounded-[10px] px-3 py-4 md:col-span-2"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                className="border border-[#E1E4E8] rounded-[10px] px-3 py-4 md:col-span-2"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <input
                className="border border-[#E1E4E8] rounded-[10px] px-3 py-4 md:col-span-2"
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <input
                className="border border-[#E1E4E8] rounded-[10px] px-3 py-4 md:col-span-2"
                placeholder="Confirm Password"
                type="password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                required
              />
              <select
                className="border border-[#E1E4E8] rounded-[10px] px-3 py-4"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="admin">admin</option>
                <option value="manager">manager</option>
                <option value="staff">staff</option>
              </select>
              <div className="flex items-center gap-2 md:col-span-1">
                <input
                  id="active"
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                <label htmlFor="active">Active</label>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className={`md:col-span-6 rounded-[10px] px-4 py-3 text-white transition ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'}`}
              >
                {submitting ? 'Saving…' : 'Save User'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Table card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-4 text-left font-semibold">ID</th>
                <th className="p-4 text-left font-semibold">Name</th>
                <th className="p-4 text-left font-semibold">Email</th>
                <th className="p-4 text-left font-semibold">Role</th>
                <th className="p-4 text-left font-semibold">Active</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="border-t border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="p-4 text-gray-600">{u.id}</td>
                  <td className="p-4 text-gray-600">{u.name}</td>
                  <td className="p-4 text-gray-600">{u.email}</td>
                  <td className="p-4 text-gray-600">
                    <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-800">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{u.active ? 'Yes' : 'No'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
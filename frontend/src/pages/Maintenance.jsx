import { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

function Maintenance() {
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
  const [cars, setCars] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch cars and auto-select first car on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/cars`);
        if (res.ok) {
          const data = await res.json();
          setCars(data || []);
          if ((data || []).length) {
            const firstId = String(data[0].id);
            setForm((f) => ({ ...f, car_id: firstId }));
          }
        }
      } catch (e) {
        console.error("Failed to load cars", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    const res = await fetch(`${API_BASE}/maintenance/upcoming?days=${days}`);
    const data = await res.json();
    setItems(data);
  };

  // Mark maintenance as completed
  const markCompleted = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/maintenance/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      if (!res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          alert(data?.detail || "Failed to mark as completed.");
        } catch {
          alert(text || "Failed to mark as completed.");
        }
        return;
      }
      await load();
    } catch (err) {
      console.error(err);
      alert("Network error while updating maintenance.");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // basic guard
      if (!form.car_id) {
        alert("Please select a vehicle.");
        return;
      }
      const res = await fetch(`${API_BASE}/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          car_id: Number(form.car_id),
          cost: Number(form.cost || 0),
        }),
      });
      const text = await res.text();
      if (!res.ok) {
        console.error("Add maintenance failed:", text);
        try {
          const data = JSON.parse(text);
          alert(data?.detail || "Failed to add maintenance.");
        } catch {
          alert(text || "Failed to add maintenance.");
        }
        return;
      }
      // success
      setForm({
        car_id: "",
        maint_type: "Oil Change",
        due_date: "",
        status: "pending",
        cost: 0,
        notes: "",
      });
      setShowForm(false);
      await load();
    } catch (err) {
      console.error(err);
      alert("Network error while adding maintenance.");
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
        Maintenance
      </motion.h1>

      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition-colors"
        >
          {showForm ? 'Close' : 'Add'}
        </button>
      </div>

      {/* Add Maintenance Form Card */}
      {showForm && (
        <div className="bg-white p-5 rounded-[10px] shadow-lg border border-gray-200 overflow-hidden mb-6">
          {/* <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Add Maintenance</h3>
          </div> */}
          <div className="">
            <form onSubmit={submit} className="grid gap-5 md:grid-cols-6">
              <div className="md:col-span-2">
                {/* <label className="text-xs text-gray-600">Vehicle</label> */}
                <select
                  className="border border-[#E1E4E8] rounded-[10px] px-4 py-4 w-full"
                  value={form.car_id}
                  onChange={(e) => setForm({ ...form, car_id: e.target.value })}
                  required
                >
                  <option value="" disabled>-- choose a vehicle --</option>
                  {cars.map((c) => (
                    <option key={c.id} value={c.id}>
                      #{c.id} — {c.make} {c.model} ({c.year})
                    </option>
                  ))}
                </select>
              </div>
              <input
                className="border border-[#E1E4E8] rounded-[10px] px-3 py-4"
                placeholder="Type (e.g. Oil Change)"
                value={form.maint_type}
                onChange={(e) => setForm({ ...form, maint_type: e.target.value })}
              />
              <input
                className="border border-[#E1E4E8] rounded-[10px] px-3 py-4"
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                required
                min={new Date().toISOString().slice(0,10)}
              />
              <select
                className="border border-[#E1E4E8] rounded-[10px] px-3 py-4"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="pending">pending</option>
                <option value="completed">completed</option>
              </select>
              <input
                className="border border-[#E1E4E8] rounded-[10px] px-3 py-4"
                type="number"
                step="0.01"
                placeholder="Cost"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
              />
              <input
                className="border border-[#E1E4E8] rounded-[10px] px-3 py-4 md:col-span-6"
                placeholder="Notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
              <button
                type="submit"
                disabled={submitting}
                className={`md:col-span-6 rounded-[10px] px-4 py-3 text-white transition ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'}`}
              >
                {submitting ? 'Saving…' : 'Save Maintenance'}
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
                <th className="p-4 text-left font-semibold">Due Date</th>
                <th className="p-4 text-left font-semibold">Car</th>
                <th className="p-4 text-left font-semibold">Type</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Cost</th>
                <th className="p-4 text-left font-semibold">Notes</th>
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <motion.tr
                  key={it.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="border-t border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="p-4 text-gray-600">{it.due_date}</td>
                  <td className="p-4 text-gray-600">
                    {it.car.make} {it.car.model} ({it.car.year})
                  </td>
                  <td className="p-4 text-gray-600">{it.maint_type}</td>
                  <td className="p-4 text-gray-600">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                        it.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {it.status === 'completed' ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{it.cost ?? 0}</td>
                  <td className="p-4 text-gray-600">{it.notes ?? '-'}</td>
                  <td className="p-4">
                    {it.status === "pending" && (
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                        onClick={() => markCompleted(it.id)}
                      >
                        Mark Completed
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Filters card */}
      <div className="overflow-hidden mb-4 mt-10">
        <div className="p-4 flex items-center gap-3">
          <label className="text-sm text-gray-700">Show upcoming for</label>
          <select
            className="border rounded-[10px] px-3 py-2"
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
      </div>
    </div>
  );
}

export default Maintenance;
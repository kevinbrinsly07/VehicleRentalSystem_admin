import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

function Compliance() {
  const [cars, setCars] = useState([]);
  const [selectedCarId, setSelectedCarId] = useState("");

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

  const [insFile, setInsFile] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const [showInsForm, setShowInsForm] = useState(false);
  const [showDocForm, setShowDocForm] = useState(false);

  // fetch inventory vehicles once
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await fetch(`${API_BASE}/cars`);
        if (res.ok) {
          const data = await res.json();
          setCars(data || []);
          if ((data || []).length && !selectedCarId) {
            setSelectedCarId(String(data[0].id));
          }
        }
      } catch (e) {
        console.error("Failed to load cars", e);
      }
    };
    fetchCars();
  }, []);

  // load compliance info for a car
  const load = async (cid) => {
    if (!cid) return;
    const [insRes, docRes] = await Promise.all([
      fetch(`${API_BASE}/cars/${cid}/insurance`),
      fetch(`${API_BASE}/cars/${cid}/legal-docs`),
    ]);
    setInsurance(await insRes.json());
    setLegalDocs(await docRes.json());
  };

  useEffect(() => {
    if (selectedCarId) {
      load(selectedCarId);
    }
  }, [selectedCarId]);

  const addInsurance = async (e) => {
    e.preventDefault();
    const car_id_num = Number(insForm.car_id || selectedCarId);
    const fd = new FormData();
    fd.append('provider', insForm.provider);
    fd.append('policy_number', insForm.policy_number);
    fd.append('start_date', insForm.start_date);
    fd.append('end_date', insForm.end_date);
    if (insForm.coverage) fd.append('coverage', insForm.coverage);
    if (insFile) fd.append('file', insFile);
    const res = await fetch(`${API_BASE}/cars/${car_id_num}/insurance`, {
      method: 'POST',
      body: fd,
    });
    if (res.ok) {
      setInsForm({
        car_id: String(selectedCarId),
        provider: "",
        policy_number: "",
        start_date: "",
        end_date: "",
        coverage: "",
      });
      setInsFile(null);
      load(car_id_num);
    }
  };

  const addDoc = async (e) => {
    e.preventDefault();
    const car_id_num = Number(docForm.car_id || selectedCarId);
    const fd = new FormData();
    fd.append('doc_type', docForm.doc_type);
    if (docForm.number) fd.append('number', docForm.number);
    if (docForm.issue_date) fd.append('issue_date', docForm.issue_date);
    if (docForm.expiry_date) fd.append('expiry_date', docForm.expiry_date);
    if (docFile) fd.append('file', docFile);
    const res = await fetch(`${API_BASE}/cars/${car_id_num}/legal-docs`, {
      method: 'POST',
      body: fd,
    });
    if (res.ok) {
      setDocForm({
        car_id: String(selectedCarId),
        doc_type: "Registration",
        number: "",
        issue_date: "",
        expiry_date: "",
        file_url: "",
      });
      setDocFile(null);
      load(car_id_num);
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
        Compliance
      </motion.h1>

      {/* Vehicle picker */}
      <div className="overflow-hidden mb-6">
        <div className="p-4 flex flex-col items-start gap-2">
          <h1 className="text-sm text-gray-700 font-medium">Select Vehicle</h1>
          <select
            className="border rounded-[5px] px-3 py-2 focus:border-[#000000]"
            value={selectedCarId}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedCarId(val);
              setInsForm((f) => ({ ...f, car_id: val }));
              setDocForm((f) => ({ ...f, car_id: val }));
            }}
          >
            <option value="" disabled>
              -- choose a vehicle --
            </option>
            {cars.map((c) => (
              <option key={c.id} value={c.id}>
                #{c.id} — {c.make} {c.model} ({c.year})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Insurance */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Insurance</h3>
            <button
              type="button"
              onClick={() => setShowInsForm((v) => !v)}
              className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition-colors"
            >
              {showInsForm ? 'Close' : 'Add'}
            </button>
          </div>
          <div className="p-4 space-y-4">
            {showInsForm && (
              <form onSubmit={addInsurance} className="grid gap-3 bg-white p-4 rounded-xl border">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Add Insurance</span>
                  <button type="button" onClick={() => setShowInsForm(false)} className="text-xs px-2 py-1 rounded border">Close</button>
                </div>
                <input
                  className="border rounded px-3 py-2"
                  placeholder="Provider"
                  value={insForm.provider}
                  onChange={(e) => setInsForm({ ...insForm, provider: e.target.value })}
                />
                <input
                  className="border rounded px-3 py-2"
                  placeholder="Policy Number"
                  value={insForm.policy_number}
                  onChange={(e) => setInsForm({ ...insForm, policy_number: e.target.value })}
                />
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    className="border rounded px-3 py-2"
                    type="date"
                    value={insForm.start_date}
                    onChange={(e) => setInsForm({ ...insForm, start_date: e.target.value })}
                  />
                  <input
                    className="border rounded px-3 py-2"
                    type="date"
                    value={insForm.end_date}
                    onChange={(e) => setInsForm({ ...insForm, end_date: e.target.value })}
                  />
                </div>
                <input
                  className="border rounded px-3 py-2"
                  placeholder="Coverage"
                  value={insForm.coverage}
                  onChange={(e) => setInsForm({ ...insForm, coverage: e.target.value })}
                />
                <input
                  className="border rounded px-3 py-2"
                  type="file"
                  onChange={(e) => setInsFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                />
                <button className="bg-gray-900 text-white rounded px-4 py-2 hover:bg-red-600 transition">
                  Save Insurance
                </button>
              </form>
            )}
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
                      <th className="p-4 text-left font-semibold">Provider</th>
                      <th className="p-4 text-left font-semibold">Policy</th>
                      <th className="p-4 text-left font-semibold">Start</th>
                      <th className="p-4 text-left font-semibold">End</th>
                      <th className="p-4 text-left font-semibold">Coverage</th>
                      <th className="p-4 text-left font-semibold">File</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insurance.map((i) => (
                      <motion.tr
                        key={i.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-t border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="p-4 text-gray-600">{i.provider}</td>
                        <td className="p-4 text-gray-600">{i.policy_number}</td>
                        <td className="p-4 text-gray-600">{i.start_date}</td>
                        <td className="p-4 text-gray-600">{i.end_date}</td>
                        <td className="p-4 text-gray-600">{i.coverage ?? '-'}</td>
                        <td className="p-4 text-gray-600">
                          {i.file_url ? (
                            <a href={`${API_BASE}${i.file_url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View File</a>
                          ) : (
                            '-'
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Legal Documents */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Legal Documents</h3>
            <button
              type="button"
              onClick={() => setShowDocForm((v) => !v)}
              className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition-colors"
            >
              {showDocForm ? 'Close' : 'Add'}
            </button>
          </div>
          <div className="p-4 space-y-4">
            {showDocForm && (
              <form onSubmit={addDoc} className="grid gap-3 bg-white p-4 rounded-xl border">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Add Legal Document</span>
                  <button type="button" onClick={() => setShowDocForm(false)} className="text-xs px-2 py-1 rounded border">Close</button>
                </div>
                <input
                  className="border rounded px-3 py-2"
                  placeholder="Type (e.g. Registration)"
                  value={docForm.doc_type}
                  onChange={(e) => setDocForm({ ...docForm, doc_type: e.target.value })}
                />
                <input
                  className="border rounded px-3 py-2"
                  placeholder="Number"
                  value={docForm.number}
                  onChange={(e) => setDocForm({ ...docForm, number: e.target.value })}
                />
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    className="border rounded px-3 py-2"
                    type="date"
                    value={docForm.issue_date}
                    onChange={(e) => setDocForm({ ...docForm, issue_date: e.target.value })}
                  />
                  <input
                    className="border rounded px-3 py-2"
                    type="date"
                    value={docForm.expiry_date}
                    onChange={(e) => setDocForm({ ...docForm, expiry_date: e.target.value })}
                  />
                </div>
                <input
                  className="border rounded px-3 py-2"
                  type="file"
                  onChange={(e) => setDocFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                />
                <button className="bg-gray-900 text-white rounded px-4 py-2 hover:bg-red-600 transition">
                  Save Document
                </button>
              </form>
            )}
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
                      <th className="p-4 text-left font-semibold">Type</th>
                      <th className="p-4 text-left font-semibold">Number</th>
                      <th className="p-4 text-left font-semibold">Issue</th>
                      <th className="p-4 text-left font-semibold">Expiry</th>
                      <th className="p-4 text-left font-semibold">File</th>
                    </tr>
                  </thead>
                  <tbody>
                    {legalDocs.map((d) => (
                      <motion.tr
                        key={d.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-t border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="p-4 text-gray-600">{d.doc_type}</td>
                        <td className="p-4 text-gray-600">{d.number ?? '-'}</td>
                        <td className="p-4 text-gray-600">{d.issue_date ?? '-'}</td>
                        <td className="p-4 text-gray-600">{d.expiry_date ?? '-'}</td>
                        <td className="p-4 text-gray-600">
                          {d.file_url ? (
                            <a href={`${API_BASE}${d.file_url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View File</a>
                          ) : (
                            '-'
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Compliance;
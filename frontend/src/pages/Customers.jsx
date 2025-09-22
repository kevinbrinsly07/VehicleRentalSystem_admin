import { useState, useEffect } from 'react';
import axios from 'axios';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

const API_BASE = 'http://localhost:8000';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState({ id_card: null, driving_license: null });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/customers`);
      setCustomers(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch customers. Please try again.');
      console.error('Error fetching customers:', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFiles((prev) => ({ ...prev, [name]: files[0] || null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('email', formData.email);
      if (files.id_card) fd.append('id_card', files.id_card);
      if (files.driving_license) fd.append('driving_license', files.driving_license);
      await axios.post(`${API_BASE}/customers`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowForm(false);
      setFormData({ name: '', email: '' });
      setFiles({ id_card: null, driving_license: null });
      setError(null);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add customer. Please try again.');
      console.error('Error adding customer:', err);
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
        Customers
      </motion.h1>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg"
        >
          {error}
        </motion.div>
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition-colors mb-6"
      >
        {showForm ? (
          <>
            <XMarkIcon className="h-5 w-5" />
            Cancel
          </>
        ) : (
          <>
            <PlusIcon className="h-5 w-5" />
            Add Customer
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="mb-8 bg-white p-6 rounded-lg shadow-lg border border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
                required
              />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">ID Card</span>
                <input
                  type="file"
                  name="id_card"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Driving License</span>
                <input
                  type="file"
                  name="driving_license"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
                />
              </label>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="mt-4 flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition-colors"
            >
              <CheckIcon className="h-5 w-5" />
              Add Customer
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
      >
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-4 text-left font-semibold">ID</th>
              <th className="p-4 text-left font-semibold">Name</th>
              <th className="p-4 text-left font-semibold">Email</th>
              <th className="p-4 text-left font-semibold">ID Card</th>
              <th className="p-4 text-left font-semibold">Driving License</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, index) => (
              <motion.tr
                key={customer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-t border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="p-4 text-gray-600">{customer.id}</td>
                <td className="p-4 text-gray-600">{customer.name}</td>
                <td className="p-4 text-gray-600">{customer.email}</td>
                <td className="p-4 text-gray-600">
                  {customer.id_card_url ? (
                    <a
                      href={`http://localhost:8000${customer.id_card_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 rounded-md border border-gray-300 text-sm hover:bg-gray-100"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="p-4 text-gray-600">
                  {customer.driving_license_url ? (
                    <a
                      href={`http://localhost:8000${customer.driving_license_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 rounded-md border border-gray-300 text-sm hover:bg-gray-100"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {customers.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-gray-500 mt-4 text-center"
        >
          No customers found.
        </motion.p>
      )}
    </div>
  );
}

export default Customers;
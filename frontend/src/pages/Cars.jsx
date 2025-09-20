import { useState, useEffect } from 'react';
import axios from 'axios';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

const API_BASE = 'http://localhost:8000';

function Cars() {
  const [cars, setCars] = useState([]);
  const [formData, setFormData] = useState({ make: '', model: '', year: '', price_per_day: '' });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const res = await axios.get(`${API_BASE}/cars`);
      setCars(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch cars. Please try again.');
      console.error('Error fetching cars:', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/cars`, { ...formData, year: parseInt(formData.year), price_per_day: parseFloat(formData.price_per_day) });
      setShowForm(false);
      setFormData({ make: '', model: '', year: '', price_per_day: '' });
      setError(null);
      fetchCars();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add car. Please try again.');
      console.error('Error adding car:', err);
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
        Car Inventory
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
            Add Car
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
                name="make"
                value={formData.make}
                onChange={handleInputChange}
                placeholder="Make"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
                required
              />
              <input
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="Model"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
                required
              />
              <input
                name="year"
                type="number"
                value={formData.year}
                onChange={handleInputChange}
                placeholder="Year"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
                required
              />
              <input
                name="price_per_day"
                type="number"
                step="0.01"
                value={formData.price_per_day}
                onChange={handleInputChange}
                placeholder="Price per Day"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
                required
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="mt-4 flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition-colors"
            >
              <CheckIcon className="h-5 w-5" />
              Add Car
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
              <th className="p-4 text-left font-semibold">Make</th>
              <th className="p-4 text-left font-semibold">Model</th>
              <th className="p-4 text-left font-semibold">Year</th>
              <th className="p-4 text-left font-semibold">Price/Day</th>
              <th className="p-4 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car, index) => (
              <motion.tr
                key={car.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-t border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="p-4 text-gray-600">{car.id}</td>
                <td className="p-4 text-gray-600">{car.make}</td>
                <td className="p-4 text-gray-600">{car.model}</td>
                <td className="p-4 text-gray-600">{car.year}</td>
                <td className="p-4 text-gray-600">${car.price_per_day}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      car.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {car.available ? 'Available' : 'Rented'}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {cars.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-gray-500 mt-4 text-center"
        >
          No cars available.
        </motion.p>
      )}
    </div>
  );
}

export default Cars;
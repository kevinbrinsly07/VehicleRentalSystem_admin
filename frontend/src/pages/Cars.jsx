import { useState, useEffect } from 'react';
import axios from 'axios';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import carImg from "../assets/car.jpeg"

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
      await axios.post(`${API_BASE}/cars`, {
        ...formData,
        year: parseInt(formData.year),
        price_per_day: parseFloat(formData.price_per_day),
      });
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
        Vehicle Inventory
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
            Add a Vehicle
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
              Done
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Card Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {cars.map((car, index) => (
          <motion.div
            key={car.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <img
              src={carImg}
              alt={`${car.make} ${car.model}`}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 space-y-3">
              <h2 className="text-xl font-semibold text-gray-800">{car.make} {car.model}</h2>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8v4l3 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 19c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9c0 3.53 2.07 6.61 5.05 8.05" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {car.year}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c-1.1 0-2 .9-2 2 0 .55.23 1.05.6 1.4l1.4 1.4V17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 3v1m0 16v1m8.66-13.66l-.707.707M4.34 19.66l-.707-.707M21 12h1M2 12H1m16.66 4.66l-.707-.707M7.34 4.34l-.707.707" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  ${car.price_per_day}/day
                </span>
              </div>
              <div>
                <span
                  className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                    car.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {car.available ? 'Available' : 'Rented'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
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

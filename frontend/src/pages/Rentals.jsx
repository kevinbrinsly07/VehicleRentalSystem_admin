import { useState, useEffect } from 'react';
import axios from 'axios';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, XMarkIcon, CheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const API_BASE = 'http://localhost:8000';

function Rentals() {
  const [rentals, setRentals] = useState([]);
  const [availableCars, setAvailableCars] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    car_id: '',
    customer_id: '',
    start_date: '',
    days: '', // Changed from end_date to days
    deposit_amount: 0,
    is_paid: false,
    payment_method: '',
  });
  const [showRentForm, setShowRentForm] = useState(false);
  const [selectedRentalId, setSelectedRentalId] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRentals();
    fetchAvailableCars();
    fetchCustomers();
  }, []);

  const fetchRentals = async () => {
    try {
      const res = await axios.get(`${API_BASE}/rentals`);
      setRentals(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch rentals. Please try again.');
      console.error('Error fetching rentals:', err);
    }
  };

  const fetchAvailableCars = async () => {
    try {
      const res = await axios.get(`${API_BASE}/cars/available`);
      setAvailableCars(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch available cars. Please try again.');
      console.error('Error fetching available cars:', err);
    }
  };

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
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleRentSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/rentals`, {
        ...formData,
        car_id: parseInt(formData.car_id),
        customer_id: parseInt(formData.customer_id),
        deposit_amount: parseFloat(formData.deposit_amount),
        days: formData.days ? parseInt(formData.days) : null, // Send null if days is empty
      });
      setShowRentForm(false);
      setFormData({
        car_id: '',
        customer_id: '',
        start_date: '',
        days: '',
        deposit_amount: 0,
        is_paid: false,
        payment_method: '',
      });
      setError(null);
      fetchRentals();
      fetchAvailableCars();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create rental. Please try again.');
      console.error('Error renting car:', err);
    }
  };

  const handleReturn = async () => {
    if (!selectedRentalId) return;
    try {
      await axios.put(`${API_BASE}/rentals/${selectedRentalId}/return`);
      setSelectedRentalId('');
      setError(null);
      fetchRentals();
      fetchAvailableCars();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to return car. Please try again.');
      console.error('Error returning car:', err);
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
        Rentals
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

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowRentForm(!showRentForm)}
          className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition-colors"
        >
          {showRentForm ? (
            <>
              <XMarkIcon className="h-5 w-5" />
              Cancel
            </>
          ) : (
            <>
              <PlusIcon className="h-5 w-5" />
              Rent Car
            </>
          )}
        </motion.button>

        <div className="flex items-center gap-2">
          <motion.select
            whileHover={{ scale: 1.02 }}
            value={selectedRentalId}
            onChange={(e) => setSelectedRentalId(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
          >
            <option value="">Select Rental to Return</option>
            {rentals
              .filter((r) => !r.end_date || r.end_date >= new Date().toISOString().split('T')[0])
              .map((rental) => (
                <option key={rental.id} value={rental.id}>
                  ID: {rental.id} - Car: {rental.car_id}
                </option>
              ))}
          </motion.select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReturn}
            disabled={!selectedRentalId}
            className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Return Car
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showRentForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleRentSubmit}
            className="mb-8 bg-white p-6 rounded-lg shadow-lg border border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                name="car_id"
                value={formData.car_id}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
                required
              >
                <option value="">Select Car</option>
                {availableCars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.year} {car.make} {car.model} - ${car.price_per_day}/day
                  </option>
                ))}
              </select>
              <select
                name="customer_id"
                value={formData.customer_id}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
                required
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>
              <input
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
                required
              />
              <input
                name="days"
                type="number"
                min="1"
                value={formData.days}
                onChange={handleInputChange}
                placeholder="Number of Days"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              />
              <input
                name="deposit_amount"
                type="number"
                step="0.01"
                value={formData.deposit_amount}
                onChange={handleInputChange}
                placeholder="Deposit Amount"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              />
              <input
                name="payment_method"
                value={formData.payment_method}
                onChange={handleInputChange}
                placeholder="Payment Method"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              />
              <label className="flex items-center gap-2">
                <input
                  name="is_paid"
                  type="checkbox"
                  checked={formData.is_paid}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-gray-800 focus:ring-gray-500"
                />
                <span className="text-gray-700">Paid?</span>
              </label>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="mt-4 flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition-colors"
            >
              <CheckIcon className="h-5 w-5" />
              Rent Car
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
              <th className="p-4 text-left font-semibold">Car ID</th>
              <th className="p-4 text-left font-semibold">Customer ID</th>
              <th className="p-4 text-left font-semibold">Start</th>
              <th className="p-4 text-left font-semibold">End</th>
              <th className="p-4 text-left font-semibold">Cost</th>
              <th className="p-4 text-left font-semibold">Deposit</th>
              <th className="p-4 text-left font-semibold">Paid</th>
              <th className="p-4 text-left font-semibold">Method</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((rental, index) => (
              <motion.tr
                key={rental.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-t border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="p-4 text-gray-600">{rental.id}</td>
                <td className="p-4 text-gray-600">{rental.car_id}</td>
                <td className="p-4 text-gray-600">{rental.customer_id}</td>
                <td className="p-4 text-gray-600">{rental.start_date}</td>
                <td className="p-4 text-gray-600">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rental.end_date ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {rental.end_date || 'Active'}
                  </span>
                </td>
                <td className="p-4 text-gray-600">${(rental.total_cost || 0).toFixed(2)}</td>
                <td className="p-4 text-gray-600">${rental.deposit_amount.toFixed(2)}</td>
                <td className="p-4 text-gray-600">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rental.is_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {rental.is_paid ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="p-4 text-gray-600">{rental.payment_method || 'N/A'}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {rentals.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-gray-500 mt-4 text-center"
        >
          No rentals found.
        </motion.p>
      )}
    </div>
  );
}

export default Rentals;
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { HomeIcon, TruckIcon, UserGroupIcon, DocumentTextIcon, DocumentCurrencyDollarIcon } from '@heroicons/react/24/outline';
import Cars from './pages/Cars.jsx';
import Customers from './pages/Customers.jsx';
import Rentals from './pages/Rentals.jsx';
import Invoices from './pages/Invoices.jsx';

// import logo from "./assets/logo.jpg";

function App() {
  const navItems = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/cars', label: 'Cars', icon: TruckIcon },
    { path: '/customers', label: 'Customers', icon: UserGroupIcon },
    { path: '/rentals', label: 'Rentals', icon: DocumentTextIcon },
    { path: '/invoices', label: 'Invoices', icon: DocumentCurrencyDollarIcon },
  ];

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <motion.nav
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 text-white shadow-lg"
        >
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-[600] tracking-tight">
              AE
            </Link>
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <motion.div
                  key={item.path}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={item.path}
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
            {/* Mobile Menu (Optional) */}
            <div className="md:hidden">
              {/* Add a hamburger menu or similar for mobile if desired */}
            </div>
          </div>
        </motion.nav>

        <div className="container mx-auto p-6">
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
                path="/"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center text-xl text-gray-700"
                  >
                    Welcome! Select a menu item.
                  </motion.div>
                }
              />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
    </Router>
  );
}

export default App;
import { useState, useEffect } from 'react';
import axios from 'axios';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const API_BASE = 'http://localhost:8000';

// Styles for PDF document
const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    padding: 20,
    color: '#000',
  },
  section: {
    marginBottom: 10,
  },
  heading: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  label: {
    fontWeight: 'bold',
  },
  value: {
    marginLeft: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  statusPaid: {
    color: 'green',
    fontWeight: 'bold',
  },
  statusUnpaid: {
    color: 'red',
    fontWeight: 'bold',
  },
});

function InvoicePDF({ invoice }) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.heading}>Invoice</Text>

        <View style={pdfStyles.section}>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>Rental ID:</Text>
            <Text style={pdfStyles.value}>{invoice.rental_id}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>Sale ID:</Text>
            <Text style={pdfStyles.value}>{invoice.sale_id}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>Customer:</Text>
            <Text style={pdfStyles.value}>
              {invoice.customer_name} ({invoice.customer_email})
            </Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>Car:</Text>
            <Text style={pdfStyles.value}>
              {invoice.car_year} {invoice.car_make} {invoice.car_model}
            </Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>Rental Period:</Text>
            <Text style={pdfStyles.value}>
              {invoice.start_date} to {invoice.end_date}
            </Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>Total Cost:</Text>
            <Text style={pdfStyles.value}>${invoice.total_cost.toFixed(2)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>Deposit Paid:</Text>
            <Text style={pdfStyles.value}>${invoice.deposit_amount.toFixed(2)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>Payment Status:</Text>
            <Text
              style={invoice.is_paid ? pdfStyles.statusPaid : pdfStyles.statusUnpaid}
            >
              {invoice.is_paid ? 'Paid' : 'Unpaid'}
            </Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>Payment Method:</Text>
            <Text style={pdfStyles.value}>{invoice.payment_method}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>Sale Date:</Text>
            <Text style={pdfStyles.value}>{invoice.sale_date}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

function Invoices() {
  const [rentals, setRentals] = useState([]);
  const [selectedRentalId, setSelectedRentalId] = useState('');
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompletedRentals();
  }, []);

  const fetchCompletedRentals = async () => {
    try {
      const res = await axios.get(`${API_BASE}/rentals`);
      const completed = res.data.filter((r) => r.end_date);
      setRentals(completed);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch rentals. Please try again.');
      console.error('Error fetching rentals:', err);
    }
  };

  const fetchInvoice = async () => {
    if (!selectedRentalId) return;
    try {
      const res = await axios.get(`${API_BASE}/rentals/${selectedRentalId}/invoice`);
      setInvoice(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate invoice. Please try again.');
      console.error('Error fetching invoice:', err);
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
        Invoices
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
        <motion.select
          whileHover={{ scale: 1.02 }}
          value={selectedRentalId}
          onChange={(e) => setSelectedRentalId(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
        >
          <option value="">Select Completed Rental</option>
          {rentals.map((rental) => (
            <option key={rental.id} value={rental.id}>
              ID: {rental.id} - Car: {rental.car_id}, End: {rental.end_date}
            </option>
          ))}
        </motion.select>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchInvoice}
          disabled={!selectedRentalId}
          className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <DocumentTextIcon className="h-5 w-5" />
          Generate Invoice
        </motion.button>
      </div>

      <AnimatePresence>
        {invoice && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Invoice</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p className="text-gray-600">
                  <span className="font-semibold">Rental ID:</span> {invoice.rental_id}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Sale ID:</span> {invoice.sale_id}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Customer:</span> {invoice.customer_name} (
                  {invoice.customer_email})
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Car:</span> {invoice.car_year} {invoice.car_make}{' '}
                  {invoice.car_model}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Rental Period:</span> {invoice.start_date} to{' '}
                  {invoice.end_date}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Total Cost:</span> $
                  {invoice.total_cost.toFixed(2)}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Deposit Paid:</span> $
                  {invoice.deposit_amount.toFixed(2)}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Payment Status:</span>{' '}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      invoice.is_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {invoice.is_paid ? 'Paid' : 'Unpaid'}
                  </span>
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Payment Method:</span>{' '}
                  {invoice.payment_method}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Sale Date:</span> {invoice.sale_date}
                </p>
              </div>
            </motion.div>

            {/* PDF Download Button */}
            <PDFDownloadLink
              document={<InvoicePDF invoice={invoice} />}
              fileName={`invoice_${invoice.rental_id}.pdf`}
              className="mt-4 inline-block bg-black text-white px-5 py-2 rounded-lg shadow hover:bg-gray-900 transition"
            >
              {({ loading }) => (loading ? 'Preparing PDF...' : 'Download Invoice PDF')}
            </PDFDownloadLink>
          </>
        )}
      </AnimatePresence>

      {rentals.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-gray-500 mt-4 text-center"
        >
          No completed rentals found.
        </motion.p>
      )}
    </div>
  );
}

export default Invoices;

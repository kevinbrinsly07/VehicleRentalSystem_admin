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
    fontSize: 11,
    paddingTop: 28,
    paddingHorizontal: 28,
    paddingBottom: 36,
    color: '#111827',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderBottomStyle: 'solid',
    paddingBottom: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandLeft: { flexDirection: 'row', alignItems: 'center' },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#4F46E5',
    marginRight: 8,
  },
  brandTitle: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  brandSub: { fontSize: 9, color: '#6B7280', marginTop: 2 },

  titleBlock: { textAlign: 'right' },
  docTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  docMeta: { fontSize: 10, color: '#374151', marginTop: 2 },

  sectionRow: { flexDirection: 'row', marginBottom: 12 },
  section: { flex: 1 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 6, color: '#111827' },
  text: { fontSize: 10, color: '#374151', lineHeight: 1.4 },

  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'solid',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 6,
    marginBottom: 12,
  },
  tableRow: { flexDirection: 'row' },
  th: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    borderRightStyle: 'solid',
  },
  td: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 10,
    color: '#111827',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    borderRightStyle: 'solid',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderTopStyle: 'solid',
  },
  colQty: { width: '10%' },
  colDesc: { width: '52%' },
  colRate: { width: '18%', textAlign: 'right' },
  colAmount: { width: '20%', textAlign: 'right' },

  totals: { marginLeft: 'auto', width: '50%' },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totalsLabel: { fontSize: 10, color: '#374151' },
  totalsValue: { fontSize: 10, color: '#111827' },
  totalsStrong: { fontSize: 12, fontWeight: 'bold' },

  notes: { marginTop: 8, fontSize: 9, color: '#6B7280' },

  footer: {
    position: 'absolute',
    bottom: 20,
    left: 28,
    right: 28,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderTopStyle: 'solid',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: { fontSize: 9, color: '#6B7280' },
});

function InvoicePDF({ invoice }) {
  const amount = Number(invoice.total_cost || 0);
  const deposit = Number(invoice.deposit_amount || 0);
  const subtotal = amount;
  const total = amount; // If you add taxes/fees later, adjust here

  const fmt = (n) => `LKR ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Letterhead / Header */}
        <View style={pdfStyles.header}>
          <View style={pdfStyles.brandLeft}>
            <View style={pdfStyles.brandMark} />
            <View>
              <Text style={pdfStyles.brandTitle}>Akalanka Enterprises</Text>
              <Text style={pdfStyles.brandSub}>Vehicle Rentals &amp; Services</Text>
            </View>
          </View>
          <View style={pdfStyles.titleBlock}>
            <Text style={pdfStyles.docTitle}>INVOICE</Text>
            <Text style={pdfStyles.docMeta}>Invoice #: {invoice.sale_id}</Text>
            <Text style={pdfStyles.docMeta}>Date: {invoice.sale_date}</Text>
          </View>
        </View>

        {/* From / To */}
        <View style={pdfStyles.sectionRow}>
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>From</Text>
            <Text style={pdfStyles.text}>Akalanka Enterprises</Text>
            <Text style={pdfStyles.text}>Colombo, Sri Lanka</Text>
            <Text style={pdfStyles.text}>Phone: +94 77 000 0000</Text>
            <Text style={pdfStyles.text}>Email: billing@akalanka.lk</Text>
          </View>
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Bill To</Text>
            <Text style={pdfStyles.text}>{invoice.customer_name}</Text>
            <Text style={pdfStyles.text}>{invoice.customer_email}</Text>
          </View>
        </View>

        {/* Rental summary table */}
        <View style={pdfStyles.table}>
          {/* Header */}
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.th, pdfStyles.colQty]}>Qty</Text>
            <Text style={[pdfStyles.th, pdfStyles.colDesc]}>Description</Text>
            <Text style={[pdfStyles.th, pdfStyles.colRate]}>Rate</Text>
            <Text style={[pdfStyles.th, pdfStyles.colAmount]}>Amount</Text>
          </View>
          {/* Single line item */}
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.td, pdfStyles.colQty]}>1</Text>
            <Text style={[pdfStyles.td, pdfStyles.colDesc]}>
              Car Rental — {invoice.car_year} {invoice.car_make} {invoice.car_model} (Rental #{invoice.rental_id}){"\n"}
              Period: {invoice.start_date} to {invoice.end_date}
            </Text>
            <Text style={[pdfStyles.td, pdfStyles.colRate]}>{fmt(subtotal)}</Text>
            <Text style={[pdfStyles.td, pdfStyles.colAmount]}>{fmt(subtotal)}</Text>
          </View>
        </View>

        {/* Totals */}
        <View style={pdfStyles.totals}>
          <View style={pdfStyles.totalsRow}>
            <Text style={pdfStyles.totalsLabel}>Subtotal</Text>
            <Text style={pdfStyles.totalsValue}>{fmt(subtotal)}</Text>
          </View>
          <View style={pdfStyles.totalsRow}>
            <Text style={pdfStyles.totalsLabel}>Deposit Paid</Text>
            <Text style={pdfStyles.totalsValue}>- {fmt(deposit)}</Text>
          </View>
          <View style={pdfStyles.totalsRow}>
            <Text style={[pdfStyles.totalsLabel, pdfStyles.totalsStrong]}>Total Due</Text>
            <Text style={[pdfStyles.totalsValue, pdfStyles.totalsStrong]}>{fmt(total - deposit)}</Text>
          </View>
        </View>

        {/* Notes */}
        <Text style={pdfStyles.notes}>
          Thank you for choosing Akalanka Enterprises. Please make payment within 7 days of the
          invoice date. For bank transfers, use Invoice #{invoice.sale_id} as the reference.
        </Text>

        {/* Footer */}
        <View style={pdfStyles.footer}>
          <Text style={pdfStyles.footerText}>www.akalanka.lk</Text>
          <Text style={pdfStyles.footerText}>This is a system-generated invoice.</Text>
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
    if (!selectedRentalId) return;
    // Auto-generate (fetch) invoice on selection
    const run = async () => {
      try {
        const res = await axios.get(`${API_BASE}/rentals/${selectedRentalId}/invoice`);
        setInvoice(res.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to generate invoice. Please try again.');
        console.error('Error fetching invoice:', err);
      }
    };
    run();
  }, [selectedRentalId]);

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

  // const fetchInvoice = async () => {
  //   if (!selectedRentalId) return;
  //   try {
  //     const res = await axios.get(`${API_BASE}/rentals/${selectedRentalId}/invoice`);
  //     setInvoice(res.data);
  //     setError(null);
  //   } catch (err) {
  //     setError(err.response?.data?.detail || 'Failed to generate invoice. Please try again.');
  //     console.error('Error fetching invoice:', err);
  //   }
  // };

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

      <div className="flex flex-col gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-0">
          <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
            <table className="min-w-[1000px] w-full">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3 text-left font-semibold w-5">Select</th>
                  <th className="p-3 text-left font-semibold w-14">Rental ID</th>
                  <th className="p-3 text-left font-semibold w-14">Customer Name</th>
                  <th className="p-3 text-left font-semibold w-14">Vehicle</th>
                  <th className="p-3 text-left font-semibold w-14">Start Date</th>
                  <th className="p-3 text-left font-semibold w-14">End Date</th>
                </tr>
              </thead>
              <tbody>
                {rentals.map((rental, index) => {
                  const cust = rental.customer || {};
                  const car = rental.car || {};
                  const carLabel = (car.year || car.make || car.model)
                    ? `${car.year ?? ''} ${car.make ?? ''} ${car.model ?? ''}`.trim()
                    : `Car #${rental.car_id}`;
                  return (
                    <motion.tr
                      key={rental.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.03 }}
                      className={`border-t border-gray-200 transition cursor-pointer ${
                        selectedRentalId === String(rental.id)
                          ? 'bg-gray-100 font-medium'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedRentalId(String(rental.id))}
                      aria-selected={selectedRentalId === String(rental.id)}
                    >
                      <td className="p-3 align-middle">
                        <input
                          type="radio"
                          name="selectedRental"
                          checked={selectedRentalId === String(rental.id)}
                          onChange={() => setSelectedRentalId(String(rental.id))}
                        />
                      </td>
                      <td className="p-3 text-gray-700 align-middle">{rental.id}</td>
                      <td className="p-3 text-gray-700 align-middle truncate">
                        <div className="max-w-[14rem] truncate" title={cust.name || `Customer #${rental.customer_id}` }>
                          {cust.name ? (
                            <span>{cust.name}</span>
                          ) : (
                            <span>Customer #{rental.customer_id}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-gray-700 align-middle truncate">
                        <div className="max-w-[14rem] truncate" title={carLabel}>{carLabel}</div>
                      </td>
                      <td className="p-3 text-gray-700 align-middle whitespace-nowrap">{rental.start_date}</td>
                      <td className="p-3 text-gray-700 align-middle whitespace-nowrap">{rental.end_date}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
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
                  <span className="font-semibold">Total Cost:</span> LKR {invoice.total_cost.toFixed(2)}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Deposit Paid:</span> LKR {invoice.deposit_amount.toFixed(2)}
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
              fileName={`Akalanka_Invoice_${invoice.sale_id}_${invoice.sale_date}.pdf`}
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

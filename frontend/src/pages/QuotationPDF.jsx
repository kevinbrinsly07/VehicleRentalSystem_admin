import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image
} from "@react-pdf/renderer";

import logo from "/logo.jpg";

// --- Brand tokens ---
const BRAND = {
  primary: "#111827", // gray-900
  text: "#1F2937", // gray-800
  subtext: "#6B7280", // gray-500
  border: "#E5E7EB", // gray-200
  softBg: "#F9FAFB", // gray-50
  tableHead: "#F3F4F6", // gray-100
  accent: "#2563EB", // blue-600
};

// --- Styles ---
const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingTop: 28,
    paddingHorizontal: 32,
    paddingBottom: 40,
    color: BRAND.text,
    backgroundColor: "#FFFFFF",
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
    borderBottomStyle: "solid",
    paddingBottom: 12,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandLeft: { flexDirection: "row", alignItems: "center" },
  logo: { width: 64, height: 64, borderRadius: 8, marginRight: 10 },
  brandTitleWrap: { justifyContent: "center" },
  brandTitle: { fontSize: 16, fontWeight: "bold", color: BRAND.primary },
  brandSub: { fontSize: 9, color: BRAND.subtext, marginTop: 2 },

  titleBlock: { textAlign: "right" },
  docBadge: {
    alignSelf: "flex-end",
    fontSize: 9,
    fontWeight: "bold",
    color: "#FFFFFF",
    backgroundColor: BRAND.accent,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    marginBottom: 6,
  },
  docMeta: { fontSize: 10, color: BRAND.subtext, marginTop: 2 },

  sectionRow: { flexDirection: "row", gap: 12, marginBottom: 10 },
  card: {
    flex: 1,
    backgroundColor: BRAND.softBg,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderStyle: "solid",
    borderRadius: 8,
    padding: 10,
  },
  sectionTitle: { fontSize: 11, fontWeight: "bold", color: BRAND.primary, marginBottom: 6 },
  text: { fontSize: 10, color: BRAND.text, lineHeight: 1.4 },

  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: BRAND.border,
    borderStyle: "solid",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 6,
    marginBottom: 12,
  },
  tableRow: { flexDirection: "row" },
  th: {
    backgroundColor: BRAND.tableHead,
    paddingVertical: 7,
    paddingHorizontal: 10,
    fontSize: 10,
    fontWeight: "bold",
    color: BRAND.primary,
    borderRightWidth: 1,
    borderRightColor: BRAND.border,
    borderRightStyle: "solid",
  },
  td: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    fontSize: 10,
    color: BRAND.text,
    borderRightWidth: 1,
    borderRightColor: BRAND.border,
    borderRightStyle: "solid",
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
    borderTopStyle: "solid",
  },
  colQty: { width: "10%" },
  colDesc: { width: "52%" },
  colRate: { width: "18%", textAlign: "right" },
  colAmount: { width: "20%", textAlign: "right" },

  totalsWrap: {
    marginLeft: "auto",
    width: "58%",
  },
  totalsCard: {
    marginLeft: "auto",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BRAND.border,
    borderStyle: "solid",
    borderRadius: 10,
    padding: 10,
  },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  totalsLabel: { fontSize: 10, color: BRAND.subtext },
  totalsValue: { fontSize: 10, color: BRAND.text },
  totalsStrong: { fontSize: 12, fontWeight: "bold", color: BRAND.primary },

  notes: {
    marginTop: 8,
    fontSize: 9,
    color: BRAND.subtext,
    backgroundColor: BRAND.softBg,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderStyle: "solid",
    borderRadius: 8,
    padding: 8,
  },

  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
    borderTopStyle: "solid",
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 9, color: BRAND.subtext },
});

export default function QuotationPDF({ quote }) {
  const items = Array.isArray(quote.items) ? quote.items : [];
  const subtotal = items.reduce((acc, it) => acc + Number(it.amount || it.rate || 0), 0);
  const total = subtotal; // no taxes/fees applied

  const fmt = (n) =>
    `LKR ${Number(n || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header}>
          <View style={pdfStyles.brandLeft}>
            <Image src={logo} style={pdfStyles.logo} />
            <View style={pdfStyles.brandTitleWrap}>
              <Text style={pdfStyles.brandTitle}>Akalanka Enterprises</Text>
              <Text style={pdfStyles.brandSub}>Vehicle Rentals & Services</Text>
              <Text style={pdfStyles.brandSub}>Marawila, Sri Lanka · +94 72 081 5252</Text>
              <Text style={pdfStyles.brandSub}>brinslykevin@gmail.com</Text>
            </View>
          </View>
          <View style={pdfStyles.titleBlock}>
            <Text style={pdfStyles.docBadge}>QUOTATION</Text>
            <Text style={pdfStyles.docMeta}>Quote: #{quote.quote_id || "N/A"}</Text>
            <Text style={pdfStyles.docMeta}>Date: {quote.date || new Date().toISOString().split("T")[0]}</Text>
          </View>
        </View>

        {/* Parties */}
        <View style={pdfStyles.sectionRow}>
          <View style={pdfStyles.card}>
            <Text style={pdfStyles.sectionTitle}>From</Text>
            <Text style={pdfStyles.text}>Akalanka Enterprises</Text>
            <Text style={pdfStyles.text}>Marawila, Sri Lanka</Text>
            <Text style={pdfStyles.text}>Phone: +94 72 081 5252</Text>
            <Text style={pdfStyles.text}>Email: brinslykevin@gmail.com</Text>
          </View>
          <View style={pdfStyles.card}>
            <Text style={pdfStyles.sectionTitle}>Quote For</Text>
            <Text style={pdfStyles.text}>{quote.customer_name}</Text>
            <Text style={pdfStyles.text}>{quote.customer_email}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.th, pdfStyles.colQty]}>Qty</Text>
            <Text style={[pdfStyles.th, pdfStyles.colDesc]}>Description</Text>
            <Text style={[pdfStyles.th, pdfStyles.colRate]}>Rate</Text>
            <Text style={[pdfStyles.th, pdfStyles.colAmount]}>Amount</Text>
          </View>

          {items.map((item, i) => (
            <View
              style={[
                pdfStyles.tableRow,
                { backgroundColor: i % 2 === 0 ? "#FFFFFF" : BRAND.softBg },
              ]}
              key={i}
            >
              <Text style={[pdfStyles.td, pdfStyles.colQty]}>{item.qty}</Text>
              <Text style={[pdfStyles.td, pdfStyles.colDesc]}>{item.desc}</Text>
              <Text style={[pdfStyles.td, pdfStyles.colRate]}>{fmt(item.rate)}</Text>
              <Text style={[pdfStyles.td, pdfStyles.colAmount]}>{fmt(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={pdfStyles.totalsWrap}>
          <View style={pdfStyles.totalsCard}>
            <View style={pdfStyles.totalsRow}>
              <Text style={pdfStyles.totalsLabel}>Subtotal</Text>
              <Text style={pdfStyles.totalsValue}>{fmt(subtotal)}</Text>
            </View>
            <View style={pdfStyles.totalsRow}>
              <Text style={[pdfStyles.totalsLabel, pdfStyles.totalsStrong]}>Estimated Total</Text>
              <Text style={[pdfStyles.totalsValue, pdfStyles.totalsStrong]}>{fmt(total)}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        <Text style={pdfStyles.notes}>
          This quotation is valid for 14 days. Prices are subject to change based on availability
          and final requirements. Please contact us to confirm your booking.
        </Text>

        {/* Footer */}
        <View style={pdfStyles.footer}>
          <Text style={pdfStyles.footerText}>www.akalankaEnterprises.lk</Text>
          <Text style={pdfStyles.footerText}>This is a system-generated quotation.</Text>
        </View>
      </Page>
    </Document>
  );
}
import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import fallbackLogo from "/logo.jpg";

// Helper: read settings saved by Settings page (backend mirrors to localStorage)
function getAppSettings() {
  try {
    const raw = localStorage.getItem("app_settings");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Make styles per-render so we can use dynamic accent from settings
function makePdfStyles(BRAND) {
  return StyleSheet.create({
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

    totalsWrap: { marginLeft: "auto", width: "58%" },
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
}

export default function QuotationPDF({ quote }) {
  const settings = getAppSettings() || {};
  const general = settings.general || {};
  const branding = settings.branding || {};
  const pdf = settings.pdf || {};

  // --- Brand tokens (dynamic) ---
  const BRAND = {
    primary: "#111827",
    text: "#1F2937",
    subtext: "#6B7280",
    border: "#E5E7EB",
    softBg: "#F9FAFB",
    tableHead: "#F3F4F6",
    accent: branding.accent || "#2563EB",
  };

  const styles = makePdfStyles(BRAND);

  const resolveLogo = (u) => {
    if (!u) return fallbackLogo;
    if (typeof u === "string" && u.startsWith("/")) {
      return `http://localhost:8000${u}`;
    }
    return u;
  };
  // Logo can be data URL, absolute URL, or public path; fall back to bundled logo
  const logoSrc = resolveLogo(branding.logoUrl) || fallbackLogo;

  const companyName = general.companyName || "Akalanka Enterprises";
  const companyAddress = general.address || "Marawila, Sri Lanka";
  const companyPhone = general.phone || "+94 72 081 5252";
  const companyEmail = general.email || "brinslykevin@gmail.com";

  const headerBadge = pdf.headerBadge || "QUOTATION";
  const notesDefault = pdf.notesDefault ||
    "This quotation is valid for 14 days. Prices are subject to change based on availability and final requirements. Please contact us to confirm your booking.";
  const footerNote = branding.footerNote || "This is a system-generated quotation.";

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
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandLeft}>
            <Image src={logoSrc} style={styles.logo} />
            <View style={styles.brandTitleWrap}>
              <Text style={styles.brandTitle}>{companyName}</Text>
              <Text style={styles.brandSub}>Vehicle Rentals & Services</Text>
              <Text style={styles.brandSub}>{companyAddress} · {companyPhone}</Text>
              <Text style={styles.brandSub}>{companyEmail}</Text>
            </View>
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.docBadge}>{headerBadge}</Text>
            <Text style={styles.docMeta}>Quote: #{quote.quote_id || "N/A"}</Text>
            <Text style={styles.docMeta}>Date: {quote.date || new Date().toISOString().split("T")[0]}</Text>
          </View>
        </View>

        {/* Parties */}
        <View style={styles.sectionRow}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>From</Text>
            <Text style={styles.text}>{companyName}</Text>
            <Text style={styles.text}>{companyAddress}</Text>
            <Text style={styles.text}>Phone: {companyPhone}</Text>
            <Text style={styles.text}>Email: {companyEmail}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Quote For</Text>
            <Text style={styles.text}>{quote.customer_name}</Text>
            <Text style={styles.text}>{quote.customer_email}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.th, styles.colQty]}>Qty</Text>
            <Text style={[styles.th, styles.colDesc]}>Description</Text>
            <Text style={[styles.th, styles.colRate]}>Rate</Text>
            <Text style={[styles.th, styles.colAmount]}>Amount</Text>
          </View>

          {items.map((item, i) => (
            <View
              style={[
                styles.tableRow,
                { backgroundColor: i % 2 === 0 ? "#FFFFFF" : BRAND.softBg },
              ]}
              key={i}
            >
              <Text style={[styles.td, styles.colQty]}>{item.qty}</Text>
              <Text style={[styles.td, styles.colDesc]}>{item.desc}</Text>
              <Text style={[styles.td, styles.colRate]}>{fmt(item.rate)}</Text>
              <Text style={[styles.td, styles.colAmount]}>{fmt(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsWrap}>
          <View style={styles.totalsCard}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{fmt(subtotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={[styles.totalsLabel, styles.totalsStrong]}>Estimated Total</Text>
              <Text style={[styles.totalsValue, styles.totalsStrong]}>{fmt(total)}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        <Text style={styles.notes}>{notesDefault}</Text>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>www.akalankaEnterprises.lk</Text>
          <Text style={styles.footerText}>{footerNote}</Text>
        </View>
      </Page>
    </Document>
  );
}
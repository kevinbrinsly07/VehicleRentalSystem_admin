// frontend/src/pages/Settings.jsx

import { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

// Stable child components (defined outside to avoid remount + input blur)
const Section = ({ title, children }) => (
  <section className="bg-white border border-gray-200 rounded-xl p-5">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    {children}
  </section>
);

const Label = ({ children }) => (
  <label className="text-sm font-medium text-gray-700">{children}</label>
);

const Input = (props) => (
  <input
    {...props}
    className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 disabled:opacity-50 ${props.className || ""}`}
  />
);

const Switch = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
      checked ? "bg-blue-600" : "bg-gray-300"
    }`}
    aria-pressed={checked}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // App-level settings (client-side; wire up to backend if you add endpoints)
  const [general, setGeneral] = useState({
    companyName: "Akalanka Enterprises",
    email: "brinslykevin@gmail.com",
    phone: "+94 72 081 5252",
    address: "Marawila, Sri Lanka",
    currency: "LKR",
    language: "en",
  });

  const [branding, setBranding] = useState({
    accent: "#2563EB",
    logoUrl: "/logo.jpg", // put your logo in /public
    footerNote: "This is a system-generated document.",
  });

  const [pdf, setPdf] = useState({
    // keep as string so typing works smoothly in a controlled <input type="number"/>
    quoteValidityDays: "14",
    showZebraRows: true,
    showTotalsCard: true,
    headerBadge: "QUOTATION",
    notesDefault:
      "This quotation is valid for 14 days. Prices may change based on availability and final requirements.",
  });

  const [notifications, setNotifications] = useState({
    emailOnInvoice: true,
    emailOnRentalStart: false,
    emailOnRentalEnd: true,
  });

  // Load saved settings from backend first, fallback to localStorage
  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await fetch("http://localhost:8000/settings");
        if (res.ok) {
          const s = await res.json();
          if (!aborted && s) {
            setGeneral(s.general ?? general);
            setBranding(s.branding ?? branding);
            setPdf(s.pdf ?? pdf);
            setNotifications(s.notifications ?? notifications);
            // mirror to localStorage for offline use
            localStorage.setItem("app_settings", JSON.stringify(s));
            setLoaded(true);
            return;
          }
        }
      } catch { /* empty */ }
      // fallback to localStorage
      try {
        const saved = JSON.parse(localStorage.getItem("app_settings"));
        if (!aborted && saved) {
          setGeneral(saved.general ?? general);
          setBranding(saved.branding ?? branding);
          setPdf(saved.pdf ?? pdf);
          setNotifications(saved.notifications ?? notifications);
          setLoaded(true);
        }
      } catch { /* empty */ }
      setLoaded(true);
    })();
    return () => { aborted = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("http://localhost:8000/upload-logo", {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      if (data?.url) {
        const absoluteUrl = data.url.startsWith("http")
          ? data.url
          : `http://localhost:8000${data.url}`;
        setBranding((prev) => ({ ...prev, logoUrl: absoluteUrl }));
        // also mirror to localStorage and backend immediately so PDF uses it right away
        try {
          const currentRaw = localStorage.getItem("app_settings");
          const current = currentRaw ? JSON.parse(currentRaw) : {};
          const next = { ...current, general, branding: { ...branding, logoUrl: absoluteUrl }, pdf, notifications };
          localStorage.setItem("app_settings", JSON.stringify(next));
          // best-effort persist
          fetch("http://localhost:8000/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(next),
          }).catch(() => {});
        } catch { /* empty */ }
      }
    } catch (err) {
      console.error("Logo upload error", err);
    } finally {
      // reset input value so the same file can be re-selected if needed
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      general,
      branding,
      pdf: { ...pdf, quoteValidityDays: Number(pdf.quoteValidityDays || 0) },
      notifications,
    };
    try {
      const res = await fetch("http://localhost:8000/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      localStorage.setItem("app_settings", JSON.stringify(payload));
    } catch (e) {
      console.error("/settings save error", e);
    } finally {
      setTimeout(() => setSaving(false), 600);
    }
  };


  if (!loaded) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Loading settings…</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Settings
        </h1>
        <p className="text-gray-600 mt-1">
          Configure your company, branding, and PDF/quotation defaults.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General */}
        <Section title="General">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Company Name</Label>
              <Input
                value={general.companyName}
                onChange={(e) =>
                  setGeneral({ ...general, companyName: e.target.value })
                }
                placeholder="Company name"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={general.email}
                  onChange={(e) =>
                    setGeneral({ ...general, email: e.target.value })
                  }
                  placeholder="company@email.com"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={general.phone}
                  onChange={(e) =>
                    setGeneral({ ...general, phone: e.target.value })
                  }
                  placeholder="+94 ..."
                />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={general.address}
                onChange={(e) =>
                  setGeneral({ ...general, address: e.target.value })
                }
                placeholder="Street, City, Country"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Currency</Label>
                <Input
                  value={general.currency}
                  onChange={(e) =>
                    setGeneral({ ...general, currency: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Language</Label>
                <Input
                  value={general.language}
                  onChange={(e) =>
                    setGeneral({ ...general, language: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Branding */}
        <Section title="Branding">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Upload Logo</Label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              />
              <p className="text-xs text-gray-500 mt-1">PNG/JPG recommended. Uploaded logo applies to PDFs.</p>
              {branding.logoUrl && (
                <div className="mt-3">
                  <img
                    src={branding.logoUrl}
                    alt="Logo Preview"
                    className="h-16 w-auto rounded border border-gray-200"
                    onError={(e) => (e.currentTarget.style.opacity = 0.2)}
                  />
                </div>
              )}
            </div>
            <div>
              <Label>Footer Note</Label>
              <Input
                value={branding.footerNote}
                onChange={(e) =>
                  setBranding({ ...branding, footerNote: e.target.value })
                }
                placeholder="Shown at bottom of PDFs"
              />
            </div>
          </div>
        </Section>

        {/* PDF / Quotation */}
        <Section title="PDF & Quotation Defaults">
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Header Badge</Label>
                <Input
                  value={pdf.headerBadge}
                  onChange={(e) =>
                    setPdf({ ...pdf, headerBadge: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Quote Validity (days)</Label>
                <Input
                  type="number"
                  min={0}
                  value={pdf.quoteValidityDays}
                  onChange={(e) => {
                    const v = e.target.value;
                    // allow empty string while typing; coerce on save
                    if (v === "" || /^\d+$/.test(v)) {
                      setPdf({ ...pdf, quoteValidityDays: v });
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <Label>Default Notes</Label>
              <textarea
                value={pdf.notesDefault}
                onChange={(e) =>
                  setPdf({ ...pdf, notesDefault: e.target.value })
                }
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={pdf.showZebraRows}
                onChange={(v) => setPdf({ ...pdf, showZebraRows: v })}
              />
              <span className="text-sm text-gray-700">
                Use zebra rows in item tables
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={pdf.showTotalsCard}
                onChange={(v) => setPdf({ ...pdf, showTotalsCard: v })}
              />
              <span className="text-sm text-gray-700">
                Show totals card on right
              </span>
            </div>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                Email customer when invoice is generated
              </span>
              <Switch
                checked={notifications.emailOnInvoice}
                onChange={(v) =>
                  setNotifications({ ...notifications, emailOnInvoice: v })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                Email customer on rental start
              </span>
              <Switch
                checked={notifications.emailOnRentalStart}
                onChange={(v) =>
                  setNotifications({ ...notifications, emailOnRentalStart: v })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                Email customer on rental end
              </span>
              <Switch
                checked={notifications.emailOnRentalEnd}
                onChange={(v) =>
                  setNotifications({ ...notifications, emailOnRentalEnd: v })
                }
              />
            </div>
          </div>
        </Section>
      </div>

      {/* Save Bar */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          onClick={handleSave}
          disabled={!loaded || saving}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/30 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
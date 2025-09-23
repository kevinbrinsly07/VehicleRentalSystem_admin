import React, { useMemo, useState } from "react";

// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";


// tiny helper to read settings for contact details
function useAppSettings() {
  return useMemo(() => {
    try {
      const raw = localStorage.getItem("app_settings");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, []);
}

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white border border-gray-200 rounded-xl p-5 ${className}`}
  >
    {children}
  </div>
);

const HelpNSupport = () => {
  const settings = useAppSettings();
  const company = settings?.general?.companyName || "Akalanka Enterprises";
  const email = settings?.general?.email || "brinslykevin@gmail.com";
  const phone = settings?.general?.phone || "+94 72 081 5252";
  const address = settings?.general?.address || "Marawila, Sri Lanka";

  const [faqOpen, setFaqOpen] = useState(null);
  const [form, setForm] = useState({
    name: "",
    from: "",
    subject: "",
    message: "",
  });
  const [copied, setCopied] = useState(false);

  const mailtoHref = useMemo(() => {
    const s = encodeURIComponent(
      form.subject || `Support request from ${form.name || "customer"}`
    );
    const body = encodeURIComponent(
      `Hi ${company} team,%0D%0A%0D%0A${form.message || ""}%0D%0A%0D%0A— ${
        form.name || ""
      } (${form.from || ""})`
    );
    return `mailto:${email}?subject=${s}&body=${body}`;
  }, [form, email, company]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* empty */
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-8"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Help & Support
          </h1>
          <p className="text-gray-600 mt-1">
            We're here to help. Find answers, troubleshoot issues, or contact
            our team.
          </p>
        </div>
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <Card>
          <div className="flex items-start gap-3">
            <div className="shrink-0 h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
              📧
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Email support</h3>
              <p className="text-sm text-gray-600">{email}</p>
              <div className="mt-3 flex gap-2">
                <a
                  href={`mailto:${email}`}
                  className="text-sm px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
                >
                  Compose
                </a>
                <button
                  onClick={copyEmail}
                  className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  {copied ? "Copied!" : "Copy address"}
                </button>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start gap-3">
            <div className="shrink-0 h-10 w-10 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center">
              💬
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">WhatsApp</h3>
              <p className="text-sm text-gray-600">Chat with us on WhatsApp</p>
              <a
                href={`https://wa.me/${phone.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                Open chat
              </a>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start gap-3">
            <div className="shrink-0 h-10 w-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
              📞
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Call us</h3>
              <p className="text-sm text-gray-600">{phone}</p>
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="mt-3 inline-block text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Call now
              </a>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: FAQ + Troubleshooting */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Frequently Asked Questions
            </h3>
            <div className="divide-y divide-gray-200">
              {[
                {
                  q: "How do I generate a quotation?",
                  a: "Go to Rentals → Create Rental, then use Generate Quotation. You can customize the PDF in Settings → PDF & Quotation Defaults.",
                },
                {
                  q: "My PDF shows the old logo—how do I update it?",
                  a: "Open Settings → Branding → Upload Logo and choose your image. Click Save Changes. Regenerate the PDF and the new logo will appear.",
                },
                {
                  q: "Why do inputs lose focus in Settings?",
                  a: "We fixed that; if you still see it, refresh the page and ensure your browser isn’t autofilling aggressively.",
                },
                {
                  q: "Where are my settings stored?",
                  a: "They are saved in your backend database via the /settings API and mirrored to your browser for offline resilience.",
                },
              ].map((item, idx) => (
                <details
                  key={idx}
                  open={faqOpen === idx}
                  onToggle={(e) => setFaqOpen(e.target.open ? idx : null)}
                  className="py-3"
                >
                  <summary className="cursor-pointer font-medium text-gray-800 list-none flex items-center justify-between">
                    <span>{item.q}</span>
                    <span className="text-gray-400 text-xs">
                      {faqOpen === idx ? "—" : "+"}
                    </span>
                  </summary>
                  <p className="text-sm text-gray-600 mt-2">{item.a}</p>
                </details>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Troubleshooting
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              <li>
                Refresh the page after changing Settings to ensure components
                pick up new values.
              </li>
              <li>
                Verify your logo URL works by opening it in a new tab. If it
                starts with{" "}
                <code className="px-1 bg-gray-100 rounded">/uploads</code>, it
                should resolve to{" "}
                <code className="px-1 bg-gray-100 rounded">
                  http://localhost:8000
                </code>
                .
              </li>
              <li>
                Make sure the backend is running and CORS allows your frontend
                origin.
              </li>
              <li>
                For invoice/quotation issues, confirm the rental has an end date
                and a sale generated.
              </li>
            </ul>
          </Card>
        </div>

        {/* Right: Contact Form & Company Info */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Contact Us
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Your name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Your email
                </label>
                <input
                  value={form.from}
                  onChange={(e) => setForm({ ...form, from: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="jane@example.com"
                  type="email"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="I need help with..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  rows={5}
                  placeholder="Describe the issue or question here..."
                />
              </div>
              <div className="flex gap-2">
                <a
                  href={mailtoHref}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800"
                >
                  Send Email
                </a>
                <a
                  href={`https://wa.me/${phone.replace(
                    /[^\d]/g,
                    ""
                  )}?text=${encodeURIComponent(
                    form.message || "Hi, I need help."
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Company
            </h3>
            <div className="text-sm text-gray-700">
              <p className="font-medium text-gray-900">{company}</p>
              <p>{address}</p>
              <p className="mt-2">Phone: {phone}</p>
              <p>Email: {email}</p>
              <p className="mt-2 text-gray-500">Hours: Mon–Sat 9:00–18:00</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HelpNSupport;

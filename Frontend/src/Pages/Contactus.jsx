import React, { useState } from "react";

const ContactUs = () => {
  const [form, setForm]       = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1500);
  };

  const contacts = [
    { icon: "✉️",  label: "Email",   value: "hello@tradesphere.dev",  color: "#2d7ef7"  },
    { icon: "🐙",  label: "GitHub",  value: "github.com/tradesphere",  color: "#a78bfa"  },
    { icon: "💼",  label: "LinkedIn",value: "linkedin.com/in/tradesphere", color: "#00e5a0" },
  ];

  const faqs = [
    { q: "Is this real money?",         a: "No. TradeSphere uses 100% virtual money. You start with ₹1,00,000 in virtual cash. Nothing is real." },
    { q: "What is Premium?",            a: "Premium users get access to the AI prediction feature — next-day price forecasts with trend classification and confidence scores." },
    { q: "How does the matching engine work?", a: "When the highest buy price meets or exceeds the lowest sell price, our matching engine executes the trade instantly and updates both portfolios live." },
    { q: "Can I lose my virtual money?", a: "Yes — that's the point! Bad trades will reduce your virtual balance, just like a real exchange. This helps you learn risk management." },
  ];

  return (
    <div style={s.root}>
      <div style={s.gridBg} />
      <div style={{ ...s.orb, top: "-100px", left: "-50px", background: "rgba(0,229,160,0.07)" }} />

      <div style={s.container}>

        {/* Header */}
        <div style={s.header}>
          <span style={s.badge}>✉️ Contact Us</span>
          <h1 style={s.title}>
            Get in touch
          </h1>
          <p style={s.subtitle}>
            Have a question, found a bug, or want to suggest a feature? We'd love to hear from you.
          </p>
        </div>

        <div style={s.layout}>

          {/* Left — Form */}
          <div style={s.formWrap}>
            {sent ? (
              <div style={s.successBox}>
                <div style={s.successIcon}>✅</div>
                <h3 style={s.successTitle}>Message sent!</h3>
                <p style={s.successText}>Thanks for reaching out. We'll get back to you within 24 hours.</p>
                <button onClick={() => setSent(false)} style={s.sendAgainBtn}>Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={s.form}>
                <h2 style={s.formTitle}>Send a message</h2>

                <div style={s.row}>
                  <FormField label="Your Name" focused={focused === "name"}>
                    <input
                      name="name" type="text" placeholder="John Doe"
                      value={form.name} onChange={handleChange} required
                      style={{ ...s.input, borderColor: focused === "name" ? "#2d7ef7" : "#1a2540" }}
                      onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                    />
                  </FormField>
                  <FormField label="Email Address" focused={focused === "email"}>
                    <input
                      name="email" type="email" placeholder="you@example.com"
                      value={form.email} onChange={handleChange} required
                      style={{ ...s.input, borderColor: focused === "email" ? "#2d7ef7" : "#1a2540" }}
                      onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                    />
                  </FormField>
                </div>

                <FormField label="Subject" focused={focused === "subject"}>
                  <select
                    name="subject"
                    value={form.subject} onChange={handleChange} required
                    style={{ ...s.input, ...s.select, borderColor: focused === "subject" ? "#2d7ef7" : "#1a2540" }}
                    onFocus={() => setFocused("subject")} onBlur={() => setFocused("")}
                  >
                    <option value="" disabled>Select a subject</option>
                    <option value="bug">🐛 Bug Report</option>
                    <option value="feature">💡 Feature Request</option>
                    <option value="premium">⭐ Premium Enquiry</option>
                    <option value="general">💬 General Question</option>
                    <option value="other">📝 Other</option>
                  </select>
                </FormField>

                <FormField label="Message" focused={focused === "message"}>
                  <textarea
                    name="message" placeholder="Tell us what's on your mind..."
                    value={form.message} onChange={handleChange} required rows={5}
                    style={{ ...s.input, ...s.textarea, borderColor: focused === "message" ? "#2d7ef7" : "#1a2540" }}
                    onFocus={() => setFocused("message")} onBlur={() => setFocused("")}
                  />
                </FormField>

                <button type="submit" disabled={loading} style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}>
                  {loading ? <span style={s.spinner} /> : "Send Message →"}
                </button>
              </form>
            )}
          </div>

          {/* Right — Info */}
          <div style={s.infoCol}>

            {/* Contact cards */}
            <div style={s.infoCard}>
              <h3 style={s.infoTitle}>Other ways to reach us</h3>
              {contacts.map((c) => (
                <div key={c.label} style={s.contactRow}>
                  <div style={{ ...s.contactIcon, background: c.color + "18", border: `1px solid ${c.color}33` }}>
                    {c.icon}
                  </div>
                  <div>
                    <div style={s.contactLabel}>{c.label}</div>
                    <div style={{ ...s.contactValue, color: c.color }}>{c.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* FAQs */}
            <div style={s.faqCard}>
              <h3 style={s.infoTitle}>FAQ</h3>
              {faqs.map((faq, i) => (
                <FaqItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        option { background: #0e1525; color: #e2e8f0; }
      `}</style>
    </div>
  );
};

const FormField = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "7px", flex: 1 }}>
    <label style={{ fontSize: "11.5px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {label}
    </label>
    {children}
  </div>
);

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #1a2540", paddingBottom: "12px", marginBottom: "12px" }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
      >
        <span style={{ fontSize: "13.5px", fontWeight: "500", color: "#e2e8f0" }}>{q}</span>
        <span style={{ color: "#64748b", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none", fontSize: "12px" }}>▾</span>
      </div>
      {open && <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.7", marginTop: "10px" }}>{a}</p>}
    </div>
  );
};

const s = {
  root: {
    minHeight: "100vh", background: "#090e1a",
    fontFamily: "'Poppins', sans-serif",
    position: "relative", overflow: "hidden",
    padding: "60px 24px 80px",
  },
  gridBg: {
    position: "absolute", inset: 0,
    backgroundImage:
      "linear-gradient(rgba(45,126,247,0.03) 1px, transparent 1px)," +
      "linear-gradient(90deg, rgba(45,126,247,0.03) 1px, transparent 1px)",
    backgroundSize: "48px 48px", pointerEvents: "none",
  },
  orb: {
    position: "absolute", borderRadius: "50%",
    filter: "blur(80px)", pointerEvents: "none",
    width: "400px", height: "400px",
  },
  container: { maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 },

  header: { textAlign: "center", marginBottom: "60px" },
  badge: {
    display: "inline-block",
    background: "rgba(45,126,247,0.12)", border: "1px solid rgba(45,126,247,0.25)",
    borderRadius: "100px", color: "#2d7ef7",
    fontSize: "12px", fontWeight: "600", padding: "5px 16px",
    letterSpacing: "0.06em", marginBottom: "20px",
  },
  title: {
    fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "800",
    color: "#e2e8f0", letterSpacing: "-0.03em",
    lineHeight: "1.15", marginBottom: "16px",
  },
  subtitle: { color: "#64748b", fontSize: "16px", maxWidth: "500px", margin: "0 auto", lineHeight: "1.7" },

  layout: { display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "32px", alignItems: "start" },

  /* Form */
  formWrap: {
    background: "#0e1525", border: "1px solid #1a2540",
    borderRadius: "20px", padding: "36px",
  },
  formTitle: { fontSize: "20px", fontWeight: "700", color: "#e2e8f0", marginBottom: "28px", letterSpacing: "-0.02em" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  row:  { display: "flex", gap: "16px" },
  input: {
    width: "100%", background: "#090e1a",
    border: "1px solid", borderRadius: "10px",
    color: "#e2e8f0", fontFamily: "'Poppins', sans-serif",
    fontSize: "14px", padding: "11px 14px",
    outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
  },
  select: { cursor: "pointer", appearance: "none" },
  textarea: { resize: "vertical", minHeight: "120px", lineHeight: "1.6" },
  submitBtn: {
    background: "#2d7ef7", border: "none", borderRadius: "10px",
    color: "#fff", fontFamily: "'Poppins', sans-serif",
    fontSize: "15px", fontWeight: "600", padding: "13px",
    cursor: "pointer", boxShadow: "0 4px 20px rgba(45,126,247,0.35)",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.2s",
  },
  spinner: {
    width: "18px", height: "18px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #fff", borderRadius: "50%",
    display: "inline-block", animation: "spin 0.7s linear infinite",
  },

  /* Success */
  successBox: { textAlign: "center", padding: "48px 24px" },
  successIcon:  { fontSize: "56px", marginBottom: "16px" },
  successTitle: { fontSize: "22px", fontWeight: "700", color: "#e2e8f0", marginBottom: "10px" },
  successText:  { color: "#64748b", fontSize: "14px", lineHeight: "1.7", marginBottom: "24px" },
  sendAgainBtn: {
    background: "transparent", border: "1px solid #1a2540",
    borderRadius: "10px", color: "#94a3b8",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "14px", fontWeight: "500", padding: "10px 20px", cursor: "pointer",
  },

  /* Right col */
  infoCol: { display: "flex", flexDirection: "column", gap: "20px" },
  infoCard: {
    background: "#0e1525", border: "1px solid #1a2540",
    borderRadius: "16px", padding: "24px",
  },
  faqCard: {
    background: "#0e1525", border: "1px solid #1a2540",
    borderRadius: "16px", padding: "24px",
  },
  infoTitle: { fontSize: "16px", fontWeight: "700", color: "#e2e8f0", marginBottom: "20px" },
  contactRow: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" },
  contactIcon: {
    width: "40px", height: "40px", borderRadius: "10px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "18px", flexShrink: 0,
  },
  contactLabel: { fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" },
  contactValue: { fontSize: "13.5px", fontWeight: "500" },
};

export default ContactUs;
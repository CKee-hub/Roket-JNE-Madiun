import { useState, useEffect } from "react";

// ── CREDENTIALS ───────────────────────────────────────────────────────────
const ADMIN_CREDS = { username: "admin", password: "rktmdn2024" };

// ── COLOR PRESETS ─────────────────────────────────────────────────────────
const COLOR_PRESETS = [
  { color: "#92400e", bg: "#fef3c7" },
  { color: "#065f46", bg: "#d1fae5" },
  { color: "#7c2d12", bg: "#ffedd5" },
  { color: "#1e3a5f", bg: "#dbeafe" },
  { color: "#4c1d95", bg: "#ede9fe" },
  { color: "#831843", bg: "#fce7f3" },
];

const HEADER_GRADIENTS = [
  { label: "Coklat Tanah", value: "linear-gradient(160deg,#78350f 0%,#92400e 55%,#b45309 100%)" },
  { label: "Hijau Daun", value: "linear-gradient(160deg,#064e3b 0%,#065f46 55%,#047857 100%)" },
  { label: "Merah Bata", value: "linear-gradient(160deg,#7f1d1d 0%,#991b1b 55%,#b91c1c 100%)" },
  { label: "Biru Langit", value: "linear-gradient(160deg,#1e3a5f 0%,#1e40af 55%,#2563eb 100%)" },
  { label: "Ungu Batik", value: "linear-gradient(160deg,#3b0764 0%,#6b21a8 55%,#7c3aed 100%)" },
  { label: "Abu Elegan", value: "linear-gradient(160deg,#111827 0%,#1f2937 55%,#374151 100%)" },
];

// ── DEFAULT SITE SETTINGS ─────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  brandName: "ROKEAT by JNE Madiun",
  tagline: "Kuliner lokal Madiun, pesan langsung ke merchant",
  headerGradient: HEADER_GRADIENTS[0].value,
  footerText: "Kuliner lokal Madiun · Pesan mudah · langsung ke merchant",
  footerCredit: "Dibuat dengan ❤️ untuk Masyarakat Madiun",
  logoEmoji: "🛵",
  showSearch: true,
  showStats: true,
};

// ── INITIAL MERCHANTS ─────────────────────────────────────────────────────
const INITIAL_MERCHANTS = [
  { id: 1, name: "Warung Bu Sari", tagline: "Masakan Jawa otentik sejak 1995", category: "Masakan Jawa", emoji: "🍛", color: "#92400e", bg: "#fef3c7", phone: "6281234567890", address: "Jl. Pahlawan No. 12, Madiun", jamBuka: "07:00", jamTutup: "20:00", menu: ["Nasi Pecel", "Soto Ayam", "Rawon", "Nasi Jagung"] },
  { id: 2, name: "Mie Ayam Pak Budi", tagline: "Mie kenyal, kuah gurih, bikin nagih", category: "Mie & Bakso", emoji: "🍜", color: "#065f46", bg: "#d1fae5", phone: "6289876543210", address: "Jl. Diponegoro No. 45, Madiun", jamBuka: "08:00", jamTutup: "17:00", menu: ["Mie Ayam", "Bakso Urat", "Mie Goreng", "Pangsit Goreng"] },
  { id: 3, name: "Ayam Geprek Sultan", tagline: "Pedas nampol, harga merakyat", category: "Ayam & Lalapan", emoji: "🍗", color: "#7c2d12", bg: "#ffedd5", phone: "6287654321098", address: "Jl. Ahmad Yani No. 8, Madiun", jamBuka: "10:00", jamTutup: "21:00", menu: ["Ayam Geprek", "Ayam Kremes", "Ayam Bakar", "Es Kelapa Muda"] },
  { id: 4, name: "Es Dawet Pak Joko", tagline: "Segar, manis, legit di setiap tegukan", category: "Minuman & Jajanan", emoji: "🥤", color: "#1e3a5f", bg: "#dbeafe", phone: "6282233445566", address: "Jl. Serayu No. 3, Madiun", jamBuka: "09:00", jamTutup: "17:00", menu: ["Es Dawet", "Es Cendol", "Klepon", "Onde-onde"] },
];

// ── HELPERS ───────────────────────────────────────────────────────────────
function isOpenNow(jamBuka, jamTutup) {
  if (!jamBuka || !jamTutup) return false;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const [bH, bM] = jamBuka.split(":").map(Number);
  const [tH, tM] = jamTutup.split(":").map(Number);
  const buka = bH * 60 + bM, tutup = tH * 60 + tM;
  if (tutup < buka) return cur >= buka || cur < tutup;
  return cur >= buka && cur < tutup;
}
function formatJam(a, b) { return (!a || !b) ? "-" : `${a.replace(":", ".")} – ${b.replace(":", ".")}`; }
function withStatus(ms) { return ms.map(m => ({ ...m, isOpen: isOpenNow(m.jamBuka, m.jamTutup), jam: formatJam(m.jamBuka, m.jamTutup) })); }
function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);
  return now;
}

// ── APP ───────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [rawMerchants, setRawMerchants] = useState(INITIAL_MERCHANTS);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Semua");
  const [adminUser, setAdminUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [toast, setToast] = useState(null);

  const now = useNow();
  const merchants = withStatus(rawMerchants);
  const categories = ["Semua", ...new Set(merchants.map(m => m.category))];
  const filtered = merchants.filter(m => {
    const q = search.toLowerCase();
    return (m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)) &&
      (filterCat === "Semua" || m.category === filterCat);
  });

  const jamStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const jumlahBuka = merchants.filter(m => m.isOpen).length;

  function toast_(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  if (page === "admin" && adminUser) {
    return <AdminPage
      rawMerchants={rawMerchants} setRawMerchants={setRawMerchants}
      settings={settings} setSettings={setSettings}
      now={now} onLogout={() => { setAdminUser(null); setPage("home"); }}
      toast_={toast_} toast={toast}
    />;
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", minHeight: "100vh", background: "#fffbf5", position: "relative", overflowX: "hidden" }}>
      {/* BG BLOBS */}
      <div style={{ position: "fixed", top: "-5%", left: "-5%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle,#fef3c744,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-5%", right: "-5%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle,#d1fae544,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onSuccess={u => { setAdminUser(u); setShowLogin(false); setPage("admin"); }} />}
      {toast && <Toast {...toast} />}

      {/* ── HEADER ── */}
      <header style={{ background: settings.headerGradient, padding: "32px 20px 52px", clipPath: "ellipse(120% 100% at 50% 0%)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 540, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <span style={{ fontSize: 42, filter: "drop-shadow(0 3px 6px rgba(0,0,0,.3))" }}>{settings.logoEmoji}</span>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 900, color: "#fef3c7", letterSpacing: "-0.5px", textShadow: "0 2px 10px rgba(0,0,0,.25)" }}>{settings.brandName}</h1>
              <p style={{ color: "#fde68a", fontSize: 13, opacity: 0.85, marginTop: 2 }}>{settings.tagline}</p>
            </div>
          </div>

          {settings.showSearch && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,.15)", backdropFilter: "blur(10px)", borderRadius: 14, padding: "10px 16px", border: "1px solid rgba(255,255,255,.2)", marginBottom: 16 }}>
              <span style={{ opacity: 0.7 }}>🔍</span>
              <input style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 14 }}
                placeholder="Cari nama warung atau kategori..." value={search}
                onChange={e => { setSearch(e.target.value); setFilterCat("Semua"); }} />
              {search && <button style={{ background: "none", border: "none", color: "rgba(255,255,255,.6)", cursor: "pointer", fontSize: 13 }} onClick={() => setSearch("")}>✕</button>}
            </div>
          )}

          {settings.showStats && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                `🏪 ${merchants.length} Outlet`,
                `● ${jumlahBuka} Buka`,
                `🕐 ${jamStr} WIB`
              ].map((txt, i) => (
                <span key={i} style={{ fontSize: 12, fontWeight: 600, color: "#fef3c7", background: "rgba(255,255,255,.12)", padding: "5px 12px", borderRadius: 20, border: "1px solid rgba(255,255,255,.15)" }}>{txt}</span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ── FILTER KATEGORI ── */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 560, margin: "-16px auto 0", padding: "0 16px 14px", display: "flex", gap: 8, overflowX: "auto" }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px solid", borderColor: filterCat === cat ? "#92400e" : "#e7e0d6", background: filterCat === cat ? "#92400e" : "#fff", color: filterCat === cat ? "#fef3c7" : "#78716c", fontWeight: 600, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            {cat}
          </button>
        ))}
      </div>

      {/* ── LIST ── */}
      <main style={{ position: "relative", zIndex: 1, maxWidth: 560, margin: "0 auto", padding: "0 16px 40px", display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
            <p style={{ fontWeight: 700, color: "#78716c", marginBottom: 4 }}>Warung tidak ditemukan</p>
            <p style={{ fontSize: 13, color: "#a8a29e" }}>Coba kata kunci atau kategori lain</p>
          </div>
        ) : filtered.map((m, i) => <MerchantCard key={m.id} merchant={m} index={i} onSelect={() => setSelected(m)} />)}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ textAlign: "center", padding: "24px 20px 32px", color: "#a8a29e", fontSize: 13, position: "relative", zIndex: 1, borderTop: "1px solid #f0e8de" }}>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>{settings.logoEmoji} {settings.brandName}</p>
        <p style={{ fontSize: 12, opacity: 0.6 }}>{settings.footerText}</p>
        <p style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>{settings.footerCredit}</p>
        <button style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.1, fontSize: 15, display: "block", margin: "14px auto 0" }}
          onClick={() => adminUser ? setPage("admin") : setShowLogin(true)}>⚙️</button>
      </footer>

      {selected && <DetailModal merchant={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ── MERCHANT CARD ─────────────────────────────────────────────────────────
function MerchantCard({ merchant: m, index, onSelect }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onSelect} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "#fff", borderRadius: 18, overflow: "hidden", display: "flex", cursor: "pointer", border: "1px solid #f0e8de", animation: "fadeUp .45s ease both", animationDelay: `${index * 70}ms`, transform: hov ? "translateY(-2px)" : "none", boxShadow: hov ? "0 10px 28px rgba(0,0,0,.10)" : "0 2px 10px rgba(0,0,0,.06)", transition: "transform .2s, box-shadow .2s" }}>
      <div style={{ width: 82, minWidth: 82, display: "flex", alignItems: "center", justifyContent: "center", background: m.bg }}>
        <span style={{ fontSize: 36 }}>{m.emoji}</span>
      </div>
      <div style={{ flex: 1, padding: "14px 14px 14px 10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.6, color: m.color, marginBottom: 2 }}>{m.category}</p>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: "#1c1917", marginBottom: 2 }}>{m.name}</h3>
            <p style={{ fontSize: 12, color: "#78716c" }}>{m.tagline}</p>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0, background: m.isOpen ? "#dcfce7" : "#fee2e2", color: m.isOpen ? "#15803d" : "#dc2626" }}>
            {m.isOpen ? "● Buka" : "○ Tutup"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#a8a29e", marginBottom: 8, flexWrap: "wrap" }}>
          <span>🕐 {m.jam}</span><span>📍 {m.address.split(",")[0]}</span>
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
          {m.menu.slice(0, 3).map(item => <span key={item} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, border: `1px solid ${m.color}55`, color: m.color, fontWeight: 700 }}>{item}</span>)}
          {m.menu.length > 3 && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, border: "1px solid #e5e7eb", color: "#9ca3af" }}>+{m.menu.length - 3} lagi</span>}
        </div>
        <button onClick={e => { e.stopPropagation(); if (m.isOpen) onSelect(); }}
          style={{ width: "100%", padding: "8px", border: "none", borderRadius: 9, fontWeight: 700, fontSize: 13, fontFamily: "'Plus Jakarta Sans',sans-serif", background: m.isOpen ? "#25D366" : "#e5e7eb", color: m.isOpen ? "#fff" : "#9ca3af", cursor: m.isOpen ? "pointer" : "not-allowed" }}>
          {m.isOpen ? "💬 Pesan via WhatsApp" : "⛔ Sedang Tutup"}
        </button>
      </div>
    </div>
  );
}

// ── DETAIL MODAL ──────────────────────────────────────────────────────────
function DetailModal({ merchant: m, onClose }) {
  function bukaWA() {
    const msg = encodeURIComponent(`Halo *${m.name}* 🙏\n\nSaya ingin pesan. Mohon info menu dan ketersediaan ya!`);
    window.open(`https://wa.me/${m.phone}?text=${msg}`, "_blank");
  }
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(28,25,23,.65)", backdropFilter: "blur(5px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "22px 22px 0 0", width: "100%", maxWidth: 560, maxHeight: "92vh", overflowY: "auto", animation: "slideUp .3s ease" }} onClick={e => e.stopPropagation()}>
        <div style={{ background: m.bg, padding: "28px 24px 22px", textAlign: "center", position: "relative", borderRadius: "22px 22px 0 0" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "rgba(0,0,0,.1)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 14, color: "#374151" }}>✕</button>
          <div style={{ fontSize: 54, marginBottom: 10 }}>{m.emoji}</div>
          <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: m.color, marginBottom: 4 }}>{m.category}</p>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 900, color: "#1c1917", marginBottom: 4 }}>{m.name}</h2>
          <p style={{ fontSize: 14, color: "#78716c", marginBottom: 12 }}>{m.tagline}</p>
          <span style={{ fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 20, background: m.isOpen ? "#dcfce7" : "#fee2e2", color: m.isOpen ? "#15803d" : "#dc2626" }}>
            {m.isOpen ? "● Buka Sekarang" : "○ Sedang Tutup"}
          </span>
        </div>
        <div style={{ padding: "18px 20px 36px" }}>
          <div style={{ background: "#f8f4ef", borderRadius: 12, padding: "14px 16px", marginBottom: 18, display: "flex", flexDirection: "column", gap: 8 }}>
            {[["📍", m.address], ["🕐", `Jam buka: ${m.jam}`], ["📱", `+${m.phone}`]].map(([icon, text]) => (
              <div key={icon} style={{ display: "flex", gap: 10, fontSize: 13, color: "#374151" }}><span>{icon}</span><span>{text}</span></div>
            ))}
          </div>
          <p style={{ fontWeight: 700, fontSize: 14, color: "#1c1917", marginBottom: 10 }}>Menu Tersedia</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
            {m.menu.map(item => <div key={item} style={{ background: "#f9fafb", padding: "9px 12px", borderRadius: 8, fontSize: 13, color: "#374151", fontWeight: 500, borderLeft: `3px solid ${m.color}` }}>{item}</div>)}
          </div>
          {m.isOpen ? (
            <button onClick={bukaWA} style={{ width: "100%", padding: "15px", background: "#25D366", color: "#fff", border: "none", borderRadius: 13, fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: "0 4px 16px #25D36640", cursor: "pointer" }}>
              <span style={{ fontSize: 22 }}>💬</span> Pesan via WhatsApp
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 12, padding: "14px 16px" }}>
              <span style={{ fontSize: 20 }}>⛔</span>
              <div>
                <p style={{ fontWeight: 700, color: "#dc2626", marginBottom: 2 }}>Warung Sedang Tutup</p>
                <p style={{ fontSize: 13, color: "#78716c" }}>Buka kembali pukul {m.jamBuka?.replace(":", ".")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── TOAST ─────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  return <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999, padding: "12px 20px", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 14, background: type === "success" ? "#15803d" : "#dc2626", boxShadow: "0 4px 16px rgba(0,0,0,.2)", animation: "fadeUp .3s ease" }}>{msg}</div>;
}

// ── LOGIN MODAL ───────────────────────────────────────────────────────────
function LoginModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  function handleLogin() {
    setLoading(true); setError("");
    setTimeout(() => {
      if (form.username === ADMIN_CREDS.username && form.password === ADMIN_CREDS.password) onSuccess({ username: form.username });
      else setError("Username atau password salah.");
      setLoading(false);
    }, 600);
  }
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(28,25,23,.65)", backdropFilter: "blur(5px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 400, animation: "slideUp .3s ease" }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#78350f,#b45309)", padding: "32px 24px 22px", borderRadius: "20px 20px 0 0", textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🔐</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", color: "#fef3c7", fontSize: 22, marginBottom: 4 }}>Admin Panel</h2>
          <p style={{ color: "#fde68a", fontSize: 13, opacity: 0.85 }}>Masuk untuk kelola website</p>
        </div>
        <div style={{ padding: "24px 24px 32px" }}>
          {[{ k: "username", ph: "Username", type: "text" }, { k: "password", ph: "Password", type: showPass ? "text" : "password" }].map(f => (
            <div key={f.k} style={{ position: "relative" }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5, marginTop: f.k === "password" ? 14 : 0 }}>{f.k === "username" ? "Username" : "Password"}</label>
              <input type={f.type} style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans',sans-serif", paddingRight: f.k === "password" ? 42 : 14 }}
                placeholder={f.ph} value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleLogin()} />
              {f.k === "password" && <button style={{ position: "absolute", right: 10, bottom: 10, background: "none", border: "none", cursor: "pointer", fontSize: 16 }} onClick={() => setShowPass(p => !p)}>{showPass ? "🙈" : "👁️"}</button>}
            </div>
          ))}
          {error && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 8 }}>⚠️ {error}</p>}
          <button onClick={handleLogin} disabled={loading}
            style={{ width: "100%", padding: "13px", background: "#78350f", color: "#fff", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 15, fontFamily: "'Plus Jakarta Sans',sans-serif", marginTop: 20, cursor: "pointer" }}>
            {loading ? "⏳ Memeriksa..." : "Masuk ke Dashboard"}
          </button>
          <p style={{ textAlign: "center", fontSize: 11, color: "#9ca3af", marginTop: 12 }}>Demo: <code>admin</code> / <code>madiun2024</code></p>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN PAGE ────────────────────────────────────────────────────────────
function AdminPage({ rawMerchants, setRawMerchants, settings, setSettings, now, onLogout, toast_, toast }) {
  const [tab, setTab] = useState("merchant"); // "merchant" | "tampilan"
  const [view, setView] = useState("list");
  const [editTarget, setEditTarget] = useState(null);

  const merchants = withStatus(rawMerchants);
  const jamStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  function handleDelete(id) {
    if (!window.confirm("Hapus merchant ini?")) return;
    setRawMerchants(p => p.filter(m => m.id !== id));
    toast_("Merchant dihapus.", "error");
  }

  function handleSave(data) {
    if (editTarget) {
      setRawMerchants(p => p.map(m => m.id === editTarget.id ? { ...editTarget, ...data } : m));
      toast_("✅ Merchant diperbarui!");
    } else {
      setRawMerchants(p => [...p, { id: Date.now(), ...data }]);
      toast_("✅ Merchant baru ditambahkan!");
    }
    setView("list"); setEditTarget(null);
  }

  const tabStyle = (active) => ({
    padding: "8px 18px", border: "none", borderRadius: 8, cursor: "pointer",
    fontWeight: 700, fontSize: 13, fontFamily: "'Plus Jakarta Sans',sans-serif",
    background: active ? "#f59e0b" : "#334155", color: active ? "#1c1917" : "#94a3b8",
    transition: "all .15s",
  });

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", background: "#0f172a", minHeight: "100vh" }}>
      {toast && <Toast {...toast} />}

      {/* NAV */}
      <nav style={{ background: "#1e293b", borderBottom: "1px solid #334155", padding: "13px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>{settings.logoEmoji}</span>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", color: "#fef3c7", fontWeight: 700, fontSize: 16 }}>{settings.brandName}</div>
            <div style={{ color: "#f59e0b", fontSize: 11, fontWeight: 600 }}>Admin Dashboard · 🕐 {jamStr} WIB</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button style={tabStyle(tab === "merchant")} onClick={() => { setTab("merchant"); setView("list"); setEditTarget(null); }}>🏪 Merchant</button>
          <button style={tabStyle(tab === "tampilan")} onClick={() => setTab("tampilan")}>🎨 Tampilan</button>
          {view !== "list" && tab === "merchant" && (
            <button style={{ ...tabStyle(false) }} onClick={() => { setView("list"); setEditTarget(null); }}>← Kembali</button>
          )}
          <button onClick={onLogout} style={{ padding: "8px 14px", background: "#3f0f0f", color: "#fca5a5", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 60px" }}>

        {/* ══ TAB: MERCHANT ══ */}
        {tab === "merchant" && (
          <>
            {view === "list" && (
              <>
                {/* STATS */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
                  {[["🏪", merchants.length, "Total"], ["✅", merchants.filter(m => m.isOpen).length, "Buka"], ["⛔", merchants.filter(m => !m.isOpen).length, "Tutup"]].map(([ic, v, lb]) => (
                    <div key={lb} style={{ background: "#1e293b", borderRadius: 14, padding: "14px 10px", textAlign: "center", border: "1px solid #334155" }}>
                      <div style={{ fontSize: 24 }}>{ic}</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#fef3c7" }}>{v}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{lb}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: "11px 16px", marginBottom: 16, fontSize: 13, color: "#94a3b8" }}>
                  <span style={{ fontSize: 16 }}>⚡</span>
                  Status buka/tutup diperbarui <strong style={{ color: "#f59e0b", marginLeft: 4 }}>otomatis tiap menit</strong> sesuai jam operasional.
                </div>

                <button onClick={() => { setEditTarget(null); setView("add"); }}
                  style={{ width: "100%", padding: "12px", background: "#b45309", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14, fontFamily: "'Plus Jakarta Sans',sans-serif", cursor: "pointer", marginBottom: 16 }}>
                  + Tambah Merchant Baru
                </button>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {merchants.map(m => (
                    <div key={m.id} style={{ background: "#1e293b", borderRadius: 16, padding: "14px", display: "flex", gap: 14, alignItems: "flex-start", border: "1px solid #334155" }}>
                      <div style={{ width: 50, height: 50, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, background: m.bg, flexShrink: 0 }}>{m.emoji}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                          <span style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 15 }}>{m.name}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: m.isOpen ? "#dcfce7" : "#fee2e2", color: m.isOpen ? "#15803d" : "#dc2626" }}>{m.isOpen ? "● Buka" : "○ Tutup"}</span>
                        </div>
                        <p style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>{m.category} · {m.address}</p>
                        <p style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>⏰ {m.jam} · 📱 +{m.phone}</p>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button style={{ padding: "5px 12px", background: "#334155", color: "#cbd5e1", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'Plus Jakarta Sans',sans-serif" }}
                            onClick={() => { setEditTarget(rawMerchants.find(r => r.id === m.id)); setView("edit"); }}>✏️ Edit</button>
                          <button style={{ padding: "5px 12px", background: "#3f0f0f", color: "#fca5a5", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'Plus Jakarta Sans',sans-serif" }}
                            onClick={() => handleDelete(m.id)}>🗑️ Hapus</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {(view === "add" || view === "edit") && (
              <MerchantForm initial={editTarget} onSave={handleSave} onCancel={() => { setView("list"); setEditTarget(null); }} />
            )}
          </>
        )}

        {/* ══ TAB: TAMPILAN ══ */}
        {tab === "tampilan" && (
          <AppearanceEditor settings={settings} setSettings={setSettings} toast_={toast_} />
        )}
      </div>
    </div>
  );
}

// ── APPEARANCE EDITOR ─────────────────────────────────────────────────────
function AppearanceEditor({ settings, setSettings, toast_ }) {
  const [form, setForm] = useState({ ...settings });

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  function handleSave() {
    setSettings(form);
    toast_("✅ Tampilan berhasil diperbarui!");
  }

  function handleReset() {
    setForm({ ...DEFAULT_SETTINGS });
    setSettings({ ...DEFAULT_SETTINGS });
    toast_("Tampilan direset ke default.", "error");
  }

  const aLbl = { display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, marginTop: 18, textTransform: "uppercase", letterSpacing: 0.6 };
  const aInp = { width: "100%", padding: "10px 14px", background: "#0f172a", border: "1.5px solid #334155", borderRadius: 10, color: "#f1f5f9", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans',sans-serif" };

  return (
    <div>
      {/* LIVE PREVIEW */}
      <div style={{ background: "#1e293b", borderRadius: 16, overflow: "hidden", border: "1px solid #334155", marginBottom: 24 }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid #334155", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>
          👁️ Preview Header
        </div>
        <div style={{ background: form.headerGradient, padding: "20px", borderRadius: "0 0 8px 8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 32 }}>{form.logoEmoji}</span>
            <div>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, color: "#fef3c7" }}>{form.brandName || "Nama Brand"}</p>
              <p style={{ color: "#fde68a", fontSize: 12, opacity: 0.85 }}>{form.tagline || "Tagline website..."}</p>
            </div>
          </div>
        </div>
      </div>

      {/* FORM */}
      <div style={{ background: "#1e293b", borderRadius: 16, padding: "20px", border: "1px solid #334155" }}>
        <h3 style={{ color: "#fef3c7", fontFamily: "'Playfair Display',serif", marginBottom: 4, fontSize: 18 }}>🎨 Edit Tampilan Website</h3>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 4 }}>Perubahan langsung tampil di halaman utama.</p>

        <label style={aLbl}>Ikon Logo (Emoji)</label>
        <input style={aInp} placeholder="🛵" value={form.logoEmoji} onChange={e => set("logoEmoji", e.target.value)} />

        <label style={aLbl}>Nama Brand / Judul Website</label>
        <input style={aInp} placeholder="MadiunEats" value={form.brandName} onChange={e => set("brandName", e.target.value)} />

        <label style={aLbl}>Tagline / Subjudul</label>
        <input style={aInp} placeholder="Kuliner lokal Madiun..." value={form.tagline} onChange={e => set("tagline", e.target.value)} />

        <label style={aLbl}>Warna / Tema Header</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 4 }}>
          {HEADER_GRADIENTS.map(g => (
            <div key={g.value} onClick={() => set("headerGradient", g.value)}
              style={{ background: g.value, borderRadius: 10, padding: "14px 10px", textAlign: "center", cursor: "pointer", border: form.headerGradient === g.value ? "2.5px solid #f59e0b" : "2.5px solid transparent", fontSize: 11, fontWeight: 700, color: "#fef3c7", transition: "border .15s" }}>
              {g.label}
              {form.headerGradient === g.value && <div style={{ fontSize: 14, marginTop: 4 }}>✓</div>}
            </div>
          ))}
        </div>

        <label style={aLbl}>Teks Footer Utama</label>
        <input style={aInp} placeholder="Kuliner lokal Madiun..." value={form.footerText} onChange={e => set("footerText", e.target.value)} />

        <label style={aLbl}>Teks Credit Footer</label>
        <input style={aInp} placeholder="Dibuat dengan ❤️ untuk Madiun" value={form.footerCredit} onChange={e => set("footerCredit", e.target.value)} />

        <label style={aLbl}>Tampilkan Elemen</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[["showSearch", "🔍 Kotak pencarian"], ["showStats", "📊 Bar statistik (jumlah outlet, jam)"]].map(([k, label]) => (
            <label key={k} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "10px 14px", background: "#0f172a", borderRadius: 10, border: "1.5px solid #334155" }}>
              <div onClick={() => set(k, !form[k])}
                style={{ width: 42, height: 24, borderRadius: 12, background: form[k] ? "#b45309" : "#334155", position: "relative", transition: "background .2s", cursor: "pointer", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: 3, left: form[k] ? 20 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
              </div>
              <span style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 500 }}>{label}</span>
            </label>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={handleSave}
            style={{ flex: 2, padding: "13px", background: "#b45309", color: "#fff", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 15, fontFamily: "'Plus Jakarta Sans',sans-serif", cursor: "pointer" }}>
            💾 Simpan Tampilan
          </button>
          <button onClick={handleReset}
            style={{ flex: 1, padding: "13px", background: "#1e293b", color: "#94a3b8", border: "1.5px solid #334155", borderRadius: 12, fontWeight: 600, fontSize: 14, fontFamily: "'Plus Jakarta Sans',sans-serif", cursor: "pointer" }}>
            ↺ Reset
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MERCHANT FORM ─────────────────────────────────────────────────────────
function MerchantForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name || "", tagline: initial?.tagline || "",
    category: initial?.category || "", emoji: initial?.emoji || "🍽️",
    phone: initial?.phone || "", address: initial?.address || "",
    jamBuka: initial?.jamBuka || "08:00", jamTutup: initial?.jamTutup || "21:00",
    menu: initial?.menu?.join(", ") || "",
    color: initial?.color || COLOR_PRESETS[0].color,
    bg: initial?.bg || COLOR_PRESETS[0].bg,
  });

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }
  const previewOpen = isOpenNow(form.jamBuka, form.jamTutup);
  const aLbl = { display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, marginTop: 16, textTransform: "uppercase", letterSpacing: 0.6 };
  const aInp = { width: "100%", padding: "10px 14px", background: "#0f172a", border: "1.5px solid #334155", borderRadius: 10, color: "#f1f5f9", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans',sans-serif" };

  function handleSave() {
    if (!form.name.trim() || !form.phone.trim()) { alert("Nama dan No. WA wajib diisi."); return; }
    onSave({ ...form, menu: form.menu.split(",").map(s => s.trim()).filter(Boolean) });
  }

  return (
    <div style={{ background: "#1e293b", borderRadius: 20, padding: "24px", border: "1px solid #334155" }}>
      <h2 style={{ color: "#fef3c7", fontFamily: "'Playfair Display',serif", marginBottom: 20, fontSize: 20 }}>
        {initial ? "✏️ Edit Merchant" : "➕ Tambah Merchant Baru"}
      </h2>

      <label style={aLbl}>Warna Tema Kartu</label>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
        {COLOR_PRESETS.map(p => (
          <div key={p.color} onClick={() => { set("color", p.color); set("bg", p.bg); }}
            style={{ width: 34, height: 34, borderRadius: "50%", background: p.color, cursor: "pointer", border: form.color === p.color ? "3px solid #f59e0b" : "3px solid #1e293b", boxShadow: form.color === p.color ? "0 0 0 2px #f59e0b66" : "none", transition: "all .15s" }} />
        ))}
      </div>

      {/* PREVIEW */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: form.bg, borderLeft: `4px solid ${form.color}`, marginBottom: 4, marginTop: 12 }}>
        <span style={{ fontSize: 28 }}>{form.emoji}</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, color: form.color, fontSize: 14, marginBottom: 2 }}>{form.name || "Nama Outlet"}</p>
          <p style={{ fontSize: 12, color: "#78716c" }}>{form.tagline || "Tagline warung..."}</p>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: previewOpen ? "#dcfce7" : "#fee2e2", color: previewOpen ? "#15803d" : "#dc2626" }}>
          {previewOpen ? "● Buka" : "○ Tutup"}
        </span>
      </div>

      {[["emoji", "Ikon Emoji", "🍛"], ["name", "Nama Outlet *", "Warung Bu Sari"], ["tagline", "Tagline", "Masakan Jawa otentik..."], ["category", "Kategori", "Masakan Jawa"], ["phone", "No. WhatsApp (62xxx) *", "6281234567890"], ["address", "Alamat", "Jl. Pahlawan No. 12, Madiun"]].map(([k, lb, ph]) => (
        <div key={k}>
          <label style={aLbl}>{lb}</label>
          <input style={aInp} placeholder={ph} value={form[k]} onChange={e => set(k, e.target.value)} />
        </div>
      ))}

      <label style={aLbl}>⏰ Jam Operasional (otomatis buka/tutup)</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[["jamBuka", "Jam Buka", "#86efac"], ["jamTutup", "Jam Tutup", "#fca5a5"]].map(([k, lb, clr]) => (
          <div key={k}>
            <label style={{ ...aLbl, marginTop: 0, color: clr, fontSize: 10 }}>{lb}</label>
            <input type="time" style={{ ...aInp, colorScheme: "dark" }} value={form[k]} onChange={e => set(k, e.target.value)} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#64748b", marginTop: 8 }}>
        <span>Jam operasional: <strong style={{ color: "#94a3b8" }}>{formatJam(form.jamBuka, form.jamTutup)}</strong></span>
        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: previewOpen ? "#dcfce7" : "#fee2e2", color: previewOpen ? "#15803d" : "#dc2626" }}>
          {previewOpen ? "Buka" : "Tutup"}
        </span>
      </div>

      <label style={aLbl}>Daftar Menu (pisahkan koma)</label>
      <textarea style={{ ...aInp, height: 80, resize: "vertical", lineHeight: 1.6 }}
        placeholder="Nasi Pecel, Soto Ayam, Rawon" value={form.menu} onChange={e => set("menu", e.target.value)} />

      <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
        <button onClick={handleSave}
          style={{ flex: 2, padding: "13px", background: "#b45309", color: "#fff", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 15, fontFamily: "'Plus Jakarta Sans',sans-serif", cursor: "pointer" }}>
          💾 Simpan
        </button>
        <button onClick={onCancel}
          style={{ flex: 1, padding: "13px", background: "#0f172a", color: "#94a3b8", border: "1.5px solid #334155", borderRadius: 12, fontWeight: 600, fontSize: 14, fontFamily: "'Plus Jakarta Sans',sans-serif", cursor: "pointer" }}>
          Batal
        </button>
      </div>
    </div>
  );
}

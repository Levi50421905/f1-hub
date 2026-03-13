"use client";
// src/components/OnboardingNotif.jsx
// Full screen onboarding — muncul sekali setelah install PWA
// Step 0: Welcome → Step 1: Preview notif → Step 2: Pilih sesi → Step 3: Aktifkan + Test

import { useState, useEffect } from "react";

const SESSION_OPTIONS = [
  { key: "fp1",        label: "Free Practice 1",   icon: "🟡", sprint: false },
  { key: "fp2",        label: "Free Practice 2",   icon: "🟡", sprint: false },
  { key: "sprintQual", label: "Sprint Qualifying", icon: "🟠", sprint: true  },
  { key: "fp3",        label: "Free Practice 3",   icon: "🟡", sprint: false },
  { key: "sprintRace", label: "Sprint Race",        icon: "🟠", sprint: true  },
  { key: "qualifying", label: "Qualifying",         icon: "🔵", sprint: false },
  { key: "race",       label: "Race",               icon: "🏁", sprint: false },
];

const REMINDER_OPTS = [
  { val: 60, label: "1 jam" },
  { val: 30, label: "30 mnt" },
  { val: 15, label: "15 mnt" },
];

const NOTIF_PREVIEWS = [
  {
    color: "#fbbf24",
    title: "Race Week Minggu Depan!",
    body:  "China GP dimulai Jumat, 13 Mar. Siap-siap! 🏁",
    tag:   "7 hari sebelum FP1",
  },
  {
    color: "#3b82f6",
    title: "Qualifying 30 menit lagi!",
    body:  "China GP · Mulai pukul 14:00 WIB",
    tag:   "Reminder sesi",
  },
  {
    color: "#ef4444",
    title: "RACE 15 menit lagi! 🏁",
    body:  "China GP · Mulai pukul 14:00 WIB",
    tag:   "Race reminder",
  },
];

export default function OnboardingNotif({ onDone }) {
  const [visible,     setVisible]     = useState(false);
  const [step,        setStep]        = useState(0);
  const [permission,  setPermission]  = useState("default");
  const [loading,     setLoading]     = useState(false);
  const [testSent,    setTestSent]    = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [previewIdx,  setPreviewIdx]  = useState(0);
  const [raceWeek,    setRaceWeek]    = useState(true);
  const [reminderMins,setReminderMins]= useState(30);
  const [selected,    setSelected]    = useState({
    fp1: false, fp2: false, sprintQual: false,
    fp3: false, sprintRace: false, qualifying: true, race: true,
  });

  useEffect(() => {
    const isPWA =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    const done = localStorage.getItem("f1-notif-onboarded");
    if (isPWA && !done) setTimeout(() => setVisible(true), 500);
    if ("Notification" in window) setPermission(Notification.permission);
  }, []);

  // Auto-rotate preview di step 1
  useEffect(() => {
    if (step !== 1) return;
    const t = setInterval(() => setPreviewIdx(i => (i + 1) % NOTIF_PREVIEWS.length), 2800);
    return () => clearInterval(t);
  }, [step]);

  function toggleSession(key) {
    setSelected(prev => ({ ...prev, [key]: !prev[key] }));
  }

  async function handlePermission() {
    setLoading(true);
    const result = await Notification.requestPermission();
    setPermission(result);
    setLoading(false);
    if (result === "granted" && typeof window.__f1SyncNotif === "function") {
      window.__f1SyncNotif();
    }
  }

  async function handleTestNotif() {
    if (permission !== "granted") return;
    setTestLoading(true);
    await new Promise(r => setTimeout(r, 700));
    new Notification("🏎️ F1 Hub — Test Notifikasi", {
      body: "Notifikasi kamu sudah aktif dan berfungsi dengan baik!",
      icon: "/icons/icon-192.png",
      tag:  "f1-test",
    });
    setTestSent(true);
    setTestLoading(false);
  }

  function saveAndFinish() {
    localStorage.setItem("f1-notif-prefs", JSON.stringify({ sessions: selected, reminderMins, raceWeek }));
    localStorage.setItem("f1-notif-onboarded", "1");
    setVisible(false);
    setTimeout(() => onDone?.(), 350);
  }

  if (!visible) return null;

  const TOTAL = 4;
  const progress = ((step + 1) / TOTAL) * 100;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "#060810",
      display: "flex", flexDirection: "column",
      animation: "obIn 0.3s ease",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      <style>{`
        @keyframes obIn    { from{opacity:0} to{opacity:1} }
        @keyframes obUp    { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes obPop   { 0%{transform:scale(0.75);opacity:0} 60%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
        @keyframes obNtf   { from{transform:translateX(16px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .ob-body  { animation: obUp  0.35s cubic-bezier(.34,1.2,.64,1) both; }
        .ob-icon  { animation: obPop 0.45s cubic-bezier(.34,1.56,.64,1) both; }
        .ob-ntf   { animation: obNtf 0.3s ease both; }
        .ob-sess  { transition: all 0.15s; }
        .ob-sess:active { transform: scale(0.97); }
      `}</style>

      {/* Progress bar */}
      <div style={{ height: 3, background: "#0d1117", flexShrink: 0 }}>
        <div style={{
          height: "100%", borderRadius: "0 2px 2px 0",
          background: "linear-gradient(90deg,#ef4444,#f97316)",
          width: `${progress}%`, transition: "width 0.4s ease",
        }}/>
      </div>

      {/* Skip */}
      <div style={{ padding: "14px 22px 0", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
        <button onClick={saveAndFinish} style={{
          background: "none", border: "none", color: "#4b5563",
          fontSize: 14, cursor: "pointer", fontFamily: "inherit", padding: "4px 8px",
        }}>Lewati</button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 22px 24px" }}>

        {/* ── STEP 0: WELCOME ── */}
        {step === 0 && (
          <div className="ob-body" style={{ paddingTop: 20 }}>
            <div className="ob-icon" style={{ fontSize: 64, textAlign: "center", marginBottom: 22 }}>🏎️</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f9fafb", textAlign: "center", margin: "0 0 12px", lineHeight: 1.25 }}>
              F1 Hub sudah<br/>terpasang!
            </h1>
            <p style={{ fontSize: 14, color: "#6b7280", textAlign: "center", lineHeight: 1.7, margin: "0 0 28px" }}>
              Aktifkan notifikasi supaya kamu tidak ketinggalan satu sesi pun — bahkan saat HP sedang terkunci.
            </p>
            {[
              { icon: "🔕", text: "Tidak butuh app terbuka" },
              { icon: "⏰", text: "Reminder sebelum sesi dimulai" },
              { icon: "🗓️", text: "Ingatkan race week datang" },
            ].map(f => (
              <div key={f.text} style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "#0d1117", borderRadius: 12,
                border: "1px solid #1a2035",
                padding: "12px 14px", marginBottom: 8,
              }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
                <span style={{ fontSize: 14, color: "#d1d5db" }}>{f.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 1: PREVIEW NOTIF ── */}
        {step === 1 && (
          <div className="ob-body" style={{ paddingTop: 12 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f9fafb", margin: "0 0 6px" }}>
              Begini tampilan notifnya
            </h2>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 18px" }}>
              Langsung muncul di notification bar HP kamu.
            </p>

            {/* Preview card */}
            <div style={{
              background: "#0d1117", borderRadius: 16,
              border: "1px solid #1a2035", padding: 16, marginBottom: 18,
            }}>
              <div style={{ fontSize: 10, color: "#374151", letterSpacing: 2, marginBottom: 12, fontFamily: "monospace" }}>
                PREVIEW
              </div>
              {NOTIF_PREVIEWS.map((n, i) => (
                <div key={i} className="ob-ntf" style={{
                  display: i === previewIdx ? "flex" : "none",
                  alignItems: "flex-start", gap: 12,
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                    background: "#ef4444", display: "flex", alignItems: "center",
                    justifyContent: "center", fontWeight: 900, fontSize: 12, color: "#fff",
                  }}>F1</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#f3f4f6", marginBottom: 3 }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.5 }}>{n.body}</div>
                  </div>
                  <div style={{
                    fontSize: 10, color: n.color,
                    background: n.color + "15", border: `1px solid ${n.color}30`,
                    borderRadius: 6, padding: "3px 7px", flexShrink: 0, whiteSpace: "nowrap",
                  }}>{n.tag}</div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 5, marginTop: 14 }}>
                {NOTIF_PREVIEWS.map((_, i) => (
                  <div key={i} onClick={() => setPreviewIdx(i)} style={{
                    width: i === previewIdx ? 18 : 6, height: 6, borderRadius: 3,
                    background: i === previewIdx ? "#ef4444" : "#1f2937",
                    cursor: "pointer", transition: "all 0.25s",
                  }}/>
                ))}
              </div>
            </div>

            {/* 2 tipe */}
            {[
              { icon: "🗓️", color: "#fbbf24", label: "Race Week Reminder", desc: "7 hari sebelum race week — biar bisa plan nonton." },
              { icon: "⏱️", color: "#ef4444", label: "Reminder sesi", desc: "Sebelum FP, Qualifying, Sprint, dan Race. Kamu pilih." },
            ].map(c => (
              <div key={c.label} style={{
                background: "#0d1117", borderRadius: 12,
                border: "1px solid #1a2035", padding: "13px 14px", marginBottom: 8,
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: c.color + "15", border: `1px solid ${c.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                }}>{c.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#f3f4f6", marginBottom: 3 }}>{c.label}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 2: PILIH SESI ── */}
        {step === 2 && (
          <div className="ob-body" style={{ paddingTop: 12 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f9fafb", margin: "0 0 6px" }}>
              Sesi apa saja?
            </h2>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 16px" }}>
              Bisa diubah lagi nanti di halaman race.
            </p>

            {/* Race week toggle */}
            <div onClick={() => setRaceWeek(v => !v)} style={{
              background: raceWeek ? "#fbbf2410" : "#0d1117",
              borderRadius: 12, border: `1px solid ${raceWeek ? "#fbbf2435" : "#1a2035"}`,
              padding: "12px 14px", marginBottom: 10, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s",
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>🗓️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f3f4f6" }}>Race Week Reminder</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>7 hari sebelum race week</div>
              </div>
              <div style={{
                width: 40, height: 22, borderRadius: 11, flexShrink: 0,
                background: raceWeek ? "#fbbf24" : "#374151",
                position: "relative", transition: "background 0.2s",
              }}>
                <div style={{
                  position: "absolute", top: 3, left: raceWeek ? 20 : 3,
                  width: 16, height: 16, borderRadius: "50%",
                  background: "#fff", transition: "left 0.2s",
                }}/>
              </div>
            </div>

            {/* Session grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 14 }}>
              {SESSION_OPTIONS.map(s => {
                const on = selected[s.key];
                return (
                  <button key={s.key} className="ob-sess" onClick={() => toggleSession(s.key)} style={{
                    background: on ? "#ef444412" : "#0d1117",
                    border: `1px solid ${on ? "#ef444440" : "#1a2035"}`,
                    borderRadius: 10, padding: "10px 12px", cursor: "pointer",
                    fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <span style={{ fontSize: 15 }}>{s.icon}</span>
                    <div style={{ textAlign: "left", flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: on ? "#f87171" : "#9ca3af" }}>{s.label}</div>
                      {s.sprint && <div style={{ fontSize: 10, color: "#f97316" }}>Sprint</div>}
                    </div>
                    {on && <span style={{ color: "#ef4444", fontSize: 13 }}>✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Reminder timing */}
            <div style={{ background: "#0d1117", borderRadius: 12, border: "1px solid #1a2035", padding: 13 }}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 9 }}>
                Ingatkan berapa menit sebelum sesi?
              </div>
              <div style={{ display: "flex", gap: 7 }}>
                {REMINDER_OPTS.map(r => (
                  <button key={r.val} onClick={() => setReminderMins(r.val)} style={{
                    flex: 1, padding: "9px 4px", borderRadius: 8,
                    border: `1px solid ${reminderMins === r.val ? "#ef444440" : "#1a2035"}`,
                    background: reminderMins === r.val ? "#ef444412" : "transparent",
                    color: reminderMins === r.val ? "#f87171" : "#6b7280",
                    fontSize: 12, fontWeight: reminderMins === r.val ? 700 : 400,
                    cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                  }}>{r.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: AKTIFKAN + TEST ── */}
        {step === 3 && (
          <div className="ob-body" style={{ paddingTop: 12 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f9fafb", margin: "0 0 6px" }}>
              {permission === "granted" ? "Notifikasi aktif! ✅" : "Aktifkan notifikasi"}
            </h2>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 18px", lineHeight: 1.6 }}>
              {permission === "granted"
                ? "Coba kirim notifikasi test untuk memastikan semuanya berfungsi di HP kamu."
                : "Izinkan F1 Hub mengirim notifikasi — tap tombol di bawah lalu pilih \"Izinkan\"."}
            </p>

            {/* Status */}
            <div style={{
              borderRadius: 14, padding: "14px 16px", marginBottom: 14,
              background: permission === "granted" ? "#052e16" : permission === "denied" ? "#1a0505" : "#0d1117",
              border: `1px solid ${permission === "granted" ? "#166534" : permission === "denied" ? "#7f1d1d" : "#1a2035"}`,
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <span style={{ fontSize: 28 }}>
                {permission === "granted" ? "✅" : permission === "denied" ? "🚫" : "🔔"}
              </span>
              <div>
                <div style={{
                  fontSize: 14, fontWeight: 700, marginBottom: 3,
                  color: permission === "granted" ? "#4ade80" : permission === "denied" ? "#f87171" : "#d1d5db",
                }}>
                  {permission === "granted" ? "Izin diberikan"
                   : permission === "denied"  ? "Notifikasi diblokir"
                   : "Belum ada izin"}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>
                  {permission === "granted"
                   ? "Jadwal notifikasi sudah tersimpan di background."
                   : permission === "denied"
                   ? "Settings HP → Notifikasi → F1 Hub → Aktifkan."
                   : "Tap tombol di bawah untuk memberi izin."}
                </div>
              </div>
            </div>

            {/* TEST NOTIF */}
            {permission === "granted" && (
              <div style={{
                background: "#0d1117", borderRadius: 14,
                border: "1px solid #1a2035", padding: 14, marginBottom: 14,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#d1d5db", marginBottom: 4 }}>
                  Tes notifikasi sekarang
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12, lineHeight: 1.5 }}>
                  Notifikasi akan muncul di HP kamu dalam beberapa detik. Lock screen dulu untuk melihat hasilnya.
                </div>
                <button
                  onClick={handleTestNotif}
                  disabled={testLoading || testSent}
                  style={{
                    width: "100%", padding: "12px", borderRadius: 10,
                    border: `1px solid ${testSent ? "#166534" : "#374151"}`,
                    background: testSent ? "#052e16" : "#111827",
                    color: testSent ? "#4ade80" : testLoading ? "#6b7280" : "#d1d5db",
                    fontSize: 13, fontWeight: 600,
                    cursor: testSent || testLoading ? "default" : "pointer",
                    fontFamily: "inherit", transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  {testLoading
                    ? <><span style={{ animation: "pulse 0.8s infinite" }}>⏳</span> Mengirim...</>
                    : testSent
                    ? "✓ Notifikasi test dikirim!"
                    : "🔔 Kirim notifikasi test"}
                </button>
                {testSent && (
                  <p style={{ fontSize: 11, color: "#16a34a", textAlign: "center", margin: "8px 0 0" }}>
                    Cek notification panel HP kamu ↑
                  </p>
                )}
              </div>
            )}

            {/* Ringkasan */}
            <div style={{ background: "#0d1117", borderRadius: 12, border: "1px solid #1a2035", padding: 13 }}>
              <div style={{ fontSize: 10, color: "#374151", letterSpacing: 2, marginBottom: 10, fontFamily: "monospace" }}>
                RINGKASAN PILIHANMU
              </div>
              <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 2.2 }}>
                <div>🗓️ Race Week: <span style={{ color: raceWeek ? "#4ade80" : "#6b7280" }}>{raceWeek ? "Aktif" : "Nonaktif"}</span></div>
                <div>⏱️ Reminder: <span style={{ color: "#d1d5db" }}>{reminderMins} menit sebelum sesi</span></div>
                <div style={{ lineHeight: 1.6 }}>📋 Sesi: <span style={{ color: "#d1d5db" }}>
                  {SESSION_OPTIONS.filter(s => selected[s.key]).map(s => s.label).join(", ") || "Tidak ada dipilih"}
                </span></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div style={{
        padding: "14px 22px 36px", flexShrink: 0,
        borderTop: "1px solid #0d1117", background: "#060810",
      }}>
        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 14 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              width: i === step ? 22 : 6, height: 6, borderRadius: 3,
              background: i <= step ? "#ef4444" : "#1f2937",
              transition: "all 0.3s",
            }}/>
          ))}
        </div>

        {step < 3 ? (
          <button onClick={() => setStep(s => s + 1)} style={{
            width: "100%", padding: "16px", borderRadius: 14, border: "none",
            background: "linear-gradient(135deg,#ef4444,#dc2626)",
            color: "#fff", fontSize: 15, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            {step === 0 ? "Lihat jenis notifikasi →"
             : step === 1 ? "Pilih sesi →"
             : "Lanjut →"}
          </button>
        ) : permission === "granted" ? (
          <button onClick={saveAndFinish} style={{
            width: "100%", padding: "16px", borderRadius: 14, border: "none",
            background: "linear-gradient(135deg,#16a34a,#15803d)",
            color: "#fff", fontSize: 15, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            Mulai pakai F1 Hub 🏁
          </button>
        ) : (
          <button onClick={handlePermission} disabled={loading || permission === "denied"} style={{
            width: "100%", padding: "16px", borderRadius: 14, border: "none",
            background: permission === "denied" ? "#1f2937" : loading ? "#374151"
              : "linear-gradient(135deg,#ef4444,#dc2626)",
            color: permission === "denied" ? "#6b7280" : "#fff",
            fontSize: 15, fontWeight: 700,
            cursor: permission === "denied" || loading ? "default" : "pointer",
            fontFamily: "inherit",
          }}>
            {loading ? "Menunggu izin..." : permission === "denied" ? "Buka Settings untuk aktifkan" : "🔔 Aktifkan Notifikasi"}
          </button>
        )}
      </div>
    </div>
  );
}
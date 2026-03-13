"use client";
// src/components/NotifSettings.jsx
// Reminder sesi F1 — hanya berfungsi penuh di PWA (installed)
// Di browser biasa: tampil info "install dulu"

import { useState, useEffect } from "react";
import { SCHEDULE_2026 } from "@/lib/schedule2026";

// ─── Helpers ──────────────────────────────────────────────────
function parseUTC(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  try {
    const raw = `${dateStr}T${timeStr}`;
    const clean = raw.endsWith("Z") ? raw : raw + "Z";
    const dt = new Date(clean);
    return isNaN(dt.getTime()) ? null : dt;
  } catch { return null; }
}

function fmtWIB(dt) {
  if (!dt) return "TBA";
  const wib = new Date(dt.getTime() + 7 * 60 * 60 * 1000);
  return wib.toLocaleString("id-ID", {
    weekday: "short", day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }) + " WIB";
}

const SESSION_LABELS = {
  fp1: "Free Practice 1", fp2: "Free Practice 2", fp3: "Free Practice 3",
  qualifying: "Qualifying", race: "RACE",
};
const SESSION_LABELS_SPRINT = {
  fp1: "Free Practice 1", fp2: "Sprint Qualifying", fp3: "Sprint Race",
  qualifying: "Qualifying", race: "RACE",
};
const SESSION_ICONS = {
  fp1: "🟡", fp2: "🟡", fp3: "🟠", qualifying: "🔵", race: "🏁",
};

// ─── Sync ke SW setelah perubahan ────────────────────────────
function triggerSWSync() {
  // Panggil fungsi yang di-expose oleh PWAProvider
  if (typeof window !== "undefined" && window.__f1SyncNotif) {
    window.__f1SyncNotif();
  }
  // Trigger storage event (untuk tab lain)
  window.dispatchEvent(new StorageEvent("storage", {
    key: "f1-reminders",
    newValue: localStorage.getItem("f1-reminders"),
  }));
}

// ════════════════════════════════════════════════════════════
export default function NotifSettings({ race }) {
  const [permission, setPermission] = useState("default");
  const [scheduled, setScheduled]   = useState({});
  const [saved, setSaved]           = useState(false);
  const [isPWA, setIsPWA]           = useState(false);

  useEffect(() => {
    // Cek mode standalone (sudah install)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsPWA(standalone);

    if ("Notification" in window) setPermission(Notification.permission);

    const stored = JSON.parse(localStorage.getItem("f1-reminders") || "{}");
    setScheduled(stored);
  }, []);

  // ── Request permission ────────────────────────────────────
  async function requestPermission() {
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      // Langsung sync jadwal ke SW setelah permission granted
      setTimeout(() => triggerSWSync(), 300);
    }
  }

  // ── Toggle reminder ───────────────────────────────────────
  function toggleReminder(sessionKey, minutesBefore) {
    if (permission !== "granted") return;

    const key = `${race.round}-${sessionKey}-${minutesBefore}`;
    setScheduled((prev) => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = { round: race.round, session: sessionKey, minutesBefore };
      }
      localStorage.setItem("f1-reminders", JSON.stringify(next));
      triggerSWSync(); // kirim ke SW
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return next;
    });
  }

  // ── Toggle race week reminder ─────────────────────────────
  function toggleRaceWeek() {
    if (permission !== "granted") return;

    const key = `raceweek-toggle-${race.round}`;
    setScheduled((prev) => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = { round: race.round, type: "raceweek" };
      }
      localStorage.setItem("f1-reminders", JSON.stringify(next));
      triggerSWSync();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return next;
    });
  }

  if (!race) return null;

  const fb         = SCHEDULE_2026[race.round] || {};
  const isSprint   = !!fb.sprint;
  const labels     = isSprint ? SESSION_LABELS_SPRINT : SESSION_LABELS;
  const sessions   = ["fp1", "fp2", "fp3", "qualifying", "race"].filter((k) => fb[k]);
  const today      = new Date();
  const raceWeekOn = !!scheduled[`raceweek-toggle-${race.round}`];

  // ── FP1 date untuk info race week ────────────────────────
  const fp1Data  = fb.fp1;
  const fp1Time  = fp1Data ? parseUTC(fp1Data.date, fp1Data.time) : null;
  const raceWeekDate = fp1Time ? fmtWIB(fp1Time) : "TBA";

  return (
    <div style={{
      background: "#0d1117", border: "1px solid #1f2937",
      borderRadius: 14, padding: "18px 20px", marginBottom: 20,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: 2, fontFamily: "monospace" }}>
          🔔 REMINDER SESI
        </div>
        {saved && <span style={{ fontSize: 11, color: "#22c55e" }}>✓ Tersimpan</span>}
      </div>

      {/* ── Bukan PWA: tampil info install ── */}
      {!isPWA && (
        <div style={{
          background: "#1a1f2e", border: "1px solid #374151",
          borderRadius: 10, padding: "14px 16px", marginBottom: 14,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
            📱 Install dulu untuk dapat notifikasi
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.6 }}>
            Notifikasi background hanya tersedia setelah F1 Hub diinstall sebagai
            aplikasi di HP kamu. Klik tombol <strong style={{ color: "#ef4444" }}>Install</strong> yang
            muncul di bawah layar.
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: "#4b5563" }}>
            Setelah install → buka F1 Hub dari home screen → aktifkan notifikasi di sini.
          </div>
        </div>
      )}

      {/* ── Sudah PWA: tampil controls ── */}
      {isPWA && (
        <>
          {/* Permission request */}
          {permission === "default" && (
            <div style={{
              background: "#fbbf2410", border: "1px solid #fbbf2430",
              borderRadius: 10, padding: "12px 14px", marginBottom: 14,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ fontSize: 20 }}>🔔</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Aktifkan Notifikasi</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>Izinkan F1 Hub mengirim reminder sesi</div>
              </div>
              <button onClick={requestPermission} style={{
                padding: "7px 14px", borderRadius: 8, border: "none",
                background: "#fbbf24", color: "#000",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit", flexShrink: 0,
              }}>Aktifkan</button>
            </div>
          )}

          {permission === "denied" && (
            <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 14 }}>
              ⚠️ Notifikasi diblokir. Aktifkan di Settings HP → Aplikasi → F1 Hub.
            </div>
          )}

          {/* Race Week Reminder */}
          {fp1Time && fp1Time > today && (
            <div style={{
              background: raceWeekOn ? "#ef444410" : "#111827",
              border: `1px solid ${raceWeekOn ? "#ef444440" : "#1f2937"}`,
              borderRadius: 10, padding: "12px 14px", marginBottom: 14,
              display: "flex", alignItems: "center", gap: 12,
              opacity: permission === "granted" ? 1 : 0.5,
              cursor: permission === "granted" ? "pointer" : "not-allowed",
            }} onClick={toggleRaceWeek}>
              <span style={{ fontSize: 22 }}>🗓️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Race Week Reminder</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>
                  Notif 7 hari sebelum race week dimulai
                </div>
                <div style={{ fontSize: 10, color: "#4b5563", marginTop: 2 }}>
                  FP1: {raceWeekDate}
                </div>
              </div>
              <div style={{
                width: 38, height: 22, borderRadius: 11,
                background: raceWeekOn ? "#ef4444" : "#374151",
                position: "relative", flexShrink: 0, transition: "background 0.2s",
              }}>
                <div style={{
                  position: "absolute", top: 3,
                  left: raceWeekOn ? 19 : 3,
                  width: 16, height: 16, borderRadius: "50%",
                  background: "#fff", transition: "left 0.2s",
                }}/>
              </div>
            </div>
          )}

          {/* Session reminders */}
          <div style={{ display: "grid", gap: 12 }}>
            {sessions.map((sessionKey) => {
              const sData     = fb[sessionKey];
              const sessionDt = parseUTC(sData?.date, sData?.time);
              const sessionDate = sessionDt ? new Date(sessionDt) : null;
              const isPast    = sessionDate && sessionDate < today;
              const icon      = SESSION_ICONS[sessionKey] || "📍";
              const label     = labels[sessionKey] || sessionKey;

              return (
                <div key={sessionKey} style={{ opacity: isPast ? 0.45 : 1 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, marginBottom: 8,
                    display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap",
                  }}>
                    <span>{icon}</span>
                    <span>{label}</span>
                    <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 400 }}>
                      — {sessionDate ? fmtWIB(sessionDate) : "TBA"}
                    </span>
                    {isPast && (
                      <span style={{ fontSize: 10, color: "#22c55e" }}>✓ selesai</span>
                    )}
                  </div>

                  {!isPast && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {[60, 30, 15].map((mins) => {
                        const key   = `${race.round}-${sessionKey}-${mins}`;
                        const isOn  = !!scheduled[key];
                        const canSet = permission === "granted";
                        return (
                          <button
                            key={mins}
                            onClick={() => canSet && toggleReminder(sessionKey, mins)}
                            disabled={!canSet}
                            style={{
                              padding: "5px 12px", borderRadius: 7,
                              cursor: canSet ? "pointer" : "not-allowed",
                              background: isOn ? "#ef444420" : "#1a1f2e",
                              border: `1px solid ${isOn ? "#ef444455" : "#1f2937"}`,
                              color: isOn ? "#ef4444" : "#6b7280",
                              fontSize: 11, fontFamily: "inherit",
                              fontWeight: isOn ? 700 : 400,
                              transition: "all 0.15s",
                            }}
                          >
                            {isOn ? "✓ " : ""}{mins}m sebelum
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {permission === "granted" && (
            <div style={{
              marginTop: 14, fontSize: 11, color: "#374151",
              borderTop: "1px solid #1a1f2e", paddingTop: 12,
            }}>
              ✅ Notifikasi aktif. Jadwal tersimpan di app — tidak perlu buka browser.
            </div>
          )}
        </>
      )}
    </div>
  );
}
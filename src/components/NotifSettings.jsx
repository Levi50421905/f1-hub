"use client";
// src/components/NotifSettings.jsx
// Komponen untuk set reminder sesi F1
// Pakai Web Notifications API — tidak butuh backend

import { useState, useEffect } from "react";
import { SCHEDULE_2026 } from "@/lib/schedule2026";

function toWIB(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  try {
    const raw = `${dateStr}T${timeStr}`;
    const clean = raw.endsWith("Z") ? raw : raw + "Z";
    const dt = new Date(clean);
    return isNaN(dt) ? null : dt; // simpan dalam UTC, display dalam WIB
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
const SESSION_ICONS = {
  fp1: "🟡", fp2: "🟡", fp3: "🟡", qualifying: "🔵", race: "🏁",
};

export default function NotifSettings({ race }) {
  const [permission, setPermission] = useState("default");
  const [scheduled, setScheduled]   = useState({});
  const [saved, setSaved]           = useState(false);

  useEffect(() => {
    if ("Notification" in window) setPermission(Notification.permission);
    // Load saved reminders dari localStorage
    const saved = JSON.parse(localStorage.getItem("f1-reminders") || "{}");
    setScheduled(saved);
  }, []);

  async function requestPermission() {
    const result = await Notification.requestPermission();
    setPermission(result);
  }

  function toggleReminder(sessionKey, minutesBefore) {
    const key = `${race.round}-${sessionKey}-${minutesBefore}`;
    setScheduled(prev => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = { round: race.round, session: sessionKey, minutesBefore };
      }
      localStorage.setItem("f1-reminders", JSON.stringify(next));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return next;
    });
  }

  // Jadwalkan actual notification pakai setTimeout
  useEffect(() => {
    if (permission !== "granted") return;
    const fb = SCHEDULE_2026[race?.round] || {};

    Object.entries(scheduled).forEach(([key, reminder]) => {
      if (reminder.round !== race?.round) return;
      const sData = fb[reminder.session];
      if (!sData) return;

      const sessionTime = toWIB(sData.date, sData.time);
      if (!sessionTime) return;

      const notifTime = new Date(sessionTime.getTime() - reminder.minutesBefore * 60 * 1000);
      const msUntil   = notifTime - new Date();
      if (msUntil < 0 || msUntil > 7 * 24 * 60 * 60 * 1000) return; // max 7 hari ke depan

      const label = SESSION_LABELS[reminder.session] || reminder.session;
      const wibStr = fmtWIB(sessionTime);

      setTimeout(() => {
        new Notification(`F1 Hub — ${label} ${reminder.minutesBefore} menit lagi`, {
          body: `${race?.name}\n${wibStr}`,
          icon: "/icons/icon-192.png",
          tag: key,
        });
      }, msUntil);
    });
  }, [scheduled, permission, race]);

  if (!race) return null;

  const fb       = SCHEDULE_2026[race.round] || {};
  const sessions = ["fp1","fp2","fp3","qualifying","race"].filter(k => fb[k]);
  const today    = new Date();

  return (
    <div style={{
      background: "#0d1117", border: "1px solid #1f2937",
      borderRadius: 14, padding: "18px 20px", marginBottom: 20,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: 2, fontFamily: "monospace" }}>
          🔔 REMINDER SESI
        </div>
        {saved && <span style={{ fontSize: 11, color: "#22c55e" }}>✓ Tersimpan</span>}
      </div>

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
            <div style={{ fontSize: 11, color: "#6b7280" }}>Supaya bisa dapat reminder sebelum sesi dimulai</div>
          </div>
          <button onClick={requestPermission} style={{
            padding: "7px 14px", borderRadius: 8, border: "none",
            background: "#fbbf24", color: "#000",
            fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
          }}>Aktifkan</button>
        </div>
      )}

      {permission === "denied" && (
        <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 14 }}>
          ⚠️ Notifikasi diblokir browser. Aktifkan di Settings browser kamu.
        </div>
      )}

      {/* Session reminders */}
      <div style={{ display: "grid", gap: 10 }}>
        {sessions.map(sessionKey => {
          const sData      = fb[sessionKey];
          const sessionDt  = toWIB(sData?.date, sData?.time);
          const isPast     = sessionDt && sessionDt < today;
          const icon       = SESSION_ICONS[sessionKey] || "📍";
          const label      = SESSION_LABELS[sessionKey] || sessionKey;

          return (
            <div key={sessionKey} style={{ opacity: isPast ? 0.5 : 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <span>{icon}</span>
                <span>{label}</span>
                <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 400 }}>
                  — {fmtWIB(sessionDt)}
                </span>
                {isPast && <span style={{ fontSize: 10, color: "#22c55e" }}>✓ selesai</span>}
              </div>

              {!isPast && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[60, 30, 15].map(mins => {
                    const key     = `${race.round}-${sessionKey}-${mins}`;
                    const isOn    = !!scheduled[key];
                    const canSet  = permission === "granted";
                    return (
                      <button
                        key={mins}
                        onClick={() => canSet && toggleReminder(sessionKey, mins)}
                        disabled={!canSet}
                        style={{
                          padding: "5px 12px", borderRadius: 7, cursor: canSet ? "pointer" : "not-allowed",
                          background: isOn ? "#ef444422" : "#1a1f2e",
                          border: `1px solid ${isOn ? "#ef444455" : "#1f2937"}`,
                          color: isOn ? "#ef4444" : "#6b7280",
                          fontSize: 11, fontFamily: "inherit", fontWeight: isOn ? 700 : 400,
                          transition: "all 0.15s",
                        }}
                      >
                        {isOn ? "✓ " : ""}{mins} menit sebelum
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 14, fontSize: 11, color: "#374151", borderTop: "1px solid #1a1f2e", paddingTop: 12 }}>
        💡 Reminder hanya jalan jika browser/tab masih terbuka. Untuk notif background, install sebagai PWA.
      </div>
    </div>
  );
}

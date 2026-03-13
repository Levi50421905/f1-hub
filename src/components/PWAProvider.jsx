"use client";
// src/components/PWAProvider.jsx
// Handles: PWA install banner + kirim jadwal notifikasi ke Service Worker
// Notifikasi HANYA aktif kalau app diinstall sebagai PWA (standalone mode)

import { useEffect, useState } from "react";
import { SCHEDULE_2026 } from "@/lib/schedule2026";

// ─── Nama race lookup ─────────────────────────────────────────
const RACE_NAMES = {
  1:"Australia GP", 2:"China GP", 3:"Japan GP", 4:"Bahrain GP",
  5:"Saudi Arabia GP", 6:"Miami GP", 7:"Canada GP", 8:"Monaco GP",
  9:"Spain GP", 10:"Austria GP", 11:"Great Britain GP", 12:"Belgium GP",
  13:"Hungary GP", 14:"Netherlands GP", 15:"Italy GP", 16:"Madrid GP",
  17:"Azerbaijan GP", 18:"Singapore GP", 19:"USA GP", 20:"Mexico GP",
  21:"Brazil GP", 22:"Las Vegas GP", 23:"Qatar GP", 24:"Abu Dhabi GP",
};

const SESSION_LABELS = {
  fp1: "Free Practice 1", fp2: "Free Practice 2", fp3: "Free Practice 3",
  qualifying: "Qualifying", race: "RACE 🏁",
};
// Sprint weekend: fp2 = Sprint Qualifying, fp3 = Sprint Race
const SESSION_LABELS_SPRINT = {
  fp1: "Free Practice 1", fp2: "Sprint Qualifying", fp3: "Sprint Race 🏎️",
  qualifying: "Qualifying", race: "RACE 🏁",
};

// ─── Bangun semua jadwal notifikasi dari SCHEDULE_2026 ────────
function buildAllSchedules(savedReminders) {
  const schedules = [];
  const now = Date.now();

  Object.entries(SCHEDULE_2026).forEach(([roundStr, raceData]) => {
    const round = parseInt(roundStr);
    const raceName = RACE_NAMES[round] || `Race R${round}`;
    const isSprint = !!raceData.sprint;
    const labels = isSprint ? SESSION_LABELS_SPRINT : SESSION_LABELS;

    // ── 1. SESSION REMINDERS (dari preferensi user) ──────────
    const sessions = ["fp1", "fp2", "fp3", "qualifying", "race"];
    sessions.forEach((sessionKey) => {
      const sData = raceData[sessionKey];
      if (!sData) return;

      const sessionTime = parseUTC(sData.date, sData.time);
      if (!sessionTime) return;

      // Cek apakah user set reminder untuk sesi ini
      [60, 30, 15].forEach((mins) => {
        const reminderKey = `${round}-${sessionKey}-${mins}`;
        if (!savedReminders[reminderKey]) return;

        const fireAt = sessionTime - mins * 60 * 1000;
        if (fireAt <= now) return; // sudah lewat

        const label = labels[sessionKey] || sessionKey;
        const wibStr = toWIBString(new Date(sessionTime));

        schedules.push({
          key: `notif-${reminderKey}`,
          fireAt,
          title: `🏎️ F1 Hub — ${label} ${mins} menit lagi!`,
          body: `${raceName}\nMulai pukul ${wibStr} WIB`,
          icon: "/icons/icon-192.png",
        });
      });
    });

    // ── 2. RACE WEEK REMINDER (7 hari sebelum FP1) ──────────
    const fp1Data = raceData.fp1;
    if (fp1Data) {
      const fp1Time = parseUTC(fp1Data.date, fp1Data.time);
      if (fp1Time) {
        const fireAt = fp1Time - 7 * 24 * 60 * 60 * 1000; // 7 hari sebelum
        if (fireAt > now) {
          const raceDate = toDateString(new Date(fp1Time));
          schedules.push({
            key: `raceweek-${round}`,
            fireAt,
            title: `🗓️ Race Week Minggu Depan!`,
            body: `${raceName} dimulai ${raceDate}. Siap-siap! 🏁`,
            icon: "/icons/icon-192.png",
          });
        }
      }
    }
  });

  return schedules;
}

// ─── Helpers ──────────────────────────────────────────────────
function parseUTC(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  try {
    const raw = `${dateStr}T${timeStr}`;
    const clean = raw.endsWith("Z") ? raw : raw + "Z";
    const dt = new Date(clean);
    return isNaN(dt.getTime()) ? null : dt.getTime();
  } catch { return null; }
}

function toWIBString(dt) {
  const wib = new Date(dt.getTime() + 7 * 60 * 60 * 1000);
  return wib.toLocaleString("id-ID", {
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

function toDateString(dt) {
  return dt.toLocaleString("id-ID", {
    weekday: "long", day: "numeric", month: "long",
  });
}

// ─── Kirim jadwal ke Service Worker ──────────────────────────
async function syncSchedulesToSW() {
  if (!("serviceWorker" in navigator)) return;

  const reg = await navigator.serviceWorker.ready;
  if (!reg.active) return;

  // Ambil reminders dari localStorage
  const savedReminders = JSON.parse(
    localStorage.getItem("f1-reminders") || "{}"
  );

  const schedules = buildAllSchedules(savedReminders);

  reg.active.postMessage({
    type: "SAVE_SCHEDULES",
    payload: { schedules },
  });
}

// ─── Daftar Periodic Background Sync ─────────────────────────
async function registerPeriodicSync(reg) {
  try {
    const status = await navigator.permissions.query({
      name: "periodic-background-sync",
    });
    if (status.state === "granted") {
      await reg.periodicSync.register("f1-notif-check", {
        minInterval: 60 * 60 * 1000, // 1 jam
      });
    }
  } catch {
    // Periodic sync tidak didukung semua browser — tidak masalah
  }
}

// ════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════
export default function PWAProvider() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showBanner, setShowBanner]       = useState(false);
  const [isPWA, setIsPWA]                 = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || window.navigator.standalone === true;

    setIsPWA(standalone);

    // ── Register Service Worker ──
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(async (reg) => {
          console.log("[PWA] SW registered:", reg.scope);

          // Daftar periodic sync (untuk background check)
          if (standalone) {
            await registerPeriodicSync(reg);
          }

          // Update SW jika ada versi baru
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                newWorker.postMessage("SKIP_WAITING");
                window.location.reload();
              }
            });
          });

          // Kalau sudah PWA: sync jadwal notifikasi ke SW
          if (standalone && Notification.permission === "granted") {
            await syncSchedulesToSW();
            // Trigger cek notifikasi yang mungkin terlewat
            reg.active?.postMessage({ type: "CHECK_NOTIFICATIONS" });
          }
        })
        .catch(console.error);

      // Listen balasan dari SW
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "SCHEDULES_SAVED") {
          console.log("[PWA] Jadwal notifikasi tersimpan di SW ✓");
        }
      });
    }

    // ── Install prompt (hanya kalau bukan standalone) ──
    if (!standalone) {
      const handler = (e) => {
        e.preventDefault();
        setInstallPrompt(e);
        setShowBanner(true);
      };
      window.addEventListener("beforeinstallprompt", handler);
      window.addEventListener("appinstalled", () => {
        setIsPWA(true);
        setShowBanner(false);
      });
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }
  }, []);

  // Re-sync setiap kali localStorage "f1-reminders" berubah
  // (dipanggil dari NotifSettings setelah user toggle reminder)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "f1-reminders" && isPWA) {
        syncSchedulesToSW();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [isPWA]);

  // Expose syncSchedulesToSW ke window supaya NotifSettings bisa panggil
  useEffect(() => {
    window.__f1SyncNotif = syncSchedulesToSW;
    return () => { delete window.__f1SyncNotif; };
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setIsPWA(true);
    setInstallPrompt(null);
    setShowBanner(false);
  }

  if (!showBanner || isPWA) return null;

  return (
    <div style={{
      position: "fixed", bottom: 18, left: "50%",
      transform: "translateX(-50%)", zIndex: 9999,
      width: "calc(100% - 32px)", maxWidth: 420,
      background: "#0f1117", border: "1px solid #ef444444",
      borderRadius: 14, padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: "#ef4444", display: "flex",
        alignItems: "center", justifyContent: "center",
        color: "#fff", fontWeight: 900, fontSize: 18, flexShrink: 0,
      }}>F1</div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>Install F1 Hub</div>
        <div style={{ fontSize: 11, color: "#6b7280" }}>
          Buka dari home screen + notifikasi background
        </div>
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => setShowBanner(false)} style={{
          padding: "6px 10px", borderRadius: 7,
          border: "1px solid #1f2937", background: "transparent",
          color: "#6b7280", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
        }}>Nanti</button>

        <button onClick={handleInstall} style={{
          padding: "6px 14px", borderRadius: 7, border: "none",
          background: "#ef4444", color: "#fff",
          fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
        }}>Install</button>
      </div>
    </div>
  );
}
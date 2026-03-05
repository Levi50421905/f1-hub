"use client";
// src/components/PWAProvider.jsx
// Taruh di layout.jsx: <PWAProvider />
// Handles: service worker registration, install prompt, notifikasi

import { useEffect, useState } from "react";

export default function PWAProvider() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showBanner, setShowBanner]       = useState(false);
  const [installed, setInstalled]         = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        console.log("SW registered:", reg.scope);
      }).catch(console.error);
    }

    // Cek apakah sudah pernah dismiss banner
    const dismissed = localStorage.getItem("pwa-dismissed");
    if (dismissed) return;

    // Tangkap install prompt
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Cek sudah terinstall
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShowBanner(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setShowBanner(false);
    setInstallPrompt(null);
  }

  function handleDismiss() {
    setShowBanner(false);
    localStorage.setItem("pwa-dismissed", "1");
  }

  if (!showBanner || installed) return null;

  return (
    <div style={{
      position: "fixed", bottom: 16, left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999, width: "calc(100% - 32px)", maxWidth: 420,
      background: "#0f1117",
      border: "1px solid #ef444444",
      borderRadius: 14, padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      animation: "slideUp 0.3s ease",
    }}>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateX(-50%) translateY(20px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
      `}</style>

      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
        background: "#ef4444", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#fff",
      }}>F1</div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Install F1 Hub</div>
        <div style={{ fontSize: 11, color: "#6b7280" }}>Buka langsung dari home screen HP kamu</div>
      </div>

      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button onClick={handleDismiss} style={{
          padding: "6px 10px", borderRadius: 7, border: "1px solid #1f2937",
          background: "transparent", color: "#6b7280",
          fontSize: 12, cursor: "pointer", fontFamily: "inherit",
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

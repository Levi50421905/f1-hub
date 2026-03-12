"use client";

import { useEffect, useState } from "react";

export default function PWAProvider() {

  const [installPrompt, setInstallPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {

    // DETECT jika sudah terinstall
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    // REGISTER SERVICE WORKER
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js")
        .then((reg) => {
          console.log("SW registered:", reg.scope);
        })
        .catch(console.error);
    }

    // EVENT INSTALL PROMPT
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // EVENT SETELAH TERINSTALL
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShowBanner(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };

  }, []);

  async function handleInstall() {

    if (!installPrompt) return;

    installPrompt.prompt();

    const { outcome } = await installPrompt.userChoice;

    if (outcome === "accepted") {
      setInstalled(true);
    }

    setInstallPrompt(null);
    setShowBanner(false);

  }

  function handleDismiss() {
    setShowBanner(false);
  }

  if (!showBanner || installed) return null;

  return (

    <div style={{
      position: "fixed",
      bottom: 18,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
      width: "calc(100% - 32px)",
      maxWidth: 420,
      background: "#0f1117",
      border: "1px solid #ef444444",
      borderRadius: 14,
      padding: "14px 16px",
      display: "flex",
      alignItems: "center",
      gap: 12,
      boxShadow: "0 10px 30px rgba(0,0,0,0.6)"
    }}>

      <div style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        background: "#ef4444",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 900,
        fontSize: 18
      }}>
        F1
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>
          Install F1 Hub
        </div>

        <div style={{
          fontSize: 11,
          color: "#6b7280"
        }}>
          Buka langsung dari home screen kamu
        </div>
      </div>

      <div style={{ display: "flex", gap: 6 }}>

        <button
          onClick={handleDismiss}
          style={{
            padding: "6px 10px",
            borderRadius: 7,
            border: "1px solid #1f2937",
            background: "transparent",
            color: "#6b7280",
            fontSize: 12,
            cursor: "pointer"
          }}
        >
          Nanti
        </button>

        <button
          onClick={handleInstall}
          style={{
            padding: "6px 14px",
            borderRadius: 7,
            border: "none",
            background: "#ef4444",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          Install
        </button>

      </div>

    </div>
  );
}
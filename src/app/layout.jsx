// src/app/layout.jsx
import "./globals.css";
import Navbar from "@/components/Navbar";
import PWAProvider from "@/components/PWAProvider";
import AnimatedBg from "@/components/AnimatedBg";
import OnboardingNotif from "@/components/OnboardingNotif";

export const metadata = {
  title: "F1 Hub — Formula One Dashboard",
  description: "Jadwal, klasemen, dan hasil race F1 — update otomatis",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon1.png",
    shortcut: "/icons/icon1.png",
    apple: "/icons/icon1.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "F1 Hub",
  },
  formatDetection: { telephone: false },
};

export const viewport = {
  themeColor: "#ef4444",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body style={{ margin: 0, background: "#0c0e16", color: "#f0f2f8" }}>

        {/* Layer 0 — animated canvas */}
        <AnimatedBg />

        {/* Layer 1 — vignette overlay so text is always readable */}
        <div style={{
          position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
          background: `
            radial-gradient(ellipse 110% 60% at 50% 0%,   rgba(12,14,22,0.15) 0%, rgba(12,14,22,0.6) 100%),
            radial-gradient(ellipse 80%  80% at 0%   100%, rgba(12,14,22,0.35) 0%, transparent 65%),
            radial-gradient(ellipse 80%  80% at 100% 0%,   rgba(12,14,22,0.25) 0%, transparent 65%)
          `,
        }} />

        {/* Layer 2 — content */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <Navbar />
          <main style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "20px 20px 88px",
          }}>
            {children}
          </main>
          <PWAProvider />
          <OnboardingNotif />
        </div>

      </body>
    </html>
  );
}
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
        <AnimatedBg />
        <div style={{ position: "relative", zIndex: 1 }}>
          <Navbar />
          <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px 80px" }}>
            {children}
          </main>
          <PWAProvider />
          <OnboardingNotif />
        </div>
      </body>
    </html>
  );
}
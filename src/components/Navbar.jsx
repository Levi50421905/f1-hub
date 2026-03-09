"use client";
// src/components/Navbar.jsx
// Desktop: top navbar | Mobile: bottom tab bar

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/",            label: "Home",      icon: "🏠" },
  { href: "/standings",   label: "Klasemen",  icon: "🏆" },
  { href: "/schedule",    label: "Kalender",  icon: "📅" },
  { href: "/drivers",     label: "Driver",    icon: "🧑" },
  { href: "/chart",       label: "Grafik",    icon: "📈" },
  { href: "/predict",     label: "Prediksi",  icon: "🎯" },
  { href: "/leaderboard", label: "Skor",      icon: "🏅" },
  { href: "/news",        label: "Berita",    icon: "📰" },
];

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <style>{`
        .desktop-nav { display: flex; }
        .mobile-header { display: none; }
        .mobile-bottom-nav { display: none; }
        .mobile-spacer { display: none; }

        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-header { display: flex !important; }
          .mobile-bottom-nav { display: flex !important; }
          .mobile-spacer { display: block !important; }
        }
      `}</style>

      {/* ── DESKTOP TOP NAVBAR ── */}
      <nav className="desktop-nav" style={{
        background: "#050507",
        borderBottom: "1px solid #1a1f2e",
        padding: "0 24px",
        alignItems: "center",
        gap: 0,
        position: "sticky", top: 0, zIndex: 100,
      }}>
        {/* Logo */}
        <Link href="/" style={{
          textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
          marginRight: 28, padding: "14px 0",
        }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: "#ef4444", fontFamily: "monospace" }}>F1</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#f9fafb", letterSpacing: 1 }}>HUB</span>
        </Link>

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
          {LINKS.map(({ href, label, icon }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href} style={{
                textDecoration: "none",
                padding: "14px 12px",
                fontSize: 13, fontWeight: active ? 700 : 400,
                color: active ? "#ef4444" : "#6b7280",
                borderBottom: `2px solid ${active ? "#ef4444" : "transparent"}`,
                transition: "color 0.15s, border-color 0.15s",
                whiteSpace: "nowrap",
                display: "flex", alignItems: "center", gap: 5,
              }}>
                <span style={{ fontSize: 14 }}>{icon}</span>
                {label}
              </Link>
            );
          })}
        </div>

        {/* Year */}
        <div style={{ fontSize: 11, color: "#374151", fontFamily: "monospace" }}>2026</div>
      </nav>

      {/* ── MOBILE MINI HEADER ── */}
      <div className="mobile-header" style={{
        background: "#050507",
        borderBottom: "1px solid #1a1f2e",
        padding: "10px 16px",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: "#ef4444", fontFamily: "monospace" }}>F1</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#f9fafb", letterSpacing: 1 }}>HUB</span>
        </Link>
        <span style={{ fontSize: 10, color: "#374151", fontFamily: "monospace" }}>2026</span>
      </div>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <nav className="mobile-bottom-nav" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: "#050507",
        borderTop: "1px solid #1a1f2e",
        padding: "8px 0 calc(8px + env(safe-area-inset-bottom))",
        justifyContent: "space-around", alignItems: "center",
      }}>
        {LINKS.map(({ href, label, icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} style={{
              textDecoration: "none",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              padding: "2px 6px", minWidth: 44,
              borderTop: `2px solid ${active ? "#ef4444" : "transparent"}`,
              paddingTop: 6,
            }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span style={{
                fontSize: 9, fontWeight: active ? 700 : 400,
                color: active ? "#ef4444" : "#4b5563",
                letterSpacing: 0.3,
              }}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Spacer for bottom nav */}
      <div className="mobile-spacer" style={{ height: 70 }} />
    </>
  );
}
"use client";
// src/components/Navbar.jsx

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/",          label: "Home",     icon: "🏠" },
  { href: "/standings", label: "Klasemen", icon: "🏆" },
  { href: "/schedule",  label: "Kalender", icon: "📅" },
  { href: "/drivers",   label: "Driver",   icon: "🧑‍✈️" },
  { href: "/chart",     label: "Grafik",   icon: "📈" },
  { href: "/predict",   label: "Prediksi", icon: "🎯" },
];

export default function Navbar() {
  const path = usePathname();

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

      {/* ── Desktop top navbar ── */}
      <nav className="desktop-nav" style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(8,9,15,0.95)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid #1a1f2e",
        padding: "0 20px", height: 56,
        alignItems: "center", gap: 4,
      }}>
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0, marginRight: 12 }}>
          <div style={{ fontWeight: 900, fontSize: 20 }}>
            <span style={{ color: "#ef4444" }}>F1</span>
            <span style={{ color: "#6b7280", fontSize: 12, fontWeight: 400, marginLeft: 5 }}>HUB</span>
          </div>
        </Link>
        <div style={{ display: "flex", gap: 1, flex: 1 }}>
          {NAV.map(n => {
            const active = path === n.href || (n.href !== "/" && path.startsWith(n.href));
            return (
              <Link key={n.href} href={n.href} style={{ textDecoration: "none" }}>
                <div style={{
                  padding: "6px 12px", borderRadius: 8,
                  fontSize: 12, fontWeight: active ? 700 : 500,
                  color: active ? "#ef4444" : "#6b7280",
                  borderBottom: active ? "2px solid #ef4444" : "2px solid transparent",
                  whiteSpace: "nowrap",
                }}>{n.icon} {n.label}</div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Mobile top mini bar ── */}
      <div className="mobile-header" style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(8,9,15,0.97)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid #1a1f2e",
        height: 48, alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontWeight: 900, fontSize: 20 }}>
          <span style={{ color: "#ef4444" }}>F1</span>
          <span style={{ color: "#4b5563", fontSize: 12, fontWeight: 400, marginLeft: 5 }}>HUB · {new Date().getFullYear()}</span>
        </span>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="mobile-bottom-nav" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(8,9,15,0.98)", backdropFilter: "blur(24px)",
        borderTop: "1px solid #1a1f2e",
        height: 60,
        alignItems: "stretch",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}>
        {NAV.map(n => {
          const active = path === n.href || (n.href !== "/" && path.startsWith(n.href));
          return (
            <Link key={n.href} href={n.href} style={{ textDecoration: "none", flex: 1 }}>
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                height: "100%", gap: 2, position: "relative",
              }}>
                {active && (
                  <div style={{
                    position: "absolute", top: 0, left: "20%", right: "20%",
                    height: 2, background: "#ef4444", borderRadius: "0 0 2px 2px",
                  }} />
                )}
                <span style={{ fontSize: 18, lineHeight: 1 }}>{n.icon}</span>
                <span style={{
                  fontSize: 9, fontWeight: active ? 700 : 400,
                  color: active ? "#ef4444" : "#4b5563",
                  letterSpacing: 0.2,
                }}>{n.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Spacer so content not hidden behind bottom nav */}
      <div className="mobile-spacer" style={{ height: 60 }} />
    </>
  );
}

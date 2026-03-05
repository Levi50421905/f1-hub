"use client";
// src/components/Navbar.jsx

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/",         label: "Home",     icon: "🏠" },
  { href: "/standings",label: "Klasemen", icon: "🏆" },
  { href: "/schedule", label: "Kalender", icon: "📅" },
  { href: "/drivers",  label: "Driver",   icon: "🧑‍✈️" },
  { href: "/chart",    label: "Grafik",   icon: "📈" },
  { href: "/predict",  label: "Prediksi", icon: "🎯" },
];

export default function Navbar() {
  const path = usePathname();

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(8,9,15,0.95)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid #1a1f2e",
      padding: "0 20px", height: 56,
      display: "flex", alignItems: "center", gap: 4,
      overflowX: "auto",
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: "none", flexShrink: 0, marginRight: 12 }}>
        <div style={{
          fontFamily: "sans-serif",
          fontWeight: 900, fontSize: 20, letterSpacing: -0.5,
        }}>
          <span style={{ color: "#ef4444" }}>F1</span>
          <span style={{ color: "#6b7280", fontSize: 12, fontWeight: 400, marginLeft: 5 }}>HUB</span>
        </div>
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", gap: 1, flex: 1, overflowX: "auto" }}>
        {NAV.map(n => {
          const active = path === n.href || (n.href !== "/" && path.startsWith(n.href));
          return (
            <Link key={n.href} href={n.href} style={{ textDecoration: "none", flexShrink: 0 }}>
              <div style={{
                padding: "6px 12px", borderRadius: 8,
                fontSize: 12, fontWeight: active ? 700 : 500,
                color: active ? "#ef4444" : "#6b7280",
                borderBottom: active ? "2px solid #ef4444" : "2px solid transparent",
                whiteSpace: "nowrap", transition: "all 0.15s",
              }}>
                {n.icon} {n.label}
              </div>
            </Link>
          );
        })}
      </div>

      <div style={{ fontSize: 10, color: "#1f2937", flexShrink: 0, fontFamily: "monospace" }}>
        {new Date().getFullYear()}
      </div>
    </nav>
  );
}

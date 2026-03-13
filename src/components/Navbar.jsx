"use client";
// src/components/Navbar.jsx

import Link from "next/link";
import { usePathname } from "next/navigation";

// Desktop: all 8 links
const ALL_LINKS = [
  { href: "/",            label: "Home",     icon: "⬡" },
  { href: "/standings",   label: "Klasemen", icon: "⬡" },
  { href: "/schedule",    label: "Kalender", icon: "⬡" },
  { href: "/drivers",     label: "Driver",   icon: "⬡" },
  { href: "/chart",       label: "Grafik",   icon: "⬡" },
  { href: "/predict",     label: "Prediksi", icon: "⬡" },
  { href: "/leaderboard", label: "Skor",     icon: "⬡" },
  { href: "/news",        label: "Berita",   icon: "⬡" },
];

// Mobile bottom: 5 most important only
const MOBILE_LINKS = [
  { href: "/",          label: "Home",     svg: <HomeIcon /> },
  { href: "/standings", label: "Klasemen", svg: <TrophyIcon /> },
  { href: "/schedule",  label: "Kalender", svg: <CalIcon /> },
  { href: "/predict",   label: "Prediksi", svg: <TargetIcon /> },
  { href: "/news",      label: "Berita",   svg: <NewsIcon /> },
];

function HomeIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>;
}
function TrophyIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8,21 16,21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M7 4H17L16 13A5 5 0 017 13L6 4Z"/><path d="M6 6H3V10A3 3 0 006 13"/><path d="M18 6H21V10A3 3 0 0118 13"/></svg>;
}
function CalIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function TargetIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
}
function NewsIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a4 4 0 01-4-4V6"/><line x1="10" y1="7" x2="18" y2="7"/><line x1="10" y1="11" x2="18" y2="11"/><line x1="10" y1="15" x2="14" y2="15"/></svg>;
}

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (href) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <style>{`
        .desktop-nav  { display: flex; }
        .mobile-bar   { display: none; }
        .mobile-nav   { display: none; }
        .mobile-space { display: none; }

        @media (max-width: 640px) {
          .desktop-nav  { display: none !important; }
          .mobile-bar   { display: flex !important; }
          .mobile-nav   { display: flex !important; }
          .mobile-space { display: block !important; }
        }

        .nav-link {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 8px;
          font-size: 13px; font-weight: 500;
          color: var(--text-muted);
          text-decoration: none;
          transition: all 0.15s ease;
          white-space: nowrap;
          font-family: 'Outfit', sans-serif;
        }
        .nav-link:hover { color: var(--text-secondary); background: var(--bg-raised); }
        .nav-link.active { color: var(--text-primary); background: var(--bg-raised); font-weight: 600; }
        .nav-link.active::after {
          content: ''; position: absolute; bottom: -1px; left: 12px; right: 12px;
          height: 2px; background: var(--red); border-radius: 2px 2px 0 0;
        }

        .mob-tab {
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          flex: 1; padding: 10px 4px 6px;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.15s;
          position: relative;
        }
        .mob-tab.active { color: var(--red); }
        .mob-tab.active::before {
          content: ''; position: absolute; top: 0; left: 25%; right: 25%;
          height: 2px; background: var(--red); border-radius: 0 0 3px 3px;
        }
        .mob-tab-label {
          font-size: 10px; font-weight: 500; letter-spacing: 0.2px;
          font-family: 'Outfit', sans-serif;
        }
      `}</style>

      {/* ── DESKTOP NAV ── */}
      <nav className="desktop-nav" style={{
        background: "rgba(12, 14, 22, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 28px",
        alignItems: "center",
        position: "sticky", top: 0, zIndex: 200,
        height: 52,
      }}>
        {/* Logo */}
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: 2,
          marginRight: 32, textDecoration: "none", flexShrink: 0,
        }}>
          <span style={{
            fontSize: 20, fontWeight: 900, color: "var(--red)",
            fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: -0.5, lineHeight: 1,
          }}>F1</span>
          <span style={{
            fontSize: 14, fontWeight: 700, color: "var(--text-primary)",
            letterSpacing: 2, fontFamily: "'Barlow Condensed', sans-serif",
          }}>HUB</span>
        </Link>

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, position: "relative" }}>
          {ALL_LINKS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href} className={`nav-link${active ? " active" : ""}`}
                style={{ position: "relative" }}>
                {label}
              </Link>
            );
          })}
        </div>

        {/* Season badge */}
        <div style={{
          fontSize: 11, fontWeight: 700,
          color: "var(--text-muted)",
          background: "var(--bg-raised)",
          border: "1px solid var(--border)",
          borderRadius: 6, padding: "3px 8px",
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: 1,
        }}>2026</div>
      </nav>

      {/* ── MOBILE TOP BAR ── */}
      <div className="mobile-bar" style={{
        background: "rgba(12, 14, 22, 0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 18px",
        alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 200, height: 52,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 2, textDecoration: "none" }}>
          <span style={{ fontSize: 19, fontWeight: 900, color: "var(--red)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: -0.5 }}>F1</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", letterSpacing: 2, fontFamily: "'Barlow Condensed', sans-serif" }}>HUB</span>
        </Link>
        <div style={{
          fontSize: 10, fontWeight: 700, color: "var(--text-muted)",
          background: "var(--bg-raised)", border: "1px solid var(--border)",
          borderRadius: 5, padding: "2px 7px",
          fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1,
        }}>2026</div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="mobile-nav" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
        background: "rgba(12, 14, 22, 0.97)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid var(--border)",
        paddingBottom: "env(safe-area-inset-bottom)",
        justifyContent: "stretch", alignItems: "stretch",
      }}>
        {MOBILE_LINKS.map(({ href, label, svg }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} className={`mob-tab${active ? " active" : ""}`}>
              {svg}
              <span className="mob-tab-label">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mobile-space" style={{ height: 64 }} />
    </>
  );
}
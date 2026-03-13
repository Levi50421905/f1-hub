"use client";
// src/components/Navbar.jsx

import Link from "next/link";
import { usePathname } from "next/navigation";

const ALL_LINKS = [
  { href: "/",            label: "Home"     },
  { href: "/standings",   label: "Klasemen" },
  { href: "/schedule",    label: "Kalender" },
  { href: "/drivers",     label: "Driver"   },
  { href: "/chart",       label: "Grafik"   },
  { href: "/predict",     label: "Prediksi" },
  { href: "/leaderboard", label: "Skor"     },
  { href: "/news",        label: "Berita"   },
];

const MOBILE_LINKS = [
  { href: "/",          label: "Home",     icon: <HomeIcon />    },
  { href: "/standings", label: "Klasemen", icon: <TrophyIcon />  },
  { href: "/schedule",  label: "Kalender", icon: <CalIcon />     },
  { href: "/predict",   label: "Prediksi", icon: <TargetIcon />  },
  { href: "/news",      label: "Berita",   icon: <NewsIcon />    },
];

function HomeIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>;
}
function TrophyIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8,21 16,21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M7 4H17L16 13A5 5 0 017 13L6 4Z"/><path d="M6 6H3V10A3 3 0 006 13"/><path d="M18 6H21V10A3 3 0 0118 13"/></svg>;
}
function CalIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function TargetIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
}
function NewsIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a4 4 0 01-4-4V6"/><line x1="10" y1="7" x2="18" y2="7"/><line x1="10" y1="11" x2="18" y2="11"/><line x1="10" y1="15" x2="14" y2="15"/></svg>;
}

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (href) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* ── DESKTOP NAV ── */}
      <nav className="desktop-nav" style={{
        background: "rgba(12,14,22,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 28px",
        alignItems: "center",
        position: "sticky", top: 0, zIndex: 200,
        height: 52,
      }}>
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:2, marginRight:32, textDecoration:"none", flexShrink:0 }}>
          <span style={{ fontSize:20, fontWeight:900, color:"var(--red)", fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:-0.5, lineHeight:1 }}>F1</span>
          <span style={{ fontSize:14, fontWeight:700, color:"var(--text-primary)", letterSpacing:2, fontFamily:"'Barlow Condensed',sans-serif" }}>HUB</span>
        </Link>
        <div style={{ display:"flex", alignItems:"center", gap:2, flex:1, position:"relative" }}>
          {ALL_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={`nav-link${isActive(href) ? " active" : ""}`} style={{ position:"relative" }}>
              {label}
            </Link>
          ))}
        </div>
        <div style={{ fontSize:11, fontWeight:700, color:"var(--text-muted)", background:"var(--bg-raised)", border:"1px solid var(--border)", borderRadius:6, padding:"3px 8px", fontFamily:"'JetBrains Mono',monospace", letterSpacing:1 }}>2026</div>
      </nav>

      {/* ── MOBILE TOP BAR ── */}
      <div className="mobile-bar" style={{
        background: "rgba(12,14,22,0.97)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 18px",
        alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 200, height: 52,
      }}>
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:2, textDecoration:"none" }}>
          <span style={{ fontSize:22, fontWeight:900, color:"var(--red)", fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:-0.5, lineHeight:1 }}>F1</span>
          <span style={{ fontSize:15, fontWeight:700, color:"var(--text-primary)", letterSpacing:2, fontFamily:"'Barlow Condensed',sans-serif" }}>HUB</span>
        </Link>
        <div style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", background:"var(--bg-raised)", border:"1px solid var(--border)", borderRadius:6, padding:"3px 10px", fontFamily:"'JetBrains Mono',monospace", letterSpacing:1 }}>2026</div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="mobile-nav" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
        background: "rgba(10,11,18,0.98)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid var(--border)",
        paddingBottom: "env(safe-area-inset-bottom, 8px)",
        justifyContent: "stretch", alignItems: "stretch",
      }}>
        {MOBILE_LINKS.map(({ href, label, icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} className={`mob-tab${active ? " active" : ""}`}>
              <div className="mob-tab-icon-wrap">
                {icon}
              </div>
              <span className="mob-tab-label">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mobile-space" />
    </>
  );
}
"use client";
// src/app/drivers/[id]/page.jsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTeamColor, getFlag, getFlagImg } from "@/lib/teamColors";

function StatBox({ label, value, color, sub }) {
  return (
    <div style={{
      background: "#111827", border: "1px solid #1f2937",
      borderRadius: 12, padding: "16px", textAlign: "center",
    }}>
      <div style={{ fontSize: 26, fontWeight: 900, color: color || "#e2e8f0", lineHeight: 1, marginBottom: 4 }}>
        {value ?? "—"}
      </div>
      {sub && <div style={{ fontSize: 10, color: color || "#6b7280", marginBottom: 2 }}>{sub}</div>}
      <div style={{ fontSize: 11, color: "#4b5563" }}>{label}</div>
    </div>
  );
}

const POS_COLOR = { 1: "#fbbf24", 2: "#9ca3af", 3: "#cd7c2f" };

export default function DriverProfilePage({ params }) {
  const id = params.id;
  const [driver, setDriver]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetch(`/api/driver?id=${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setDriver(json.data);
        else setError("Driver tidak ditemukan.");
      })
      .catch(() => setError("Gagal memuat data driver."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div>
      <div style={{ height: 200, background: "#0d1117", borderRadius: 16, animation: "pulse 1.5s ease infinite", marginBottom: 16 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ height: 80, background: "#0d1117", borderRadius: 12, animation: "pulse 1.5s ease infinite", animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }`}</style>
    </div>
  );

  if (error) return (
    <div>
      <Link href="/drivers" style={{ textDecoration: "none" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6b7280", marginBottom: 20, padding: "6px 12px", background: "#0d1117", border: "1px solid #1f2937", borderRadius: 8, cursor: "pointer" }}>
          ← Driver
        </div>
      </Link>
      <div style={{ background: "#ef444420", border: "1px solid #ef444440", borderRadius: 12, padding: 24, color: "#ef4444", textAlign: "center" }}>
        ⚠️ {error}
      </div>
    </div>
  );

  if (!driver) return null;

  const color    = getTeamColor(driver.currentTeam);
  const flag     = getFlag(driver.nationality);
  const wins     = driver.raceResults.filter((r) => r.pos === 1).length;
  const podiums  = driver.raceResults.filter((r) => r.pos <= 3).length;
  const dnfs     = driver.raceResults.filter((r) => r.posText === "R" || r.posText === "D").length;
  const bestPos  = driver.raceResults.length > 0
    ? Math.min(...driver.raceResults.map((r) => r.pos || 99))
    : null;

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
      `}</style>

      {/* Back */}
      <Link href="/drivers" style={{ textDecoration: "none" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          fontSize: 12, color: "#6b7280", marginBottom: 20,
          padding: "6px 12px", background: "#0d1117",
          border: "1px solid #1f2937", borderRadius: 8, cursor: "pointer",
        }}>← Driver</div>
      </Link>

      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, #08090f, ${color}15)`,
        border: `1px solid ${color}33`, borderRadius: 20,
        padding: "28px", marginBottom: 20,
        position: "relative", overflow: "hidden",
        animation: "fadeUp 0.4s ease",
      }}>
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: 200, height: 200,
          background: `radial-gradient(circle, ${color}18, transparent 70%)`,
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
          {/* Headshot */}
<div
  style={{
    width: 110,
    height: 110,
    borderRadius: 16,
    flexShrink: 0,
    background: "#0b0f18",
    border: `2px solid ${color}44`,
    overflow: "hidden",
    position: "relative",
  }}
>
  {driver.headshotUrl ? (
    <img
      src={driver.headshotUrl}
      alt={driver.name}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "50% 20%",
      }}
      onError={(e) => {
        e.target.style.display = "none";
        e.target.nextSibling.style.display = "flex";
      }}
    />
  ) : null}

  {/* fallback jika gambar gagal */}
  <div
    style={{
      display: driver.headshotUrl ? "none" : "flex",
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 32,
      fontWeight: 900,
      color,
    }}
  >
    {driver.num || "#"}
  </div>
</div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: color, letterSpacing: 3, marginBottom: 6, fontFamily: "monospace", display: "flex", alignItems: "center", gap: 6 }}>
              P{driver.season.pos || "—"} ·
              {getFlagImg(driver.nationality) ? (
                <img src={getFlagImg(driver.nationality)} alt={driver.nationality} style={{ width: 20, height: 14, borderRadius: 2, objectFit: "cover" }} />
              ) : flag}
              {driver.nationality}
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1, marginBottom: 4 }}>
              {driver.name}
            </h1>
            <div style={{ fontSize: 14, color: color, marginBottom: 8 }}>{driver.currentTeam}</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: "#6b7280" }}>
              {driver.dob && (
                <span>🎂 {new Date(driver.dob).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
              )}
              {driver.code && <span style={{ fontFamily: "monospace", color: "#4b5563" }}>#{driver.code}</span>}
            </div>
          </div>

          {/* Season points */}
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontSize: 42, fontWeight: 900, color: color, lineHeight: 1 }}>
              {driver.season.points}
            </div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>POIN 2026</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
        <StatBox label="Posisi" value={driver.season.pos ? `P${driver.season.pos}` : "—"} color={color} />
        <StatBox label="Menang" value={wins} color={wins > 0 ? "#fbbf24" : undefined} />
        <StatBox label="Podium" value={podiums} color={podiums > 0 ? "#22c55e" : undefined} />
        <StatBox label="DNF" value={dnfs} color={dnfs > 0 ? "#ef4444" : undefined} />
      </div>

      {/* Race Results Table */}
      <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 16, padding: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 800, color: "#9ca3af", letterSpacing: 1, marginBottom: 16 }}>
          🏁 HASIL RACE {new Date().getFullYear()}
        </h2>

        {driver.raceResults.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#4b5563", fontSize: 14 }}>
            Musim belum dimulai — hasil akan muncul setelah race pertama 🏎️
          </div>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            {/* Header */}
            <div style={{
              display: "grid", gridTemplateColumns: "40px 1fr 60px 60px 50px",
              gap: 10, padding: "6px 12px",
              fontSize: 10, color: "#4b5563", letterSpacing: 1,
            }}>
              <span>RND</span><span>GRAND PRIX</span>
              <span style={{ textAlign: "center" }}>GRID</span>
              <span style={{ textAlign: "center" }}>FINISH</span>
              <span style={{ textAlign: "right" }}>PTS</span>
            </div>

            {driver.raceResults.map((r, i) => {
              const isRetired = r.posText === "R" || r.posText === "D";
              const posColor  = POS_COLOR[r.pos] || (isRetired ? "#ef4444" : "#e2e8f0");
              const gridDiff  = r.grid && r.pos ? r.grid - r.pos : null;
              return (
                <Link key={r.round} href={`/race/${r.round}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "40px 1fr 60px 60px 50px",
                    gap: 10, padding: "10px 12px",
                    background: i % 2 === 0 ? "#111827" : "transparent",
                    borderRadius: 8, alignItems: "center",
                    transition: "background 0.15s", cursor: "pointer",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#1f2937"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#111827" : "transparent"}
                  >
                    <span style={{ fontSize: 12, color: "#4b5563", fontFamily: "monospace" }}>R{r.round}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
                      <div style={{ fontSize: 10, color: "#4b5563" }}>
                        {new Date(r.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                      </div>
                    </div>
                    <div style={{ textAlign: "center", fontSize: 13, color: "#6b7280" }}>
                      P{r.grid || "—"}
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <span style={{
                        fontSize: 13, fontWeight: 800, color: posColor,
                        background: posColor + "22", borderRadius: 6,
                        padding: "2px 8px", display: "inline-block",
                      }}>
                        {isRetired ? "DNF" : `P${r.pos}`}
                      </span>
                      {gridDiff !== null && !isRetired && (
                        <div style={{ fontSize: 9, color: gridDiff > 0 ? "#22c55e" : gridDiff < 0 ? "#ef4444" : "#4b5563", marginTop: 2 }}>
                          {gridDiff > 0 ? `▲${gridDiff}` : gridDiff < 0 ? `▼${Math.abs(gridDiff)}` : "="}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right", fontSize: 13, fontWeight: 700, color: r.points > 0 ? "#fbbf24" : "#4b5563" }}>
                      {r.points > 0 ? `+${r.points}` : "—"}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
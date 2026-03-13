"use client";
// src/app/standings/page.jsx (Redesigned)

import { useState, useEffect } from "react";
import { getTeamColor, getFlagImg, getCountryFlagImg } from "@/lib/teamColors";

function FlagImg({ url, alt, size = 22 }) {
  if (!url) return <span style={{ fontSize: size * 0.7 }}>🏁</span>;
  return (
    <img
      src={url} alt={alt || "flag"}
      style={{
        width: size, height: Math.round(size * 0.67),
        borderRadius: 2, display: "block", flexShrink: 0,
        objectFit: "cover", boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
      }}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {[...Array(10)].map((_, i) => (
        <div key={i} style={{
          height: 62, background: "#0b0d14",
          border: "1px solid #1a1f2e", borderRadius: 10,
          animation: "pulse 1.5s ease-in-out infinite",
          animationDelay: `${i * 60}ms`,
        }} />
      ))}
    </div>
  );
}

export default function StandingsPage() {
  const [tab,          setTab]          = useState("drivers");
  const [drivers,      setDrivers]      = useState(null);
  const [constructors, setConstructors] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [lastUpdated,  setLastUpdated]  = useState(null);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true); setError(null);
      try {
        const [dRes, cRes] = await Promise.all([
          fetch("/api/standings?type=drivers"),
          fetch("/api/standings?type=constructors"),
        ]);
        const dJson = await dRes.json();
        const cJson = await cRes.json();
        if (dJson.success) setDrivers(dJson.data);
        if (cJson.success) setConstructors(cJson.data);
        setLastUpdated(new Date());
      } catch {
        setError("Gagal mengambil data standings. Coba refresh.");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const maxDriverPts = drivers?.drivers?.[0]?.points || 1;
  const maxConPts    = constructors?.constructors?.[0]?.points || 1;

  return (
    <div>
      <style>{`
        @keyframes pulse   { 0%,100%{opacity:0.3} 50%{opacity:0.6} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .standing-row {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 16px;
          border-bottom: 1px solid #0f1219;
          transition: background 0.15s;
        }
        .standing-row:last-child { border-bottom: none; }
        .standing-row:hover { background: #0d0f18; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24, animation: "fadeUp 0.35s ease" }}>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: 3, color: "#4b5563",
          fontFamily: "'JetBrains Mono', monospace",
          display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
        }}>
          <div style={{ width: 16, height: 1, background: "#ef4444" }} />
          STANDINGS 2026
        </div>
        <h1 style={{
          fontSize: 28, fontWeight: 900, letterSpacing: -1, margin: 0, color: "#f1f5f9",
          fontFamily: "'Barlow Condensed', sans-serif",
        }}>Klasemen F1 {new Date().getFullYear()}</h1>
        {drivers && (
          <p style={{ fontSize: 10, color: "#374151", marginTop: 6, fontFamily: "'JetBrains Mono', monospace" }}>
            ROUND {drivers.round}
            {lastUpdated && ` · UPDATE ${lastUpdated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`}
          </p>
        )}
        {drivers?.round === 0 && (
          <div style={{
            marginTop: 10, background: "#fbbf2408", border: "1px solid #fbbf2420",
            borderRadius: 8, padding: "8px 14px", fontSize: 11, color: "#fbbf24",
            display: "inline-flex", alignItems: "center", gap: 6,
            fontFamily: "'JetBrains Mono', monospace",
          }}>⏳ Musim belum dimulai</div>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 0, marginBottom: 20,
        background: "#0b0d14", border: "1px solid #1a1f2e",
        borderRadius: 10, padding: 4, width: "fit-content",
        animation: "fadeUp 0.35s ease 0.05s both",
      }}>
        {[["drivers", "Driver"], ["constructors", "Konstruktor"]].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} style={{
            padding: "7px 20px", borderRadius: 7, border: "none", cursor: "pointer",
            background: tab === v ? "#ef4444" : "transparent",
            color: tab === v ? "#fff" : "#4b5563",
            fontWeight: 700, fontSize: 12,
            fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: 0.5, transition: "all 0.15s",
          }}>{l}</button>
        ))}
      </div>

      {error && (
        <div style={{
          background: "#ef444410", border: "1px solid #ef444428",
          borderRadius: 10, padding: "12px 16px", marginBottom: 16,
          color: "#ef4444", fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
        }}>⚠ {error}</div>
      )}

      {loading && <LoadingSkeleton />}

      {/* Driver Standings */}
      {!loading && tab === "drivers" && drivers && (
        <div style={{
          background: "#0b0d14", border: "1px solid #1a1f2e",
          borderRadius: 12, overflow: "hidden", animation: "fadeUp 0.35s ease",
        }}>
          {drivers.drivers.map((d, i) => {
            const color   = getTeamColor(d.team.id);
            const flagUrl = getFlagImg(d.driver.nationality);
            const pct     = Math.round((d.points / maxDriverPts) * 100);
            const isLead  = i === 0;
            return (
              <div key={d.driver.id} className="standing-row" style={{
                background: isLead ? "#0d0810" : undefined,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: isLead ? color + "18" : "#0f1219",
                  border: `1px solid ${isLead ? color + "35" : "#1a1f2e"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 900,
                  color: isLead ? color : i < 3 ? "#9ca3af" : "#6b7280",
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}>{d.pos}</div>

                <FlagImg url={flagUrl} alt={d.driver.nationality} size={24} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 3 }}>
                    <span style={{
                      fontSize: 14, fontWeight: 700,
                      fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.3,
                    }}>{d.driver.name}</span>
                    {d.driver.code && (
                      <span style={{ fontSize: 9, color: "#2d3748", fontFamily: "'JetBrains Mono', monospace" }}>
                        {d.driver.code}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: color, fontFamily: "'JetBrains Mono', monospace", marginBottom: 5 }}>
                    {d.team.name}
                  </div>
                  <div style={{ height: 2, background: "#1a1f2e", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      width: `${pct}%`, height: "100%",
                      background: `linear-gradient(90deg, ${color}88, ${color})`,
                      borderRadius: 4, transition: "width 1.2s cubic-bezier(0.25, 1, 0.5, 1)",
                    }} />
                  </div>
                </div>

                <div style={{ textAlign: "center", flexShrink: 0, minWidth: 36 }}>
                  <div style={{ fontSize: 11, color: "#374151", fontFamily: "'JetBrains Mono', monospace", marginBottom: 1 }}>W</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: d.wins > 0 ? "#fbbf24" : "#1f2937", fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {d.wins}
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0, minWidth: 56 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1, color: isLead ? color : "#e2e8f0", fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {d.points}
                  </div>
                  <div style={{ fontSize: 8, color: "#374151", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>PTS</div>
                </div>

                {d.driver.num && (
                  <div style={{
                    width: 30, height: 30, borderRadius: 6, flexShrink: 0,
                    background: "#0f1219", border: "1px solid #1a1f2e",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800, color: "#2d3748",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{d.driver.num}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Constructor Standings */}
      {!loading && tab === "constructors" && constructors && (
        <div style={{
          background: "#0b0d14", border: "1px solid #1a1f2e",
          borderRadius: 12, overflow: "hidden", animation: "fadeUp 0.35s ease",
        }}>
          {constructors.constructors.map((c, i) => {
            const color   = getTeamColor(c.team.id);
            const flagUrl = getFlagImg(c.team.nationality);
            const pct     = Math.round((c.points / maxConPts) * 100);
            const isLead  = i === 0;
            return (
              <div key={c.team.id} className="standing-row" style={{
                background: isLead ? "#0d0810" : undefined,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: isLead ? color + "18" : "#0f1219",
                  border: `1px solid ${isLead ? color + "35" : "#1a1f2e"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 900,
                  color: isLead ? color : i < 3 ? "#9ca3af" : "#6b7280",
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}>{c.pos}</div>

                <FlagImg url={flagUrl} alt={c.team.nationality} size={24} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.3 }}>
                    {c.team.name}
                  </div>
                  <div style={{ height: 2, background: "#1a1f2e", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      width: `${pct}%`, height: "100%",
                      background: `linear-gradient(90deg, ${color}88, ${color})`,
                      borderRadius: 4, transition: "width 1.2s cubic-bezier(0.25, 1, 0.5, 1)",
                    }} />
                  </div>
                </div>

                <div style={{ textAlign: "center", flexShrink: 0, minWidth: 36 }}>
                  <div style={{ fontSize: 11, color: "#374151", fontFamily: "'JetBrains Mono', monospace", marginBottom: 1 }}>W</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: c.wins > 0 ? "#fbbf24" : "#1f2937", fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {c.wins}
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0, minWidth: 56 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1, color: isLead ? color : "#e2e8f0", fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {c.points}
                  </div>
                  <div style={{ fontSize: 8, color: "#374151", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>PTS</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
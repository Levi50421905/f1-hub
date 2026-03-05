"use client";
// src/app/drivers/page.jsx — mobile optimized

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTeamColor, getFlag } from "@/lib/teamColors";
import { DRIVERS_2026 } from "@/lib/drivers2026";

export default function DriversPage() {
  const [standings, setStandings] = useState(null);
  const [search,    setSearch]    = useState("");
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    fetch("/api/standings?type=drivers")
      .then(r => r.json())
      .then(json => { if (json.success) setStandings(json.data); })
      .finally(() => setLoading(false));
  }, []);

  const isPreSeason = !standings || standings.round === 0;
  const maxPts = standings?.drivers?.[0]?.points || 1;

  // Gabung data API + static
  const drivers = isPreSeason
    ? [...DRIVERS_2026].sort((a, b) => a.lastName.localeCompare(b.lastName)).map((d, i) => ({
        pos: i + 1,
        driver: { id: d.id, code: d.code, name: `${d.firstName} ${d.lastName}`, lastName: d.lastName, nationality: d.nationality },
        team:   { id: d.team, name: d.teamName },
        points: 0,
      }))
    : standings.drivers;

  const filtered = drivers.filter(d => {
    const q = search.toLowerCase();
    return !q
      || d.driver.name?.toLowerCase().includes(q)
      || d.driver.code?.toLowerCase().includes(q)
      || d.team.name?.toLowerCase().includes(q);
  });

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        .driver-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        @media (max-width: 400px) {
          .driver-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "#ef4444", letterSpacing: 3, marginBottom: 6, fontFamily: "monospace" }}>🧑‍✈️ DRIVER</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.5, marginBottom: 4 }}>Driver F1 {new Date().getFullYear()}</h1>
        <p style={{ fontSize: 11, color: "#6b7280" }}>
          {drivers.length} driver · {isPreSeason ? "urut alfabetis · pre-season" : "urut poin · update otomatis"}
        </p>
      </div>

      {/* Pre-season banner */}
      {isPreSeason && !loading && (
        <div style={{
          background: "#fbbf2410", border: "1px solid #fbbf2430",
          borderRadius: 10, padding: "10px 14px", marginBottom: 14,
          fontSize: 12, color: "#fbbf24",
        }}>
          ⏳ Musim belum dimulai · Poin otomatis terupdate setelah race pertama (Australian GP · 8 Mar 2026)
        </div>
      )}

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 14 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama, tim, atau kode driver..."
          style={{
            width: "100%", background: "#0d1117",
            border: "1px solid #1f2937", borderRadius: 10,
            padding: "10px 14px", color: "#e2e8f0",
            fontSize: 13, boxSizing: "border-box",
            outline: "none",
          }}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "transparent", border: "none", color: "#6b7280",
            cursor: "pointer", fontSize: 16,
          }}>×</button>
        )}
      </div>

      {/* Driver Grid */}
      {loading ? (
        <div className="driver-grid">
          {[...Array(8)].map((_,i) => (
            <div key={i} style={{ height: 110, background: "#0d1117", borderRadius: 12, animation: "pulse 1.5s ease infinite" }} />
          ))}
        </div>
      ) : (
        <div className="driver-grid">
          {filtered.map((d, i) => {
            const color   = getTeamColor(d.team.id);
            const flag    = getFlag(d.driver.nationality);
            const static_ = DRIVERS_2026.find(s => s.id === d.driver.id);
            const num     = static_?.num || "";
            const pct     = maxPts > 0 ? (d.points / maxPts) * 100 : 0;

            return (
              <Link key={d.driver.id} href={`/drivers/${d.driver.id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "#0d1117",
                  border: `1px solid ${i < 3 && !isPreSeason ? color + "33" : "#1a1f2e"}`,
                  borderRadius: 12, padding: "12px",
                  animation: `fadeUp 0.25s ease ${i*20}ms both`,
                  height: "100%", boxSizing: "border-box",
                }}>
                  {/* Top row: number + flag + code */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: color + "22", border: `1px solid ${color}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 900, color,
                    }}>{num}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: 16 }}>{flag}</span>
                        <span style={{ fontSize: 14, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {d.driver.lastName || d.driver.name?.split(" ").pop()}
                        </span>
                      </div>
                      <div style={{ fontSize: 10, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {d.driver.name?.split(" ")[0]}
                      </div>
                    </div>
                    {!isPreSeason && i < 3 && (
                      <span style={{ fontSize: 14 }}>{["🥇","🥈","🥉"][i]}</span>
                    )}
                  </div>

                  {/* Team */}
                  <div style={{
                    display: "inline-block",
                    fontSize: 10, color, background: color + "15",
                    border: `1px solid ${color}33`, borderRadius: 5,
                    padding: "2px 7px", marginBottom: 8,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    maxWidth: "100%",
                  }}>{d.team.name}</div>

                  {/* Points */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                    <span style={{ fontSize: 10, color: "#6b7280" }}>{isPreSeason ? "Pre-season" : `P${i+1}`}</span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: isPreSeason ? "#374151" : i === 0 ? color : "#9ca3af" }}>
                      {d.points} <span style={{ fontSize: 9, fontWeight: 400, color: "#4b5563" }}>pts</span>
                    </span>
                  </div>
                  <div style={{ height: 3, background: "#1a1f2e", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.5s ease" }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#4b5563" }}>
          Tidak ada driver yang cocok dengan "{search}"
        </div>
      )}
    </div>
  );
}

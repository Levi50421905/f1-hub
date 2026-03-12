"use client";
// src/app/drivers/page.jsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTeamColor, getFlagImg } from "@/lib/teamColors";
import { DRIVERS_2026 } from "@/lib/drivers2026";

// Cache headshots per session
let headshotCache = null;

export default function DriversPage() {
  const [standings,  setStandings]  = useState(null);
  const [headshots,  setHeadshots]  = useState({});
  const [search,     setSearch]     = useState("");
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    // Fetch standings
    fetch("/api/standings?type=drivers")
      .then(r => r.json())
      .then(json => { if (json.success) setStandings(json.data); })
      .finally(() => setLoading(false));

    // Fetch headshots dari OpenF1 (latest race session)
    if (headshotCache) {
      setHeadshots(headshotCache);
      return;
    }
    fetch("https://api.openf1.org/v1/drivers")
      .then(r => r.json())
      .then(data => {
  const map = {};

  data.forEach(d => {
    if (d.driver_number && d.headshot_url) {
      map[d.driver_number] = d.headshot_url;
    }
  });

  headshotCache = map;
  setHeadshots(map);
})
      .catch(() => {}); // Gagal headshot tidak apa-apa
  }, []);

  const isPreSeason = !standings || standings.round === 0;
  const maxPts = standings?.drivers?.[0]?.points || 1;

  const drivers = isPreSeason
    ? [...DRIVERS_2026].sort((a, b) => a.lastName.localeCompare(b.lastName)).map((d, i) => ({
        pos: i + 1,
        driver: { id: d.id, code: d.code, num: d.num, name: `${d.firstName} ${d.lastName}`, lastName: d.lastName, firstName: d.firstName, nationality: d.nationality },
        team:   { id: d.team, name: d.teamName },
        points: 0,
      }))
    : standings.drivers.map(d => ({
        ...d,
        driver: { ...d.driver, num: DRIVERS_2026.find(s => s.id === d.driver.id)?.num || "" }
      }));

  const filtered = drivers.filter(d => {
    const q = search.toLowerCase();
    return !q
      || d.driver.name?.toLowerCase().includes(q)
      || d.driver.code?.toLowerCase().includes(q)
      || d.team.name?.toLowerCase().includes(q);
  });

  function getHeadshot(driver) {
  const staticDriver = DRIVERS_2026.find(d => d.id === driver.id);
  const num = staticDriver?.num;

  if (!num) return null;

  return headshots[num] || null;
}

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        .driver-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media (max-width: 400px) {
          .driver-grid { grid-template-columns: 1fr; }
        }
        .driver-card:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
        .driver-card { transition: transform 0.2s, box-shadow 0.2s; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "#ef4444", letterSpacing: 3, marginBottom: 6, fontFamily: "monospace" }}>🧑‍✈️ DRIVER</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.5, marginBottom: 4 }}>Driver F1 {new Date().getFullYear()}</h1>
        <p style={{ fontSize: 11, color: "#6b7280" }}>
          {drivers.length} driver · {isPreSeason ? "urut alfabetis · pre-season" : "urut poin · update otomatis"}
        </p>
      </div>

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
            fontSize: 13, boxSizing: "border-box", outline: "none",
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
            <div key={i} style={{ height: 140, background: "#0d1117", borderRadius: 14, animation: "pulse 1.5s ease infinite" }} />
          ))}
        </div>
      ) : (
        <div className="driver-grid">
          {filtered.map((d, i) => {
            const color    = getTeamColor(d.team.id);
            const flagUrl  = getFlagImg(d.driver.nationality);
            const static_  = DRIVERS_2026.find(s => s.id === d.driver.id);
            const num      = static_?.num || d.driver.num || "";
            const headshot = getHeadshot(d.driver);
            const pct      = maxPts > 0 ? (d.points / maxPts) * 100 : 0;

            return (
              <Link key={d.driver.id} href={`/drivers/${d.driver.id}`} style={{ textDecoration: "none" }}>
                <div className="driver-card" style={{
                  background: "#0d1117",
                  border: `1px solid ${i < 3 && !isPreSeason ? color + "55" : "#1a1f2e"}`,
                  borderRadius: 14, overflow: "hidden",
                  animation: `fadeUp 0.25s ease ${i*20}ms both`,
                  position: "relative",
                }}>
                  {/* Color accent top bar */}
                  <div style={{ height: 3, background: color, width: "100%" }} />

                  {/* Headshot area */}
                  <div style={{
                    position: "relative",
                    background: `linear-gradient(135deg, #0a0b0f, ${color}18)`,
                    height: 90, overflow: "hidden",
                    display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
                  }}>
                    {/* Car number watermark */}
                    <div style={{
                      position: "absolute", left: 10, top: 8,
                      fontSize: 36, fontWeight: 900, color: color + "25",
                      lineHeight: 1, userSelect: "none",
                    }}>{num}</div>

                    {/* Headshot */}
{headshot ? (
  <img
    src={headshot}
    alt={d.driver.lastName}
    style={{
      maxHeight: "100%",
      width: "auto",
      objectFit: "contain",
      objectPosition: "center bottom",
      filter: "drop-shadow(0 0 8px rgba(0,0,0,0.6))",
    }}
    onError={(e) => {
      e.target.style.display = "none";
    }}
  />
) : (
                      <div style={{
                        position: "absolute", right: 12, bottom: 8,
                        width: 56, height: 56, borderRadius: "50%",
                        background: color + "22", border: `2px solid ${color}44`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, fontWeight: 900, color,
                      }}>{d.driver.code?.slice(0,2) || "?"}</div>
                    )}

                    {/* Top 3 medal */}
                    {!isPreSeason && i < 3 && (
                      <div style={{
                        position: "absolute", top: 8, right: 8,
                        fontSize: 18, zIndex: 2,
                      }}>{["🥇","🥈","🥉"][i]}</div>
                    )}
                  </div>

                  {/* Info area */}
                  <div style={{ padding: "10px 12px 12px" }}>
                    {/* Name + flag */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      {flagUrl ? (
                        <img
                          src={flagUrl}
                          alt={d.driver.nationality}
                          style={{ width: 20, height: 14, borderRadius: 2, objectFit: "cover", flexShrink: 0 }}
                          onError={e => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <span style={{ fontSize: 14 }}>{getFlag(d.driver.nationality)}</span>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {d.driver.lastName || d.driver.name?.split(" ").pop()}
                        </div>
                        <div style={{ fontSize: 10, color: "#6b7280" }}>
                          {d.driver.firstName || d.driver.name?.split(" ")[0]}
                        </div>
                      </div>
                    </div>

                    {/* Team badge */}
                    <div style={{
                      display: "inline-block", fontSize: 10, color,
                      background: color + "15", border: `1px solid ${color}33`,
                      borderRadius: 5, padding: "2px 7px", marginBottom: 8,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      maxWidth: "100%",
                    }}>{d.team.name}</div>

                    {/* Points bar */}
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
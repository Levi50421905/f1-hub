"use client";
// src/app/drivers/page.jsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTeamColor, getFlag } from "@/lib/teamColors";
import { DRIVERS_2026 } from "@/lib/drivers2026";

export default function DriversPage() {
  const [apiDrivers, setApiDrivers] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");

  useEffect(() => {
    fetch("/api/standings?type=drivers")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data.round > 0) {
          setApiDrivers(json.data.drivers);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Kalau API sudah ada poin → pakai API (urut poin)
  // Kalau belum → pakai static data (urut abjad)
  const displayDrivers = apiDrivers
    ? apiDrivers
    : [...DRIVERS_2026]
        .sort((a, b) => a.lastName.localeCompare(b.lastName))
        .map((d, i) => ({
          pos: i + 1,
          points: 0,
          wins: 0,
          driver: {
            id: d.id,
            code: d.code,
            num: d.num,
            firstName: d.firstName,
            lastName: d.lastName,
            name: `${d.firstName} ${d.lastName}`,
            nationality: d.nationality,
          },
          team: { id: d.team, name: d.teamName },
        }));

  const filtered = displayDrivers.filter((d) =>
    d.driver.name.toLowerCase().includes(search.toLowerCase()) ||
    d.team.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.driver.code || "").toLowerCase().includes(search.toLowerCase())
  );

  const seasonStarted = apiDrivers !== null;

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        .d-card { transition: transform 0.2s, border-color 0.2s; }
        .d-card:hover { transform: translateY(-3px); }
        input::placeholder { color: #374151; }
        input:focus { outline: none; border-color: #ef444466 !important; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, color: "#ef4444", letterSpacing: 3, marginBottom: 8, fontFamily: "monospace" }}>
          🧑‍✈️ DRIVER
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1, marginBottom: 4 }}>
          Driver F1 {new Date().getFullYear()}
        </h1>
        <p style={{ fontSize: 12, color: "#6b7280" }}>
          {displayDrivers.length} driver ·{" "}
          {seasonStarted ? "urut berdasarkan poin" : "urut alfabetis · poin update otomatis setelah race"}
        </p>
      </div>

      {/* Pre-season notice */}
      {!loading && !seasonStarted && (
        <div style={{
          background: "#fbbf2410", border: "1px solid #fbbf2430",
          borderRadius: 10, padding: "10px 16px", marginBottom: 16,
          fontSize: 12, color: "#fbbf24",
        }}>
          ⏳ Musim belum dimulai · Poin otomatis terupdate setelah race pertama (Australian GP · 8 Mar 2026)
        </div>
      )}

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari nama, tim, atau kode driver..."
        style={{
          width: "100%", background: "#0d1117",
          border: "1px solid #1f2937", borderRadius: 10,
          padding: "11px 16px", color: "#e2e8f0",
          fontSize: 14, marginBottom: 20, transition: "border-color 0.2s",
        }}
      />

      {/* Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[...Array(10)].map((_, i) => (
            <div key={i} style={{
              height: 108, background: "#0d1117", borderRadius: 12,
              animation: "pulse 1.5s ease infinite", animationDelay: `${i * 60}ms`,
            }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {filtered.map((d, i) => {
            const color = getTeamColor(d.team.id);
            const flag  = getFlag(d.driver.nationality);
            return (
              <Link key={d.driver.id} href={`/drivers/${d.driver.id}`} style={{ textDecoration: "none" }}>
                <div className="d-card" style={{
                  background: "#0d1117",
                  border: `1px solid ${seasonStarted && i < 3 ? color + "55" : "#1f2937"}`,
                  borderRadius: 12, padding: "16px",
                  animation: `fadeUp 0.3s ease ${i * 25}ms both`,
                }}>
                  {/* Top row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    {/* Car number */}
                    <div style={{
                      width: 46, height: 46, borderRadius: 10, flexShrink: 0,
                      background: color + "18", border: `1px solid ${color}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 17, fontWeight: 900, color,
                    }}>{d.driver.num || "?"}</div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 1 }}>
                        <span style={{ fontSize: 16 }}>{flag}</span>
                        <span style={{ fontSize: 15, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {d.driver.lastName}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 3 }}>{d.driver.firstName}</div>
                      <div style={{
                        display: "inline-block",
                        fontSize: 10, fontWeight: 700, color,
                        background: color + "15", borderRadius: 5,
                        padding: "2px 8px",
                      }}>{d.team.name}</div>
                    </div>

                    {d.driver.code && (
                      <div style={{
                        fontSize: 10, fontFamily: "monospace", fontWeight: 700,
                        color: "#4b5563", background: "#1f2937",
                        borderRadius: 6, padding: "3px 7px", flexShrink: 0, alignSelf: "flex-start",
                      }}>{d.driver.code}</div>
                    )}
                  </div>

                  {/* Points row */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: "#4b5563" }}>
                        {seasonStarted ? `P${d.pos}` : "Pre-season"}
                        {d.wins > 0 && <span style={{ color: "#fbbf24", marginLeft: 8 }}>🏆 {d.wins}W</span>}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 900, color: seasonStarted && i === 0 ? color : "#6b7280" }}>
                        {d.points} <span style={{ fontSize: 10, fontWeight: 400, color: "#374151" }}>pts</span>
                      </span>
                    </div>
                    <div style={{ height: 3, background: "#1a1f2e", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{
                        width: seasonStarted && displayDrivers[0]?.points > 0
                          ? `${(d.points / displayDrivers[0].points) * 100}%`
                          : "0%",
                        height: "100%", background: color, borderRadius: 4,
                        transition: "width 1.2s ease",
                      }} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0", color: "#4b5563", fontSize: 14 }}>
              Tidak ada driver yang cocok dengan "{search}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
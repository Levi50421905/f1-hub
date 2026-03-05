"use client";
// app/page.jsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTeamColor, getFlag, getCountryFlag } from "@/lib/teamColors";

export default function HomePage() {
  const [standings, setStandings] = useState(null);
  const [schedule,  setSchedule]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/standings?type=drivers").then((r) => r.json()),
      fetch("/api/schedule").then((r) => r.json()),
    ]).then(([dJson, sJson]) => {
      if (dJson.success) setStandings(dJson.data);
      if (sJson.success) setSchedule(sJson.data);
    }).finally(() => setLoading(false));
  }, []);

  const nextRace    = schedule.find((r) => r.status === "upcoming");
  const finishedCnt = schedule.filter((r) => r.status === "finished").length;
  const today       = new Date();

  function daysUntil(ds) {
    return Math.ceil((new Date(ds) - today) / (1000 * 60 * 60 * 24));
  }
  function fmtDate(ds) {
    return new Date(ds).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  }

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        .card { transition: all 0.2s; }
        .card:hover { transform: translateY(-2px); }
      `}</style>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #0a0005 0%, #12000a 60%, #050010 100%)",
        border: "1px solid #1a0a1a", borderRadius: 20,
        padding: "40px 36px", marginBottom: 24, position: "relative", overflow: "hidden",
        animation: "fadeUp 0.5s ease",
      }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: 300, height: 300, background: "radial-gradient(circle,#ef444412,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ fontSize: 10, color: "#ef4444", letterSpacing: 3, marginBottom: 12, fontFamily: "monospace" }}>
          ⬤ FORMULA ONE · LIVE DATA
        </div>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 52, fontWeight: 900, letterSpacing: -2, lineHeight: 0.95, marginBottom: 16,
        }}>
          F1 HUB<br />
          <span style={{ color: "#ef4444", fontSize: 36 }}>
            {new Date().getFullYear()} SEASON
          </span>
        </h1>
        <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 28, maxWidth: 480 }}>
          Data standings, jadwal, dan hasil race F1 langsung dari API resmi — update otomatis setiap selesai race.
        </p>

        {/* Next Race */}
        {nextRace ? (
          <Link href={`/race/${nextRace.round}`} style={{ textDecoration: "none" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 20,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14, padding: "16px 24px", cursor: "pointer",
              transition: "all 0.2s",
            }}>
              <div>
                <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: 2, marginBottom: 4 }}>RACE BERIKUTNYA</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>
                  {getCountryFlag(nextRace.circuit.country)} {nextRace.name}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {nextRace.circuit.name} · {fmtDate(nextRace.date)}
                </div>
              </div>
              <div style={{ textAlign: "center", padding: "0 16px", borderLeft: "1px solid #1f2937" }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#ef4444", lineHeight: 1 }}>
                  {daysUntil(nextRace.date)}
                </div>
                <div style={{ fontSize: 10, color: "#6b7280" }}>HARI</div>
              </div>
            </div>
          </Link>
        ) : loading && (
          <div style={{ height: 80, width: 280, background: "#1a0a1a", borderRadius: 14, animation: "pulse 1.5s ease infinite" }} />
        )}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Race Selesai", val: loading ? "—" : finishedCnt, sub: `dari ${schedule.length}`, icon: "🏁" },
          { label: "Points Leader", val: loading ? "—" : standings?.drivers?.[0]?.driver?.code || "—", sub: `${standings?.drivers?.[0]?.points || 0} pts`, icon: "🏆" },
          { label: "Race Weekend", val: loading ? "—" : nextRace ? `R${nextRace.round}` : "—", sub: nextRace?.circuit?.country || "", icon: "📍" },
          { label: "Update", val: "Auto", sub: "tiap 1 jam", icon: "🔄" },
        ].map((s) => (
          <div key={s.label} style={{
            background: "#0d1117", border: "1px solid #1f2937",
            borderRadius: 12, padding: "16px", textAlign: "center",
            animation: "fadeUp 0.5s ease",
          }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 2 }}>{s.val}</div>
            <div style={{ fontSize: 10, color: "#6b7280" }}>{s.sub}</div>
            <div style={{ fontSize: 10, color: "#374151", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Top 5 Driver Standings */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: "#9ca3af" }}>🏆 TOP DRIVER</h2>
            <Link href="/standings" style={{ fontSize: 11, color: "#ef4444", textDecoration: "none" }}>Lihat semua →</Link>
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {loading ? [...Array(5)].map((_, i) => (
              <div key={i} style={{ height: 52, background: "#0d1117", borderRadius: 8, animation: "pulse 1.5s ease infinite", animationDelay: `${i * 60}ms` }} />
            )) : standings?.drivers?.slice(0, 5).map((d, i) => {
              const color = getTeamColor(d.team.id);
              const flag  = getFlag(d.driver.nationality);
              return (
                <div key={d.driver.id} style={{
                  background: "#0d1117", border: `1px solid ${i === 0 ? color + "44" : "#1f2937"}`,
                  borderRadius: 8, padding: "10px 14px",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: i === 0 ? color : "#4b5563", minWidth: 20 }}>P{d.pos}</span>
                  <span style={{ fontSize: 16 }}>{flag}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {d.driver.lastName}
                    </div>
                    <div style={{ fontSize: 10, color: color }}>{d.driver.code}</div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: i === 0 ? color : "#e2e8f0" }}>{d.points}</div>
                </div>
              );
            })}
            {!loading && standings?.round === 0 && (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#4b5563", fontSize: 13 }}>
                Musim belum dimulai — standings akan muncul setelah race pertama 🏁
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Races */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: "#9ca3af" }}>📅 RACE SELANJUTNYA</h2>
            <Link href="/schedule" style={{ fontSize: 11, color: "#ef4444", textDecoration: "none" }}>Lihat semua →</Link>
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {loading ? [...Array(5)].map((_, i) => (
              <div key={i} style={{ height: 52, background: "#0d1117", borderRadius: 8, animation: "pulse 1.5s ease infinite", animationDelay: `${i * 60}ms` }} />
            )) : schedule.filter((r) => r.status === "upcoming").slice(0, 5).map((race, i) => (
              <Link key={race.round} href={`/race/${race.round}`} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "#0d1117", border: `1px solid ${i === 0 ? "#ef444433" : "#1f2937"}`,
                  borderRadius: 8, padding: "10px 14px",
                  display: "flex", alignItems: "center", gap: 10,
                  cursor: "pointer", transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#111827"}
                onMouseLeave={e => e.currentTarget.style.background = "#0d1117"}
                >
                  <span style={{ fontSize: 11, fontWeight: 800, color: i === 0 ? "#ef4444" : "#4b5563", minWidth: 20 }}>R{race.round}</span>
                  <span style={{ fontSize: 16 }}>{getCountryFlag(race.circuit.country)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {race.name}
                    </div>
                    <div style={{ fontSize: 10, color: "#4b5563" }}>{fmtDate(race.date)}</div>
                  </div>
                  <div style={{ fontSize: 12, color: i === 0 ? "#ef4444" : "#4b5563", fontFamily: "monospace" }}>
                    {daysUntil(race.date)}h
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

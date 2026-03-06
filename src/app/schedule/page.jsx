"use client";
// src/app/schedule/page.jsx — mobile optimized

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCountryFlag } from "@/lib/teamColors";
import { SCHEDULE_2026 } from "@/lib/schedule2026";

function toWIB(dateStr, timeStr) {
  if (!dateStr) return null;
  try {
    const raw   = `${dateStr}T${timeStr || "00:00:00Z"}`;
    const clean = raw.endsWith("Z") ? raw : raw + "Z";
    const dt    = new Date(clean);
    return isNaN(dt) ? null : new Date(dt.getTime() + 7 * 60 * 60 * 1000);
  } catch { return null; }
}

// Format compact: "Sab 7/3 · 19:00"
function fmtCompact(dateStr, timeStr) {
  const dt = toWIB(dateStr, timeStr);
  if (!dt) return "TBA";
  const day  = dt.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "numeric" });
  const time = dt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${day} · ${time} WIB`;
}

function getSessions(race) {
  const fb       = SCHEDULE_2026[race.round] || {};
  const isSprint = !!(race.sprint || fb.sprint);
  return [
    { key: "fp1",        label: "FP1",        icon: "🟡", date: fb.fp1?.date,        time: fb.fp1?.time        },
    { key: "fp2",        label: isSprint ? "Sprint Q" : "FP2", icon: isSprint ? "⚡" : "🟡", date: fb.fp2?.date, time: fb.fp2?.time },
    { key: "fp3",        label: isSprint ? "Sprint"   : "FP3", icon: isSprint ? "⚡" : "🟡", date: fb.fp3?.date, time: fb.fp3?.time },
    { key: "qualifying", label: "Qualifying",  icon: "🔵", date: fb.qualifying?.date, time: fb.qualifying?.time },
    { key: "race",       label: "RACE",        icon: "🏁", date: fb.race?.date,       time: fb.race?.time       },
  ].filter(s => s.date);
}

export default function SchedulePage() {
  const [races,    setRaces]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetch("/api/schedule")
      .then(r => r.json())
      .then(json => { if (json.success) setRaces(json.data); })
      .finally(() => setLoading(false));
  }, []);

  const today    = new Date();
  const filtered = races.filter(r => filter === "all" || r.status === filter);
  const nextRace = races.find(r => r.status === "upcoming");

  function daysUntil(ds) {
    return Math.ceil((new Date(ds) - today) / (1000 * 60 * 60 * 24));
  }

  const nextFb   = nextRace ? SCHEDULE_2026[nextRace.round] || {} : {};
  const raceWIB  = nextRace ? fmtCompact(nextFb.race?.date,       nextFb.race?.time)       : null;
  const qualiWIB = nextRace ? fmtCompact(nextFb.qualifying?.date, nextFb.qualifying?.time) : null;

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        .race-row:active { background: #111827 !important; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "#ef4444", letterSpacing: 3, marginBottom: 6, fontFamily: "monospace" }}>📅 KALENDER</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.5, marginBottom: 4 }}>Musim F1 {new Date().getFullYear()}</h1>
        <p style={{ fontSize: 11, color: "#6b7280" }}>
          {races.length} race · {races.filter(r=>r.status==="finished").length} selesai · Jam dalam <strong style={{color:"#fbbf24"}}>WIB</strong>
        </p>
      </div>

      {/* Next Race Hero */}
      {!loading && nextRace && (
        <div style={{
          background: "linear-gradient(135deg,#0a0005,#0f0012)",
          border: "1px solid #2d1030", borderRadius: 14,
          padding: "16px", marginBottom: 16,
          position: "relative", overflow: "hidden",
          animation: "fadeUp 0.4s ease",
        }}>
          <div style={{ fontSize: 10, color: "#ef4444", letterSpacing: 3, marginBottom: 8, fontFamily: "monospace" }}>
            ⬤ BERIKUTNYA — R{nextRace.round}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1, marginRight: 12 }}>
              <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 4, lineHeight: 1.2 }}>
                {getCountryFlag(nextRace.circuit.country)} {nextRace.name}
              </div>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 10 }}>
                {nextRace.circuit.name}
              </div>
              {qualiWIB && (
                <div style={{ fontSize: 11, color: "#93c5fd", marginBottom: 3 }}>
                  🔵 {qualiWIB}
                </div>
              )}
              {raceWIB && (
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fde68a" }}>
                  🏁 {raceWIB}
                </div>
              )}
            </div>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 44, fontWeight: 900, color: "#ef4444", lineHeight: 1 }}>{daysUntil(nextRace.date)}</div>
              <div style={{ fontSize: 9, color: "#6b7280" }}>HARI LAGI</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[["all","Semua"],["upcoming","Akan Datang"],["finished","Selesai"]].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding: "6px 14px", borderRadius: 8, cursor: "pointer",
            background: filter===v ? "#ef444422" : "transparent",
            border: `1px solid ${filter===v ? "#ef444466" : "#1f2937"}`,
            color: filter===v ? "#ef4444" : "#6b7280",
            fontSize: 12, fontFamily: "inherit", fontWeight: 600,
          }}>{l}</button>
        ))}
      </div>

      {/* Race List */}
      {loading ? (
        <div style={{ display: "grid", gap: 6 }}>
          {[...Array(6)].map((_,i) => (
            <div key={i} style={{ height: 64, background: "#0d1117", borderRadius: 10, animation: "pulse 1.5s ease infinite" }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 6 }}>
          {filtered.map((race, i) => {
            const fb      = SCHEDULE_2026[race.round] || {};
            const isNext  = race === nextRace;
            const done    = race.status === "finished";
            const days    = daysUntil(race.date);
            const isOpen  = expanded === race.round;
            const isSprint = !!(race.sprint || fb.sprint);
            const rWIB = fmtCompact(fb.race?.date, fb.race?.time);
            const sessions = getSessions(race);

            return (
              <div key={race.round} style={{ animation: `fadeUp 0.25s ease ${i*15}ms both` }}>
                {/* Row */}
                <div
                  className="race-row"
                  onClick={() => setExpanded(isOpen ? null : race.round)}
                  style={{
                    background: isOpen ? "#0f1420" : isNext ? "#100a0a" : "#0d1117",
                    border: `1px solid ${isNext ? "#ef444433" : "#1a1f2e"}`,
                    borderRadius: isOpen ? "10px 10px 0 0" : 10,
                    padding: "12px 14px",
                    display: "flex", alignItems: "center", gap: 10,
                    cursor: "pointer", userSelect: "none",
                    opacity: done ? 0.75 : 1,
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                    background: isNext ? "#ef444422" : "#1a1f2e",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 800,
                    color: isNext ? "#ef4444" : "#4b5563",
                  }}>{race.round}</div>

                  <span style={{ fontSize: 18, flexShrink: 0 }}>{getCountryFlag(race.circuit.country)}</span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 5, marginBottom: 1 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {race.name.replace(" Grand Prix", " GP")}
                      </span>
                      {isSprint && <span style={{ fontSize: 8, background: "#fbbf2420", border: "1px solid #fbbf2433", borderRadius: 3, padding: "1px 4px", color: "#fbbf24", flexShrink: 0 }}>S</span>}
                      {done && <span style={{ fontSize: 8, background: "#22c55e20", border: "1px solid #22c55e33", borderRadius: 3, padding: "1px 4px", color: "#22c55e", flexShrink: 0 }}>✓</span>}
                    </div>
                    {/* Jam race — 1 baris, tidak wrap */}
                    <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {rWIB}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    {!done && (
                      <span style={{ fontSize: 11, color: isNext ? "#ef4444" : days < 14 ? "#fbbf24" : "#4b5563" }}>
                        {days === 0 ? "🔥" : days === 1 ? "Besok" : `${days}h`}
                      </span>
                    )}
                    {done && (
                      <span style={{ fontSize: 11, color: "#374151" }}>Hasil</span>
                    )}
                    <span style={{
                      fontSize: 10, color: "#374151",
                      display: "inline-block", transition: "transform 0.2s",
                      transform: isOpen ? "rotate(180deg)" : "none",
                    }}>▼</span>
                  </div>
                </div>

                {/* Expanded sessions */}
                {isOpen && (
                  <div style={{
                    background: "#090a0f",
                    border: "1px solid #1a1f2e", borderTop: "none",
                    borderRadius: "0 0 10px 10px",
                    padding: "10px 14px 14px",
                    animation: "fadeIn 0.2s ease",
                  }}>
                    <div style={{ fontSize: 9, color: "#374151", letterSpacing: 2, padding: "6px 0 8px", fontFamily: "monospace" }}>
                      JADWAL SESI · WIB (UTC+7)
                    </div>
                    {sessions.map(s => {
                      const wib    = toWIB(s.date, s.time);
                      const isPast = wib && wib < today;
                      const isRace = s.key === "race";
                      const isQ    = s.key === "qualifying";
                      const txt    = wib ? fmtCompact(s.date, s.time) : "TBA";
                      return (
                        <div key={s.key} style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "7px 0", borderBottom: "1px solid #111827",
                        }}>
                          <span style={{ fontSize: 14, flexShrink: 0, width: 18 }}>{s.icon}</span>
                          <span style={{
                            fontSize: 12, fontWeight: isRace || isQ ? 700 : 400,
                            color: isRace ? "#f1f5f9" : isQ ? "#93c5fd" : "#6b7280",
                            width: 70, flexShrink: 0,
                          }}>{s.label}</span>
                          <span style={{
                            fontSize: 11, fontFamily: "monospace", flex: 1,
                            color: isRace ? "#fbbf24" : isQ ? "#60a5fa" : isPast ? "#374151" : "#9ca3af",
                            fontWeight: isRace || isQ ? 600 : 400,
                          }}>{txt}</span>
                          {isPast && <span style={{ fontSize: 9, color: "#22c55e", flexShrink: 0 }}>✓</span>}
                        </div>
                      );
                    })}

                    {done ? (
                      <Link href={`/race/${race.round}`} style={{ textDecoration: "none" }}>
                        <div style={{
                          marginTop: 10, background: "#ef444415", border: "1px solid #ef444430",
                          borderRadius: 8, padding: "8px", fontSize: 12, color: "#ef4444", textAlign: "center",
                        }}>Lihat hasil race & semua sesi →</div>
                      </Link>
                    ) : (
                      <Link href={`/race/${race.round}`} style={{ textDecoration: "none" }}>
                        <div style={{
                          marginTop: 10, background: "#1a1f2e",
                          borderRadius: 8, padding: "8px", fontSize: 12, color: "#6b7280", textAlign: "center",
                        }}>Detail race weekend →</div>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";
// src/app/schedule/page.jsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCountryFlag } from "@/lib/teamColors";
import { SCHEDULE_2026 } from "@/lib/schedule2026";

function toWIB(dateStr, timeStr) {
  if (!dateStr) return null;
  try {
    const raw = `${dateStr}T${timeStr || "00:00:00Z"}`;
    const clean = raw.endsWith("Z") ? raw : raw + "Z";
    const dt = new Date(clean);
    if (isNaN(dt)) return null;
    return new Date(dt.getTime() + 7 * 60 * 60 * 1000);
  } catch { return null; }
}

function fmtWIB(dateStr, timeStr) {
  const dt = toWIB(dateStr, timeStr);
  if (!dt) return null;
  return dt.toLocaleString("id-ID", {
    weekday: "short", day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }) + " WIB";
}

function fmtDateShort(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// Gabungkan data API + fallback hardcode
function getSessions(race) {
  const fb       = SCHEDULE_2026[race.round] || {};
  const isSprint = !!(race.sprint || fb.sprint);
  return [
    { key:"fp1",        label:"Free Practice 1",  icon:"🟡", date: race.fp1?.date        || fb.fp1?.date,        time: race.fp1?.time        || fb.fp1?.time        },
    { key:"fp2",        label:"Free Practice 2",  icon:"🟡", date: race.fp2?.date        || fb.fp2?.date,        time: race.fp2?.time        || fb.fp2?.time        },
    isSprint
      ? { key:"sprintQ", label:"Sprint Qualifying", icon:"⚡", date: race.fp3?.date       || fb.fp2?.date,        time: race.fp3?.time        || fb.fp2?.time        }
      : { key:"fp3",     label:"Free Practice 3",  icon:"🟡", date: race.fp3?.date        || fb.fp3?.date,        time: race.fp3?.time        || fb.fp3?.time        },
    isSprint
      ? { key:"sprint",  label:"Sprint Race",      icon:"⚡", date: race.sprint?.date     || fb.fp3?.date,        time: race.sprint?.time     || fb.fp3?.time        }
      : null,
    { key:"qualifying", label:"Qualifying",        icon:"🔵", date: race.qualifying?.date || fb.qualifying?.date, time: race.qualifying?.time || fb.qualifying?.time },
    { key:"race",       label:"RACE",              icon:"🏁", date: race.date             || fb.race?.date,       time: race.time             || fb.race?.time        },
  ].filter(Boolean);
}

function SessionList({ race }) {
  const today    = new Date();
  const sessions = getSessions(race);
  return (
    <div style={{
      background: "#090a0f",
      border: "1px solid #1a1f2e", borderTop: "none",
      borderRadius: "0 0 12px 12px",
      padding: "8px 18px 16px",
    }}>
      <div style={{ fontSize: 10, color: "#374151", letterSpacing: 2, padding: "10px 0 8px", fontFamily: "monospace" }}>
        JADWAL SESI · WIB (UTC+7)
      </div>
      {sessions.map(s => {
        const wib    = toWIB(s.date, s.time);
        const isPast = wib && wib < today;
        const isRace = s.key === "race";
        const isQ    = s.key === "qualifying";
        return (
          <div key={s.key} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 0",
            borderBottom: "1px solid #111827",
          }}>
            <span style={{ fontSize: 16, flexShrink: 0, width: 22 }}>{s.icon}</span>
            <span style={{
              fontSize: 12, fontWeight: isRace || isQ ? 700 : 500,
              color: isRace ? "#f1f5f9" : isQ ? "#93c5fd" : "#6b7280",
              width: 150, flexShrink: 0,
            }}>{s.label}</span>
            <span style={{
              fontSize: 12, fontFamily: "monospace", flex: 1,
              color: isRace ? "#fbbf24" : isQ ? "#60a5fa" : isPast ? "#4b5563" : "#9ca3af",
              fontWeight: isRace || isQ ? 700 : 400,
            }}>
              {wib
                ? wib.toLocaleString("id-ID", { weekday:"short", day:"numeric", month:"short", hour:"2-digit", minute:"2-digit", hour12:false }) + " WIB"
                : "TBA"
              }
            </span>
            {isPast
              ? <span style={{ fontSize: 9, background:"#22c55e20", border:"1px solid #22c55e33", borderRadius:4, padding:"2px 7px", color:"#22c55e", flexShrink:0 }}>✓ selesai</span>
              : wib
                ? <span style={{ fontSize: 10, color:"#374151", flexShrink:0 }}>{Math.ceil((wib-today)/(1000*60*60*24))}h lagi</span>
                : null
            }
          </div>
        );
      })}
      <Link href={`/race/${race.round}`} style={{ textDecoration:"none" }}>
        <div style={{
          marginTop: 12, background:"#ef444415", border:"1px solid #ef444430",
          borderRadius: 8, padding:"8px 14px",
          fontSize: 12, color:"#ef4444", textAlign:"center", cursor:"pointer",
        }}>
          {race.status === "finished" ? "Lihat hasil race & semua sesi →" : "Detail race weekend →"}
        </div>
      </Link>
    </div>
  );
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
    return Math.ceil((new Date(ds) - today) / (1000*60*60*24));
  }

  // Jadwal qualifying & race untuk hero card
  const nextFb   = nextRace ? SCHEDULE_2026[nextRace.round] || {} : {};
  const qualiWIB = nextRace ? fmtWIB(nextRace.qualifying?.date || nextFb.qualifying?.date, nextRace.qualifying?.time || nextFb.qualifying?.time) : null;
  const raceWIB  = nextRace ? fmtWIB(nextRace.date || nextFb.race?.date, nextRace.time || nextFb.race?.time) : null;

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize:10, color:"#ef4444", letterSpacing:3, marginBottom:8, fontFamily:"monospace" }}>📅 KALENDER</div>
        <h1 style={{ fontSize:28, fontWeight:900, letterSpacing:-1, marginBottom:4 }}>Musim F1 {new Date().getFullYear()}</h1>
        <p style={{ fontSize:12, color:"#6b7280" }}>
          {races.length} race · {races.filter(r=>r.status==="finished").length} selesai · {races.filter(r=>r.status==="upcoming").length} tersisa · Semua jam dalam <strong style={{color:"#fbbf24"}}>WIB (UTC+7)</strong>
        </p>
      </div>

      {/* Next Race Hero */}
      {!loading && nextRace && (
        <div style={{
          background:"linear-gradient(135deg,#0a0005,#0f0012)",
          border:"1px solid #2d1030", borderRadius:16,
          padding:"22px 26px", marginBottom:24,
          position:"relative", overflow:"hidden",
          animation:"fadeUp 0.4s ease",
        }}>
          <div style={{ position:"absolute", top:0, right:0, width:200, height:200, background:"radial-gradient(circle,#ef444412,transparent 70%)", pointerEvents:"none" }} />
          <div style={{ fontSize:10, color:"#ef4444", letterSpacing:3, marginBottom:10, fontFamily:"monospace" }}>
            ⬤ RACE BERIKUTNYA — ROUND {nextRace.round}
          </div>
          <div style={{ display:"flex", gap:20, alignItems:"flex-start", flexWrap:"wrap" }}>
            <div style={{ flex:1 }}>
              <h2 style={{ fontSize:22, fontWeight:900, letterSpacing:-0.5, marginBottom:4 }}>
                {getCountryFlag(nextRace.circuit.country)} {nextRace.name}
              </h2>
              <div style={{ fontSize:12, color:"#6b7280", marginBottom:14 }}>
                {nextRace.circuit.name} · {nextRace.circuit.location}, {nextRace.circuit.country}
              </div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                {qualiWIB && (
                  <div style={{ background:"#60a5fa15", border:"1px solid #60a5fa33", borderRadius:8, padding:"6px 12px" }}>
                    <div style={{ fontSize:10, color:"#60a5fa", marginBottom:2 }}>🔵 QUALIFYING</div>
                    <div style={{ fontSize:12, fontFamily:"monospace", fontWeight:700, color:"#93c5fd" }}>{qualiWIB}</div>
                  </div>
                )}
                {raceWIB && (
                  <div style={{ background:"#fbbf2415", border:"1px solid #fbbf2433", borderRadius:8, padding:"6px 12px" }}>
                    <div style={{ fontSize:10, color:"#fbbf24", marginBottom:2 }}>🏁 RACE</div>
                    <div style={{ fontSize:12, fontFamily:"monospace", fontWeight:700, color:"#fde68a" }}>{raceWIB}</div>
                  </div>
                )}
              </div>
            </div>
            <div style={{ textAlign:"center", flexShrink:0 }}>
              <div style={{ fontSize:52, fontWeight:900, color:"#ef4444", lineHeight:1 }}>{daysUntil(nextRace.date)}</div>
              <div style={{ fontSize:11, color:"#6b7280" }}>HARI LAGI</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{ display:"flex", gap:6, marginBottom:16 }}>
        {[["all","Semua"],["upcoming","Akan Datang"],["finished","Selesai"]].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding:"6px 16px", borderRadius:8, cursor:"pointer",
            background: filter===v ? "#ef444422" : "transparent",
            border: `1px solid ${filter===v ? "#ef444466" : "#1f2937"}`,
            color: filter===v ? "#ef4444" : "#6b7280",
            fontSize:12, fontFamily:"inherit", fontWeight:600,
          }}>{l}</button>
        ))}
      </div>

      {/* Race List */}
      {loading ? (
        <div style={{ display:"grid", gap:8 }}>
          {[...Array(8)].map((_,i) => (
            <div key={i} style={{ height:68, background:"#0d1117", borderRadius:10, animation:`pulse 1.5s ease ${i*80}ms infinite` }} />
          ))}
        </div>
      ) : (
        <div style={{ display:"grid", gap:6 }}>
          {filtered.map((race, i) => {
            const fb      = SCHEDULE_2026[race.round] || {};
            const isNext  = race === nextRace;
            const done    = race.status === "finished";
            const days    = daysUntil(race.date);
            const isOpen  = expanded === race.round;
            const isSprint = !!(race.sprint || fb.sprint);
            const rWIB    = fmtWIB(race.date || fb.race?.date, race.time || fb.race?.time);

            return (
              <div key={race.round} style={{ animation:`fadeUp 0.3s ease ${i*20}ms both` }}>

                {/* ── Row ── klik seluruh baris untuk expand */}
                <div
                  onClick={() => setExpanded(isOpen ? null : race.round)}
                  style={{
                    background: isOpen ? "#0f1420" : isNext ? "#100a0a" : "#0d1117",
                    border: `1px solid ${isNext ? "#ef444433" : isOpen ? "#1f2937" : "#1a1f2e"}`,
                    borderRadius: isOpen ? "12px 12px 0 0" : 12,
                    padding: "13px 16px",
                    display: "flex", alignItems: "center", gap: 12,
                    opacity: done ? 0.75 : 1,
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "background 0.15s",
                  }}
                >
                  <div style={{
                    width:30, height:30, borderRadius:6, flexShrink:0,
                    background: isNext ? "#ef444422" : "#1a1f2e",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:11, fontWeight:800,
                    color: isNext ? "#ef4444" : "#4b5563",
                  }}>{race.round}</div>

                  <span style={{ fontSize:20, flexShrink:0 }}>{getCountryFlag(race.circuit.country)}</span>

                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700, display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                      {race.name}
                      {isSprint && <span style={{ fontSize:9, background:"#fbbf2420", border:"1px solid #fbbf2433", borderRadius:3, padding:"1px 5px", color:"#fbbf24" }}>SPRINT</span>}
                      {done && <span style={{ fontSize:9, background:"#22c55e20", border:"1px solid #22c55e33", borderRadius:3, padding:"1px 5px", color:"#22c55e" }}>✓ SELESAI</span>}
                    </div>
                    <div style={{ fontSize:11, color:"#374151" }}>{race.circuit.name} · {race.circuit.location}</div>
                  </div>

                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:12, color:"#9ca3af", fontFamily:"monospace" }}>{rWIB || fmtDateShort(race.date)}</div>
                    {!done && <div style={{ fontSize:11, color: isNext ? "#ef4444" : days < 14 ? "#fbbf24" : "#4b5563" }}>
                      {days === 0 ? "🔥 Hari ini!" : days === 1 ? "Besok!" : `${days} hari lagi`}
                    </div>}
                    {done && <div style={{ fontSize:11, color:"#374151" }}>Lihat hasil</div>}
                  </div>

                  <span style={{
                    fontSize:10, color:"#374151", flexShrink:0,
                    display:"inline-block", transition:"transform 0.2s",
                    transform: isOpen ? "rotate(180deg)" : "none",
                  }}>▼</span>
                </div>

                {/* ── Expanded session list ── */}
                {isOpen && (
                  <div style={{ animation:"fadeIn 0.2s ease" }}>
                    <SessionList race={race} />
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
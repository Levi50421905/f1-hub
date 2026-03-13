"use client";
// src/app/schedule/page.jsx (Redesigned)

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCountryFlagImg } from "@/lib/teamColors";
import { SCHEDULE_2026 } from "@/lib/schedule2026";

function FlagImg({ url, alt, size = 20 }) {
  if (!url) return <span style={{ fontSize: size * 0.8 }}>🏁</span>;
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

function fmtCompact(dateStr, timeStr) {
  if (!dateStr) return "TBA";
  try {
    const t   = (timeStr || "00:00:00").replace(/Z?$/, "Z");
    const dt  = new Date(`${dateStr}T${t}`);
    if (isNaN(dt)) return "TBA";
    const day  = dt.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", weekday: "short", day: "numeric", month: "short" });
    const time = dt.toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hour12: false });
    return `${day}, ${time} WIB`;
  } catch { return "TBA"; }
}

function toDate(dateStr, timeStr) {
  if (!dateStr) return null;
  try {
    const t = (timeStr || "00:00:00").replace(/Z?$/, "Z");
    const d = new Date(`${dateStr}T${t}`);
    return isNaN(d) ? null : d;
  } catch { return null; }
}

function getSessions(race) {
  const fb       = SCHEDULE_2026[race.round] || {};
  const isSprint = !!(race.sprint || fb.sprint);
  return [
    { key: "fp1",        label: "FP1",                         color: "#fbbf24", date: fb.fp1?.date,        time: fb.fp1?.time        },
    { key: "fp2",        label: isSprint ? "Sprint Quali" : "FP2", color: isSprint ? "#a78bfa" : "#fbbf24", date: fb.fp2?.date, time: fb.fp2?.time },
    { key: "fp3",        label: isSprint ? "Sprint Race" : "FP3",  color: isSprint ? "#a78bfa" : "#fbbf24", date: fb.fp3?.date, time: fb.fp3?.time },
    { key: "qualifying", label: "Qualifying",                   color: "#60a5fa", date: fb.qualifying?.date, time: fb.qualifying?.time },
    { key: "race",       label: "RACE",                         color: "#ef4444", date: fb.race?.date,       time: fb.race?.time       },
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

  const today     = new Date();
  const filtered  = races.filter(r => filter === "all" || r.status === filter);
  const nextRace  = races.find(r => r.status === "upcoming");
  const daysUntil = ds => Math.ceil((new Date(ds) - today) / 86400000);

  const nextFb   = nextRace ? SCHEDULE_2026[nextRace.round] || {} : {};
  const raceWIB  = nextRace ? fmtCompact(nextFb.race?.date, nextFb.race?.time) : null;
  const qualiWIB = nextRace ? fmtCompact(nextFb.qualifying?.date, nextFb.qualifying?.time) : null;

  return (
    <div>
      <style>{`
        @keyframes fadeUp    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse     { 0%,100%{opacity:0.3} 50%{opacity:0.6} }
        @keyframes blink     { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .skeleton {
          background: #0b0d14;
          border: 1px solid #1a1f2e;
          border-radius: 10px;
          animation: pulse 1.5s ease-in-out infinite;
        }
        .race-item { transition: background 0.15s; cursor: pointer; }
        .race-item:hover { background: #0d0f18 !important; }
        .filter-btn {
          padding: 6px 14px; border-radius: 6px; cursor: pointer;
          font-size: 10px; font-family: 'JetBrains Mono', monospace;
          font-weight: 600; letter-spacing: 0.5px;
          transition: all 0.15s;
        }
        .detail-link {
          display: block; margin-top: 12px;
          border-radius: 8px; padding: 9px 14px;
          font-size: 11px; font-weight: 600; text-align: center;
          font-family: 'Barlow Condensed', sans-serif; letter-spacing: 0.5px;
          text-decoration: none; transition: background 0.15s;
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{ marginBottom: 20, animation: "fadeUp 0.35s ease" }}>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: 3, color: "#4b5563",
          fontFamily: "'JetBrains Mono', monospace",
          display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
        }}>
          <div style={{ width: 16, height: 1, background: "#ef4444" }} />
          KALENDER 2026
        </div>
        <h1 style={{
          fontSize: 28, fontWeight: 900, letterSpacing: -1, margin: 0, color: "#f1f5f9",
          fontFamily: "'Barlow Condensed', sans-serif",
        }}>Musim F1 {new Date().getFullYear()}</h1>
        <p style={{
          fontSize: 10, color: "#374151", marginTop: 6,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {races.length} RACE · {races.filter(r => r.status === "finished").length} SELESAI · UTC+7 WIB
        </p>
      </div>

      {/* ── Next Race Hero ── */}
      {!loading && nextRace && (
        <div style={{
          background: "linear-gradient(135deg, #0c0008 0%, #0f0515 50%, #08080f 100%)",
          border: "1px solid #2a1535",
          borderRadius: 14, padding: "18px 20px", marginBottom: 16,
          position: "relative", overflow: "hidden",
          animation: "fadeUp 0.4s ease 0.05s both",
        }}>
          <div style={{
            position: "absolute", top: -40, right: -40, width: 160, height: 160,
            background: "radial-gradient(circle, #ef444410, transparent 65%)",
            pointerEvents: "none",
          }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 9, color: "#ef4444", letterSpacing: 3,
                fontFamily: "'JetBrains Mono', monospace", marginBottom: 10,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{
                  display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                  background: "#ef4444", animation: "blink 2s ease infinite",
                }} />
                BERIKUTNYA — R{nextRace.round}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <FlagImg url={getCountryFlagImg(nextRace.circuit.country)} alt={nextRace.circuit.country} size={26} />
                <h2 style={{
                  fontSize: 20, fontWeight: 900, margin: 0, letterSpacing: -0.3,
                  fontFamily: "'Barlow Condensed', sans-serif", color: "#f1f5f9",
                }}>{nextRace.name}</h2>
              </div>

              <div style={{
                fontSize: 10, color: "#374151", marginBottom: 12,
                fontFamily: "'JetBrains Mono', monospace",
              }}>{nextRace.circuit.name}</div>

              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {qualiWIB && (
                  <div>
                    <div style={{ fontSize: 8, color: "#374151", letterSpacing: 2, marginBottom: 2, fontFamily: "'JetBrains Mono', monospace" }}>KUALIFIKASI</div>
                    <div style={{ fontSize: 11, color: "#60a5fa", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{qualiWIB}</div>
                  </div>
                )}
                {raceWIB && (
                  <div>
                    <div style={{ fontSize: 8, color: "#374151", letterSpacing: 2, marginBottom: 2, fontFamily: "'JetBrains Mono', monospace" }}>RACE</div>
                    <div style={{ fontSize: 11, color: "#fbbf24", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{raceWIB}</div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{
                fontSize: 48, fontWeight: 900, color: "#ef4444", lineHeight: 1,
                fontFamily: "'Barlow Condensed', sans-serif",
              }}>{daysUntil(nextRace.date)}</div>
              <div style={{
                fontSize: 9, color: "#4b5563", letterSpacing: 2,
                fontFamily: "'JetBrains Mono', monospace",
              }}>HARI LAGI</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Filter ── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, animation: "fadeUp 0.35s ease 0.1s both" }}>
        {[["all", "Semua"], ["upcoming", "Akan Datang"], ["finished", "Selesai"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} className="filter-btn" style={{
            background: filter === v ? "#ef444418" : "transparent",
            border: `1px solid ${filter === v ? "#ef444440" : "#1a1f2e"}`,
            color: filter === v ? "#ef4444" : "#4b5563",
          }}>{l}</button>
        ))}
      </div>

      {/* ── Race List ── */}
      {loading ? (
        <div style={{ display: "grid", gap: 6 }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 58, animationDelay: `${i * 50}ms` }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 6 }}>
          {filtered.map((race, i) => {
            const fb       = SCHEDULE_2026[race.round] || {};
            const isNext   = race === nextRace;
            const done     = race.status === "finished";
            const days     = daysUntil(race.date);
            const isOpen   = expanded === race.round;
            const isSprint = !!(race.sprint || fb.sprint);
            const rWIB     = fmtCompact(fb.race?.date, fb.race?.time);
            const sessions = getSessions(race);
            const flagUrl  = getCountryFlagImg(race.circuit.country);

            return (
              <div key={race.round} style={{ animation: `fadeUp 0.25s ease ${Math.min(i, 8) * 20}ms both` }}>
                <div
                  className="race-item"
                  onClick={() => setExpanded(isOpen ? null : race.round)}
                  style={{
                    background: isOpen ? "#0d0f18" : isNext ? "#0d080f" : "#0b0d14",
                    border: `1px solid ${isNext ? "#ef444428" : isOpen ? "#1e2535" : "#1a1f2e"}`,
                    borderRadius: isOpen ? "10px 10px 0 0" : 10,
                    padding: "11px 14px",
                    display: "flex", alignItems: "center", gap: 10,
                    userSelect: "none", opacity: done ? 0.65 : 1,
                  }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                    background: isNext ? "#ef444418" : "#0f1219",
                    border: `1px solid ${isNext ? "#ef444330" : "#1a1f2e"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 800,
                    color: isNext ? "#ef4444" : "#2d3748",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>R{race.round}</div>

                  <FlagImg url={flagUrl} alt={race.circuit.country} size={22} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        fontFamily: "'Barlow Condensed', sans-serif",
                        letterSpacing: 0.3,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>{race.name.replace(" Grand Prix", " GP")}</span>
                      {isSprint && (
                        <span style={{
                          fontSize: 7, background: "#a78bfa15", border: "1px solid #a78bfa28",
                          borderRadius: 3, padding: "1px 5px", color: "#a78bfa",
                          fontFamily: "'JetBrains Mono', monospace", flexShrink: 0,
                        }}>SPR</span>
                      )}
                      {done && (
                        <span style={{
                          fontSize: 7, background: "#22c55e12", border: "1px solid #22c55e22",
                          borderRadius: 3, padding: "1px 5px", color: "#22c55e",
                          fontFamily: "'JetBrains Mono', monospace", flexShrink: 0,
                        }}>DONE</span>
                      )}
                    </div>
                    <div style={{
                      fontSize: 10, color: "#374151",
                      fontFamily: "'JetBrains Mono', monospace",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>{rWIB}</div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {!done && (
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        color: isNext ? "#ef4444" : days < 14 ? "#fbbf24" : "#2d3748",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        {days === 0 ? "TODAY" : days === 1 ? "BESOK" : `${days}H`}
                      </span>
                    )}
                    <span style={{
                      fontSize: 9, color: "#2d3748",
                      transition: "transform 0.2s", display: "inline-block",
                      transform: isOpen ? "rotate(180deg)" : "none",
                    }}>▼</span>
                  </div>
                </div>

                {/* Expanded */}
                {isOpen && (
                  <div style={{
                    background: "#080a10",
                    border: "1px solid #1a1f2e", borderTop: "none",
                    borderRadius: "0 0 10px 10px",
                    padding: "12px 16px 14px",
                    animation: "slideDown 0.18s ease",
                  }}>
                    <div style={{
                      fontSize: 8, color: "#2d3748", letterSpacing: 3,
                      fontFamily: "'JetBrains Mono', monospace",
                      marginBottom: 8, paddingBottom: 8,
                      borderBottom: "1px solid #0f1219",
                    }}>JADWAL SESI · WIB (UTC+7)</div>

                    {sessions.map((s, si) => {
                      const dt     = toDate(s.date, s.time);
                      const isPast = dt && dt < today;
                      const isRace = s.key === "race";
                      const txt    = dt ? fmtCompact(s.date, s.time) : "TBA";
                      return (
                        <div key={s.key} style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "6px 0",
                          borderBottom: si < sessions.length - 1 ? "1px solid #0d0f18" : "none",
                        }}>
                          <div style={{
                            width: 3, height: 24, borderRadius: 2,
                            background: isPast ? "#1a1f2e" : s.color,
                            flexShrink: 0,
                          }} />
                          <div style={{
                            fontSize: 10, fontWeight: isRace ? 700 : 500,
                            color: isPast ? "#2d3748" : isRace ? "#f1f5f9" : "#6b7280",
                            width: 80, flexShrink: 0,
                            fontFamily: "'JetBrains Mono', monospace",
                          }}>{s.label}</div>
                          <div style={{
                            fontSize: 10, flex: 1,
                            color: isPast ? "#2d3748" : isRace ? "#fbbf24" : "#9ca3af",
                            fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: isRace ? 600 : 400,
                          }}>{txt}</div>
                          {isPast && <span style={{ fontSize: 9, color: "#22c55e" }}>✓</span>}
                        </div>
                      );
                    })}

                    <Link href={`/race/${race.round}`} className="detail-link" style={{
                      background: done ? "#ef444412" : "#0f1219",
                      border: `1px solid ${done ? "#ef444428" : "#1a1f2e"}`,
                      color: done ? "#ef4444" : "#4b5563",
                    }}>
                      {done ? "Lihat Hasil Race →" : "Detail Race Weekend →"}
                    </Link>
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
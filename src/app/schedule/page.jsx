"use client";
// src/app/schedule/page.jsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCountryFlagImg } from "@/lib/teamColors";
import { SCHEDULE_2026 } from "@/lib/schedule2026";

function FlagImg({ url, alt, size = 20 }) {
  if (!url) return <span style={{ fontSize: size * 0.8 }}>🏁</span>;
  return (
    <img src={url} alt={alt || "flag"} style={{
      width: size, height: Math.round(size * 0.67),
      borderRadius: 2, display: "block", flexShrink: 0,
      objectFit: "cover", boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
    }} />
  );
}

function fmtCompact(dateStr, timeStr) {
  if (!dateStr) return "TBA";
  try {
    const t  = (timeStr || "00:00:00").replace(/Z?$/, "Z");
    const dt = new Date(`${dateStr}T${t}`);
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
    { key: "fp1",        label: "FP1",                              color: "#fbbf24", date: fb.fp1?.date,        time: fb.fp1?.time        },
    { key: "fp2",        label: isSprint ? "Sprint Quali" : "FP2", color: isSprint ? "#a78bfa" : "#fbbf24", date: fb.fp2?.date, time: fb.fp2?.time },
    { key: "fp3",        label: isSprint ? "Sprint Race"  : "FP3", color: isSprint ? "#a78bfa" : "#fbbf24", date: fb.fp3?.date, time: fb.fp3?.time },
    { key: "qualifying", label: "Qualifying",                       color: "#60a5fa", date: fb.qualifying?.date, time: fb.qualifying?.time },
    { key: "race",       label: "RACE",                             color: "#ef4444", date: fb.race?.date,       time: fb.race?.time       },
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
        .skeleton { background:var(--bg-raised); border:1px solid var(--border); border-radius:10px; animation:pulse 1.5s ease-in-out infinite; }
        .race-item { transition:background 0.15s; cursor:pointer; }
        .race-item:hover { background:var(--bg-hover) !important; }
        .filter-btn { padding:6px 16px; border-radius:8px; cursor:pointer; font-size:11px; font-family:'Outfit',sans-serif; font-weight:600; transition:all 0.15s; }
        .detail-link { display:block; margin-top:12px; border-radius:8px; padding:9px 14px; font-size:12px; font-weight:600; text-align:center; font-family:'Barlow Condensed',sans-serif; letter-spacing:0.5px; text-decoration:none; transition:background 0.15s; }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        background: "linear-gradient(135deg, #10060c 0%, #0e0618 50%, #0c0e1a 100%)",
        border: "1px solid #2a1535",
        borderRadius: "var(--r-xl)", padding: "24px 24px 20px",
        marginBottom: 16, position: "relative", overflow: "hidden",
        animation: "fadeUp 0.35s ease",
      }}>
        <div style={{ position:"absolute", top:-50, right:-50, width:180, height:180, background:"radial-gradient(circle, rgba(232,52,74,0.1) 0%, transparent 65%)", pointerEvents:"none" }} />

        <div style={{ fontSize:10, fontWeight:700, letterSpacing:3, color:"var(--red)", fontFamily:"'JetBrains Mono',monospace", display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          <div style={{ width:16, height:1, background:"var(--red)" }} />
          KALENDER 2026
        </div>
        <h1 style={{ fontSize:30, fontWeight:900, letterSpacing:-1, margin:"0 0 6px", color:"var(--text-primary)", fontFamily:"'Barlow Condensed',sans-serif" }}>
          Musim F1 {new Date().getFullYear()}
        </h1>
        <p style={{ fontSize:11, color:"var(--text-secondary)", fontFamily:"'JetBrains Mono',monospace" }}>
          {races.length} RACE · {races.filter(r => r.status === "finished").length} SELESAI · UTC+7 WIB
        </p>
      </div>

      {/* ── Next Race Hero ── */}
      {!loading && nextRace && (
        <div style={{
          background: "linear-gradient(135deg, #0c0008 0%, #0f0515 50%, #08080f 100%)",
          border: "1px solid #2a1535",
          borderRadius: "var(--r-lg)", padding: "18px 20px", marginBottom: 16,
          position: "relative", overflow: "hidden",
          animation: "fadeUp 0.4s ease 0.05s both",
        }}>
          <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, background:"radial-gradient(circle, rgba(232,52,74,0.1), transparent 65%)", pointerEvents:"none" }} />

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:9, color:"var(--red)", letterSpacing:3, fontFamily:"'JetBrains Mono',monospace", marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:"var(--red)", animation:"blink 2s ease infinite" }} />
                BERIKUTNYA — R{nextRace.round}
              </div>

              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                <FlagImg url={getCountryFlagImg(nextRace.circuit.country)} alt={nextRace.circuit.country} size={26} />
                <h2 style={{ fontSize:22, fontWeight:900, margin:0, letterSpacing:-0.3, fontFamily:"'Barlow Condensed',sans-serif", color:"var(--text-primary)" }}>
                  {nextRace.name}
                </h2>
              </div>

              <div style={{ fontSize:11, color:"var(--text-secondary)", marginBottom:14, fontFamily:"'JetBrains Mono',monospace" }}>
                {nextRace.circuit.name}
              </div>

              <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                {qualiWIB && (
                  <div>
                    <div style={{ fontSize:9, color:"var(--text-muted)", letterSpacing:2, marginBottom:3, fontFamily:"'JetBrains Mono',monospace" }}>KUALIFIKASI</div>
                    <div style={{ fontSize:12, color:"#60a5fa", fontFamily:"'JetBrains Mono',monospace", fontWeight:600 }}>{qualiWIB}</div>
                  </div>
                )}
                {raceWIB && (
                  <div>
                    <div style={{ fontSize:9, color:"var(--text-muted)", letterSpacing:2, marginBottom:3, fontFamily:"'JetBrains Mono',monospace" }}>RACE</div>
                    <div style={{ fontSize:12, color:"#fbbf24", fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>{raceWIB}</div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ textAlign:"right", flexShrink:0 }}>
              <div style={{ fontSize:52, fontWeight:900, color:"var(--red)", lineHeight:1, fontFamily:"'Barlow Condensed',sans-serif" }}>
                {daysUntil(nextRace.date)}
              </div>
              <div style={{ fontSize:10, color:"var(--text-secondary)", letterSpacing:2, fontFamily:"'JetBrains Mono',monospace", fontWeight:600 }}>
                HARI LAGI
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Filter ── */}
      <div style={{ display:"flex", gap:6, marginBottom:14, animation:"fadeUp 0.35s ease 0.1s both" }}>
        {[["all","Semua"],["upcoming","Akan Datang"],["finished","Selesai"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} className="filter-btn" style={{
            background: filter === v ? "var(--red-bg)" : "transparent",
            border: `1px solid ${filter === v ? "var(--red-border)" : "var(--border)"}`,
            color: filter === v ? "var(--red)" : "var(--text-secondary)",
          }}>{l}</button>
        ))}
      </div>

      {/* ── Race List ── */}
      {loading ? (
        <div style={{ display:"grid", gap:6 }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height:58, animationDelay:`${i*50}ms` }} />
          ))}
        </div>
      ) : (
        <div style={{ display:"grid", gap:6 }}>
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
              <div key={race.round} style={{ animation:`fadeUp 0.25s ease ${Math.min(i,8)*20}ms both` }}>
                <div className="race-item" onClick={() => setExpanded(isOpen ? null : race.round)} style={{
                  background: isOpen ? "var(--bg-raised)" : isNext ? "#0d080f" : "var(--bg-surface)",
                  border: `1px solid ${isNext ? "#e8344a28" : isOpen ? "var(--border-light)" : "var(--border)"}`,
                  borderRadius: isOpen ? "10px 10px 0 0" : 10,
                  padding: "11px 14px",
                  display: "flex", alignItems: "center", gap: 10,
                  userSelect: "none", opacity: done ? 0.75 : 1,
                }}>
                  <div style={{
                    width:28, height:28, borderRadius:7, flexShrink:0,
                    background: isNext ? "var(--red-bg)" : "var(--bg-raised)",
                    border: `1px solid ${isNext ? "var(--red-border)" : "var(--border)"}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:9, fontWeight:800,
                    color: isNext ? "var(--red)" : "var(--text-muted)",
                    fontFamily:"'JetBrains Mono',monospace",
                  }}>R{race.round}</div>

                  <FlagImg url={flagUrl} alt={race.circuit.country} size={22} />

                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                      <span style={{
                        fontSize:13, fontWeight:700, color:"var(--text-primary)",
                        fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:0.3,
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                      }}>{race.name.replace(" Grand Prix"," GP")}</span>
                      {isSprint && <span style={{ fontSize:7, background:"#a78bfa15", border:"1px solid #a78bfa28", borderRadius:3, padding:"1px 5px", color:"#a78bfa", fontFamily:"'JetBrains Mono',monospace", flexShrink:0 }}>SPR</span>}
                      {done && <span style={{ fontSize:7, background:"#22c55e12", border:"1px solid #22c55e22", borderRadius:3, padding:"1px 5px", color:"#22c55e", fontFamily:"'JetBrains Mono',monospace", flexShrink:0 }}>DONE</span>}
                    </div>
                    <div style={{ fontSize:11, color:"var(--text-secondary)", fontFamily:"'JetBrains Mono',monospace", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {rWIB}
                    </div>
                  </div>

                  <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                    {!done && (
                      <span style={{ fontSize:11, fontWeight:700, color: isNext ? "var(--red)" : days < 14 ? "var(--gold)" : "var(--text-secondary)", fontFamily:"'JetBrains Mono',monospace" }}>
                        {days === 0 ? "TODAY" : days === 1 ? "BESOK" : `${days}H`}
                      </span>
                    )}
                    <span style={{ fontSize:9, color:"var(--text-muted)", transition:"transform 0.2s", display:"inline-block", transform: isOpen ? "rotate(180deg)" : "none" }}>▼</span>
                  </div>
                </div>

                {isOpen && (
                  <div style={{
                    background:"var(--bg-surface)", border:"1px solid var(--border)", borderTop:"none",
                    borderRadius:"0 0 10px 10px", padding:"12px 16px 14px",
                    animation:"slideDown 0.18s ease",
                  }}>
                    <div style={{ fontSize:9, color:"var(--text-muted)", letterSpacing:3, fontFamily:"'JetBrains Mono',monospace", marginBottom:8, paddingBottom:8, borderBottom:"1px solid var(--border)" }}>
                      JADWAL SESI · WIB (UTC+7)
                    </div>
                    {sessions.map((s, si) => {
                      const dt     = toDate(s.date, s.time);
                      const isPast = dt && dt < today;
                      const isRace = s.key === "race";
                      return (
                        <div key={s.key} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderBottom: si < sessions.length-1 ? "1px solid var(--border)" : "none" }}>
                          <div style={{ width:3, height:24, borderRadius:2, background: isPast ? "var(--border)" : s.color, flexShrink:0 }} />
                          <div style={{ fontSize:11, fontWeight: isRace ? 700 : 500, color: isPast ? "var(--text-muted)" : isRace ? "var(--text-primary)" : "var(--text-secondary)", width:80, flexShrink:0, fontFamily:"'JetBrains Mono',monospace" }}>
                            {s.label}
                          </div>
                          <div style={{ fontSize:11, flex:1, color: isPast ? "var(--text-muted)" : isRace ? "#fbbf24" : "var(--text-secondary)", fontFamily:"'JetBrains Mono',monospace", fontWeight: isRace ? 600 : 400 }}>
                            {dt ? fmtCompact(s.date, s.time) : "TBA"}
                          </div>
                          {isPast && <span style={{ fontSize:10, color:"#22c55e" }}>✓</span>}
                        </div>
                      );
                    })}
                    <Link href={`/race/${race.round}`} className="detail-link" style={{
                      background: done ? "var(--red-bg)" : "var(--bg-raised)",
                      border: `1px solid ${done ? "var(--red-border)" : "var(--border)"}`,
                      color: done ? "var(--red)" : "var(--text-secondary)",
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
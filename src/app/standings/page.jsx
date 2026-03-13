"use client";
// src/app/standings/page.jsx

import { useState, useEffect } from "react";
import { getTeamColor, getFlagImg } from "@/lib/teamColors";

function FlagImg({ url, alt, size = 22 }) {
  if (!url) return null;
  return (
    <img src={url} alt={alt || ""} style={{
      width: size, height: Math.round(size * 0.67),
      borderRadius: 3, display: "block", flexShrink: 0,
      objectFit: "cover", boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
    }} />
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
  const leader       = drivers?.drivers?.[0];
  const leaderColor  = leader ? getTeamColor(leader.team.id) : "#e8344a";
  const totalRaces   = drivers?.round || 0;
  const driversWithPoints = drivers?.drivers?.filter(d => d.points > 0).length || 0;

  return (
    <div>
      <style>{`
        @keyframes pulse  { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0.2} }

        .standing-row {
          display: flex; align-items: center; gap: 14px;
          padding: 13px 18px;
          border-bottom: 1px solid var(--border);
          transition: background 0.15s;
        }
        .standing-row:last-child { border-bottom: none; }
        .standing-row:hover { background: var(--bg-hover); }

        .skeleton {
          background: var(--bg-raised);
          border-radius: var(--r-md);
          animation: pulse 1.8s ease-in-out infinite;
        }

        .tab-btn {
          padding: 8px 22px; border-radius: 8px;
          font-weight: 600; font-size: 13px;
          font-family: 'Outfit', sans-serif;
          transition: all 0.15s; cursor: pointer; border: none;
        }
      `}</style>

      {/* ── HERO HEADER ── */}
      <div style={{
        background: "linear-gradient(135deg, #10060c 0%, #0e0618 50%, #0c0e1a 100%)",
        border: "1px solid #2a1535",
        borderRadius: "var(--r-xl)",
        padding: "28px 28px 24px",
        marginBottom: 20,
        position: "relative", overflow: "hidden",
        animation: "fadeUp 0.4s ease",
      }}>
        {/* Glow */}
        <div style={{ position:"absolute", top:-60, right:-60, width:220, height:220, background:"radial-gradient(circle, rgba(232,52,74,0.12) 0%, transparent 65%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-40, left:-40, width:160, height:160, background:`radial-gradient(circle, ${leaderColor}0a 0%, transparent 65%)`, pointerEvents:"none" }} />

        {/* Label */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(232,52,74,0.1)", border: "1px solid rgba(232,52,74,0.2)",
          borderRadius: 20, padding: "4px 12px", marginBottom: 16,
        }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--red)", display:"inline-block", animation:"blink 2s ease infinite" }} />
          <span style={{ fontSize:10, fontWeight:700, color:"var(--red)", letterSpacing:1.5 }}>STANDINGS 2026</span>
        </div>

        {/* Title row */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:20, marginBottom:24 }}>
          <div>
            <h1 style={{
              fontSize: 32, fontWeight: 900, letterSpacing: -0.5,
              margin: 0, color: "var(--text-primary)",
              fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1,
            }}>Klasemen F1 2026</h1>
            {drivers && (
              <p style={{ fontSize:11, color:"var(--text-muted)", marginTop:6, fontWeight:400 }}>
                Round {drivers.round}
                {lastUpdated && ` · Update ${lastUpdated.toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit" })} WIB`}
              </p>
            )}
          </div>

          {/* Leader snapshot */}
          {leader && !loading && (
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border-light)",
              borderRadius: "var(--r-md)",
              padding: "10px 16px",
              textAlign: "right", flexShrink: 0,
            }}>
              <div style={{ fontSize:9, fontWeight:700, color:"var(--text-muted)", letterSpacing:1.5, marginBottom:4 }}>PEMIMPIN</div>
              <div style={{ fontSize:18, fontWeight:800, color: leaderColor, fontFamily:"'Barlow Condensed', sans-serif", lineHeight:1 }}>
                {leader.driver.code}
              </div>
              <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>{leader.team.name}</div>
              <div style={{
                fontSize:22, fontWeight:900, color:"var(--text-primary)",
                fontFamily:"'Barlow Condensed', sans-serif", marginTop:4,
              }}>{leader.points} <span style={{ fontSize:11, color:"var(--text-muted)", fontWeight:400 }}>pts</span></div>
            </div>
          )}
        </div>

        {/* Stats strip */}
        {!loading && (
          <div style={{ display:"flex", gap:0, borderTop:"1px solid var(--border)", paddingTop:16 }}>
            {[
              { label:"Race Selesai",    val: totalRaces,          color:"var(--text-primary)" },
              { label:"Poin Terbanyak",  val: leader?.points ?? 0, color:"var(--gold)" },
              { label:"Driver Poin",     val: driversWithPoints,   color:"var(--blue)" },
              { label:"Tim Aktif",       val: constructors?.constructors?.length ?? 0, color:"var(--green)" },
            ].map((s, i) => (
              <div key={i} style={{
                flex:1, textAlign:"center",
                borderRight: i < 3 ? "1px solid var(--border)" : "none",
                padding: "0 12px",
              }}>
                <div style={{ fontSize:22, fontWeight:800, color:s.color, fontFamily:"'Barlow Condensed', sans-serif", lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:10, color:"var(--text-muted)", marginTop:4, fontWeight:400 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── TABS ── */}
      <div style={{
        display:"flex", gap:4, marginBottom:16,
        background:"var(--bg-surface)",
        border:"1px solid var(--border)",
        borderRadius:"var(--r-md)",
        padding:4, width:"fit-content",
        animation:"fadeUp 0.4s ease 0.06s both",
      }}>
        {[["drivers","Driver"],["constructors","Konstruktor"]].map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)} className="tab-btn" style={{
            background: tab === v ? "var(--red)" : "transparent",
            color: tab === v ? "#fff" : "var(--text-muted)",
          }}>{l}</button>
        ))}
      </div>

      {error && (
        <div style={{
          background:"var(--red-bg)", border:"1px solid var(--red-border)",
          borderRadius:"var(--r-md)", padding:"12px 16px", marginBottom:16,
          color:"var(--red)", fontSize:13,
        }}>⚠ {error}</div>
      )}

      {/* ── LOADING ── */}
      {loading && (
        <div style={{ display:"grid", gap:2 }}>
          {[...Array(10)].map((_,i) => (
            <div key={i} className="skeleton" style={{ height:58, animationDelay:`${i*50}ms` }} />
          ))}
        </div>
      )}

      {/* ── DRIVER STANDINGS ── */}
      {!loading && tab === "drivers" && drivers && (
        <div style={{
          background:"var(--bg-surface)", border:"1px solid var(--border)",
          borderRadius:"var(--r-lg)", overflow:"hidden",
          animation:"fadeUp 0.35s ease",
        }}>
          {drivers.drivers.map((d, i) => {
            const color   = getTeamColor(d.team.id);
            const flagUrl = getFlagImg(d.driver.nationality);
            const pct     = maxDriverPts > 0 ? Math.round((d.points / maxDriverPts) * 100) : 0;
            const isLead  = i === 0;
            const rank    = d.pos ?? i + 1;
            return (
              <div key={d.driver.id} className="standing-row" style={{
                background: isLead ? `${color}08` : undefined,
              }}>
                {/* Rank */}
                <div style={{
                  width:30, height:30, borderRadius:7, flexShrink:0,
                  background: isLead ? `${color}20` : "var(--bg-raised)",
                  border:`1px solid ${isLead ? `${color}40` : "var(--border)"}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:12, fontWeight:800,
                  color: isLead ? color : rank <= 3 ? "var(--text-secondary)" : "var(--text-muted)",
                  fontFamily:"'Barlow Condensed', sans-serif",
                }}>{rank}</div>

                <FlagImg url={flagUrl} alt={d.driver.nationality} size={24} />

                {/* Name + team + bar */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:4 }}>
                    <span style={{
                      fontSize:14, fontWeight:700, color:"var(--text-primary)",
                      fontFamily:"'Outfit', sans-serif",
                    }}>{d.driver.name}</span>
                    {d.driver.code && (
                      <span style={{ fontSize:10, color:"var(--text-muted)", fontFamily:"'JetBrains Mono', monospace" }}>
                        {d.driver.code}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize:11, color, marginBottom:6, fontWeight:500 }}>{d.team.name}</div>
                  <div style={{ height:2, background:"var(--border)", borderRadius:4, overflow:"hidden" }}>
                    <div style={{
                      width:`${pct}%`, height:"100%", borderRadius:4,
                      background:`linear-gradient(90deg, ${color}60, ${color})`,
                      transition:"width 1.2s cubic-bezier(0.25,1,0.5,1)",
                    }} />
                  </div>
                </div>

                {/* Wins */}
                <div style={{ textAlign:"center", flexShrink:0, minWidth:32 }}>
                  <div style={{ fontSize:10, color:"var(--text-muted)", marginBottom:1 }}>W</div>
                  <div style={{
                    fontSize:16, fontWeight:800,
                    color: d.wins > 0 ? "var(--gold)" : "var(--border-light)",
                    fontFamily:"'Barlow Condensed', sans-serif",
                  }}>{d.wins}</div>
                </div>

                {/* Points */}
                <div style={{ textAlign:"right", flexShrink:0, minWidth:58 }}>
                  <div style={{
                    fontSize:24, fontWeight:900, lineHeight:1,
                    color: isLead ? color : "var(--text-primary)",
                    fontFamily:"'Barlow Condensed', sans-serif",
                  }}>{d.points}</div>
                  <div style={{ fontSize:9, color:"var(--text-muted)", letterSpacing:1 }}>PTS</div>
                </div>

                {/* Car number */}
                {d.driver.num && (
                  <div style={{
                    width:30, height:30, borderRadius:6, flexShrink:0,
                    background:"var(--bg-raised)", border:"1px solid var(--border)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:11, fontWeight:700, color:"var(--text-muted)",
                    fontFamily:"'JetBrains Mono', monospace",
                  }}>{d.driver.num}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── CONSTRUCTOR STANDINGS ── */}
      {!loading && tab === "constructors" && constructors && (
        <div style={{
          background:"var(--bg-surface)", border:"1px solid var(--border)",
          borderRadius:"var(--r-lg)", overflow:"hidden",
          animation:"fadeUp 0.35s ease",
        }}>
          {constructors.constructors.map((c, i) => {
            const color  = getTeamColor(c.team.id);
            const flagUrl = getFlagImg(c.team.nationality);
            const pct    = maxConPts > 0 ? Math.round((c.points / maxConPts) * 100) : 0;
            const isLead = i === 0;
            const rank   = c.pos ?? i + 1;
            return (
              <div key={c.team.id} className="standing-row" style={{
                background: isLead ? `${color}08` : undefined,
              }}>
                <div style={{
                  width:30, height:30, borderRadius:7, flexShrink:0,
                  background: isLead ? `${color}20` : "var(--bg-raised)",
                  border:`1px solid ${isLead ? `${color}40` : "var(--border)"}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:12, fontWeight:800,
                  color: isLead ? color : rank <= 3 ? "var(--text-secondary)" : "var(--text-muted)",
                  fontFamily:"'Barlow Condensed', sans-serif",
                }}>{rank}</div>

                <FlagImg url={flagUrl} alt={c.team.nationality} size={24} />

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:700, marginBottom:6, color:"var(--text-primary)" }}>
                    {c.team.name}
                  </div>
                  <div style={{ height:2, background:"var(--border)", borderRadius:4, overflow:"hidden" }}>
                    <div style={{
                      width:`${pct}%`, height:"100%", borderRadius:4,
                      background:`linear-gradient(90deg, ${color}60, ${color})`,
                      transition:"width 1.2s cubic-bezier(0.25,1,0.5,1)",
                    }} />
                  </div>
                </div>

                <div style={{ textAlign:"center", flexShrink:0, minWidth:32 }}>
                  <div style={{ fontSize:10, color:"var(--text-muted)", marginBottom:1 }}>W</div>
                  <div style={{
                    fontSize:16, fontWeight:800,
                    color: c.wins > 0 ? "var(--gold)" : "var(--border-light)",
                    fontFamily:"'Barlow Condensed', sans-serif",
                  }}>{c.wins}</div>
                </div>

                <div style={{ textAlign:"right", flexShrink:0, minWidth:58 }}>
                  <div style={{
                    fontSize:24, fontWeight:900, lineHeight:1,
                    color: isLead ? color : "var(--text-primary)",
                    fontFamily:"'Barlow Condensed', sans-serif",
                  }}>{c.points}</div>
                  <div style={{ fontSize:9, color:"var(--text-muted)", letterSpacing:1 }}>PTS</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
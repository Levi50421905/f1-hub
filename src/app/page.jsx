"use client";
// src/app/page.jsx — Home (Full Redesign)

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTeamColor, getFlagImg, getCountryFlagImg } from "@/lib/teamColors";
import { SCHEDULE_2026 } from "@/lib/schedule2026";

/* ─── Helpers ─── */
function FlagImg({ url, alt, size = 20 }) {
  if (!url) return null;
  return (
    <img src={url} alt={alt || ""} style={{
      width: size, height: Math.round(size * 0.7),
      borderRadius: 3, objectFit: "cover", flexShrink: 0,
      boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
      display: "block",
    }} />
  );
}

function fmtWIB(dateStr, timeStr) {
  if (!dateStr) return null;
  try {
    const t  = (timeStr || "00:00:00").replace(/Z?$/, "Z");
    const dt = new Date(`${dateStr}T${t}`);
    if (isNaN(dt)) return null;
    return dt.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      weekday: "short", day: "numeric", month: "short",
      hour: "2-digit", minute: "2-digit", hour12: false,
    }) + " WIB";
  } catch { return null; }
}

const pad = n => String(n).padStart(2, "0");

/* ─── Reusable ─── */
function SectionTitle({ children, action, actionHref }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      marginBottom: 12,
    }}>
      <h2 style={{
        fontSize: 12, fontWeight: 700, letterSpacing: 1.5,
        color: "var(--text-muted)", textTransform: "uppercase",
        fontFamily: "'Outfit', sans-serif",
      }}>{children}</h2>
      {actionHref && (
        <Link href={actionHref} style={{
          fontSize: 12, color: "var(--red)",
          fontWeight: 500, opacity: 0.85,
          display: "flex", alignItems: "center", gap: 3,
        }}>
          {action || "Lihat semua"}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      )}
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-lg)",
      overflow: "hidden",
      ...style,
    }}>{children}</div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "var(--border)", margin: "0" }} />;
}

/* ─── Main ─── */
export default function HomePage() {
  const [standings, setStandings] = useState(null);
  const [schedule,  setSchedule]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [countdown, setCountdown] = useState(null);
  const [weather,   setWeather]   = useState(null);
  const [news,      setNews]      = useState([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/standings?type=drivers").then(r => r.json()),
      fetch("/api/schedule").then(r => r.json()),
      fetch("/api/news").then(r => r.json()).catch(() => ({ success: false, data: [] })),
    ]).then(([d, s, n]) => {
      if (d.success) setStandings(d.data);
      if (s.success) setSchedule(s.data);
      if (n.success) setNews(n.data.slice(0, 4));
    }).finally(() => setLoading(false));
  }, []);

  const today    = new Date();
  const nextRace = schedule.find(r => r.status === "upcoming");
  const upcoming = schedule.filter(r => r.status === "upcoming").slice(0, 5);
  const top5     = standings?.drivers?.slice(0, 5) || [];
  const leader   = top5[0];
  const fb       = nextRace ? SCHEDULE_2026[nextRace.round] || {} : {};
  const raceWIB  = nextRace ? fmtWIB(nextRace.date || fb.race?.date, nextRace.time || fb.race?.time) : null;
  const qualiWIB = nextRace ? fmtWIB(
    nextRace.qualifying?.date || fb.qualifying?.date,
    nextRace.qualifying?.time || fb.qualifying?.time
  ) : null;

  useEffect(() => {
    if (!nextRace) return;
    const fb2      = SCHEDULE_2026[nextRace.round] || {};
    const raceDate = fb2.race?.date || nextRace.date;
    const raceTime = (fb2.race?.time || nextRace.time || "00:00:00Z").replace(/Z?$/, "Z");
    const target   = new Date(`${raceDate}T${raceTime}`);
    const tick = () => {
      const diff = target - new Date();
      if (diff <= 0) { setCountdown({ d:0, h:0, m:0, s:0 }); return; }
      setCountdown({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [nextRace]);

  useEffect(() => {
    if (!nextRace?.circuit?.lat || !nextRace?.circuit?.long) return;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${nextRace.circuit.lat}&longitude=${nextRace.circuit.long}&current=temperature_2m,weathercode,windspeed_10m&timezone=auto`)
      .then(r => r.json())
      .then(d => {
        const c = d.current; if (!c) return;
        const wc   = c.weathercode;
        const icon = wc === 0 ? "☀️" : wc <= 3 ? "⛅" : wc <= 49 ? "🌫️" : wc <= 69 ? "🌧️" : wc <= 79 ? "🌨️" : "⛈️";
        setWeather({ temp: Math.round(c.temperature_2m), icon, wind: Math.round(c.windspeed_10m) });
      }).catch(() => {});
  }, [nextRace]);

  const daysUntil = ds => Math.ceil((new Date(ds) - today) / 86400000);
  const timeAgo   = pub => {
    if (!pub) return "";
    const diff = Date.now() - new Date(pub);
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m lalu`;
    const h = Math.floor(m / 60);
    return h < 24 ? `${h}j lalu` : `${Math.floor(h/24)}h lalu`;
  };

  const SOURCE_COLORS = {
    "Autosport": "#e8344a", "Motorsport.com": "#f97316",
    "BBC Sport": "#4d9ef5", "NewsAPI": "#a78bfa",
  };

  return (
    <div>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.8; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.2; }
        }
        @keyframes countSpin {
          from { transform: translateY(8px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }

        .fade-1 { animation: fadeUp .5s ease both; }
        .fade-2 { animation: fadeUp .5s ease .08s both; }
        .fade-3 { animation: fadeUp .5s ease .16s both; }
        .fade-4 { animation: fadeUp .5s ease .24s both; }

        .home-cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .stat-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }
        @media (max-width: 640px) {
          .home-cols { grid-template-columns: 1fr; }
          .stat-row  { grid-template-columns: repeat(2, 1fr); }
        }

        .row-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px;
          transition: background 0.15s;
          cursor: default;
          text-decoration: none;
          color: inherit;
        }
        .row-item:not(:last-child) { border-bottom: 1px solid var(--border); }
        .row-item:hover { background: var(--bg-raised); }

        .news-item {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 13px 16px;
          text-decoration: none; color: inherit;
          transition: background 0.15s;
        }
        .news-item:not(:last-child) { border-bottom: 1px solid var(--border); }
        .news-item:hover { background: var(--bg-raised); }

        .skeleton {
          background: var(--bg-raised);
          border-radius: var(--r-md);
          animation: pulse 1.8s ease-in-out infinite;
        }

        .stat-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          padding: 14px 16px;
          transition: border-color 0.2s;
        }
        .stat-card:hover { border-color: var(--border-light); }
      `}</style>

      {/* ════ HERO ════ */}
      {!loading && nextRace && (
        <div className="fade-1" style={{
          background: "linear-gradient(145deg, #12060a 0%, #100818 40%, #0c0e18 100%)",
          border: "1px solid #2c1530",
          borderRadius: "var(--r-xl)",
          padding: "24px",
          marginBottom: 20,
          position: "relative", overflow: "hidden",
        }}>
          {/* Glow layers */}
          <div style={{ position: "absolute", top: -80, right: -80, width: 260, height: 260, background: "radial-gradient(circle, rgba(232,52,74,0.1) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, left: -40, width: 200, height: 200, background: "radial-gradient(circle, rgba(77,158,245,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />

          {/* Live indicator */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(232,52,74,0.12)", border: "1px solid rgba(232,52,74,0.2)",
            borderRadius: 20, padding: "4px 10px", marginBottom: 16,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--red)", display: "inline-block", animation: "blink 1.8s ease infinite" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--red)", letterSpacing: 1.5, textTransform: "uppercase" }}>Race Berikutnya</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
            {/* Left */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Race name */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <FlagImg url={getCountryFlagImg(nextRace.circuit.country)} alt={nextRace.circuit.country} size={28} />
                <h1 style={{
                  fontSize: 26, fontWeight: 800, lineHeight: 1.1,
                  letterSpacing: -0.5, color: "var(--text-primary)",
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}>{nextRace.name}</h1>
              </div>

              <p style={{
                fontSize: 12, color: "var(--text-muted)",
                marginBottom: 18, fontWeight: 400,
              }}>{nextRace.circuit.name}</p>

              {/* Schedule pills */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {qualiWIB && (
                  <div style={{
                    background: "rgba(77,158,245,0.1)", border: "1px solid rgba(77,158,245,0.2)",
                    borderRadius: 8, padding: "7px 12px",
                  }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(77,158,245,0.7)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2 }}>Kualifikasi</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#4d9ef5" }}>{qualiWIB}</div>
                  </div>
                )}
                {raceWIB && (
                  <div style={{
                    background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.2)",
                    borderRadius: 8, padding: "7px 12px",
                  }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(245,166,35,0.7)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2 }}>Race</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gold)" }}>{raceWIB}</div>
                  </div>
                )}
                {weather && (
                  <div style={{
                    background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                    borderRadius: 8, padding: "7px 12px",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{ fontSize: 16 }}>{weather.icon}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{weather.temp}°C</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{weather.wind} km/h</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Countdown */}
            {countdown && (
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                {countdown.d > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{
                      fontSize: 52, fontWeight: 900, lineHeight: 1,
                      color: "var(--red)",
                      fontFamily: "'Barlow Condensed', sans-serif",
                    }}>{countdown.d}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: 2, textTransform: "uppercase" }}>Hari</div>
                  </div>
                )}
                <div style={{ display: "flex", gap: 4, alignItems: "flex-start", justifyContent: "center" }}>
                  {[
                    { v: pad(countdown.h), l: "Jam" },
                    { sep: true },
                    { v: pad(countdown.m), l: "Mnt" },
                    { sep: true },
                    { v: pad(countdown.s), l: "Dtk" },
                  ].map((item, i) => item.sep ? (
                    <span key={i} style={{ color: "var(--border-light)", fontSize: 18, fontWeight: 700, marginTop: 4 }}>:</span>
                  ) : (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{
                        fontSize: countdown.d > 0 ? 16 : 22, fontWeight: 800,
                        color: "var(--red)",
                        background: "var(--red-bg)",
                        border: "1px solid var(--red-border)",
                        borderRadius: 8, padding: countdown.d > 0 ? "4px 7px" : "6px 9px",
                        fontFamily: "'JetBrains Mono', monospace",
                        minWidth: 32, textAlign: "center", lineHeight: 1.2,
                        animation: "countSpin .3s ease",
                      }}>{item.v}</div>
                      <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 3, fontWeight: 500 }}>{item.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════ STATS ════ */}
      <div className={`stat-row fade-2`}>
        {loading ? [...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 80 }} />
        )) : [
          {
            label: "Race Selesai",
            val: schedule.filter(r => r.status === "finished").length,
            sub: `dari ${schedule.length} race`,
            color: "var(--text-primary)",
          },
          {
            label: "Pimpinan",
            val: leader?.points ?? "—",
            sub: leader?.driver.code ?? "Belum ada",
            color: "var(--gold)",
          },
          {
            label: "Berikutnya",
            val: nextRace ? `R${nextRace.round}` : "—",
            sub: nextRace?.circuit.country ?? "TBA",
            color: "var(--blue)",
          },
          {
            label: "Update",
            val: "Auto",
            sub: "Tiap 1 jam",
            color: "var(--green)",
          },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{
              fontSize: 10, fontWeight: 600, letterSpacing: 1,
              color: "var(--text-muted)", textTransform: "uppercase",
              marginBottom: 8,
            }}>{s.label}</div>
            <div style={{
              fontSize: 24, fontWeight: 800, lineHeight: 1,
              color: s.color, marginBottom: 4,
              fontFamily: "'Barlow Condensed', sans-serif",
            }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ════ MAIN GRID ════ */}
      <div className="home-cols fade-3">

        {/* Top Drivers */}
        <div>
          <SectionTitle actionHref="/standings">Top Driver</SectionTitle>
          <Card>
            {loading ? [...Array(5)].map((_, i) => (
              <div key={i} style={{ height: 52, background: "var(--bg-raised)", margin: "1px 0" }} />
            )) : top5.length > 0 ? top5.map((d, i) => {
              const color   = getTeamColor(d.team.id);
              const flagUrl = getFlagImg(d.driver.nationality);
              const isFirst = i === 0;
              return (
                <div key={d.driver.id} className="row-item" style={{
                  background: isFirst ? `${color}08` : undefined,
                }}>
                  {/* Rank */}
                  <div style={{
                    width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                    background: isFirst ? `${color}20` : "var(--bg-raised)",
                    border: `1px solid ${isFirst ? `${color}40` : "var(--border)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700,
                    color: isFirst ? color : "var(--text-muted)",
                  }}>{i + 1}</div>

                  <FlagImg url={flagUrl} alt={d.driver.nationality} size={22} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 700, color: "var(--text-primary)",
                      letterSpacing: 0.2, lineHeight: 1.2,
                    }}>{d.driver.code || d.driver.lastName}</div>
                    <div style={{ fontSize: 11, color, marginTop: 1, fontWeight: 500 }}>{d.team.name}</div>
                  </div>

                  <div style={{
                    fontSize: 18, fontWeight: 800,
                    color: isFirst ? color : "var(--text-secondary)",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    flexShrink: 0, minWidth: 32, textAlign: "right",
                  }}>{d.points}</div>
                </div>
              );
            }) : (
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🏁</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Musim belum dimulai</div>
              </div>
            )}
          </Card>
        </div>

        {/* Upcoming Races */}
        <div>
          <SectionTitle actionHref="/schedule">Race Selanjutnya</SectionTitle>
          <Card>
            {loading ? [...Array(5)].map((_, i) => (
              <div key={i} style={{ height: 52, background: "var(--bg-raised)", margin: "1px 0" }} />
            )) : upcoming.map((race, i) => {
              const days    = daysUntil(race.date);
              const fb2     = SCHEDULE_2026[race.round] || {};
              const wib     = fmtWIB(race.date || fb2.race?.date, race.time || fb2.race?.time);
              const flagUrl = getCountryFlagImg(race.circuit.country);
              const isNext  = i === 0;

              return (
                <Link key={race.round} href={`/race/${race.round}`} className="row-item" style={{
                  background: isNext ? "rgba(232,52,74,0.04)" : undefined,
                }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                    background: isNext ? "var(--red-bg)" : "var(--bg-raised)",
                    border: `1px solid ${isNext ? "var(--red-border)" : "var(--border)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 700,
                    color: isNext ? "var(--red)" : "var(--text-muted)",
                    letterSpacing: 0.5,
                  }}>R{race.round}</div>

                  <FlagImg url={flagUrl} alt={race.circuit.country} size={22} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 700, color: "var(--text-primary)",
                      letterSpacing: 0.2, lineHeight: 1.2,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{race.name.replace(" Grand Prix", " GP")}</div>
                    {wib && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{wib}</div>}
                  </div>

                  <div style={{
                    fontSize: 11, fontWeight: 700,
                    color: isNext ? "var(--red)" : days < 14 ? "var(--gold)" : "var(--text-muted)",
                    flexShrink: 0, textAlign: "right",
                  }}>
                    {days === 0 ? "Hari ini" : days === 1 ? "Besok" : `${days}h`}
                  </div>
                </Link>
              );
            })}
          </Card>
        </div>
      </div>

      {/* ════ NEWS ════ */}
      {news.length > 0 && (
        <div style={{ marginTop: 20 }} className="fade-4">
          <SectionTitle actionHref="/news">Berita Terbaru</SectionTitle>
          <Card>
            {news.map((item, i) => (
              <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="news-item">
                {item.img && (
                  <div style={{
                    width: 64, height: 46, flexShrink: 0,
                    borderRadius: 8, overflow: "hidden", background: "var(--bg-raised)",
                  }}>
                    <img src={item.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => { e.target.parentElement.style.display = "none"; }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: 1,
                      color: SOURCE_COLORS[item.source] || "var(--red)",
                      textTransform: "uppercase",
                    }}>{item.source}</span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>·</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{timeAgo(item.pub)}</span>
                  </div>
                  <div style={{
                    fontSize: 13, fontWeight: 600, lineHeight: 1.5,
                    color: "var(--text-secondary)",
                    overflow: "hidden", display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                  }}>{item.title}</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-muted)", flexShrink: 0, marginTop: 2 }}>
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            ))}
          </Card>
        </div>
      )}
      <button
  onClick={() => {
    localStorage.removeItem("f1-notif-onboarded");
    localStorage.removeItem("f1-reminders");
    localStorage.removeItem("f1-notif-prefs");
    alert("Reset! Tutup dan buka ulang app.");
  }}
  style={{
    position: "fixed", bottom: 80, right: 16, zIndex: 9999,
    background: "#ef4444", color: "#fff", border: "none",
    borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700,
  }}
>
  RESET
</button>
    </div>
  );
}
"use client";
// src/app/page.jsx — Home (Redesigned)

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTeamColor, getFlagImg, getCountryFlagImg } from "@/lib/teamColors";
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

function SectionHeader({ label, href }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
      <span style={{
        fontSize: 9, fontWeight: 700, letterSpacing: 3, color: "#4b5563",
        fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <div style={{ width: 12, height: 1, background: "#ef4444" }} />
        {label}
      </span>
      {href && (
        <Link href={href} style={{
          fontSize: 9, color: "#ef4444", textDecoration: "none",
          letterSpacing: 1, fontFamily: "'JetBrains Mono', monospace", opacity: 0.8,
        }}>semua →</Link>
      )}
    </div>
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
      if (n.success) setNews(n.data.slice(0, 3));
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
    const fb2 = SCHEDULE_2026[nextRace.round] || {};
    const raceDate = fb2.race?.date || nextRace.date;
    const raceTime = (fb2.race?.time || nextRace.time || "00:00:00Z").replace(/Z?$/, "Z");
    const target = new Date(`${raceDate}T${raceTime}`);
    function tick() {
      const diff = target - new Date();
      if (diff <= 0) { setCountdown({ d: 0, h: 0, m: 0, s: 0 }); return; }
      setCountdown({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [nextRace]);

  useEffect(() => {
    if (!nextRace?.circuit?.lat || !nextRace?.circuit?.long) return;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${nextRace.circuit.lat}&longitude=${nextRace.circuit.long}&current=temperature_2m,weathercode,windspeed_10m&timezone=auto`)
      .then(r => r.json())
      .then(data => {
        const c = data.current; if (!c) return;
        const code = c.weathercode;
        const icon = code === 0 ? "☀️" : code <= 3 ? "⛅" : code <= 49 ? "🌫️" : code <= 69 ? "🌧️" : code <= 79 ? "🌨️" : "⛈️";
        setWeather({ temp: Math.round(c.temperature_2m), icon, wind: Math.round(c.windspeed_10m) });
      }).catch(() => {});
  }, [nextRace]);

  const daysUntil = ds => Math.ceil((new Date(ds) - today) / 86400000);
  const pad       = n  => String(n).padStart(2, "0");
  const timeAgo   = pub => {
    if (!pub) return "";
    const diff = Date.now() - new Date(pub);
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    return h < 24 ? `${h}j` : `${Math.floor(h / 24)}h`;
  };

  const SOURCE_COLORS = {
    "Autosport": "#ef4444", "Motorsport.com": "#f97316",
    "BBC Sport": "#3b82f6", "NewsAPI": "#8b5cf6",
  };

  return (
    <div style={{ paddingBottom: 8 }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:0.3} 50%{opacity:0.6} }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .home-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 12px;
        }
        @media (max-width: 640px) {
          .home-grid { grid-template-columns: 1fr; }
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
        }

        .card {
          background: #0b0d14;
          border: 1px solid #1a1f2e;
          border-radius: 12px;
          overflow: hidden;
        }

        .list-row {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 14px;
          border-bottom: 1px solid #0a0c12;
          transition: background 0.15s;
          text-decoration: none; color: inherit;
        }
        .list-row:last-child { border-bottom: none; }
        .list-row:hover { background: #0d0f18; }

        .news-row {
          display: flex; gap: 10px; align-items: flex-start;
          padding: 10px 14px;
          border-bottom: 1px solid #0a0c12;
          transition: background 0.15s;
          text-decoration: none; color: inherit;
        }
        .news-row:last-child { border-bottom: none; }
        .news-row:hover { background: #0d0f18; }

        .skeleton {
          background: #0b0d14; border: 1px solid #1a1f2e;
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>

      {/* HERO */}
      {!loading && nextRace && (
        <div style={{
          background: "linear-gradient(135deg, #0c0008 0%, #0f0515 50%, #08080f 100%)",
          border: "1px solid #2a1535", borderRadius: 16,
          padding: "20px 24px", marginBottom: 12,
          position: "relative", overflow: "hidden",
          animation: "fadeUp 0.4s ease",
        }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, background: "radial-gradient(circle, #ef444410, transparent 65%)", pointerEvents: "none" }} />

          <div style={{
            fontSize: 9, color: "#ef4444", letterSpacing: 3,
            fontFamily: "'JetBrains Mono', monospace", marginBottom: 12,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "blink 2s ease infinite" }} />
            RACE BERIKUTNYA
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <FlagImg url={getCountryFlagImg(nextRace.circuit.country)} alt={nextRace.circuit.country} size={26} />
                <h2 style={{
                  fontSize: 22, fontWeight: 900, margin: 0, letterSpacing: -0.5, lineHeight: 1.1,
                  fontFamily: "'Barlow Condensed', sans-serif", color: "#f1f5f9",
                }}>{nextRace.name}</h2>
              </div>
              <div style={{ fontSize: 10, color: "#374151", marginBottom: 14, fontFamily: "'JetBrains Mono', monospace" }}>
                {nextRace.circuit.name}
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {qualiWIB && (
                  <div>
                    <div style={{ fontSize: 8, color: "#374151", letterSpacing: 2, marginBottom: 3, fontFamily: "'JetBrains Mono', monospace" }}>KUALIFIKASI</div>
                    <div style={{ fontSize: 11, color: "#60a5fa", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{qualiWIB}</div>
                  </div>
                )}
                {raceWIB && (
                  <div>
                    <div style={{ fontSize: 8, color: "#374151", letterSpacing: 2, marginBottom: 3, fontFamily: "'JetBrains Mono', monospace" }}>RACE</div>
                    <div style={{ fontSize: 11, color: "#fbbf24", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{raceWIB}</div>
                  </div>
                )}
                {weather && (
                  <div>
                    <div style={{ fontSize: 8, color: "#374151", letterSpacing: 2, marginBottom: 3, fontFamily: "'JetBrains Mono', monospace" }}>CUACA</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'JetBrains Mono', monospace" }}>
                      {weather.icon} {weather.temp}°C · {weather.wind} km/h
                    </div>
                  </div>
                )}
              </div>
            </div>

            {countdown && (
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {countdown.d > 0 && (
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 44, fontWeight: 900, color: "#ef4444", lineHeight: 1, fontFamily: "'Barlow Condensed', sans-serif" }}>{countdown.d}</span>
                    <span style={{ fontSize: 9, color: "#4b5563", marginLeft: 4, fontFamily: "'JetBrains Mono', monospace" }}>HARI</span>
                  </div>
                )}
                <div style={{ display: "flex", gap: 3, alignItems: "flex-start", justifyContent: "flex-end" }}>
                  {[{ v: pad(countdown.h), l: "JAM" }, { v: null }, { v: pad(countdown.m), l: "MNT" }, { v: null }, { v: pad(countdown.s), l: "DTK" }].map((item, i) =>
                    item.v === null ? (
                      <span key={i} style={{ color: "#2d3748", fontSize: 14, marginTop: 2, fontWeight: 700 }}>·</span>
                    ) : (
                      <div key={i} style={{ textAlign: "center" }}>
                        <div style={{
                          fontSize: countdown.d > 0 ? 14 : 20, fontWeight: 900, color: "#ef4444",
                          fontFamily: "'JetBrains Mono', monospace",
                          background: "#ef444412", border: "1px solid #ef444428",
                          borderRadius: 6, padding: "3px 6px", lineHeight: 1.2,
                          minWidth: 28, textAlign: "center",
                        }}>{item.v}</div>
                        <div style={{ fontSize: 7, color: "#374151", marginTop: 2, letterSpacing: 1 }}>{item.l}</div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STATS */}
      <div className="stat-grid" style={{ animation: "fadeUp 0.4s ease 0.08s both" }}>
        {loading ? [...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 72, borderRadius: 10 }} />
        )) : [
          { val: schedule.filter(r => r.status === "finished").length, sub: `dari ${schedule.length}`, label: "Race Selesai" },
          { val: leader ? leader.points : "—", sub: leader?.driver.code || "belum ada", label: "Points Lead" },
          { val: nextRace ? `R${nextRace.round}` : "—", sub: nextRace?.circuit.country || "TBA", label: "Berikutnya" },
          { val: "Auto", sub: "tiap 1 jam", label: "Update" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "#0b0d14", border: "1px solid #1a1f2e",
            borderRadius: 10, padding: "12px 14px",
          }}>
            <div style={{ fontSize: 8, color: "#374151", letterSpacing: 2, marginBottom: 5, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>
              {s.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#f1f5f9", lineHeight: 1, marginBottom: 2, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: -0.5 }}>
              {s.val}
            </div>
            <div style={{ fontSize: 9, color: "#4b5563" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="home-grid" style={{ animation: "fadeUp 0.4s ease 0.14s both" }}>
        {/* Top Drivers */}
        <div>
          <SectionHeader label="Top Driver" href="/standings" />
          <div className="card">
            {loading ? [...Array(5)].map((_, i) => (
              <div key={i} style={{ height: 46, borderBottom: "1px solid #0a0c12", background: "#0b0d14" }} />
            )) : top5.length > 0 ? top5.map((d, i) => {
              const color   = getTeamColor(d.team.id);
              const flagUrl = getFlagImg(d.driver.nationality);
              return (
                <div key={d.driver.id} className="list-row">
                  <div style={{
                    width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                    background: i === 0 ? color + "20" : "#0f1219",
                    border: `1px solid ${i === 0 ? color + "40" : "#1a1f2e"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 800, color: i === 0 ? color : "#374151",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{i + 1}</div>
                  <FlagImg url={flagUrl} alt={d.driver.nationality} size={20} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.3 }}>
                      {d.driver.code || d.driver.lastName}
                    </div>
                    <div style={{ fontSize: 9, color, fontFamily: "'JetBrains Mono', monospace" }}>{d.team.name}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: i === 0 ? color : "#4b5563", fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {d.points}
                  </div>
                </div>
              );
            }) : (
              <div style={{ padding: "20px 14px", textAlign: "center", fontSize: 11, color: "#374151", fontFamily: "'JetBrains Mono', monospace" }}>
                Musim belum dimulai 🏁
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Races */}
        <div>
          <SectionHeader label="Race Selanjutnya" href="/schedule" />
          <div className="card">
            {loading ? [...Array(5)].map((_, i) => (
              <div key={i} style={{ height: 46, borderBottom: "1px solid #0a0c12", background: "#0b0d14" }} />
            )) : upcoming.map((race, i) => {
              const days    = daysUntil(race.date);
              const fb2     = SCHEDULE_2026[race.round] || {};
              const wib     = fmtWIB(race.date || fb2.race?.date, race.time || fb2.race?.time);
              const flagUrl = getCountryFlagImg(race.circuit.country);
              const isNext  = i === 0;
              return (
                <Link key={race.round} href={`/race/${race.round}`} className="list-row">
                  <div style={{
                    width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                    background: isNext ? "#ef444418" : "#0f1219",
                    border: `1px solid ${isNext ? "#ef444330" : "#1a1f2e"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 8, fontWeight: 800, color: isNext ? "#ef4444" : "#374151",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>R{race.round}</div>
                  <FlagImg url={flagUrl} alt={race.circuit.country} size={20} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {race.name.replace(" Grand Prix", " GP")}
                    </div>
                    {wib && <div style={{ fontSize: 9, color: "#4b5563", fontFamily: "'JetBrains Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{wib}</div>}
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: isNext ? "#ef4444" : days < 14 ? "#fbbf24" : "#374151", fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
                    {days === 0 ? "HARI INI" : days === 1 ? "BESOK" : `${days}H`}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* NEWS */}
      {news.length > 0 && (
        <div style={{ animation: "fadeUp 0.4s ease 0.22s both" }}>
          <SectionHeader label="Berita Terbaru" href="/news" />
          <div className="card">
            {news.map((item, i) => (
              <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="news-row">
                {item.img && (
                  <div style={{ width: 58, height: 42, flexShrink: 0, borderRadius: 6, overflow: "hidden", background: "#111" }}>
                    <img src={item.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => { e.target.parentElement.style.display = "none"; }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.5, color: SOURCE_COLORS[item.source] || "#ef4444", fontFamily: "'JetBrains Mono', monospace" }}>
                      {item.source?.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 9, color: "#2d3748" }}>·</span>
                    <span style={{ fontSize: 9, color: "#374151", fontFamily: "'JetBrains Mono', monospace" }}>{timeAgo(item.pub)}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.45, color: "#d1d5db", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {item.title}
                  </div>
                </div>
                <span style={{ fontSize: 11, color: "#2d3748", flexShrink: 0, marginTop: 2 }}>↗</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
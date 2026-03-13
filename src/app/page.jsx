"use client";
// src/app/page.jsx — Home

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTeamColor, getFlagImg, getCountryFlagImg } from "@/lib/teamColors";
import { SCHEDULE_2026 } from "@/lib/schedule2026";

function FlagImg({ url, alt, size = 22 }) {
  if (!url) return <span style={{ fontSize: size }}>🏁</span>;
  return (
    <img
      src={url}
      alt={alt || "flag"}
      style={{ width: size + 2, height: "auto", borderRadius: 2, display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
    />
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

  // Countdown timer
  useEffect(() => {
    if (!nextRace) return;
    const fb2 = SCHEDULE_2026[nextRace.round] || {};
    const raceDate = fb2.race?.date || nextRace.date;
    const raceTime = fb2.race?.time || nextRace.time || "00:00:00Z";
    const t = (raceTime).replace(/Z?$/, "Z");
    const target = new Date(`${raceDate}T${t}`);

    function tick() {
      const diff = target - new Date();
      if (diff <= 0) { setCountdown({ d:0, h:0, m:0, s:0 }); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown({ d, h, m, s });
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [nextRace]);

  // Weather
  useEffect(() => {
    if (!nextRace?.circuit?.lat || !nextRace?.circuit?.long) return;
    const lat = nextRace.circuit.lat;
    const lon = nextRace.circuit.long;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m&timezone=auto`)
      .then(r => r.json())
      .then(data => {
        const c = data.current;
        if (!c) return;
        const code = c.weathercode;
        const icon = code === 0 ? "☀️" : code <= 3 ? "⛅" : code <= 49 ? "🌫️" : code <= 69 ? "🌧️" : code <= 79 ? "🌨️" : "⛈️";
        setWeather({ temp: Math.round(c.temperature_2m), icon, wind: Math.round(c.windspeed_10m) });
      })
      .catch(() => {});
  }, [nextRace]);

  function daysUntil(ds) {
    return Math.ceil((new Date(ds) - today) / (1000 * 60 * 60 * 24));
  }

  function pad(n) { return String(n).padStart(2, "0"); }

  function timeAgo(pub) {
    if (!pub) return "";
    const diff = Date.now() - new Date(pub);
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m lalu`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}j lalu`;
    return `${Math.floor(h / 24)}h lalu`;
  }

  const SOURCE_COLORS = {
    "Autosport": "#ef4444", "Motorsport.com": "#f97316",
    "BBC Sport": "#3b82f6", "NewsAPI": "#8b5cf6",
  };

  return (
    <div style={{ paddingBottom: 8 }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        @media (max-width: 640px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
          .home-bottom { flex-direction: column !important; }
          .home-bottom > div { width: 100% !important; }
        }
      `}</style>

      {/* Next Race Hero */}
      {!loading && nextRace && (
        <div style={{
          background: "linear-gradient(135deg,#0a0005,#0f0012)",
          border: "1px solid #2d1030", borderRadius: 16,
          padding: "20px", marginBottom: 16,
          position: "relative", overflow: "hidden",
          animation: "fadeUp 0.4s ease",
        }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 150, height: 150, background: "radial-gradient(circle,#ef444418,transparent 70%)", pointerEvents: "none" }} />

          <div style={{ fontSize: 10, color: "#ef4444", letterSpacing: 3, marginBottom: 10, fontFamily: "monospace" }}>
            ⬤ RACE BERIKUTNYA
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1, marginRight: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5, marginBottom: 4, lineHeight: 1.2, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <FlagImg url={getCountryFlagImg(nextRace.circuit.country)} alt={nextRace.circuit.country} size={20} />
                {nextRace.name}
              </h2>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
                {nextRace.circuit.name}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {qualiWIB && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "#60a5fa", minWidth: 60 }}>🔵 Quali</span>
                    <span style={{ fontSize: 12, fontFamily: "monospace", color: "#93c5fd", fontWeight: 600 }}>{qualiWIB}</span>
                  </div>
                )}
                {raceWIB && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "#fbbf24", minWidth: 60 }}>🏁 Race</span>
                    <span style={{ fontSize: 12, fontFamily: "monospace", color: "#fde68a", fontWeight: 700 }}>{raceWIB}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Countdown + Weather */}
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              {countdown ? (
                <div>
                  {countdown.d > 0 && (
                    <div>
                      <div style={{ fontSize: 42, fontWeight: 900, color: "#ef4444", lineHeight: 1 }}>{countdown.d}</div>
                      <div style={{ fontSize: 9, color: "#6b7280", marginBottom: 4 }}>HARI LAGI</div>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 4, alignItems: "center", justifyContent: "center" }}>
                    {[
                      { v: pad(countdown.h), l: "JAM" },
                      { v: ":", l: null },
                      { v: pad(countdown.m), l: "MNT" },
                      { v: ":", l: null },
                      { v: pad(countdown.s), l: "DTK" },
                    ].map((item, i) =>
                      item.l === null ? (
                        <span key={i} style={{ fontSize: 16, fontWeight: 900, color: "#ef444466", lineHeight: 1 }}>:</span>
                      ) : (
                        <div key={i} style={{ textAlign: "center" }}>
                          <div style={{
                            fontSize: countdown.d > 0 ? 14 : 20,
                            fontWeight: 900, color: "#ef4444",
                            background: "#ef444415", border: "1px solid #ef444430",
                            borderRadius: 6, padding: countdown.d > 0 ? "3px 5px" : "4px 7px",
                            fontFamily: "monospace", lineHeight: 1.2,
                            minWidth: 28,
                          }}>{item.v}</div>
                          <div style={{ fontSize: 7, color: "#4b5563", marginTop: 2 }}>{item.l}</div>
                        </div>
                      )
                    )}
                  </div>
                  {weather && (
                    <div style={{ marginTop: 8, fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                      <span>{weather.icon}</span>
                      <span>{weather.temp}°C</span>
                      <span style={{ color: "#374151" }}>·</span>
                      <span>{weather.wind} km/h</span>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 48, fontWeight: 900, color: "#ef4444", lineHeight: 1 }}>{daysUntil(nextRace.date)}</div>
                  <div style={{ fontSize: 10, color: "#6b7280" }}>HARI</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {!loading && (
        <div className="stat-grid" style={{ marginBottom: 16, animation: "fadeUp 0.4s ease 0.1s both" }}>
          {[
            { icon: "🏁", val: schedule.filter(r=>r.status==="finished").length, sub1: `dari ${schedule.length}`, sub2: "Race Selesai" },
            { icon: "🏆", val: leader ? leader.points : "—", sub1: leader ? leader.driver.code : "0 pts", sub2: "Points Leader" },
            { icon: "📍", val: nextRace ? `R${nextRace.round}` : "—", sub1: nextRace?.circuit.country || "", sub2: "Race Weekend" },
            { icon: "🔄", val: "Auto", sub1: "tiap 1 jam", sub2: "Update" },
          ].map((s, i) => (
            <div key={i} style={{
              background: "#0d1117", border: "1px solid #1a1f2e",
              borderRadius: 12, padding: "14px 12px", textAlign: "center",
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 2 }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>{s.sub1}</div>
              <div style={{ fontSize: 10, color: "#374151" }}>{s.sub2}</div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom section */}
      <div className="home-bottom" style={{ display: "flex", gap: 12, animation: "fadeUp 0.4s ease 0.2s both" }}>

        {/* Top Driver */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af" }}>🏆 TOP DRIVER</span>
            <Link href="/standings" style={{ fontSize: 11, color: "#ef4444", textDecoration: "none" }}>Lihat semua →</Link>
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {top5.length > 0 ? top5.map((d, i) => {
              const color   = getTeamColor(d.team.id);
              const flagUrl = getFlagImg(d.driver.nationality);
              return (
                <div key={d.driver.id} style={{
                  background: "#0d1117", border: `1px solid ${i === 0 ? color + "33" : "#1a1f2e"}`,
                  borderRadius: 10, padding: "10px 12px",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: i === 0 ? color : "#4b5563", minWidth: 20 }}>P{i+1}</span>
                  <FlagImg url={flagUrl} alt={d.driver.nationality} size={20} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{d.driver.code || d.driver.lastName}</div>
                    <div style={{ fontSize: 10, color }}>{d.team.name}</div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 900, color: i === 0 ? color : "#6b7280" }}>{d.points}</span>
                </div>
              );
            }) : (
              <div style={{
                background: "#0d1117", border: "1px solid #1a1f2e",
                borderRadius: 10, padding: "16px 12px", textAlign: "center",
                fontSize: 12, color: "#4b5563",
              }}>
                Musim belum dimulai —<br />standings muncul setelah race pertama 🏁
              </div>
            )}
          </div>
        </div>

        {/* Upcoming races */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af" }}>📅 RACE SELANJUTNYA</span>
            <Link href="/schedule" style={{ fontSize: 11, color: "#ef4444", textDecoration: "none" }}>Lihat semua →</Link>
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {upcoming.map((race, i) => {
              const days    = daysUntil(race.date);
              const fb2     = SCHEDULE_2026[race.round] || {};
              const wib     = fmtWIB(race.date || fb2.race?.date, race.time || fb2.race?.time);
              const flagUrl = getCountryFlagImg(race.circuit.country);
              return (
                <Link key={race.round} href={`/race/${race.round}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "#0d1117", border: `1px solid ${i === 0 ? "#ef444433" : "#1a1f2e"}`,
                    borderRadius: 10, padding: "10px 12px",
                    display: "flex", alignItems: "center", gap: 10,
                    transition: "background 0.15s",
                  }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                      background: i === 0 ? "#ef444422" : "#1a1f2e",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 800,
                      color: i === 0 ? "#ef4444" : "#4b5563",
                    }}>R{race.round}</div>
                    <FlagImg url={flagUrl} alt={race.circuit.country} size={20} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {race.name.replace(" Grand Prix", " GP")}
                      </div>
                      {wib && <div style={{ fontSize: 10, color: "#6b7280", fontFamily: "monospace" }}>{wib}</div>}
                    </div>
                    <span style={{ fontSize: 11, color: i === 0 ? "#ef4444" : "#4b5563", flexShrink: 0 }}>
                      {days === 0 ? "🔥" : days === 1 ? "Besok" : `${days}h`}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* News */}
      {news.length > 0 && (
        <div style={{ marginTop: 16, animation: "fadeUp 0.4s ease 0.3s both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af" }}>📰 BERITA TERBARU</span>
            <Link href="/news" style={{ fontSize: 11, color: "#ef4444", textDecoration: "none" }}>Lihat semua →</Link>
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {news.map((item, i) => (
              <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <div style={{
                  background: "#0d1117", border: "1px solid #1a1f2e",
                  borderRadius: 10, padding: "10px 12px",
                  display: "flex", gap: 10, alignItems: "flex-start",
                  transition: "background 0.15s",
                }}>
                  {item.img && (
                    <div style={{ width: 56, height: 44, flexShrink: 0, borderRadius: 6, overflow: "hidden", background: "#111" }}>
                      <img src={item.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={e => { e.target.parentElement.style.display = "none"; }} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: SOURCE_COLORS[item.source] || "#ef4444" }}>
                        {item.source?.toUpperCase()}
                      </span>
                      <span style={{ fontSize: 9, color: "#374151" }}>· {timeAgo(item.pub)}</span>
                    </div>
                    <div style={{
                      fontSize: 12, fontWeight: 600, lineHeight: 1.4,
                      overflow: "hidden", display: "-webkit-box",
                      WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    }}>{item.title}</div>
                  </div>
                  <span style={{ fontSize: 12, color: "#374151", flexShrink: 0 }}>↗</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
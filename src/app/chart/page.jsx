"use client";
// src/app/chart/page.jsx
// Points progression chart — perkembangan poin driver per race

import { useState, useEffect } from "react";
import { getTeamColor, getFlag } from "@/lib/teamColors";

// Warna fallback untuk chart
const CHART_COLORS = [
  "#FF8000","#3671C6","#E8002D","#27F4D2","#358C75",
  "#FF87BC","#64C4FF","#6692FF","#B6BABD","#52E252","#BA0C2F",
];

export default function ChartPage() {
  const [standings, setStandings] = useState(null);
  const [allResults, setAllResults] = useState({}); // round -> race results
  const [schedule, setSchedule]   = useState([]);
  const [selected, setSelected]   = useState(new Set()); // selected driver ids
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/standings?type=drivers").then(r => r.json()),
      fetch("/api/schedule").then(r => r.json()),
    ]).then(([dJson, sJson]) => {
      if (dJson.success) {
        setStandings(dJson.data);
        // Default: top 5 driver
        const top5 = dJson.data.drivers.slice(0, 5).map(d => d.driver.id);
        setSelected(new Set(top5));
      }
      if (sJson.success) setSchedule(sJson.data);
    }).finally(() => setLoading(false));
  }, []);

  // Fetch hasil tiap race yang sudah selesai
  useEffect(() => {
    const finished = schedule.filter(r => r.status === "finished");
    finished.forEach(race => {
      if (allResults[race.round]) return;
      fetch(`/api/race?round=${race.round}&session=race`)
        .then(r => r.json())
        .then(json => {
          if (json.success && json.data) {
            setAllResults(prev => ({ ...prev, [race.round]: json.data }));
          }
        });
    });
  }, [schedule]);

  if (loading) return (
    <div style={{ display: "grid", gap: 10 }}>
      {[...Array(4)].map((_,i) => (
        <div key={i} style={{ height: 60, background: "#0d1117", borderRadius: 10, animation: "pulse 1.5s ease infinite" }} />
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.8}}`}</style>
    </div>
  );

  const drivers      = standings?.drivers || [];
  const finishedRaces = schedule.filter(r => r.status === "finished");
  const totalRounds  = finishedRaces.length;

  // Bangun data points progression per driver
  // cumulativePoints[driverId][roundIndex] = total poin sampai round itu
  const cumulativePoints = {};
  drivers.forEach(d => { cumulativePoints[d.driver.id] = []; });

  finishedRaces.forEach((race, idx) => {
    const raceData = allResults[race.round];
    drivers.forEach(d => {
      const prev = idx > 0 ? (cumulativePoints[d.driver.id][idx - 1] || 0) : 0;
      let gained = 0;
      if (raceData?.results) {
        const result = raceData.results.find(r => r.driver?.id === d.driver.id);
        gained = result?.points || 0;
      }
      cumulativePoints[d.driver.id].push(prev + gained);
    });
  });

  const maxPts = Math.max(...drivers.map(d => cumulativePoints[d.driver.id]?.[totalRounds - 1] || 0), 1);

  // SVG chart dimensions
  const W = 800, H = 320, PAD = { top: 20, right: 120, bottom: 40, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  function xPos(roundIdx) {
    if (totalRounds <= 1) return PAD.left + chartW / 2;
    return PAD.left + (roundIdx / (totalRounds - 1)) * chartW;
  }
  function yPos(pts) {
    return PAD.top + chartH - (pts / maxPts) * chartH;
  }

  const selectedDrivers = drivers.filter(d => selected.has(d.driver.id));

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        .drv-btn { transition: all 0.15s; }
        .drv-btn:hover { opacity: 0.8; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, color: "#ef4444", letterSpacing: 3, marginBottom: 8, fontFamily: "monospace" }}>
          📈 STATISTIK
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1, marginBottom: 4 }}>
          Perkembangan Poin
        </h1>
        <p style={{ fontSize: 12, color: "#6b7280" }}>
          Klik driver di bawah untuk tampilkan/sembunyikan di grafik
        </p>
      </div>

      {/* Belum ada data */}
      {totalRounds === 0 && (
        <div style={{
          background: "#fbbf2410", border: "1px solid #fbbf2430",
          borderRadius: 14, padding: "40px 20px", textAlign: "center",
          animation: "fadeUp 0.4s ease",
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Musim belum dimulai</div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            Grafik akan muncul otomatis setelah race pertama selesai<br />
            Australian GP · 8 Maret 2026
          </div>
        </div>
      )}

      {/* Chart */}
      {totalRounds > 0 && (
        <div style={{
          background: "#0d1117", border: "1px solid #1f2937",
          borderRadius: 14, padding: "20px",
          marginBottom: 20, overflow: "hidden",
          animation: "fadeUp 0.4s ease",
        }}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            style={{ width: "100%", height: "auto", display: "block" }}
          >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(frac => {
              const y   = PAD.top + chartH * (1 - frac);
              const pts = Math.round(maxPts * frac);
              return (
                <g key={frac}>
                  <line x1={PAD.left} y1={y} x2={PAD.left + chartW} y2={y}
                    stroke="#1f2937" strokeWidth="1" strokeDasharray={frac === 0 ? "none" : "4,4"} />
                  <text x={PAD.left - 8} y={y + 4} textAnchor="end"
                    fill="#4b5563" fontSize="11">{pts}</text>
                </g>
              );
            })}

            {/* Round labels on x-axis */}
            {finishedRaces.map((race, idx) => (
              <text key={race.round}
                x={xPos(idx)} y={H - 8}
                textAnchor="middle" fill="#4b5563" fontSize="10"
              >R{race.round}</text>
            ))}

            {/* Lines per selected driver */}
            {selectedDrivers.map((d, ci) => {
              const color  = getTeamColor(d.team.id);
              const points = cumulativePoints[d.driver.id];
              if (!points || points.length === 0) return null;

              const pathD = points.map((pts, idx) =>
                `${idx === 0 ? "M" : "L"} ${xPos(idx)} ${yPos(pts)}`
              ).join(" ");

              const lastPts = points[points.length - 1];
              const lastX   = xPos(points.length - 1);
              const lastY   = yPos(lastPts);

              return (
                <g key={d.driver.id}>
                  <path d={pathD} fill="none" stroke={color}
                    strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                  {/* Dots */}
                  {points.map((pts, idx) => (
                    <circle key={idx} cx={xPos(idx)} cy={yPos(pts)} r="3"
                      fill={color} stroke="#0d1117" strokeWidth="1.5" />
                  ))}
                  {/* Label at end */}
                  <text x={lastX + 8} y={lastY + 4}
                    fill={color} fontSize="11" fontWeight="700">
                    {d.driver.code}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Driver selector */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 10 }}>
          Pilih driver ({selected.size} dipilih):
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {/* Select all / none */}
          <button
            className="drv-btn"
            onClick={() => setSelected(new Set(drivers.map(d => d.driver.id)))}
            style={{
              padding: "5px 12px", borderRadius: 7, cursor: "pointer",
              background: "#1f2937", border: "1px solid #374151",
              color: "#9ca3af", fontSize: 11, fontFamily: "inherit",
            }}
          >Semua</button>
          <button
            className="drv-btn"
            onClick={() => setSelected(new Set())}
            style={{
              padding: "5px 12px", borderRadius: 7, cursor: "pointer",
              background: "#1f2937", border: "1px solid #374151",
              color: "#9ca3af", fontSize: 11, fontFamily: "inherit",
            }}
          >Kosongkan</button>

          {drivers.map(d => {
            const color = getTeamColor(d.team.id);
            const on    = selected.has(d.driver.id);
            return (
              <button
                key={d.driver.id}
                className="drv-btn"
                onClick={() => {
                  setSelected(prev => {
                    const next = new Set(prev);
                    on ? next.delete(d.driver.id) : next.add(d.driver.id);
                    return next;
                  });
                }}
                style={{
                  padding: "5px 12px", borderRadius: 7, cursor: "pointer",
                  background: on ? color + "22" : "#0d1117",
                  border: `1px solid ${on ? color + "66" : "#1f2937"}`,
                  color: on ? color : "#4b5563",
                  fontSize: 11, fontFamily: "inherit", fontWeight: on ? 700 : 400,
                }}
              >
                {getFlag(d.driver.nationality)} {d.driver.code || d.driver.lastName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Leaderboard snapshot */}
      {totalRounds > 0 && (
        <div style={{
          background: "#0d1117", border: "1px solid #1f2937",
          borderRadius: 14, padding: "18px 20px",
        }}>
          <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: 2, marginBottom: 12, fontFamily: "monospace" }}>
            🏆 KLASEMEN SAAT INI — SETELAH ROUND {totalRounds}
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {drivers.slice(0, 10).map((d, i) => {
              const color = getTeamColor(d.team.id);
              const pts   = cumulativePoints[d.driver.id]?.[totalRounds - 1] || 0;
              const gap   = i === 0 ? "" : `−${(cumulativePoints[drivers[0].driver.id]?.[totalRounds - 1] || 0) - pts}`;
              return (
                <div key={d.driver.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "8px 12px", borderRadius: 8,
                  background: i === 0 ? color + "12" : "transparent",
                }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: i < 3 ? color : "#4b5563", minWidth: 24 }}>P{i+1}</span>
                  <span style={{ fontSize: 14 }}>{getFlag(d.driver.nationality)}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{d.driver.name}</span>
                  <span style={{ fontSize: 11, color: "#4b5563" }}>{gap}</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: i === 0 ? color : "#e2e8f0", minWidth: 36, textAlign: "right" }}>{pts}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

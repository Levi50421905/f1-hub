"use client";
// src/app/chart/page.jsx

import { useState, useEffect } from "react";
import { getTeamColor, getFlag } from "@/lib/teamColors";

export default function ChartPage() {
  const [standings,  setStandings]  = useState(null);
  const [allResults, setAllResults] = useState({});
  const [schedule,   setSchedule]   = useState([]);
  const [selected,   setSelected]   = useState(new Set());
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/standings?type=drivers").then(r => r.json()),
      fetch("/api/schedule").then(r => r.json()),
    ]).then(([dJson, sJson]) => {
      if (dJson.success) {
        setStandings(dJson.data);
        setSelected(new Set(dJson.data.drivers.slice(0, 5).map(d => d.driver.id)));
      }
      if (sJson.success) setSchedule(sJson.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const finished = schedule.filter(r => r.status === "finished");
    finished.forEach(race => {
      if (allResults[race.round]) return;
      fetch(`/api/race?round=${race.round}&session=race`)
        .then(r => r.json())
        .then(json => {
          if (json.success && json.data) setAllResults(prev => ({ ...prev, [race.round]: json.data }));
        });
    });
  }, [schedule]);

  if (loading) return (
    <div style={{ display:"grid", gap:10 }}>
      {[...Array(4)].map((_,i) => (
        <div key={i} style={{ height:60, background:"var(--bg-surface)", borderRadius:10, border:"1px solid var(--border)", animation:"pulse 1.5s ease infinite" }} />
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.8}}`}</style>
    </div>
  );

  const drivers       = standings?.drivers || [];
  const finishedRaces = schedule.filter(r => r.status === "finished");
  const totalRounds   = finishedRaces.length;

  const cumulativePoints = {};
  drivers.forEach(d => { cumulativePoints[d.driver.id] = []; });
  finishedRaces.forEach((race, idx) => {
    const raceData = allResults[race.round];
    drivers.forEach(d => {
      const prev   = idx > 0 ? (cumulativePoints[d.driver.id][idx - 1] || 0) : 0;
      let gained   = 0;
      if (raceData?.results) {
        const result = raceData.results.find(r => r.driver?.id === d.driver.id);
        gained = result?.points || 0;
      }
      cumulativePoints[d.driver.id].push(prev + gained);
    });
  });

  const maxPts = Math.max(...drivers.map(d => cumulativePoints[d.driver.id]?.[totalRounds - 1] || 0), 1);

  const W = 800, H = 320, PAD = { top: 20, right: 120, bottom: 40, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  function xPos(roundIdx) {
    if (totalRounds <= 1) return PAD.left + chartW / 2;
    return PAD.left + (roundIdx / (totalRounds - 1)) * chartW;
  }
  function yPos(pts) { return PAD.top + chartH - (pts / maxPts) * chartH; }

  const selectedDrivers = drivers.filter(d => selected.has(d.driver.id));

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        .drv-btn { transition:all 0.15s; }
        .drv-btn:hover { opacity:0.8; }
      `}</style>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #10060c 0%, #0e0618 50%, #0c0e1a 100%)",
        border: "1px solid #2a1535",
        borderRadius: "var(--r-xl)", padding: "24px 24px 20px",
        marginBottom: 20, position: "relative", overflow: "hidden",
        animation: "fadeUp 0.35s ease",
      }}>
        <div style={{ position:"absolute", top:-50, right:-50, width:180, height:180, background:"radial-gradient(circle, rgba(232,52,74,0.1) 0%, transparent 65%)", pointerEvents:"none" }} />
        <div style={{ fontSize:10, color:"var(--red)", letterSpacing:3, marginBottom:8, fontFamily:"'JetBrains Mono',monospace", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:16, height:1, background:"var(--red)" }} />
          STATISTIK
        </div>
        <h1 style={{ fontSize:30, fontWeight:900, letterSpacing:-1, marginBottom:4, color:"var(--text-primary)", fontFamily:"'Barlow Condensed',sans-serif" }}>
          Perkembangan Poin
        </h1>
        <p style={{ fontSize:11, color:"var(--text-secondary)" }}>
          Klik driver di bawah untuk tampilkan/sembunyikan di grafik
        </p>
      </div>

      {totalRounds === 0 && (
        <div style={{ background:"var(--bg-surface)", border:"1px solid var(--border)", borderRadius:14, padding:"40px 20px", textAlign:"center", animation:"fadeUp 0.4s ease" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📊</div>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:8, color:"var(--text-primary)" }}>Musim belum dimulai</div>
          <div style={{ fontSize:13, color:"var(--text-secondary)" }}>
            Grafik akan muncul otomatis setelah race pertama selesai
          </div>
        </div>
      )}

      {totalRounds > 0 && (
        <div style={{ background:"var(--bg-surface)", border:"1px solid var(--border)", borderRadius:14, padding:"20px", marginBottom:20, overflow:"hidden", animation:"fadeUp 0.4s ease" }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:"auto", display:"block" }}>
            {[0, 0.25, 0.5, 0.75, 1].map(frac => {
              const y   = PAD.top + chartH * (1 - frac);
              const pts = Math.round(maxPts * frac);
              return (
                <g key={frac}>
                  <line x1={PAD.left} y1={y} x2={PAD.left + chartW} y2={y} stroke="#1e2338" strokeWidth="1" strokeDasharray={frac === 0 ? "none" : "4,4"} />
                  <text x={PAD.left - 8} y={y + 4} textAnchor="end" fill="#8892b0" fontSize="11">{pts}</text>
                </g>
              );
            })}
            {finishedRaces.map((race, idx) => (
              <text key={race.round} x={xPos(idx)} y={H - 8} textAnchor="middle" fill="#8892b0" fontSize="10">R{race.round}</text>
            ))}
            {selectedDrivers.map(d => {
              const color  = getTeamColor(d.team.id);
              const points = cumulativePoints[d.driver.id];
              if (!points || points.length === 0) return null;
              const pathD   = points.map((pts, idx) => `${idx === 0 ? "M" : "L"} ${xPos(idx)} ${yPos(pts)}`).join(" ");
              const lastPts = points[points.length - 1];
              return (
                <g key={d.driver.id}>
                  <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                  {points.map((pts, idx) => (
                    <circle key={idx} cx={xPos(idx)} cy={yPos(pts)} r="3" fill={color} stroke="#131620" strokeWidth="1.5" />
                  ))}
                  <text x={xPos(points.length - 1) + 8} y={yPos(lastPts) + 4} fill={color} fontSize="11" fontWeight="700">{d.driver.code}</text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Driver selector */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:11, color:"var(--text-secondary)", marginBottom:10 }}>
          Pilih driver ({selected.size} dipilih):
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          <button className="drv-btn" onClick={() => setSelected(new Set(drivers.map(d => d.driver.id)))} style={{ padding:"5px 12px", borderRadius:7, cursor:"pointer", background:"var(--bg-raised)", border:"1px solid var(--border)", color:"var(--text-secondary)", fontSize:11, fontFamily:"inherit" }}>Semua</button>
          <button className="drv-btn" onClick={() => setSelected(new Set())} style={{ padding:"5px 12px", borderRadius:7, cursor:"pointer", background:"var(--bg-raised)", border:"1px solid var(--border)", color:"var(--text-secondary)", fontSize:11, fontFamily:"inherit" }}>Kosongkan</button>
          {drivers.map(d => {
            const color = getTeamColor(d.team.id);
            const on    = selected.has(d.driver.id);
            return (
              <button key={d.driver.id} className="drv-btn" onClick={() => {
                setSelected(prev => {
                  const next = new Set(prev);
                  on ? next.delete(d.driver.id) : next.add(d.driver.id);
                  return next;
                });
              }} style={{ padding:"5px 12px", borderRadius:7, cursor:"pointer", background: on ? color+"22" : "var(--bg-surface)", border:`1px solid ${on ? color+"66" : "var(--border)"}`, color: on ? color : "var(--text-secondary)", fontSize:11, fontFamily:"inherit", fontWeight: on ? 700 : 400 }}>
                {getFlag(d.driver.nationality)} {d.driver.code || d.driver.lastName}
              </button>
            );
          })}
        </div>
      </div>

      {totalRounds > 0 && (
        <div style={{ background:"var(--bg-surface)", border:"1px solid var(--border)", borderRadius:14, padding:"18px 20px" }}>
          <div style={{ fontSize:10, color:"var(--text-secondary)", letterSpacing:2, marginBottom:12, fontFamily:"'JetBrains Mono',monospace" }}>
            🏆 KLASEMEN SAAT INI — SETELAH ROUND {totalRounds}
          </div>
          <div style={{ display:"grid", gap:6 }}>
            {drivers.slice(0, 10).map((d, i) => {
              const color = getTeamColor(d.team.id);
              const pts   = cumulativePoints[d.driver.id]?.[totalRounds - 1] || 0;
              const gap   = i === 0 ? "" : `−${(cumulativePoints[drivers[0].driver.id]?.[totalRounds - 1] || 0) - pts}`;
              return (
                <div key={d.driver.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 12px", borderRadius:8, background: i === 0 ? color+"12" : "transparent" }}>
                  <span style={{ fontSize:12, fontWeight:800, color: i < 3 ? color : "var(--text-secondary)", minWidth:24 }}>P{i+1}</span>
                  <span style={{ fontSize:14 }}>{getFlag(d.driver.nationality)}</span>
                  <span style={{ flex:1, fontSize:13, fontWeight:600, color:"var(--text-primary)" }}>{d.driver.name}</span>
                  <span style={{ fontSize:11, color:"var(--text-secondary)" }}>{gap}</span>
                  <span style={{ fontSize:15, fontWeight:900, color: i === 0 ? color : "var(--text-primary)", minWidth:36, textAlign:"right" }}>{pts}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
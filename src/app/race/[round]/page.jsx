"use client";
// src/app/race/[round]/page.jsx

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getTeamColor, getCountryFlag } from "@/lib/teamColors";
import { SCHEDULE_2026 } from "@/lib/schedule2026";

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtWIB(dateStr, timeStr) {
  if (!dateStr || !timeStr) return "TBA";
  try {
    const dt  = new Date(`${dateStr}T${timeStr}`);
    const wib = new Date(dt.getTime() + 7 * 3600 * 1000);
    const DAYS   = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
    const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    return `${DAYS[wib.getUTCDay()]}, ${wib.getUTCDate()} ${MONTHS[wib.getUTCMonth()]} · ${
      String(wib.getUTCHours()).padStart(2,"0")}:${String(wib.getUTCMinutes()).padStart(2,"0")} WIB`;
  } catch { return "TBA"; }
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const CIRCUIT_INFO = {
  1:  { laps:58,  length:5.278, turns:14, lapRecord:"1:20.235", lapHolder:"Leclerc",       lapYear:2022 },
  2:  { laps:56,  length:5.451, turns:16, lapRecord:"1:32.238", lapHolder:"M. Schumacher", lapYear:2004 },
  3:  { laps:53,  length:5.807, turns:18, lapRecord:"1:30.983", lapHolder:"Verstappen",    lapYear:2019 },
  4:  { laps:57,  length:5.412, turns:15, lapRecord:"1:31.447", lapHolder:"De La Rosa",    lapYear:2005 },
  5:  { laps:50,  length:6.174, turns:27, lapRecord:"1:30.734", lapHolder:"Hamilton",      lapYear:2021 },
  6:  { laps:57,  length:5.412, turns:19, lapRecord:"1:26.841", lapHolder:"Verstappen",    lapYear:2023 },
  7:  { laps:70,  length:4.361, turns:14, lapRecord:"1:13.078", lapHolder:"Bottas",        lapYear:2019 },
  8:  { laps:78,  length:3.337, turns:19, lapRecord:"1:12.909", lapHolder:"Leclerc",       lapYear:2021 },
  9:  { laps:66,  length:4.657, turns:14, lapRecord:"1:16.330", lapHolder:"Verstappen",    lapYear:2023 },
  10: { laps:71,  length:4.318, turns:10, lapRecord:"1:05.619", lapHolder:"Bottas",        lapYear:2020 },
  11: { laps:52,  length:5.891, turns:18, lapRecord:"1:27.097", lapHolder:"Hamilton",      lapYear:2020 },
  12: { laps:44,  length:7.004, turns:20, lapRecord:"1:46.286", lapHolder:"Verstappen",    lapYear:2018 },
  13: { laps:70,  length:4.381, turns:14, lapRecord:"1:16.627", lapHolder:"Hamilton",      lapYear:2020 },
  14: { laps:72,  length:4.259, turns:14, lapRecord:"1:11.097", lapHolder:"Verstappen",    lapYear:2021 },
  15: { laps:53,  length:5.793, turns:11, lapRecord:"1:21.046", lapHolder:"Barrichello",   lapYear:2004 },
  16: { laps:55,  length:5.537, turns:21, lapRecord:"—",        lapHolder:"—",             lapYear:2026 },
  17: { laps:51,  length:6.003, turns:20, lapRecord:"1:43.009", lapHolder:"Leclerc",       lapYear:2019 },
  18: { laps:61,  length:5.063, turns:23, lapRecord:"1:35.867", lapHolder:"Leclerc",       lapYear:2023 },
  19: { laps:56,  length:5.513, turns:20, lapRecord:"1:36.169", lapHolder:"Leclerc",       lapYear:2019 },
  20: { laps:71,  length:4.304, turns:17, lapRecord:"1:17.774", lapHolder:"Bottas",        lapYear:2021 },
  21: { laps:71,  length:4.309, turns:15, lapRecord:"1:10.540", lapHolder:"Verstappen",    lapYear:2023 },
  22: { laps:50,  length:6.201, turns:17, lapRecord:"1:35.490", lapHolder:"Leclerc",       lapYear:2023 },
  23: { laps:57,  length:5.380, turns:16, lapRecord:"1:24.319", lapHolder:"Verstappen",    lapYear:2023 },
  24: { laps:58,  length:5.281, turns:16, lapRecord:"1:26.103", lapHolder:"Verstappen",    lapYear:2021 },
};

const CIRCUIT_PATHS = {
  1:  "M 50,20 L 180,20 Q 200,20 200,40 L 200,80 Q 200,95 185,95 L 160,95 Q 145,95 140,110 L 130,140 Q 125,155 110,155 L 80,155 Q 60,155 55,140 L 40,100 Q 35,85 50,80 L 50,20 Z",
  2:  "M 30,40 L 160,30 Q 180,28 185,45 L 190,90 Q 192,105 175,108 L 140,112 L 135,140 Q 132,158 115,160 L 70,160 Q 50,160 45,142 L 35,95 Q 28,75 30,40 Z",
  3:  "M 60,15 L 170,15 Q 190,15 195,35 L 200,75 Q 202,95 185,100 L 160,102 Q 145,102 140,120 L 130,155 Q 125,170 105,170 L 65,170 Q 42,170 38,150 L 28,100 Q 22,78 35,60 L 50,30 Q 55,15 60,15 Z",
  4:  "M 40,30 L 175,25 Q 195,24 198,44 L 200,85 Q 200,102 183,105 L 150,108 L 148,135 Q 146,152 128,155 L 72,155 Q 52,155 48,136 L 38,90 Q 34,72 40,30 Z",
  5:  "M 50,15 L 185,15 Q 205,15 208,35 L 210,65 L 195,75 L 210,85 L 208,120 Q 205,138 185,140 L 55,140 Q 35,140 32,120 L 30,80 L 45,70 L 30,60 L 32,35 Q 35,15 50,15 Z",
  6:  "M 60,20 C 140,10 190,50 195,90 C 198,120 170,155 120,158 C 70,160 30,130 28,90 C 26,55 45,25 60,20 Z",
  7:  "M 50,25 L 165,20 Q 185,19 188,38 L 192,75 Q 194,92 177,97 L 150,100 L 148,128 Q 146,145 128,148 L 70,148 Q 50,148 46,130 L 38,85 Q 32,65 38,45 L 42,28 Q 45,25 50,25 Z",
  8:  "M 100,15 C 155,12 195,45 198,85 C 200,115 175,150 135,158 C 105,163 75,155 58,138 C 38,118 35,85 50,62 C 65,38 80,17 100,15 Z",
  9:  "M 55,18 L 172,15 Q 192,14 195,33 L 198,72 Q 200,90 183,94 L 158,97 L 155,124 Q 153,142 135,145 L 68,145 Q 48,145 44,127 L 34,82 Q 28,62 34,42 L 40,22 Q 45,18 55,18 Z",
  10: "M 80,20 C 160,15 205,60 200,105 C 195,140 160,165 115,165 C 70,165 35,140 30,105 C 25,65 45,23 80,20 Z",
  11: "M 45,22 L 178,18 Q 198,17 200,36 L 202,78 Q 204,97 187,101 L 160,104 L 157,133 Q 155,152 137,155 L 65,155 Q 44,155 40,136 L 30,89 Q 24,68 30,47 L 35,25 Q 39,22 45,22 Z",
  12: "M 35,25 L 185,15 Q 207,14 210,36 L 212,65 Q 213,83 196,88 L 168,93 L 165,128 Q 163,150 143,153 L 55,153 Q 34,153 30,132 L 22,80 Q 16,55 25,35 L 35,25 Z",
  13: "M 65,18 L 162,15 Q 182,14 186,33 L 190,72 Q 192,89 175,93 L 152,96 L 150,122 Q 148,140 131,143 L 72,143 Q 52,143 48,125 L 38,80 Q 32,60 40,40 L 50,22 Q 55,18 65,18 Z",
  14: "M 55,20 L 170,16 Q 190,15 194,34 L 197,73 Q 199,91 182,95 L 156,98 L 154,126 Q 152,144 134,147 L 68,147 Q 48,147 44,128 L 34,83 Q 28,62 34,42 L 40,23 Q 44,20 55,20 Z",
  15: "M 50,22 L 175,17 Q 196,16 199,36 L 201,76 Q 202,95 185,99 L 158,102 L 156,130 Q 154,149 136,152 L 66,152 Q 45,152 41,133 L 31,86 Q 25,65 31,44 L 37,25 Q 41,22 50,22 Z",
  16: "M 55,18 L 168,15 Q 188,14 192,33 L 195,70 Q 197,88 180,92 L 154,95 L 151,122 Q 149,140 132,143 L 70,143 Q 50,143 46,125 L 36,79 Q 30,58 37,38 L 43,21 Q 48,18 55,18 Z",
  17: "M 50,18 C 130,8 205,55 208,100 C 210,135 185,168 140,170 C 100,172 62,152 45,120 C 28,88 30,52 50,18 Z",
  18: "M 55,20 C 140,8 210,55 213,100 C 215,138 185,172 135,175 C 90,177 50,155 35,118 C 20,82 25,45 55,20 Z",
  19: "M 60,20 C 145,10 208,58 210,103 C 212,140 182,170 132,172 C 85,174 45,150 32,113 C 18,76 22,40 60,20 Z",
  20: "M 50,22 L 168,17 Q 188,16 192,35 L 195,74 Q 197,92 180,96 L 154,99 L 152,127 Q 150,145 132,148 L 70,148 Q 50,148 46,130 L 36,84 Q 30,63 36,43 L 42,25 Q 47,22 50,22 Z",
  21: "M 55,20 L 170,15 Q 190,14 193,33 L 195,72 Q 197,90 180,94 L 154,97 L 152,124 Q 150,142 132,145 L 70,145 Q 50,145 46,127 L 36,81 Q 30,60 37,40 L 43,23 Q 48,20 55,20 Z",
  22: "M 60,22 C 145,12 208,60 210,105 C 212,142 182,172 132,174 C 85,176 45,152 32,115 C 18,78 22,42 60,22 Z",
  23: "M 55,20 L 170,15 Q 190,14 194,33 L 197,70 Q 199,88 182,92 L 156,95 L 154,122 Q 152,140 134,143 L 68,143 Q 48,143 44,125 L 34,79 Q 28,58 34,38 L 40,23 Q 45,20 55,20 Z",
  24: "M 55,18 L 170,13 Q 190,12 194,31 L 197,70 Q 199,88 182,92 L 156,95 L 154,123 Q 152,141 134,144 L 68,144 Q 48,144 44,126 L 34,80 Q 28,59 34,39 L 40,21 Q 45,18 55,18 Z",
};

// ─── Circuit SVG ──────────────────────────────────────────────────────────────

function CircuitShape({ round, color = "#ef4444" }) {
  const path = CIRCUIT_PATHS[round];
  if (!path) return null;
  return (
    <svg viewBox="0 0 240 190" style={{ width: "100%", maxWidth: 280, height: "auto" }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id={`glow-${round}`}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path d={path} fill="none" stroke={color + "30"} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
      <path d={path} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter={`url(#glow-${round})`}/>
      <line x1="50" y1="14" x2="50" y2="26" stroke="#ffffff" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          height: 44, background: "#0d1117", borderRadius: 8,
          animation: "pulse 1.5s ease infinite",
          animationDelay: `${i * 0.1}s`,
        }}/>
      ))}
    </div>
  );
}

function NoData({ children }) {
  return (
    <div style={{
      textAlign: "center", padding: "40px 20px",
      background: "#0d1117", borderRadius: 12,
      border: "1px solid #1f2937",
      fontSize: 13, color: "#4b5563",
    }}>
      {children}
    </div>
  );
}

// ─── Race Results Tab ─────────────────────────────────────────────────────────

function RaceTab({ isFinished, data }) {
  if (!isFinished) return <NoData>Hasil race akan muncul setelah race selesai.</NoData>;
  if (!data?.results?.length) return <NoData>Data race tidak tersedia.</NoData>;

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {["POS","DRIVER","TIM","WAKTU / STATUS","PTS"].map(h => (
            <th key={h} style={{
              fontSize: 10, color: "#4b5563", fontFamily: "monospace",
              letterSpacing: 1, padding: "8px 10px", textAlign: "left",
              borderBottom: "1px solid #1a1f2e",
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.results.map((r, i) => {
          // pos field can be named "position", "pos", or fall back to index+1
          const pos   = Number(r.position ?? r.pos ?? i + 1);
          const color = getTeamColor(r.team?.id || r.team?.name || r.driver?.team || "");
          const isTop = pos <= 3;
          const rowBg = i % 2 === 0 ? "#0d1117" : "transparent";

          return (
            <tr key={i} style={{ background: rowBg, borderBottom: "1px solid #0f1218" }}>
              {/* POS */}
              <td style={{
                padding: "10px 10px", fontSize: 13, width: 40,
                fontWeight: 900,
                color: isTop ? "#fbbf24" : "#9ca3af",
              }}>
                {pos}
              </td>
              {/* DRIVER */}
              <td style={{ padding: "10px 10px", fontSize: 13, fontWeight: 600, color }}>
                {r.driver?.name
                  || (r.driver?.firstName && r.driver?.lastName
                      ? `${r.driver.firstName.charAt(0)}. ${r.driver.lastName}`
                      : r.driver?.code || "—")}
              </td>
              {/* TEAM */}
              <td style={{ padding: "10px 10px", fontSize: 11, color: "#4b5563" }}>
                {r.team?.name || r.driver?.team || "—"}
              </td>
              {/* TIME */}
              <td style={{
                padding: "10px 10px", fontSize: 11,
                color: "#6b7280", fontFamily: "monospace",
              }}>
                {r.time || r.status || "—"}
              </td>
              {/* PTS */}
              <td style={{ padding: "10px 10px", fontSize: 13, fontWeight: 700, color: "#fbbf24" }}>
                {r.points ?? 0}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ─── Qualifying Tab ───────────────────────────────────────────────────────────

function QualiTab({ data }) {
  if (!data?.results?.length) return <NoData>Hasil qualifying belum tersedia.</NoData>;

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {["POS","DRIVER","Q1","Q2","Q3"].map(h => (
            <th key={h} style={{
              fontSize: 10, color: "#4b5563", fontFamily: "monospace",
              letterSpacing: 1, padding: "8px 10px", textAlign: "left",
              borderBottom: "1px solid #1a1f2e",
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.results.map((r, i) => {
          const pos   = Number(r.pos ?? r.position ?? i + 1);
          const color = getTeamColor(r.team?.id || r.team?.name || "");
          const isTop = pos <= 3;

          return (
            <tr key={i} style={{ background: i % 2 === 0 ? "#0d1117" : "transparent", borderBottom: "1px solid #0f1218" }}>
              <td style={{ padding: "10px 10px", fontSize: 13, width: 40, fontWeight: 900, color: isTop ? "#fbbf24" : "#9ca3af" }}>
                {pos}
              </td>
              <td style={{ padding: "10px 10px", fontSize: 13, fontWeight: 600, color }}>
                {r.driver?.name
                  || (r.driver?.firstName && r.driver?.lastName
                      ? `${r.driver.firstName.charAt(0)}. ${r.driver.lastName}`
                      : r.driver?.code || "—")}
              </td>
              {["q1","q2","q3"].map(q => (
                <td key={q} style={{ padding: "10px 10px", fontSize: 11, color: "#6b7280", fontFamily: "monospace" }}>
                  {r[q] || "—"}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ─── Pit Stops Tab ────────────────────────────────────────────────────────────

function PitsTab({ isFinished, data }) {
  if (!isFinished) return <NoData>Data pit stop akan muncul setelah race selesai.</NoData>;
  if (!data?.pitstops?.length) return <NoData>Data pit stop tidak tersedia.</NoData>;

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {["DRIVER","STOP KE","LAP","DURASI"].map(h => (
            <th key={h} style={{
              fontSize: 10, color: "#4b5563", fontFamily: "monospace",
              letterSpacing: 1, padding: "8px 10px", textAlign: "left",
              borderBottom: "1px solid #1a1f2e",
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.pitstops.map((p, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? "#0d1117" : "transparent", borderBottom: "1px solid #0f1218" }}>
            <td style={{ padding: "10px 10px", fontSize: 13, fontWeight: 600 }}>
              {p.driver?.name
                || (p.driver?.firstName
                    ? `${p.driver.firstName.charAt(0)}. ${p.driver.lastName}`
                    : p.driver?.code || "—")}
            </td>
            <td style={{ padding: "10px 10px", fontSize: 13, color: "#6b7280" }}>{p.stop}</td>
            <td style={{ padding: "10px 10px", fontSize: 13, color: "#6b7280" }}>Lap {p.lap}</td>
            <td style={{ padding: "10px 10px", fontSize: 13, fontFamily: "monospace", color: "#fbbf24" }}>{p.duration}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Circuit Tab ──────────────────────────────────────────────────────────────

function CircuitTab({ round, circuit }) {
  if (!circuit) return <NoData>Info sirkuit tidak tersedia.</NoData>;

  const stats = [
    { label: "JUMLAH LAP",       value: circuit.laps },
    { label: "PANJANG SIRKUIT",  value: `${circuit.length} km` },
    { label: "JUMLAH TIKUNGAN",  value: circuit.turns },
    { label: "JARAK TOTAL RACE", value: `${(circuit.laps * circuit.length).toFixed(1)} km` },
  ];

  return (
    <div>
      {/* Circuit shape */}
      <div style={{
        background: "#0d1117", border: "1px solid #1a1f2e", borderRadius: 14,
        padding: 20, display: "flex", justifyContent: "center", marginBottom: 12,
      }}>
        <CircuitShape round={round} color="#ef4444" />
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {stats.map(({ label, value }) => (
          <div key={label} style={{ background: "#0d1117", border: "1px solid #1a1f2e", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "monospace", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 900 }}>{value}</div>
          </div>
        ))}

        {/* Lap record — spans full width */}
        <div style={{ background: "#0d1117", border: "1px solid #1a1f2e", borderRadius: 10, padding: 14, gridColumn: "span 2" }}>
          <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "monospace", letterSpacing: 1, marginBottom: 4 }}>REKOR LAP TERCEPAT</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#ef4444" }}>{circuit.lapRecord}</div>
          <div style={{ fontSize: 11, color: "#4b5563", marginTop: 4 }}>
            {circuit.lapHolder} · {circuit.lapYear}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RaceDetailPage() {
  const { round }  = useParams();
  const roundNum   = parseInt(round);

  const [raceInfo,  setRaceInfo]  = useState(null);
  const [tab,       setTab]       = useState("race");
  const [raceData,  setRaceData]  = useState(null);
  const [qualiData, setQualiData] = useState(null);
  const [pitData,   setPitData]   = useState(null);
  const [loading,   setLoading]   = useState(false);

  const sessions = SCHEDULE_2026[roundNum] || {};
  const isSprint = !!sessions.sprint;
  const circuit  = CIRCUIT_INFO[roundNum];

  const TABS = [
    { id: "race",    label: "🏁 Race" },
    { id: "quali",   label: "🔵 Qualifying" },
    ...(isSprint ? [{ id: "sprint", label: "⚡ Sprint" }] : []),
    { id: "pits",    label: "🔧 Pit Stops" },
    { id: "circuit", label: "🗺️ Sirkuit" },
  ];

  // ── Fetch race info ──────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`/api/schedule`)
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setRaceInfo(json.data.find(r => r.round === roundNum) || null);
        }
      });
  }, [roundNum]);

  // ── Fetch tab data ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!raceInfo) return;
    const finished = raceInfo.status === "finished";

    const shouldFetch = {
      race:  tab === "race"  && !raceData  && finished,
      quali: tab === "quali" && !qualiData,
      pits:  tab === "pits"  && !pitData   && finished,
    };

    const sessionMap = { race: "race", quali: "qualifying", pits: "pitstops" };
    const setterMap  = { race: setRaceData, quali: setQualiData, pits: setPitData };

    const key = Object.keys(shouldFetch).find(k => shouldFetch[k]);
    if (!key) return;

    setLoading(true);
    fetch(`/api/race?round=${roundNum}&session=${sessionMap[key]}`)
      .then(r => r.json())
      .then(json => { if (json.success) setterMap[key](json.data); })
      .finally(() => setLoading(false));
  }, [tab, raceInfo]);

  // ── Loading skeleton while raceInfo loads ────────────────────────────────
  if (!raceInfo) {
    return (
      <div style={{ minHeight: "100vh", background: "#050507", paddingBottom: 80 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px" }}>
          <div style={{ height: 200, background: "#0d1117", borderRadius: 14, animation: "pulse 1.5s ease infinite" }}/>
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.8}}`}</style>
      </div>
    );
  }

  const isFinished = raceInfo.status === "finished";

  // ── Status banner config ─────────────────────────────────────────────────
  const statusMap = {
    finished: { bg: "#22c55e15", border: "#22c55e30", color: "#22c55e", text: "✅ Race sudah selesai — hasil tersedia" },
    ongoing:  { bg: "#ef444415", border: "#ef444430", color: "#ef4444", text: "🔴 Race sedang berlangsung!" },
    upcoming: { bg: "#fbbf2415", border: "#fbbf2430", color: "#fbbf24", text: "⏳ Race belum berlangsung — hasil akan muncul otomatis setelah selesai" },
  };
  const status = statusMap[raceInfo.status] || statusMap.upcoming;

  // ── Session cards ─────────────────────────────────────────────────────────
  const sessionCards = [
    sessions.fp1        && { label: "FREE PRACTICE 1",                             ...sessions.fp1,        highlight: false },
    sessions.fp2        && { label: isSprint ? "SPRINT QUALIFYING" : "FREE PRACTICE 2", ...sessions.fp2,  highlight: false },
    sessions.fp3        && { label: isSprint ? "SPRINT RACE"       : "FREE PRACTICE 3", ...sessions.fp3,  highlight: false },
    sessions.qualifying && { label: "QUALIFYING",                                   ...sessions.qualifying, highlight: false },
    sessions.race       && { label: "RACE",                                         ...sessions.race,       highlight: true  },
  ].filter(Boolean);

  return (
    <div style={{ minHeight: "100vh", background: "#050507", paddingBottom: 80 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.8}}`}</style>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px" }}>

        {/* Back button */}
        <Link href="/schedule" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 12, color: "#6b7280", textDecoration: "none",
          background: "#0d1117", border: "1px solid #1f2937",
          borderRadius: 8, padding: "6px 12px", marginBottom: 20,
        }}>
          ← Kalender
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: "#6b7280", fontFamily: "monospace", letterSpacing: 2, marginBottom: 6 }}>
            ROUND {roundNum} · {raceInfo.circuit?.country?.toUpperCase()}
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5, marginBottom: 4 }}>
            {getCountryFlag(raceInfo.circuit?.country)} {raceInfo.name}
          </div>
          <div style={{ fontSize: 12, color: "#4b5563" }}>
            {raceInfo.circuit?.name} · {raceInfo.circuit?.location}
          </div>
          {isSprint && (
            <span style={{
              display: "inline-block", marginTop: 8,
              background: "#7c3aed20", border: "1px solid #7c3aed40",
              color: "#a78bfa", fontSize: 10, fontWeight: 700,
              padding: "3px 10px", borderRadius: 100, fontFamily: "monospace",
            }}>
              ⚡ SPRINT WEEKEND
            </span>
          )}
        </div>

        {/* Status banner */}
        <div style={{
          background: status.bg, border: `1px solid ${status.border}`,
          borderRadius: 10, padding: "10px 14px", marginBottom: 20,
          fontSize: 12, color: status.color,
        }}>
          {status.text}
        </div>

        {/* Session schedule */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
          {sessionCards.map(({ label, date, time, highlight }) => (
            <div key={label} style={{
              background: highlight ? "#12050a" : "#0d1117",
              border: `1px solid ${highlight ? "#ef444430" : "#1a1f2e"}`,
              borderRadius: 10, padding: "10px 14px",
              ...(highlight ? { gridColumn: "span 2" } : {}),
            }}>
              <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "monospace", letterSpacing: 1, marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: highlight ? "#ef4444" : "#f9fafb" }}>
                {fmtWIB(date, time)}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                padding: "8px 14px", borderRadius: 8, fontSize: 12,
                fontWeight: tab === id ? 700 : 400,
                cursor: "pointer",
                background: tab === id ? "#ef4444" : "#0d1117",
                color: tab === id ? "#fff" : "#6b7280",
                border: `1px solid ${tab === id ? "transparent" : "#1f2937"}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {loading && <LoadingSkeleton />}

        {!loading && tab === "race"    && <RaceTab    isFinished={isFinished} data={raceData} />}
        {!loading && tab === "quali"   && <QualiTab   data={qualiData} />}
        {!loading && tab === "pits"    && <PitsTab    isFinished={isFinished} data={pitData} />}
        {           tab === "circuit"  && <CircuitTab round={roundNum} circuit={circuit} />}

      </div>
    </div>
  );
}
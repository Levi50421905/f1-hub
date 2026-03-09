"use client";
// src/app/race/[round]/page.jsx
// Detail race weekend — tab FP dihapus (Jolpica tidak simpan data FP)
// Tab yang tersedia: Race, Qualifying, Pit Stops, Info Sirkuit

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getTeamColor, getCountryFlag } from "@/lib/teamColors";
import { SCHEDULE_2026 } from "@/lib/schedule2026";

function fmtWIB(dateStr, timeStr) {
  if (!dateStr || !timeStr) return "TBA";
  try {
    const dt  = new Date(`${dateStr}T${timeStr}`);
    const wib = new Date(dt.getTime() + 7 * 60 * 60 * 1000);
    const days  = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
    const months= ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    const day   = days[wib.getUTCDay()];
    const date  = wib.getUTCDate();
    const month = months[wib.getUTCMonth()];
    const hh    = String(wib.getUTCHours()).padStart(2,"0");
    const mm    = String(wib.getUTCMinutes()).padStart(2,"0");
    return `${day}, ${date} ${month} · ${hh}:${mm} WIB`;
  } catch { return "TBA"; }
}

// Info sirkuit statis (bisa diperluas)
const CIRCUIT_INFO = {
  1:  { laps: 58,  length: 5.278, turns: 14, lapRecord: "1:20.235", lapHolder: "Leclerc", lapYear: 2022, country: "Australia" },
  2:  { laps: 56,  length: 5.451, turns: 16, lapRecord: "1:32.238", lapHolder: "M. Schumacher", lapYear: 2004, country: "China" },
  3:  { laps: 53,  length: 5.807, turns: 18, lapRecord: "1:30.983", lapHolder: "Verstappen", lapYear: 2019, country: "Japan" },
  4:  { laps: 57,  length: 5.412, turns: 15, lapRecord: "1:31.447", lapHolder: "De La Rosa", lapYear: 2005, country: "Bahrain" },
  5:  { laps: 50,  length: 6.174, turns: 27, lapRecord: "1:30.734", lapHolder: "Hamilton", lapYear: 2021, country: "Saudi Arabia" },
  6:  { laps: 57,  length: 5.412, turns: 19, lapRecord: "1:26.841", lapHolder: "Verstappen", lapYear: 2023, country: "USA" },
  7:  { laps: 70,  length: 4.361, turns: 14, lapRecord: "1:13.078", lapHolder: "Bottas", lapYear: 2019, country: "Canada" },
  8:  { laps: 78,  length: 3.337, turns: 19, lapRecord: "1:12.909", lapHolder: "Leclerc", lapYear: 2021, country: "Monaco" },
  9:  { laps: 66,  length: 4.657, turns: 14, lapRecord: "1:16.330", lapHolder: "Verstappen", lapYear: 2023, country: "Spain" },
  10: { laps: 71,  length: 4.318, turns: 10, lapRecord: "1:05.619", lapHolder: "Bottas", lapYear: 2020, country: "Austria" },
  11: { laps: 52,  length: 5.891, turns: 18, lapRecord: "1:27.097", lapHolder: "Hamilton", lapYear: 2020, country: "UK" },
  12: { laps: 44,  length: 7.004, turns: 20, lapRecord: "1:46.286", lapHolder: "Verstappen", lapYear: 2018, country: "Belgium" },
  13: { laps: 70,  length: 4.381, turns: 14, lapRecord: "1:16.627", lapHolder: "Hamilton", lapYear: 2020, country: "Hungary" },
  14: { laps: 72,  length: 4.259, turns: 14, lapRecord: "1:11.097", lapHolder: "Verstappen", lapYear: 2021, country: "Netherlands" },
  15: { laps: 53,  length: 5.793, turns: 11, lapRecord: "1:21.046", lapHolder: "Barrichello", lapYear: 2004, country: "Italy" },
  16: { laps: 55,  length: 5.537, turns: 21, lapRecord: "—",         lapHolder: "—",           lapYear: 2026, country: "Spain" },
  17: { laps: 51,  length: 6.003, turns: 20, lapRecord: "1:43.009", lapHolder: "Leclerc", lapYear: 2019, country: "Azerbaijan" },
  18: { laps: 61,  length: 5.063, turns: 23, lapRecord: "1:35.867", lapHolder: "Leclerc", lapYear: 2023, country: "Singapore" },
  19: { laps: 56,  length: 5.513, turns: 20, lapRecord: "1:36.169", lapHolder: "Leclerc", lapYear: 2019, country: "USA" },
  20: { laps: 71,  length: 4.304, turns: 17, lapRecord: "1:17.774", lapHolder: "Bottas", lapYear: 2021, country: "Mexico" },
  21: { laps: 71,  length: 4.309, turns: 15, lapRecord: "1:10.540", lapHolder: "Verstappen", lapYear: 2023, country: "Brazil" },
  22: { laps: 50,  length: 6.201, turns: 17, lapRecord: "1:35.490", lapHolder: "Leclerc", lapYear: 2023, country: "USA" },
  23: { laps: 57,  length: 5.380, turns: 16, lapRecord: "1:24.319", lapHolder: "Verstappen", lapYear: 2023, country: "Qatar" },
  24: { laps: 58,  length: 5.281, turns: 16, lapRecord: "1:26.103", lapHolder: "Verstappen", lapYear: 2021, country: "UAE" },
};


// SVG path data untuk bentuk sirkuit (simplified, recognizable)
const CIRCUIT_PATHS = {
  1: "M 50,20 L 180,20 Q 200,20 200,40 L 200,80 Q 200,95 185,95 L 160,95 Q 145,95 140,110 L 130,140 Q 125,155 110,155 L 80,155 Q 60,155 55,140 L 40,100 Q 35,85 50,80 L 50,20 Z", // Albert Park
  2: "M 30,40 L 160,30 Q 180,28 185,45 L 190,90 Q 192,105 175,108 L 140,112 L 135,140 Q 132,158 115,160 L 70,160 Q 50,160 45,142 L 35,95 Q 28,75 30,40 Z", // Shanghai
  3: "M 60,15 L 170,15 Q 190,15 195,35 L 200,75 Q 202,95 185,100 L 160,102 Q 145,102 140,120 L 130,155 Q 125,170 105,170 L 65,170 Q 42,170 38,150 L 28,100 Q 22,78 35,60 L 50,30 Q 55,15 60,15 Z", // Suzuka
  4: "M 40,30 L 175,25 Q 195,24 198,44 L 200,85 Q 200,102 183,105 L 150,108 L 148,135 Q 146,152 128,155 L 72,155 Q 52,155 48,136 L 38,90 Q 34,72 40,30 Z", // Bahrain
  5: "M 50,15 L 185,15 Q 205,15 208,35 L 210,65 L 195,75 L 210,85 L 208,120 Q 205,138 185,140 L 55,140 Q 35,140 32,120 L 30,80 L 45,70 L 30,60 L 32,35 Q 35,15 50,15 Z", // Jeddah
  6: "M 60,20 C 140,10 190,50 195,90 C 198,120 170,155 120,158 C 70,160 30,130 28,90 C 26,55 45,25 60,20 Z", // Miami (oval-ish)
  7: "M 50,25 L 165,20 Q 185,19 188,38 L 192,75 Q 194,92 177,97 L 150,100 L 148,128 Q 146,145 128,148 L 70,148 Q 50,148 46,130 L 38,85 Q 32,65 38,45 L 42,28 Q 45,25 50,25 Z", // Montreal
  8: "M 100,15 C 155,12 195,45 198,85 C 200,115 175,150 135,158 C 105,163 75,155 58,138 C 38,118 35,85 50,62 C 65,38 80,17 100,15 Z", // Monaco (tight)
  9: "M 55,18 L 172,15 Q 192,14 195,33 L 198,72 Q 200,90 183,94 L 158,97 L 155,124 Q 153,142 135,145 L 68,145 Q 48,145 44,127 L 34,82 Q 28,62 34,42 L 40,22 Q 45,18 55,18 Z", // Barcelona
  10: "M 80,20 C 160,15 205,60 200,105 C 195,140 160,165 115,165 C 70,165 35,140 30,105 C 25,65 45,23 80,20 Z", // Red Bull Ring (short)
  11: "M 45,22 L 178,18 Q 198,17 200,36 L 202,78 Q 204,97 187,101 L 160,104 L 157,133 Q 155,152 137,155 L 65,155 Q 44,155 40,136 L 30,89 Q 24,68 30,47 L 35,25 Q 39,22 45,22 Z", // Silverstone
  12: "M 35,25 L 185,15 Q 207,14 210,36 L 212,65 Q 213,83 196,88 L 168,93 L 165,128 Q 163,150 143,153 L 55,153 Q 34,153 30,132 L 22,80 Q 16,55 25,35 L 35,25 Z", // Spa (long)
  13: "M 65,18 L 162,15 Q 182,14 186,33 L 190,72 Q 192,89 175,93 L 152,96 L 150,122 Q 148,140 131,143 L 72,143 Q 52,143 48,125 L 38,80 Q 32,60 40,40 L 50,22 Q 55,18 65,18 Z", // Hungaroring
  14: "M 55,20 L 170,16 Q 190,15 194,34 L 197,73 Q 199,91 182,95 L 156,98 L 154,126 Q 152,144 134,147 L 68,147 Q 48,147 44,128 L 34,83 Q 28,62 34,42 L 40,23 Q 44,20 55,20 Z", // Zandvoort
  15: "M 50,22 L 175,17 Q 196,16 199,36 L 201,76 Q 202,95 185,99 L 158,102 L 156,130 Q 154,149 136,152 L 66,152 Q 45,152 41,133 L 31,86 Q 25,65 31,44 L 37,25 Q 41,22 50,22 Z", // Monza
  16: "M 55,18 L 168,15 Q 188,14 192,33 L 195,70 Q 197,88 180,92 L 154,95 L 151,122 Q 149,140 132,143 L 70,143 Q 50,143 46,125 L 36,79 Q 30,58 37,38 L 43,21 Q 48,18 55,18 Z", // Barcelona (new)
  17: "M 50,18 C 130,8 205,55 208,100 C 210,135 185,168 140,170 C 100,172 62,152 45,120 C 28,88 30,52 50,18 Z", // Baku (street)
  18: "M 55,20 C 140,8 210,55 213,100 C 215,138 185,172 135,175 C 90,177 50,155 35,118 C 20,82 25,45 55,20 Z", // Singapore
  19: "M 60,20 C 145,10 208,58 210,103 C 212,140 182,170 132,172 C 85,174 45,150 32,113 C 18,76 22,40 60,20 Z", // COTA
  20: "M 50,22 L 168,17 Q 188,16 192,35 L 195,74 Q 197,92 180,96 L 154,99 L 152,127 Q 150,145 132,148 L 70,148 Q 50,148 46,130 L 36,84 Q 30,63 36,43 L 42,25 Q 47,22 50,22 Z", // Mexico City
  21: "M 55,20 L 170,15 Q 190,14 193,33 L 195,72 Q 197,90 180,94 L 154,97 L 152,124 Q 150,142 132,145 L 70,145 Q 50,145 46,127 L 36,81 Q 30,60 37,40 L 43,23 Q 48,20 55,20 Z", // Interlagos
  22: "M 60,22 C 145,12 208,60 210,105 C 212,142 182,172 132,174 C 85,176 45,152 32,115 C 18,78 22,42 60,22 Z", // Las Vegas
  23: "M 55,20 L 170,15 Q 190,14 194,33 L 197,70 Q 199,88 182,92 L 156,95 L 154,122 Q 152,140 134,143 L 68,143 Q 48,143 44,125 L 34,79 Q 28,58 34,38 L 40,23 Q 45,20 55,20 Z", // Lusail
  24: "M 55,18 L 170,13 Q 190,12 194,31 L 197,70 Q 199,88 182,92 L 156,95 L 154,123 Q 152,141 134,144 L 68,144 Q 48,144 44,126 L 34,80 Q 28,59 34,39 L 40,21 Q 45,18 55,18 Z", // Yas Marina
};

function CircuitShape({ round, color = "#ef4444" }) {
  const path = CIRCUIT_PATHS[round];
  if (!path) return null;
  return (
    <svg
      viewBox="0 0 240 190"
      style={{ width: "100%", maxWidth: 280, height: "auto" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Glow effect */}
      <defs>
        <filter id={`glow-${round}`}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      {/* Track shadow */}
      <path d={path} fill="none" stroke={color + "30"} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Main track */}
      <path d={path} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter={`url(#glow-${round})`}/>
      {/* Start/finish line */}
      <line x1="50" y1="14" x2="50" y2="26" stroke="#ffffff" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

export default function RaceDetailPage() {
  const { round } = useParams();
  const roundNum  = parseInt(round);

  const [raceInfo,   setRaceInfo]   = useState(null);
  const [tab,        setTab]        = useState("race");
  const [raceData,   setRaceData]   = useState(null);
  const [qualiData,  setQualiData]  = useState(null);
  const [pitData,    setPitData]    = useState(null);
  const [loading,    setLoading]    = useState(false);

  const sessions = SCHEDULE_2026[roundNum] || {};
  const isSprint = sessions.sprint;
  const circuit  = CIRCUIT_INFO[roundNum];

  const TABS = [
    { id: "race",    label: "🏁 Race" },
    { id: "quali",   label: "🔵 Qualifying" },
    ...(isSprint ? [{ id: "sprint", label: "⚡ Sprint" }] : []),
    { id: "pits",    label: "🔧 Pit Stops" },
    { id: "circuit", label: "🗺️ Sirkuit" },
  ];

  useEffect(() => {
    fetch(`/api/schedule`)
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          const race = json.data.find(r => r.round === roundNum);
          setRaceInfo(race);
        }
      });
  }, [roundNum]);

  // Fetch data saat tab berubah
  useEffect(() => {
    if (!raceInfo) return;
    const isFinished = raceInfo.status === "finished";

    // Race & pit stops hanya kalau race sudah selesai
    if (tab === "race" && !raceData && isFinished) {
      setLoading(true);
      fetch(`/api/race?round=${roundNum}&session=race`)
        .then(r => r.json())
        .then(json => { if (json.success) setRaceData(json.data); })
        .finally(() => setLoading(false));
    }
    // Qualifying: fetch kapanpun — bisa sudah ada meski race belum
    if (tab === "quali" && !qualiData) {
      setLoading(true);
      fetch(`/api/race?round=${roundNum}&session=qualifying`)
        .then(r => r.json())
        .then(json => { if (json.success) setQualiData(json.data); })
        .finally(() => setLoading(false));
    }
    if (tab === "pits" && !pitData && isFinished) {
      setLoading(true);
      fetch(`/api/race?round=${roundNum}&session=pitstops`)
        .then(r => r.json())
        .then(json => { if (json.success) setPitData(json.data); })
        .finally(() => setLoading(false));
    }
  }, [tab, raceInfo]);

  const S = {
    page: { minHeight: "100vh", background: "#050507", paddingBottom: 80 },
    wrap: { maxWidth: 720, margin: "0 auto", padding: "20px 16px" },
    backBtn: {
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 12, color: "#6b7280", textDecoration: "none",
      background: "#0d1117", border: "1px solid #1f2937",
      borderRadius: 8, padding: "6px 12px", marginBottom: 20,
    },
    header: { marginBottom: 24 },
    eyebrow: { fontSize: 10, color: "#6b7280", fontFamily: "monospace", letterSpacing: 2, marginBottom: 6 },
    title: { fontSize: 26, fontWeight: 900, letterSpacing: -0.5, marginBottom: 4 },

    statusBanner: (status) => ({
      background: status === "finished" ? "#22c55e15" : status === "ongoing" ? "#ef444415" : "#fbbf2415",
      border: `1px solid ${status === "finished" ? "#22c55e30" : status === "ongoing" ? "#ef444430" : "#fbbf2430"}`,
      borderRadius: 10, padding: "10px 14px", marginBottom: 20,
      fontSize: 12, color: status === "finished" ? "#22c55e" : status === "ongoing" ? "#ef4444" : "#fbbf24",
    }),

    sessionGrid: {
      display: "grid", gridTemplateColumns: "1fr 1fr",
      gap: 8, marginBottom: 24,
    },
    sessionCard: (highlight) => ({
      background: highlight ? "#12050a" : "#0d1117",
      border: `1px solid ${highlight ? "#ef444430" : "#1a1f2e"}`,
      borderRadius: 10, padding: "10px 14px",
    }),
    sessionName: { fontSize: 10, color: "#4b5563", fontFamily: "monospace", letterSpacing: 1, marginBottom: 4 },
    sessionTime: (highlight) => ({ fontSize: 13, fontWeight: 700, color: highlight ? "#ef4444" : "#f9fafb" }),

    tabs: { display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" },
    tab: (active) => ({
      padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: active ? 700 : 400,
      cursor: "pointer", border: "none",
      background: active ? "#ef4444" : "#0d1117",
      color: active ? "#fff" : "#6b7280",
      border: `1px solid ${active ? "transparent" : "#1f2937"}`,
    }),

    table: { width: "100%", borderCollapse: "collapse" },
    th: {
      fontSize: 10, color: "#4b5563", fontFamily: "monospace", letterSpacing: 1,
      padding: "8px 10px", textAlign: "left", borderBottom: "1px solid #1a1f2e",
    },
    tr: (i) => ({
      background: i % 2 === 0 ? "#0d1117" : "transparent",
      borderBottom: "1px solid #0f1218",
    }),
    td: { padding: "10px 10px", fontSize: 13 },

    noData: {
      textAlign: "center", padding: "40px 20px",
      background: "#0d1117", borderRadius: 12, border: "1px solid #1f2937",
      fontSize: 13, color: "#4b5563",
    },

    circuitGrid: {
      display: "grid", gridTemplateColumns: "1fr 1fr",
      gap: 8,
    },
    circuitCard: {
      background: "#0d1117", border: "1px solid #1a1f2e",
      borderRadius: 10, padding: "14px",
    },
    circuitLabel: { fontSize: 10, color: "#4b5563", fontFamily: "monospace", letterSpacing: 1, marginBottom: 4 },
    circuitValue: { fontSize: 16, fontWeight: 900 },
  };

  if (!raceInfo) return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={{ height: 200, background: "#0d1117", borderRadius: 14, animation: "pulse 1.5s ease infinite" }} />
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:0.8}}`}</style>
    </div>
  );

  const isFinished = raceInfo.status === "finished";

  return (
    <div style={S.page}>
      <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:0.8}}`}</style>
      <div style={S.wrap}>
        <Link href="/schedule" style={S.backBtn}>← Kalender</Link>

        {/* Header */}
        <div style={S.header}>
          <div style={S.eyebrow}>ROUND {roundNum} · {raceInfo.circuit?.country?.toUpperCase()}</div>
          <div style={S.title}>
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
            }}>⚡ SPRINT WEEKEND</span>
          )}
        </div>

        {/* Status */}
        <div style={S.statusBanner(raceInfo.status)}>
          {raceInfo.status === "finished" && "✅ Race sudah selesai — hasil tersedia"}
          {raceInfo.status === "upcoming" && `⏳ Race belum berlangsung — hasil akan muncul otomatis setelah selesai`}
          {raceInfo.status === "ongoing"  && "🔴 Race sedang berlangsung!"}
        </div>

        {/* Session schedule */}
        <div style={S.sessionGrid}>
          {sessions.fp1 && (
            <div style={S.sessionCard(false)}>
              <div style={S.sessionName}>{isSprint ? "FREE PRACTICE 1" : "FREE PRACTICE 1"}</div>
              <div style={S.sessionTime(false)}>{fmtWIB(sessions.fp1.date, sessions.fp1.time)}</div>
            </div>
          )}
          {sessions.fp2 && (
            <div style={S.sessionCard(false)}>
              <div style={S.sessionName}>{isSprint ? "SPRINT QUALIFYING" : "FREE PRACTICE 2"}</div>
              <div style={S.sessionTime(false)}>{fmtWIB(sessions.fp2.date, sessions.fp2.time)}</div>
            </div>
          )}
          {sessions.fp3 && (
            <div style={S.sessionCard(false)}>
              <div style={S.sessionName}>{isSprint ? "SPRINT RACE" : "FREE PRACTICE 3"}</div>
              <div style={S.sessionTime(false)}>{fmtWIB(sessions.fp3.date, sessions.fp3.time)}</div>
            </div>
          )}
          {sessions.qualifying && (
            <div style={S.sessionCard(false)}>
              <div style={S.sessionName}>QUALIFYING</div>
              <div style={S.sessionTime(false)}>{fmtWIB(sessions.qualifying.date, sessions.qualifying.time)}</div>
            </div>
          )}
          {sessions.race && (
            <div style={{ ...S.sessionCard(true), gridColumn: "span 2" }}>
              <div style={S.sessionName}>RACE</div>
              <div style={S.sessionTime(true)}>{fmtWIB(sessions.race.date, sessions.race.time)}</div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={S.tabs}>
          {TABS.map(({ id, label }) => (
            <button key={id} style={S.tab(tab === id)} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        {/* ── TAB CONTENT ── */}
        {loading && (
          <div style={{ display: "grid", gap: 8 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ height: 44, background: "#0d1117", borderRadius: 8, animation: "pulse 1.5s ease infinite" }} />
            ))}
          </div>
        )}

        {/* Race results */}
        {!loading && tab === "race" && (
          isFinished && raceData?.results ? (
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>POS</th>
                  <th style={S.th}>DRIVER</th>
                  <th style={S.th}>TIM</th>
                  <th style={S.th}>WAKTU / STATUS</th>
                  <th style={S.th}>PTS</th>
                </tr>
              </thead>
              <tbody>
                {raceData.results.map((r, i) => {
                  const color = getTeamColor(r.driver?.team);
                  return (
                    <tr key={i} style={S.tr(i)}>
                      <td style={{ ...S.td, fontWeight: 900, color: i < 3 ? "#fbbf24" : "#9ca3af", width: 40 }}>{r.position}</td>
                      <td style={{ ...S.td, fontWeight: 600, color }}>
                        {r.driver?.firstName?.charAt(0)}. {r.driver?.lastName}
                      </td>
                      <td style={{ ...S.td, fontSize: 11, color: "#4b5563" }}>{r.driver?.team}</td>
                      <td style={{ ...S.td, fontSize: 11, color: "#6b7280", fontFamily: "monospace" }}>
                        {r.time || r.status || "—"}
                      </td>
                      <td style={{ ...S.td, fontWeight: 700, color: "#fbbf24" }}>{r.points || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : !isFinished ? (
            <div style={S.noData}>Hasil race akan muncul setelah race selesai.</div>
          ) : (
            <div style={S.noData}>Data race tidak tersedia.</div>
          )
        )}

        {/* Qualifying results */}
        {!loading && tab === "quali" && (
          qualiData?.results ? (
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>POS</th>
                  <th style={S.th}>DRIVER</th>
                  <th style={S.th}>Q1</th>
                  <th style={S.th}>Q2</th>
                  <th style={S.th}>Q3</th>
                </tr>
              </thead>
              <tbody>
                {qualiData.results.map((r, i) => {
                  const color = getTeamColor(r.team?.id || r.team?.name);
                  return (
                    <tr key={i} style={S.tr(i)}>
                      <td style={{ ...S.td, fontWeight: 900, color: i < 3 ? "#fbbf24" : "#9ca3af", width: 40 }}>{r.pos}</td>
                      <td style={{ ...S.td, fontWeight: 600, color }}>
                        {r.driver?.name || `${r.driver?.firstName?.charAt(0)}. ${r.driver?.lastName}`}
                      </td>
                      {["q1","q2","q3"].map(q => (
                        <td key={q} style={{ ...S.td, fontSize: 11, color: "#6b7280", fontFamily: "monospace" }}>
                          {r[q] || "—"}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={S.noData}>Hasil qualifying belum tersedia.</div>
          )
        )}

        {/* Pit stops */}
        {!loading && tab === "pits" && (
          isFinished && pitData?.pitstops ? (
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>DRIVER</th>
                  <th style={S.th}>STOP KE</th>
                  <th style={S.th}>LAP</th>
                  <th style={S.th}>DURASI</th>
                </tr>
              </thead>
              <tbody>
                {pitData.pitstops.map((p, i) => (
                  <tr key={i} style={S.tr(i)}>
                    <td style={{ ...S.td, fontWeight: 600 }}>
                      {p.driver?.firstName?.charAt(0)}. {p.driver?.lastName}
                    </td>
                    <td style={{ ...S.td, color: "#6b7280" }}>{p.stop}</td>
                    <td style={{ ...S.td, color: "#6b7280" }}>Lap {p.lap}</td>
                    <td style={{ ...S.td, fontFamily: "monospace", color: "#fbbf24" }}>{p.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : !isFinished ? (
            <div style={S.noData}>Data pit stop akan muncul setelah race selesai.</div>
          ) : (
            <div style={S.noData}>Data pit stop tidak tersedia.</div>
          )
        )}

        {/* Circuit info */}
        {tab === "circuit" && circuit && (() => {
          const raceColor = raceInfo?.circuit?.country
            ? "#ef4444"
            : "#ef4444";
          return (
            <div>
              {/* Circuit shape */}
              <div style={{
                background: "#0d1117", border: "1px solid #1a1f2e",
                borderRadius: 14, padding: "20px",
                display: "flex", justifyContent: "center",
                marginBottom: 12,
              }}>
                <CircuitShape round={roundNum} color="#ef4444" />
              </div>

              <div style={S.circuitGrid}>
                <div style={S.circuitCard}>
                  <div style={S.circuitLabel}>JUMLAH LAP</div>
                  <div style={S.circuitValue}>{circuit.laps}</div>
                </div>
                <div style={S.circuitCard}>
                  <div style={S.circuitLabel}>PANJANG SIRKUIT</div>
                  <div style={S.circuitValue}>{circuit.length} km</div>
                </div>
                <div style={S.circuitCard}>
                  <div style={S.circuitLabel}>JUMLAH TIKUNGAN</div>
                  <div style={S.circuitValue}>{circuit.turns}</div>
                </div>
                <div style={S.circuitCard}>
                  <div style={S.circuitLabel}>JARAK TOTAL RACE</div>
                  <div style={S.circuitValue}>{(circuit.laps * circuit.length).toFixed(1)} km</div>
                </div>
                <div style={{ ...S.circuitCard, gridColumn: "span 2" }}>
                  <div style={S.circuitLabel}>REKOR LAP TERCEPAT</div>
                  <div style={{ ...S.circuitValue, color: "#ef4444" }}>{circuit.lapRecord}</div>
                  <div style={{ fontSize: 11, color: "#4b5563", marginTop: 4 }}>
                    {circuit.lapHolder} · {circuit.lapYear}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
        {tab === "circuit" && !circuit && (
          <div style={S.noData}>Info sirkuit tidak tersedia.</div>
        )}

      </div>
    </div>
  );
}
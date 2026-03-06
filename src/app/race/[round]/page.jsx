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
    if (!raceInfo || raceInfo.status !== "finished") return;

    if (tab === "race" && !raceData) {
      setLoading(true);
      fetch(`/api/race?round=${roundNum}&session=race`)
        .then(r => r.json())
        .then(json => { if (json.success) setRaceData(json.data); })
        .finally(() => setLoading(false));
    }
    if (tab === "quali" && !qualiData) {
      setLoading(true);
      fetch(`/api/race?round=${roundNum}&session=qualifying`)
        .then(r => r.json())
        .then(json => { if (json.success) setQualiData(json.data); })
        .finally(() => setLoading(false));
    }
    if (tab === "pits" && !pitData) {
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
          isFinished && qualiData?.results ? (
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
                  const color = getTeamColor(r.driver?.team);
                  return (
                    <tr key={i} style={S.tr(i)}>
                      <td style={{ ...S.td, fontWeight: 900, color: i < 3 ? "#fbbf24" : "#9ca3af", width: 40 }}>{r.position}</td>
                      <td style={{ ...S.td, fontWeight: 600, color }}>
                        {r.driver?.firstName?.charAt(0)}. {r.driver?.lastName}
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
          ) : !isFinished ? (
            <div style={S.noData}>Hasil qualifying akan muncul setelah sesi selesai.</div>
          ) : (
            <div style={S.noData}>Data qualifying tidak tersedia.</div>
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
        {tab === "circuit" && circuit && (
          <div>
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
        )}
        {tab === "circuit" && !circuit && (
          <div style={S.noData}>Info sirkuit tidak tersedia.</div>
        )}

      </div>
    </div>
  );
}

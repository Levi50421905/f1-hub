"use client";
// src/app/leaderboard/page.jsx

import { useState, useEffect } from "react";
import { DRIVERS_2026 } from "@/lib/drivers2026";
import { getTeamColor, getCountryFlag } from "@/lib/teamColors";

// Hitung skor satu prediksi vs hasil aktual
function calcScore(picks, actual) {
  if (!picks || !actual || actual.length === 0) return null;
  let score = 0;
  picks.forEach((driverId, idx) => {
    if (!driverId) return;
    if (actual[idx] === driverId) score += 3;          // posisi tepat
    else if (actual.includes(driverId)) score += 1;    // ada di top5 tapi salah posisi
  });
  return score;
}

const MEDAL = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const [players,  setPlayers]  = useState([]);   // [{ player, predictions }]
  const [results,  setResults]  = useState({});   // round → [p1id..p5id]
  const [schedule, setSchedule] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [myName,   setMyName]   = useState("");
  const [tab,      setTab]      = useState("total"); // "total" | "perrace"
  const [selRound, setSelRound] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("f1-player-name") || "";
    setMyName(saved);

    Promise.all([
      fetch("/api/predictions?all=1").then(r => r.json()),
      fetch("/api/schedule").then(r => r.json()),
    ]).then(([predsRes, schedRes]) => {
      if (predsRes.success) setPlayers(predsRes.data);
      if (schedRes.success) {
        const sched = schedRes.data;
        setSchedule(sched);
        if (!selRound) {
          const finished = sched.filter(r => r.status === "finished");
          if (finished.length > 0) setSelRound(finished[finished.length - 1].round);
          else setSelRound(sched[0]?.round);
        }
        // Fetch hasil race yang sudah selesai
        const finishedRounds = sched.filter(r => r.status === "finished").map(r => r.round);
        finishedRounds.forEach(round => {
          fetch(`/api/race?round=${round}&session=race`)
            .then(r => r.json())
            .then(json => {
              if (json.success && json.data?.results) {
                const top5 = json.data.results.slice(0, 5).map(r => r.driver?.id);
                setResults(prev => ({ ...prev, [round]: top5 }));
              }
            });
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  // Hitung total skor tiap player
  const scoreboard = players.map(({ player, predictions }) => {
    let total = 0;
    const perRace = {};
    Object.entries(predictions || {}).forEach(([round, val]) => {
      const actual = results[round];
      const picks  = val?.picks || val;  // support both formats
      const score  = calcScore(picks, actual);
      perRace[round] = score;
      if (score !== null) total += score;
    });
    return { player, total, perRace, predictions };
  }).sort((a, b) => b.total - a.total);

  const finishedRaces = schedule.filter(r => r.status === "finished");

  const S = {
    page: {
      minHeight: "100vh",
      background: "#050507",
      paddingBottom: 80,
    },
    wrap: { maxWidth: 720, margin: "0 auto", padding: "0 16px" },

    header: {
      paddingTop: 32, paddingBottom: 24,
      borderBottom: "1px solid #1a1f2e",
      marginBottom: 24,
    },
    eyebrow: {
      fontSize: 10, color: "#ef4444", letterSpacing: 3,
      fontFamily: "monospace", marginBottom: 8,
    },
    title: {
      fontSize: 28, fontWeight: 900, letterSpacing: -1, marginBottom: 4,
    },
    subtitle: { fontSize: 12, color: "#4b5563" },

    tabs: {
      display: "flex", gap: 8, marginBottom: 20,
    },
    tab: (active) => ({
      padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700,
      cursor: "pointer", border: "none",
      background: active ? "#ef4444" : "#0d1117",
      color: active ? "#fff" : "#6b7280",
      border: `1px solid ${active ? "transparent" : "#1f2937"}`,
    }),

    // ── TOTAL LEADERBOARD ──
    podiumRow: (rank) => ({
      display: "flex", alignItems: "center", gap: 12,
      padding: "14px 16px", borderRadius: 12,
      marginBottom: 8,
      background: rank === 0 ? "#1a1300" : rank === 1 ? "#0f1018" : "#0d1117",
      border: `1px solid ${rank === 0 ? "#fbbf2430" : rank === 1 ? "#ffffff15" : "#1a1f2e"}`,
    }),
    rankNum: (rank) => ({
      fontSize: rank < 3 ? 22 : 14,
      fontWeight: 900,
      minWidth: 32, textAlign: "center",
      color: rank === 0 ? "#fbbf24" : rank === 1 ? "#9ca3af" : rank === 2 ? "#b45309" : "#374151",
    }),
    playerName: (isMe) => ({
      flex: 1, fontSize: 14, fontWeight: 700,
      color: isMe ? "#ef4444" : "#f9fafb",
    }),
    meTag: {
      fontSize: 9, background: "#ef444420", color: "#ef4444",
      border: "1px solid #ef444440", borderRadius: 100,
      padding: "2px 7px", fontFamily: "monospace", letterSpacing: 1,
    },
    scoreBox: (rank) => ({
      textAlign: "center",
      background: rank === 0 ? "#fbbf2415" : "#ffffff08",
      borderRadius: 8, padding: "6px 14px",
    }),
    scoreNum: (rank) => ({
      fontSize: 20, fontWeight: 900, lineHeight: 1,
      color: rank === 0 ? "#fbbf24" : rank === 1 ? "#9ca3af" : "#f9fafb",
    }),
    scoreLbl: { fontSize: 9, color: "#4b5563", marginTop: 1 },

    // Race prediction mini bars
    raceBars: {
      display: "flex", gap: 3, marginTop: 6, flexWrap: "wrap",
    },
    raceBar: (score) => ({
      width: 18, height: 6, borderRadius: 3,
      background: score === null ? "#1a1f2e"
        : score >= 12 ? "#22c55e"
        : score >= 6  ? "#fbbf24"
        : score >= 1  ? "#f97316"
        : "#ef4444",
      title: `R${score}`,
    }),

    // ── PER RACE TAB ──
    roundPicker: {
      display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20,
    },
    roundBtn: (active) => ({
      padding: "6px 12px", borderRadius: 8, fontSize: 11,
      cursor: "pointer", border: "none",
      background: active ? "#ef4444" : "#0d1117",
      color: active ? "#fff" : "#6b7280",
      border: `1px solid ${active ? "transparent" : "#1f2937"}`,
      fontWeight: active ? 700 : 400,
    }),
    perRaceRow: {
      background: "#0d1117", border: "1px solid #1a1f2e",
      borderRadius: 12, padding: "14px 16px",
      marginBottom: 8,
    },
    perRaceTop: {
      display: "flex", alignItems: "center", gap: 12, marginBottom: 10,
    },
    pickRow: {
      display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8,
    },
    pickChip: (isCorrect, isOnTop5, isFinished) => ({
      fontSize: 11, padding: "4px 10px", borderRadius: 6,
      fontWeight: 600,
      background: !isFinished ? "#1a1f2e"
        : isCorrect ? "#22c55e20"
        : isOnTop5  ? "#fbbf2420"
        : "#ef444415",
      color: !isFinished ? "#6b7280"
        : isCorrect ? "#22c55e"
        : isOnTop5  ? "#fbbf24"
        : "#6b7280",
      border: `1px solid ${!isFinished ? "#1f2937"
        : isCorrect ? "#22c55e40"
        : isOnTop5  ? "#fbbf2440"
        : "#ef444430"}`,
    }),

    empty: {
      textAlign: "center", padding: "60px 20px",
      background: "#0d1117", borderRadius: 14,
      border: "1px solid #1f2937",
    },
  };

  if (loading) {
    return (
      <div style={S.page}>
        <div style={S.wrap}>
          <div style={{ ...S.header }}>
            <div style={S.eyebrow}>🏆 LEADERBOARD</div>
            <div style={S.title}>Papan Skor</div>
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{
              height: 64, background: "#0d1117", borderRadius: 12,
              marginBottom: 8, animation: "pulse 1.5s ease infinite",
            }} />
          ))}
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:0.8}}`}</style>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        button:hover { opacity: 0.85; }
      `}</style>

      <div style={S.wrap}>
        {/* Header */}
        <div style={S.header}>
          <div style={S.eyebrow}>🏆 LEADERBOARD</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={S.title}>Papan Skor</div>
              <div style={S.subtitle}>
                {finishedRaces.length} race selesai · {players.length} pemain
              </div>
            </div>
            {/* My total score highlight */}
            {myName && (() => {
              const me = scoreboard.find(p => p.player === myName.toLowerCase());
              if (!me) return null;
              const myRank = scoreboard.indexOf(me) + 1;
              return (
                <div style={{
                  background: "#ef444415", border: "1px solid #ef444430",
                  borderRadius: 10, padding: "10px 16px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 9, color: "#ef4444", fontFamily: "monospace", letterSpacing: 1, marginBottom: 2 }}>SKOR KAMU</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#ef4444", lineHeight: 1 }}>{me.total}</div>
                  <div style={{ fontSize: 10, color: "#6b7280" }}>Rank #{myRank}</div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Tabs */}
        <div style={S.tabs}>
          <button style={S.tab(tab === "total")} onClick={() => setTab("total")}>
            📊 Total Poin
          </button>
          <button style={S.tab(tab === "perrace")} onClick={() => setTab("perrace")}>
            🏎️ Per Race
          </button>
        </div>

        {/* ── TAB TOTAL ── */}
        {tab === "total" && (
          <div>
            {scoreboard.length === 0 ? (
              <div style={S.empty}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🏆</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Belum ada prediksi</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  Papan skor akan muncul setelah ada race yang selesai dan prediksi masuk.
                </div>
              </div>
            ) : scoreboard.map((entry, rank) => {
              const isMe = myName && entry.player === myName.toLowerCase();
              return (
                <div key={entry.player} style={{
                  ...S.podiumRow(rank),
                  animation: `fadeUp 0.3s ease ${rank * 50}ms both`,
                }}>
                  <div style={S.rankNum(rank)}>
                    {rank < 3 ? MEDAL[rank] : `#${rank + 1}`}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={S.playerName(isMe)}>
                        {entry.player}
                      </span>
                      {isMe && <span style={S.meTag}>KAMU</span>}
                    </div>
                    {/* Mini skor per race */}
                    {finishedRaces.length > 0 && (
                      <div style={S.raceBars}>
                        {finishedRaces.map(race => {
                          const sc = entry.perRace[race.round];
                          return (
                            <div
                              key={race.round}
                              style={S.raceBar(sc)}
                              title={`R${race.round}: ${sc ?? "?"} poin`}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div style={S.scoreBox(rank)}>
                    <div style={S.scoreNum(rank)}>{entry.total}</div>
                    <div style={S.scoreLbl}>POIN</div>
                  </div>
                </div>
              );
            })}

            {/* Legend */}
            {finishedRaces.length > 0 && (
              <div style={{
                marginTop: 16, padding: "10px 14px",
                background: "#0d1117", borderRadius: 10,
                border: "1px solid #1a1f2e",
                display: "flex", gap: 14, flexWrap: "wrap",
                fontSize: 11, color: "#4b5563",
              }}>
                <span>Bar warna per race:</span>
                <span style={{ color: "#22c55e" }}>● 12-15 poin</span>
                <span style={{ color: "#fbbf24" }}>● 6-11 poin</span>
                <span style={{ color: "#f97316" }}>● 1-5 poin</span>
                <span style={{ color: "#ef4444" }}>● 0 poin</span>
                <span style={{ color: "#374151" }}>● belum ada prediksi</span>
              </div>
            )}
          </div>
        )}

        {/* ── TAB PER RACE ── */}
        {tab === "perrace" && (
          <div>
            {/* Round picker */}
            <div style={S.roundPicker}>
              {schedule.map(race => (
                <button
                  key={race.round}
                  style={S.roundBtn(selRound === race.round)}
                  onClick={() => setSelRound(race.round)}
                >
                  {getCountryFlag(race.circuit?.country)} R{race.round}
                </button>
              ))}
            </div>

            {selRound && (() => {
              const race = schedule.find(r => r.round === selRound);
              const isFinished = race?.status === "finished";
              const actual = results[selRound] || [];

              const raceEntries = players
                .map(({ player, predictions }) => {
                  const val   = predictions?.[selRound];
                  const picks = val?.picks || val || [];
                  const score = isFinished ? calcScore(picks, actual) : null;
                  return { player, picks, score };
                })
                .filter(e => e.picks && e.picks.some(p => p))
                .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

              return (
                <div>
                  {/* Race info */}
                  <div style={{
                    background: "#0d1117", border: "1px solid #1a1f2e",
                    borderRadius: 12, padding: "14px 16px", marginBottom: 16,
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <span style={{ fontSize: 24 }}>{getCountryFlag(race?.circuit?.country)}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{race?.name}</div>
                      <div style={{ fontSize: 11, color: "#4b5563" }}>
                        {isFinished ? "✅ Race selesai" : "⏳ Belum race"}
                        {isFinished && actual.length > 0 && (
                          <span style={{ marginLeft: 8 }}>
                            · Top 5: {actual.map(id => {
                              const d = DRIVERS_2026.find(x => x.id === id);
                              return d?.lastName || id;
                            }).join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Prediksi tiap player */}
                  {raceEntries.length === 0 ? (
                    <div style={S.empty}>
                      <div style={{ fontSize: 13, color: "#6b7280" }}>
                        Belum ada prediksi untuk race ini.
                      </div>
                    </div>
                  ) : raceEntries.map((entry, rank) => {
                    const isMe = myName && entry.player === myName.toLowerCase();
                    return (
                      <div key={entry.player} style={{
                        ...S.perRaceRow,
                        border: `1px solid ${isMe ? "#ef444430" : "#1a1f2e"}`,
                        animation: `fadeUp 0.3s ease ${rank * 50}ms both`,
                      }}>
                        <div style={S.perRaceTop}>
                          <div style={{ fontSize: rank < 3 && isFinished ? 20 : 13, minWidth: 28 }}>
                            {isFinished && rank < 3 ? MEDAL[rank] : `#${rank + 1}`}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: isMe ? "#ef4444" : "#f9fafb" }}>
                                {entry.player}
                              </span>
                              {isMe && <span style={S.meTag}>KAMU</span>}
                            </div>
                          </div>
                          {isFinished && entry.score !== null && (
                            <div style={{
                              background: entry.score >= 12 ? "#22c55e20" : entry.score >= 6 ? "#fbbf2420" : "#ef444415",
                              border: `1px solid ${entry.score >= 12 ? "#22c55e40" : entry.score >= 6 ? "#fbbf2440" : "#ef444430"}`,
                              borderRadius: 8, padding: "5px 12px", textAlign: "center",
                            }}>
                              <div style={{
                                fontSize: 18, fontWeight: 900,
                                color: entry.score >= 12 ? "#22c55e" : entry.score >= 6 ? "#fbbf24" : "#ef4444",
                              }}>{entry.score}</div>
                              <div style={{ fontSize: 9, color: "#4b5563" }}>/ 15 PTS</div>
                            </div>
                          )}
                          {!isFinished && (
                            <span style={{ fontSize: 11, color: "#22c55e" }}>✓ Sudah ditebak</span>
                          )}
                        </div>

                        {/* Picks */}
                        <div style={S.pickRow}>
                          {["P1","P2","P3","P4","P5"].map((pos, idx) => {
                            const driverId = entry.picks[idx];
                            const driver = DRIVERS_2026.find(d => d.id === driverId);
                            const isCorrect = isFinished && actual[idx] === driverId;
                            const isOnTop5  = isFinished && driverId && actual.includes(driverId);
                            return (
                              <div key={idx} style={S.pickChip(isCorrect, isOnTop5, isFinished)}>
                                <span style={{ fontSize: 9, opacity: 0.7 }}>{pos} </span>
                                {driver ? `${driver.lastName}` : "—"}
                                {isFinished && (isCorrect ? " ✓" : isOnTop5 ? " ≈" : "")}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

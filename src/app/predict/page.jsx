"use client";
// src/app/predict/page.jsx

import { useState, useEffect } from "react";
import { getTeamColor, getFlag, getCountryFlag } from "@/lib/teamColors";
import { DRIVERS_2026 } from "@/lib/drivers2026";

const POSITIONS = ["P1 🥇", "P2 🥈", "P3 🥉"];

function calcScore(prediction, actual) {
  if (!prediction || !actual || prediction.length < 3 || actual.length < 3) return null;
  let score = 0;
  prediction.forEach((driverId, idx) => {
    if (!driverId) return;
    if (actual[idx] === driverId) score += 3;
    else if (actual.includes(driverId)) score += 1;
  });
  return score;
}

// ── Name Input Modal ──────────────────────────────────────────
function NameModal({ onConfirm }) {
  const [name, setName] = useState("");

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: 20,
    }}>
      <div style={{
        background: "#0d1117", border: "1px solid #ef444444",
        borderRadius: 20, padding: "32px 28px", width: "100%", maxWidth: 380,
        animation: "fadeUp 0.3s ease",
      }}>
        <div style={{ fontSize: 36, textAlign: "center", marginBottom: 16 }}>🏎️</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, textAlign: "center", marginBottom: 6 }}>
          Siapa namamu?
        </h2>
        <p style={{ fontSize: 13, color: "#6b7280", textAlign: "center", marginBottom: 24 }}>
          Nama ini akan muncul di papan skor prediksi
        </p>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && name.trim() && onConfirm(name.trim())}
          placeholder="Contoh: Max, Leclerc..."
          autoFocus
          maxLength={20}
          style={{
            width: "100%", background: "#1a1f2e",
            border: "1px solid #1f2937", borderRadius: 10,
            padding: "12px 16px", color: "#e2e8f0",
            fontSize: 16, marginBottom: 14,
            outline: "none", boxSizing: "border-box",
          }}
        />
        <button
          onClick={() => name.trim() && onConfirm(name.trim())}
          disabled={!name.trim()}
          style={{
            width: "100%", padding: "12px",
            background: name.trim() ? "#ef4444" : "#1f2937",
            border: "none", borderRadius: 10,
            color: name.trim() ? "#fff" : "#4b5563",
            fontSize: 15, fontWeight: 700,
            cursor: name.trim() ? "pointer" : "not-allowed",
            fontFamily: "inherit", transition: "all 0.15s",
          }}
        >
          Mulai Prediksi →
        </button>
      </div>
    </div>
  );
}

// ── Leaderboard ───────────────────────────────────────────────
function Leaderboard({ allPredictions, results, currentUser }) {
  // Hitung total skor tiap user
  const userScores = {};
  allPredictions.forEach(({ user, round, prediction }) => {
    const actual = results[round];
    const score  = calcScore(prediction, actual);
    if (score !== null) {
      userScores[user] = (userScores[user] || 0) + score;
    }
  });

  const sorted = Object.entries(userScores)
    .sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) return null;

  const medal = ["🥇", "🥈", "🥉"];

  return (
    <div style={{
      background: "#0d1117", border: "1px solid #1f2937",
      borderRadius: 14, padding: "18px 20px", marginBottom: 20,
    }}>
      <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: 2, marginBottom: 14, fontFamily: "monospace" }}>
        🏆 PAPAN SKOR
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {sorted.map(([user, score], i) => {
          const isMe = user === currentUser;
          return (
            <div key={user} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 14px", borderRadius: 10,
              background: isMe ? "#ef444415" : i === 0 ? "#fbbf2408" : "transparent",
              border: `1px solid ${isMe ? "#ef444433" : i === 0 ? "#fbbf2422" : "#1f2937"}`,
            }}>
              <span style={{ fontSize: 18, minWidth: 24 }}>{medal[i] || `${i+1}.`}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: isMe ? 700 : 500 }}>
                {user} {isMe && <span style={{ fontSize: 11, color: "#ef4444" }}>(kamu)</span>}
              </span>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: i === 0 ? "#fbbf24" : isMe ? "#ef4444" : "#e2e8f0", lineHeight: 1 }}>
                  {score}
                </div>
                <div style={{ fontSize: 10, color: "#4b5563" }}>poin</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function PredictPage() {
  const [userName, setUserName]       = useState(null);
  const [showModal, setShowModal]     = useState(false);
  const [schedule, setSchedule]       = useState([]);
  const [results, setResults]         = useState({});
  const [myPreds, setMyPreds]         = useState({});   // round → [p1,p2,p3]
  const [allPreds, setAllPreds]       = useState([]);   // semua user semua round
  const [activeRound, setActive]      = useState(null);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);

  // Load nama dari localStorage
  useEffect(() => {
    const name = localStorage.getItem("f1-username");
    if (name) setUserName(name);
    else setShowModal(true);
  }, []);

  // Load schedule
  useEffect(() => {
    fetch("/api/schedule")
      .then(r => r.json())
      .then(json => { if (json.success) setSchedule(json.data); })
      .finally(() => setLoading(false));
  }, []);

  // Load prediksi user ini dari Redis
  useEffect(() => {
    if (!userName) return;
    schedule.forEach(race => {
      fetch(`/api/predict?round=${race.round}&user=${encodeURIComponent(userName)}`)
        .then(r => r.json())
        .then(json => {
          if (json.success && json.data?.prediction) {
            setMyPreds(prev => ({ ...prev, [race.round]: json.data.prediction }));
          }
        });
    });
  }, [userName, schedule]);

  // Load semua prediksi (untuk leaderboard)
  useEffect(() => {
    const finished = schedule.filter(r => r.status === "finished");
    finished.forEach(race => {
      // Ambil actual results
      if (!results[race.round]) {
        fetch(`/api/race?round=${race.round}&session=race`)
          .then(r => r.json())
          .then(json => {
            if (json.success && json.data?.results) {
              const podium = json.data.results.slice(0, 3).map(r => r.driver?.id);
              setResults(prev => ({ ...prev, [race.round]: podium }));
            }
          });
      }
      // Ambil semua prediksi round ini
      fetch(`/api/predict?round=${race.round}`)
        .then(r => r.json())
        .then(json => {
          if (json.success && json.data?.length > 0) {
            setAllPreds(prev => {
              const filtered = prev.filter(p => p.round !== race.round);
              return [...filtered, ...json.data.map(p => ({ ...p, round: race.round }))];
            });
          }
        });
    });
  }, [schedule]);

  function handleConfirmName(name) {
    setUserName(name);
    localStorage.setItem("f1-username", name);
    setShowModal(false);
  }

  function setPrediction(round, posIdx, driverId) {
    setMyPreds(prev => {
      const cur = [...(prev[round] || [null, null, null])];
      // Cegah duplicate
      const existing = cur.indexOf(driverId);
      if (existing !== -1 && existing !== posIdx) cur[existing] = null;
      cur[posIdx] = driverId || null;
      return { ...prev, [round]: cur };
    });
  }

  async function savePrediction(round) {
    if (!userName) return;
    const prediction = myPreds[round] || [null, null, null];
    setSaving(true);
    try {
      await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: userName, round, prediction }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  const nextRace   = schedule.find(r => r.status === "upcoming");
  const races      = schedule.filter(r => r.status === "upcoming" || r.status === "finished");
  const totalScore = Object.entries(myPreds).reduce((sum, [round, pred]) => {
    const actual = results[parseInt(round)];
    return sum + (calcScore(pred, actual) || 0);
  }, 0);

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        select:focus { outline: none; }
      `}</style>

      {showModal && <NameModal onConfirm={handleConfirmName} />}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, color: "#ef4444", letterSpacing: 3, marginBottom: 8, fontFamily: "monospace" }}>
          🎯 PREDIKSI
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1, marginBottom: 4 }}>
              Tebak Podium
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {userName && (
                <span style={{ fontSize: 13, color: "#6b7280" }}>
                  Main sebagai <strong style={{ color: "#ef4444" }}>{userName}</strong>
                </span>
              )}
              <button
                onClick={() => setShowModal(true)}
                style={{
                  fontSize: 11, color: "#4b5563", background: "transparent",
                  border: "1px solid #1f2937", borderRadius: 6,
                  padding: "3px 10px", cursor: "pointer", fontFamily: "inherit",
                }}
              >Ganti nama</button>
            </div>
          </div>
          {totalScore > 0 && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#fbbf24", lineHeight: 1 }}>{totalScore}</div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>TOTAL POINMU</div>
            </div>
          )}
        </div>
      </div>

      {/* Scoring guide */}
      <div style={{
        background: "#0d1117", border: "1px solid #1f2937",
        borderRadius: 12, padding: "10px 16px", marginBottom: 20,
        display: "flex", gap: 20, flexWrap: "wrap", fontSize: 12, color: "#6b7280",
      }}>
        <span>🎯 Posisi tepat = <strong style={{ color: "#22c55e" }}>3 poin</strong></span>
        <span>✅ Ada di podium = <strong style={{ color: "#fbbf24" }}>1 poin</strong></span>
        <span>❌ Meleset = <strong style={{ color: "#ef4444" }}>0 poin</strong></span>
      </div>

      {/* Leaderboard */}
      <Leaderboard
        allPredictions={allPreds}
        results={results}
        currentUser={userName}
      />

      {/* Race list */}
      {loading ? (
        <div style={{ display: "grid", gap: 10 }}>
          {[...Array(3)].map((_,i) => (
            <div key={i} style={{ height: 72, background: "#0d1117", borderRadius: 12, animation: "pulse 1.5s ease infinite" }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {races.map((race, i) => {
            const isFinished = race.status === "finished";
            const pred       = myPreds[race.round] || [null, null, null];
            const actual     = results[race.round];
            const score      = isFinished ? calcScore(pred, actual) : null;
            const isOpen     = activeRound === race.round;
            const hasPred    = pred.some(p => p);

            // Prediksi orang lain untuk race ini
            const otherPreds = allPreds.filter(p => p.round === race.round && p.user !== userName);

            return (
              <div key={race.round} style={{ animation: `fadeUp 0.3s ease ${i*40}ms both` }}>
                {/* Row header */}
                <div
                  onClick={() => setActive(isOpen ? null : race.round)}
                  style={{
                    background: isOpen ? "#0f1420" : "#0d1117",
                    border: `1px solid ${isOpen ? "#1f2937" : "#1a1f2e"}`,
                    borderRadius: isOpen ? "12px 12px 0 0" : 12,
                    padding: "14px 16px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 12,
                    transition: "background 0.15s", userSelect: "none",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{getCountryFlag(race.circuit.country)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>
                      R{race.round} · {race.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#4b5563" }}>
                      {new Date(race.date).toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" })}
                    </div>
                  </div>

                  {/* Status badges */}
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {isFinished && score !== null && (
                      <div style={{
                        background: score >= 6 ? "#22c55e20" : score >= 3 ? "#fbbf2420" : "#ef444420",
                        border: `1px solid ${score >= 6 ? "#22c55e44" : score >= 3 ? "#fbbf2444" : "#ef444444"}`,
                        borderRadius: 8, padding: "4px 12px", textAlign: "center",
                      }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: score >= 6 ? "#22c55e" : score >= 3 ? "#fbbf24" : "#ef4444", lineHeight: 1 }}>{score}</div>
                        <div style={{ fontSize: 9, color: "#6b7280" }}>poin</div>
                      </div>
                    )}
                    {!isFinished && hasPred && <span style={{ fontSize: 11, color: "#22c55e" }}>✓ Tersimpan</span>}
                    {!isFinished && !hasPred && <span style={{ fontSize: 11, color: "#fbbf24" }}>Belum ditebak</span>}
                  </div>

                  <span style={{
                    fontSize: 10, color: "#374151", flexShrink: 0,
                    display: "inline-block", transition: "transform 0.2s",
                    transform: isOpen ? "rotate(180deg)" : "none",
                  }}>▼</span>
                </div>

                {/* Expanded */}
                {isOpen && (
                  <div style={{
                    background: "#090a0f",
                    border: "1px solid #1f2937", borderTop: "none",
                    borderRadius: "0 0 12px 12px", padding: "18px",
                  }}>

                    {/* Prediksi kamu */}
                    <div style={{ fontSize: 11, color: "#6b7280", letterSpacing: 1, marginBottom: 12, fontFamily: "monospace" }}>
                      PREDIKSIMU
                    </div>
                    <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
                      {POSITIONS.map((posLabel, posIdx) => {
                        const selectedId    = pred[posIdx];
                        const selectedDrv   = DRIVERS_2026.find(d => d.id === selectedId);
                        const actualId      = actual?.[posIdx];
                        const actualDrv     = DRIVERS_2026.find(d => d.id === actualId);
                        const isCorrect     = isFinished && selectedId === actualId;
                        const isOnPodium    = isFinished && selectedId && actual?.includes(selectedId);
                        const color         = selectedDrv ? getTeamColor(selectedDrv.team) : "#6b7280";

                        return (
                          <div key={posIdx} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 18, flexShrink: 0 }}>{posLabel.split(" ")[1]}</span>

                            <div style={{ flex: 1, position: "relative" }}>
                              <select
                                value={selectedId || ""}
                                onChange={e => setPrediction(race.round, posIdx, e.target.value)}
                                disabled={isFinished}
                                style={{
                                  width: "100%", background: "#0d1117",
                                  border: `1px solid ${isCorrect ? "#22c55e55" : isOnPodium ? "#fbbf2455" : isFinished && selectedId ? "#ef444455" : "#1f2937"}`,
                                  borderRadius: 8, padding: "9px 12px",
                                  color: selectedDrv ? color : "#4b5563",
                                  fontSize: 13, cursor: isFinished ? "default" : "pointer",
                                  fontFamily: "inherit", fontWeight: selectedDrv ? 700 : 400,
                                  appearance: "none",
                                }}
                              >
                                <option value="">— Pilih driver —</option>
                                {DRIVERS_2026.map(d => (
                                  <option key={d.id} value={d.id}>
                                    #{d.num} {d.lastName} · {d.teamName}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Result */}
                            {isFinished && (
                              <div style={{ minWidth: 90, textAlign: "right", flexShrink: 0 }}>
                                {isCorrect
                                  ? <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 700 }}>🎯 Tepat! +3</span>
                                  : isOnPodium
                                    ? <span style={{ fontSize: 12, color: "#fbbf24", fontWeight: 700 }}>✅ Podium +1</span>
                                    : selectedId
                                      ? <span style={{ fontSize: 12, color: "#ef4444" }}>❌ Miss +0</span>
                                      : null
                                }
                                {actualDrv && (
                                  <div style={{ fontSize: 10, color: "#4b5563", marginTop: 2 }}>
                                    Aktual: {actualDrv.lastName}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Tombol simpan */}
                    {!isFinished && (
                      <button
                        onClick={() => savePrediction(race.round)}
                        disabled={saving || !hasPred}
                        style={{
                          width: "100%", padding: "10px",
                          background: saved ? "#22c55e" : hasPred ? "#ef4444" : "#1f2937",
                          border: "none", borderRadius: 10,
                          color: hasPred ? "#fff" : "#4b5563",
                          fontSize: 13, fontWeight: 700,
                          cursor: hasPred ? "pointer" : "not-allowed",
                          fontFamily: "inherit", transition: "all 0.2s",
                          marginBottom: 16,
                        }}
                      >
                        {saving ? "Menyimpan..." : saved ? "✓ Tersimpan!" : "Simpan Prediksi"}
                      </button>
                    )}

                    {/* Prediksi orang lain */}
                    {isFinished && otherPreds.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, color: "#6b7280", letterSpacing: 1, marginBottom: 10, fontFamily: "monospace", borderTop: "1px solid #1a1f2e", paddingTop: 14 }}>
                          PREDIKSI PEMAIN LAIN
                        </div>
                        <div style={{ display: "grid", gap: 8 }}>
                          {otherPreds.map(({ user, prediction: p }) => {
                            const s = calcScore(p, actual);
                            return (
                              <div key={user} style={{
                                background: "#0d1117", border: "1px solid #1f2937",
                                borderRadius: 10, padding: "10px 14px",
                                display: "flex", alignItems: "center", gap: 12,
                              }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{user}</div>
                                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                    {p.map((dId, idx) => {
                                      const drv = DRIVERS_2026.find(d => d.id === dId);
                                      const cor = actual?.[idx] === dId;
                                      const pod = actual?.includes(dId);
                                      return (
                                        <span key={idx} style={{
                                          fontSize: 11, padding: "2px 8px", borderRadius: 5,
                                          background: cor ? "#22c55e20" : pod ? "#fbbf2420" : "#1f2937",
                                          color: cor ? "#22c55e" : pod ? "#fbbf24" : "#6b7280",
                                          border: `1px solid ${cor ? "#22c55e44" : pod ? "#fbbf2444" : "transparent"}`,
                                        }}>
                                          {["P1","P2","P3"][idx]} {drv?.lastName || "?"}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                                <div style={{ textAlign: "center", flexShrink: 0 }}>
                                  <div style={{ fontSize: 20, fontWeight: 900, color: s >= 6 ? "#22c55e" : s >= 3 ? "#fbbf24" : "#6b7280" }}>{s}</div>
                                  <div style={{ fontSize: 9, color: "#4b5563" }}>poin</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Skor race ini */}
                    {isFinished && score !== null && (
                      <div style={{
                        marginTop: 14, background: "#1a1f2e", borderRadius: 10,
                        padding: "10px 14px", fontSize: 13, color: "#9ca3af",
                      }}>
                        Skormu race ini: <strong style={{ color: score >= 6 ? "#22c55e" : score >= 3 ? "#fbbf24" : "#ef4444" }}>{score}/9 poin</strong>
                        {score === 9 && " 🎉 Sempurna!"}
                        {score >= 6 && score < 9 && " 🔥 Keren!"}
                        {score >= 3 && score < 6 && " 👍 Lumayan!"}
                        {score < 3 && " 😅 Nasib!"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {races.length === 0 && !loading && (
            <div style={{
              textAlign: "center", padding: "60px 20px",
              background: "#0d1117", borderRadius: 14, border: "1px solid #1f2937",
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Siapkan prediksimu!</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>
                Australian GP · 8 Maret 2026
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
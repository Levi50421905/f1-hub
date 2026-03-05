"use client";
// src/app/predict/page.jsx
// Tebak podium sebelum race — simpan di localStorage, cek setelah race

import { useState, useEffect } from "react";
import { getTeamColor, getFlag, getCountryFlag } from "@/lib/teamColors";
import { DRIVERS_2026 } from "@/lib/drivers2026";

const POSITIONS = ["P1 🥇", "P2 🥈", "P3 🥉"];

function calcScore(prediction, actual) {
  if (!prediction || !actual) return null;
  let score = 0;
  // Exact position = 3 poin, ada di podium tapi salah posisi = 1 poin
  prediction.forEach((driverId, idx) => {
    if (actual[idx] === driverId) score += 3;
    else if (actual.includes(driverId)) score += 1;
  });
  return score;
}

export default function PredictPage() {
  const [schedule, setSchedule]   = useState([]);
  const [results, setResults]     = useState({});   // round → actual podium [p1id, p2id, p3id]
  const [predictions, setPreds]   = useState({});   // round → predicted [p1id, p2id, p3id]
  const [activeRound, setActive]  = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saved, setSaved]         = useState(false);

  useEffect(() => {
    fetch("/api/schedule")
      .then(r => r.json())
      .then(json => { if (json.success) setSchedule(json.data); })
      .finally(() => setLoading(false));

    // Load saved predictions
    const saved = JSON.parse(localStorage.getItem("f1-predictions") || "{}");
    setPreds(saved);
  }, []);

  // Fetch actual results for finished races
  useEffect(() => {
    const finished = schedule.filter(r => r.status === "finished");
    finished.forEach(race => {
      if (results[race.round]) return;
      fetch(`/api/race?round=${race.round}&session=race`)
        .then(r => r.json())
        .then(json => {
          if (json.success && json.data?.results) {
            const podium = json.data.results.slice(0, 3).map(r => r.driver?.id);
            setResults(prev => ({ ...prev, [race.round]: podium }));
          }
        });
    });
  }, [schedule]);

  function setPrediction(round, pos, driverId) {
    setPreds(prev => {
      const roundPreds = [...(prev[round] || [null, null, null])];
      // Cegah duplicate
      const existingIdx = roundPreds.indexOf(driverId);
      if (existingIdx !== -1 && existingIdx !== pos) roundPreds[existingIdx] = null;
      roundPreds[pos] = driverId;
      const next = { ...prev, [round]: roundPreds };
      localStorage.setItem("f1-predictions", JSON.stringify(next));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return next;
    });
  }

  const nextRace   = schedule.find(r => r.status === "upcoming");
  const totalScore = Object.entries(predictions).reduce((sum, [round, pred]) => {
    const actual = results[parseInt(round)];
    const score  = calcScore(pred, actual);
    return sum + (score || 0);
  }, 0);

  const races = schedule.filter(r =>
    r.status === "upcoming" || (r.status === "finished" && predictions[r.round])
  );

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        select { appearance: none; -webkit-appearance: none; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, color: "#ef4444", letterSpacing: 3, marginBottom: 8, fontFamily: "monospace" }}>
          🎯 PREDIKSI
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1, marginBottom: 4 }}>
              Tebak Podium
            </h1>
            <p style={{ fontSize: 12, color: "#6b7280" }}>
              Tebak P1/P2/P3 sebelum race — cek akurasi kamu setelah selesai
            </p>
          </div>
          {totalScore > 0 && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#fbbf24", lineHeight: 1 }}>{totalScore}</div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>TOTAL POIN</div>
            </div>
          )}
        </div>
      </div>

      {/* Scoring guide */}
      <div style={{
        background: "#0d1117", border: "1px solid #1f2937",
        borderRadius: 12, padding: "12px 16px", marginBottom: 20,
        display: "flex", gap: 20, flexWrap: "wrap", fontSize: 12, color: "#6b7280",
      }}>
        <span>🎯 Posisi tepat = <strong style={{ color: "#22c55e" }}>3 poin</strong></span>
        <span>✅ Ada di podium tapi salah posisi = <strong style={{ color: "#fbbf24" }}>1 poin</strong></span>
        <span>❌ Tidak ada di podium = <strong style={{ color: "#ef4444" }}>0 poin</strong></span>
      </div>

      {loading ? (
        <div style={{ display: "grid", gap: 10 }}>
          {[...Array(3)].map((_,i) => (
            <div key={i} style={{ height: 80, background: "#0d1117", borderRadius: 12, animation: "pulse 1.5s ease infinite" }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {races.map((race, i) => {
            const isFinished = race.status === "finished";
            const pred       = predictions[race.round] || [null, null, null];
            const actual     = results[race.round];
            const score      = isFinished ? calcScore(pred, actual) : null;
            const isOpen     = activeRound === race.round;

            return (
              <div key={race.round} style={{ animation: `fadeUp 0.3s ease ${i*40}ms both` }}>
                {/* Race header */}
                <div
                  onClick={() => setActive(isOpen ? null : race.round)}
                  style={{
                    background: isOpen ? "#0f1420" : "#0d1117",
                    border: `1px solid ${isOpen ? "#1f2937" : "#1a1f2e"}`,
                    borderRadius: isOpen ? "12px 12px 0 0" : 12,
                    padding: "14px 16px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 12,
                    transition: "background 0.15s",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{getCountryFlag(race.circuit.country)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>
                      R{race.round} · {race.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#4b5563" }}>
                      {new Date(race.date).toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" })}
                    </div>
                  </div>

                  {/* Status */}
                  {isFinished && score !== null && (
                    <div style={{
                      background: score >= 6 ? "#22c55e20" : score >= 3 ? "#fbbf2420" : "#ef444420",
                      border: `1px solid ${score >= 6 ? "#22c55e44" : score >= 3 ? "#fbbf2444" : "#ef444444"}`,
                      borderRadius: 8, padding: "4px 12px", textAlign: "center",
                    }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: score >= 6 ? "#22c55e" : score >= 3 ? "#fbbf24" : "#ef4444" }}>{score}</div>
                      <div style={{ fontSize: 9, color: "#6b7280" }}>POIN</div>
                    </div>
                  )}
                  {!isFinished && pred.some(p => p) && (
                    <span style={{ fontSize: 11, color: "#22c55e" }}>✓ Sudah ditebak</span>
                  )}
                  {!isFinished && !pred.some(p => p) && (
                    <span style={{ fontSize: 11, color: "#fbbf24" }}>Belum ditebak</span>
                  )}

                  <span style={{
                    fontSize: 10, color: "#374151",
                    display: "inline-block", transition: "transform 0.2s",
                    transform: isOpen ? "rotate(180deg)" : "none",
                  }}>▼</span>
                </div>

                {/* Prediction form */}
                {isOpen && (
                  <div style={{
                    background: "#090a0f",
                    border: "1px solid #1f2937", borderTop: "none",
                    borderRadius: "0 0 12px 12px",
                    padding: "16px 18px",
                  }}>
                    <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                      {POSITIONS.map((posLabel, posIdx) => {
                        const selectedId = pred[posIdx];
                        const selectedDriver = DRIVERS_2026.find(d => d.id === selectedId);
                        const actualId = actual?.[posIdx];
                        const actualDriver = DRIVERS_2026.find(d => d.id === actualId);
                        const isCorrect = isFinished && selectedId === actualId;
                        const isOnPodium = isFinished && selectedId && actual?.includes(selectedId);

                        return (
                          <div key={posIdx} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, minWidth: 30 }}>{posLabel.split(" ")[1]}</div>

                            {/* Dropdown pilih driver */}
                            <div style={{ flex: 1, position: "relative" }}>
                              <select
                                value={selectedId || ""}
                                onChange={e => setPrediction(race.round, posIdx, e.target.value || null)}
                                disabled={isFinished}
                                style={{
                                  width: "100%", background: "#0d1117",
                                  border: `1px solid ${isCorrect ? "#22c55e55" : isOnPodium ? "#fbbf2455" : isFinished && selectedId ? "#ef444455" : "#1f2937"}`,
                                  borderRadius: 8, padding: "8px 12px",
                                  color: selectedDriver ? getTeamColor(selectedDriver.team) : "#6b7280",
                                  fontSize: 13, cursor: isFinished ? "default" : "pointer",
                                  fontFamily: "inherit", fontWeight: selectedDriver ? 700 : 400,
                                }}
                              >
                                <option value="">— Pilih driver —</option>
                                {DRIVERS_2026.map(d => (
                                  <option key={d.id} value={d.id}>
                                    {d.num} {d.lastName} ({d.teamName})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Result indicator */}
                            {isFinished && (
                              <div style={{ minWidth: 100, textAlign: "right" }}>
                                {isCorrect ? (
                                  <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 700 }}>✓ Tepat! +3</span>
                                ) : isOnPodium ? (
                                  <span style={{ fontSize: 12, color: "#fbbf24", fontWeight: 700 }}>~ Podium +1</span>
                                ) : selectedId ? (
                                  <span style={{ fontSize: 12, color: "#ef4444" }}>✗ Miss +0</span>
                                ) : null}
                                {actualDriver && (
                                  <div style={{ fontSize: 10, color: "#4b5563" }}>
                                    Aktual: {actualDriver.lastName}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {saved && !isFinished && (
                      <div style={{ fontSize: 12, color: "#22c55e" }}>✓ Prediksi tersimpan</div>
                    )}
                    {isFinished && score !== null && (
                      <div style={{
                        background: "#1a1f2e", borderRadius: 10, padding: "10px 14px",
                        fontSize: 13, color: "#9ca3af",
                      }}>
                        Skor race ini: <strong style={{ color: score >= 6 ? "#22c55e" : score >= 3 ? "#fbbf24" : "#ef4444" }}>{score}/9 poin</strong>
                        {score === 9 && " 🎉 Sempurna!"}
                        {score >= 6 && score < 9 && " 🔥 Bagus!"}
                        {score >= 3 && score < 6 && " 👍 Lumayan!"}
                        {score < 3 && " 😅 Coba lagi!"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {races.length === 0 && (
            <div style={{
              textAlign: "center", padding: "60px 20px",
              background: "#0d1117", borderRadius: 14,
              border: "1px solid #1f2937",
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Siapkan prediksimu!</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>
                Race pertama belum tersedia untuk ditebak.<br />
                Australian GP · 8 Maret 2026
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

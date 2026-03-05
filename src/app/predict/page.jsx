"use client";
// src/app/predict/page.jsx — top 5, tap cards, mobile optimized

import { useState, useEffect } from "react";
import { getTeamColor, getFlag, getCountryFlag } from "@/lib/teamColors";
import { DRIVERS_2026 } from "@/lib/drivers2026";

const POS_LABELS = ["P1 🥇", "P2 🥈", "P3 🥉", "P4", "P5"];
const POS_COLORS = ["#fbbf24", "#9ca3af", "#b45309", "#6b7280", "#4b5563"];

function calcScore(prediction, actual) {
  if (!prediction || !actual) return null;
  let score = 0;
  prediction.forEach((id, idx) => {
    if (!id) return;
    if (actual[idx] === id) score += 3;
    else if (actual.includes(id)) score += 1;
  });
  return score;
}

// ── Name Modal ────────────────────────────────────────────────
function NameModal({ onConfirm }) {
  const [name, setName] = useState("");
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: 20,
    }}>
      <div style={{
        background: "#0d1117", border: "1px solid #ef444444",
        borderRadius: 20, padding: "28px 22px",
        width: "100%", maxWidth: 360,
      }}>
        <div style={{ fontSize: 36, textAlign: "center", marginBottom: 14 }}>🏎️</div>
        <h2 style={{ fontSize: 20, fontWeight: 900, textAlign: "center", marginBottom: 6 }}>Siapa namamu?</h2>
        <p style={{ fontSize: 12, color: "#6b7280", textAlign: "center", marginBottom: 20 }}>
          Nama ini muncul di papan skor
        </p>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && name.trim() && onConfirm(name.trim())}
          placeholder="Contoh: Aldi, Bang Reza..."
          autoFocus maxLength={20}
          style={{
            width: "100%", background: "#1a1f2e",
            border: "1px solid #1f2937", borderRadius: 10,
            padding: "12px 14px", color: "#e2e8f0",
            fontSize: 16, marginBottom: 12,
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
            fontFamily: "inherit",
          }}
        >Mulai →</button>
      </div>
    </div>
  );
}

// ── Driver picker modal ────────────────────────────────────────
function DriverPicker({ posIdx, selected, onPick, onClose, disabled }) {
  const [q, setQ] = useState("");
  const filtered  = DRIVERS_2026.filter(d =>
    !q || d.lastName.toLowerCase().includes(q.toLowerCase()) || d.teamName.toLowerCase().includes(q.toLowerCase())
  );

  if (disabled) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)",
      zIndex: 9998, display: "flex", flexDirection: "column",
      padding: "0",
    }} onClick={onClose}>
      <div style={{
        marginTop: "auto",
        background: "#0d1117", borderRadius: "20px 20px 0 0",
        border: "1px solid #1f2937", borderBottom: "none",
        maxHeight: "80vh", display: "flex", flexDirection: "column",
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "16px 16px 10px", borderBottom: "1px solid #1a1f2e" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Pilih {POS_LABELS[posIdx]}</span>
            <button onClick={onClose} style={{ background: "#1f2937", border: "none", borderRadius: 20, width: 28, height: 28, color: "#9ca3af", cursor: "pointer", fontSize: 16, fontFamily: "inherit" }}>×</button>
          </div>
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Cari driver..."
            autoFocus
            style={{
              width: "100%", background: "#1a1f2e",
              border: "1px solid #1f2937", borderRadius: 8,
              padding: "9px 12px", color: "#e2e8f0",
              fontSize: 13, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
        {/* Driver list */}
        <div style={{ overflowY: "auto", padding: "8px 12px 20px" }}>
          {/* Kosongkan pilihan */}
          <div
            onClick={() => onPick(null)}
            style={{
              padding: "10px 12px", borderRadius: 8, marginBottom: 4,
              background: "#1a1f2e", cursor: "pointer",
              fontSize: 13, color: "#6b7280",
            }}
          >— Kosongkan pilihan ini</div>
          {filtered.map(d => {
            const color   = getTeamColor(d.team);
            const isSelP  = selected.includes(d.id);
            return (
              <div
                key={d.id}
                onClick={() => onPick(d.id)}
                style={{
                  padding: "10px 12px", borderRadius: 8, marginBottom: 4,
                  background: isSelP ? color + "22" : "#0f1117",
                  border: `1px solid ${isSelP ? color + "55" : "transparent"}`,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 6, flexShrink: 0,
                  background: color + "22", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 12, fontWeight: 900, color,
                }}>{d.num}</div>
                <span style={{ fontSize: 16 }}>{getFlag(d.nationality)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{d.lastName}</div>
                  <div style={{ fontSize: 11, color }}>{d.teamName}</div>
                </div>
                {isSelP && <span style={{ fontSize: 12, color: "#22c55e" }}>✓</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Leaderboard ───────────────────────────────────────────────
function Leaderboard({ allPredictions, results, currentUser }) {
  const scores = {};
  allPredictions.forEach(({ user, round, prediction }) => {
    const s = calcScore(prediction, results[round]);
    if (s !== null) scores[user] = (scores[user] || 0) + s;
  });
  const sorted = Object.entries(scores).sort((a,b) => b[1] - a[1]);
  if (sorted.length === 0) return null;

  return (
    <div style={{
      background: "#0d1117", border: "1px solid #1f2937",
      borderRadius: 14, padding: "16px", marginBottom: 16,
    }}>
      <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: 2, marginBottom: 12, fontFamily: "monospace" }}>🏆 PAPAN SKOR</div>
      {sorted.map(([user, score], i) => {
        const isMe = user === currentUser;
        const medal = ["🥇","🥈","🥉"][i] || `${i+1}.`;
        return (
          <div key={user} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px", borderRadius: 8, marginBottom: 4,
            background: isMe ? "#ef444415" : "transparent",
            border: `1px solid ${isMe ? "#ef444430" : "transparent"}`,
          }}>
            <span style={{ fontSize: 16, minWidth: 22 }}>{medal}</span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: isMe ? 700 : 500 }}>
              {user} {isMe && <span style={{ fontSize: 10, color: "#ef4444" }}>(kamu)</span>}
            </span>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: i === 0 ? "#fbbf24" : isMe ? "#ef4444" : "#9ca3af" }}>{score}</span>
              <span style={{ fontSize: 10, color: "#4b5563" }}> pts</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function PredictPage() {
  const [userName, setUserName]   = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [picker,   setPicker]     = useState(null); // posIdx yang sedang dibuka
  const [schedule, setSchedule]   = useState([]);
  const [results,  setResults]    = useState({});
  const [myPreds,  setMyPreds]    = useState({});
  const [allPreds, setAllPreds]   = useState([]);
  const [active,   setActive]     = useState(null);
  const [loading,  setLoading]    = useState(true);
  const [saving,   setSaving]     = useState(false);
  const [saved,    setSaved]      = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("f1-username");
    if (name) setUserName(name);
    else setShowModal(true);
  }, []);

  useEffect(() => {
    fetch("/api/schedule").then(r=>r.json())
      .then(j => { if (j.success) setSchedule(j.data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!userName) return;
    schedule.forEach(race => {
      fetch(`/api/predict?round=${race.round}&user=${encodeURIComponent(userName)}`)
        .then(r=>r.json()).then(j => {
          if (j.success && j.data?.prediction)
            setMyPreds(p => ({ ...p, [race.round]: j.data.prediction }));
        });
    });
  }, [userName, schedule]);

  useEffect(() => {
    schedule.filter(r=>r.status==="finished").forEach(race => {
      if (!results[race.round]) {
        fetch(`/api/race?round=${race.round}&session=race`).then(r=>r.json()).then(j => {
          if (j.success && j.data?.results) {
            const top5 = j.data.results.slice(0,5).map(r=>r.driver?.id);
            setResults(p => ({ ...p, [race.round]: top5 }));
          }
        });
      }
      fetch(`/api/predict?round=${race.round}`).then(r=>r.json()).then(j => {
        if (j.success && j.data?.length > 0)
          setAllPreds(p => [...p.filter(x=>x.round!==race.round), ...j.data.map(x=>({...x, round:race.round}))]);
      });
    });
  }, [schedule]);

  function handleConfirmName(name) {
    setUserName(name);
    localStorage.setItem("f1-username", name);
    setShowModal(false);
  }

  function pickDriver(round, posIdx, driverId) {
    setMyPreds(prev => {
      const cur = [...(prev[round] || [null,null,null,null,null])];
      const ex  = cur.indexOf(driverId);
      if (driverId && ex !== -1 && ex !== posIdx) cur[ex] = null;
      cur[posIdx] = driverId || null;
      return { ...prev, [round]: cur };
    });
    setPicker(null);
  }

  async function savePrediction(round) {
    if (!userName) return;
    setSaving(true);
    try {
      await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: userName, round, prediction: myPreds[round] || [null,null,null,null,null] }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  }

  const races      = schedule.filter(r => r.status === "upcoming" || r.status === "finished");
  const totalScore = Object.entries(myPreds).reduce((sum, [round, pred]) => {
    return sum + (calcScore(pred, results[parseInt(round)]) || 0);
  }, 0);

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        .pick-btn:active { opacity: 0.7; }
      `}</style>

      {showModal && <NameModal onConfirm={handleConfirmName} />}
      {picker !== null && active !== null && (
        <DriverPicker
          posIdx={picker}
          selected={(myPreds[active] || []).filter(Boolean)}
          onPick={id => pickDriver(active, picker, id)}
          onClose={() => setPicker(null)}
          disabled={schedule.find(r=>r.round===active)?.status === "finished"}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "#ef4444", letterSpacing: 3, marginBottom: 6, fontFamily: "monospace" }}>🎯 PREDIKSI</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.5, marginBottom: 4 }}>Tebak Top 5</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {userName && <span style={{ fontSize: 12, color: "#6b7280" }}>
                Sebagai <strong style={{ color: "#ef4444" }}>{userName}</strong>
              </span>}
              <button onClick={() => setShowModal(true)} style={{
                fontSize: 10, color: "#4b5563", background: "transparent",
                border: "1px solid #1f2937", borderRadius: 6,
                padding: "2px 8px", cursor: "pointer", fontFamily: "inherit",
              }}>Ganti nama</button>
            </div>
          </div>
          {totalScore > 0 && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#fbbf24", lineHeight: 1 }}>{totalScore}</div>
              <div style={{ fontSize: 9, color: "#6b7280" }}>TOTAL POIN</div>
            </div>
          )}
        </div>
      </div>

      {/* Scoring guide */}
      <div style={{
        background: "#0d1117", border: "1px solid #1f2937",
        borderRadius: 10, padding: "10px 14px", marginBottom: 14,
        display: "flex", gap: 14, flexWrap: "wrap", fontSize: 11, color: "#6b7280",
      }}>
        <span>🎯 Tepat posisi = <strong style={{color:"#22c55e"}}>3 pts</strong></span>
        <span>✅ Ada di top 5 = <strong style={{color:"#fbbf24"}}>1 pt</strong></span>
        <span>❌ Meleset = <strong style={{color:"#ef4444"}}>0</strong></span>
      </div>

      {/* Leaderboard */}
      <Leaderboard allPredictions={allPreds} results={results} currentUser={userName} />

      {/* Race list */}
      {loading ? (
        <div style={{ display: "grid", gap: 8 }}>
          {[...Array(3)].map((_,i) => (
            <div key={i} style={{ height: 72, background: "#0d1117", borderRadius: 12, animation: "pulse 1.5s ease infinite" }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {races.map((race, ri) => {
            const isFinished = race.status === "finished";
            const pred       = myPreds[race.round] || [null,null,null,null,null];
            const actual     = results[race.round];
            const score      = isFinished ? calcScore(pred, actual) : null;
            const isOpen     = active === race.round;
            const hasPred    = pred.some(p => p);
            const otherPreds = allPreds.filter(p => p.round === race.round && p.user !== userName);

            return (
              <div key={race.round} style={{ animation: `fadeUp 0.25s ease ${ri*40}ms both` }}>
                {/* Row header */}
                <div
                  onClick={() => setActive(isOpen ? null : race.round)}
                  style={{
                    background: isOpen ? "#0f1420" : "#0d1117",
                    border: `1px solid ${isOpen ? "#1f2937" : "#1a1f2e"}`,
                    borderRadius: isOpen ? "12px 12px 0 0" : 12,
                    padding: "13px 14px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 10,
                    userSelect: "none",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{getCountryFlag(race.circuit.country)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      R{race.round} · {race.name.replace(" Grand Prix", " GP")}
                    </div>
                    <div style={{ fontSize: 11, color: "#4b5563" }}>
                      {new Date(race.date).toLocaleDateString("id-ID", { day:"numeric", month:"long" })}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                    {isFinished && score !== null && (
                      <div style={{
                        background: score >= 9 ? "#22c55e20" : score >= 4 ? "#fbbf2420" : "#ef444420",
                        border: `1px solid ${score >= 9 ? "#22c55e44" : score >= 4 ? "#fbbf2444" : "#ef444444"}`,
                        borderRadius: 8, padding: "4px 10px", textAlign: "center",
                      }}>
                        <div style={{ fontSize: 15, fontWeight: 900, color: score >= 9 ? "#22c55e" : score >= 4 ? "#fbbf24" : "#ef4444", lineHeight: 1 }}>{score}</div>
                        <div style={{ fontSize: 8, color: "#6b7280" }}>pts</div>
                      </div>
                    )}
                    {!isFinished && hasPred && <span style={{ fontSize: 11, color: "#22c55e" }}>✓</span>}
                    {!isFinished && !hasPred && <span style={{ fontSize: 11, color: "#fbbf24" }}>Isi</span>}
                    <span style={{
                      fontSize: 10, color: "#374151",
                      display: "inline-block", transition: "transform 0.2s",
                      transform: isOpen ? "rotate(180deg)" : "none",
                    }}>▼</span>
                  </div>
                </div>

                {/* Expanded */}
                {isOpen && (
                  <div style={{
                    background: "#090a0f",
                    border: "1px solid #1f2937", borderTop: "none",
                    borderRadius: "0 0 12px 12px", padding: "14px",
                  }}>
                    <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: 1, marginBottom: 10, fontFamily: "monospace" }}>
                      PREDIKSIMU — TAP UNTUK PILIH DRIVER
                    </div>

                    {/* 5 position buttons */}
                    <div style={{ display: "grid", gap: 6, marginBottom: 14 }}>
                      {POS_LABELS.map((pos, posIdx) => {
                        const driverId = pred[posIdx];
                        const drv      = DRIVERS_2026.find(d => d.id === driverId);
                        const color    = drv ? getTeamColor(drv.team) : POS_COLORS[posIdx];
                        const actualId = actual?.[posIdx];
                        const isCorrect  = isFinished && driverId === actualId;
                        const isOnTop5   = isFinished && driverId && actual?.includes(driverId);
                        const actualDrv  = DRIVERS_2026.find(d => d.id === actualId);

                        return (
                          <div key={posIdx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {/* Position label */}
                            <div style={{
                              width: 32, flexShrink: 0, fontSize: 11, fontWeight: 700,
                              color: POS_COLORS[posIdx], textAlign: "center",
                            }}>{pos.split(" ")[0]}<br/><span style={{ fontSize: 14 }}>{pos.split(" ")[1] || ""}</span></div>

                            {/* Pick button */}
                            <div
                              className="pick-btn"
                              onClick={() => !isFinished && setPicker(posIdx)}
                              style={{
                                flex: 1, padding: "10px 12px", borderRadius: 9,
                                background: drv ? color + "18" : "#0d1117",
                                border: `1px solid ${isCorrect ? "#22c55e55" : isOnTop5 ? "#fbbf2455" : isFinished && driverId ? "#ef444433" : drv ? color + "44" : "#1f2937"}`,
                                cursor: isFinished ? "default" : "pointer",
                                display: "flex", alignItems: "center", gap: 8,
                                minHeight: 44,
                              }}
                            >
                              {drv ? (
                                <>
                                  <span style={{ fontSize: 14 }}>{getFlag(drv.nationality)}</span>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color }}>{drv.lastName}</div>
                                    <div style={{ fontSize: 10, color: "#6b7280" }}>{drv.teamName}</div>
                                  </div>
                                  <span style={{
                                    fontSize: 11,
                                    color: isCorrect ? "#22c55e" : isOnTop5 ? "#fbbf24" : isFinished ? "#ef4444" : "#4b5563",
                                  }}>
                                    {isCorrect ? "🎯+3" : isOnTop5 ? "✅+1" : isFinished && driverId ? "❌" : drv.num}
                                  </span>
                                </>
                              ) : (
                                <span style={{ fontSize: 12, color: "#374151" }}>
                                  {isFinished ? "—" : "Tap untuk pilih driver"}
                                </span>
                              )}
                            </div>

                            {/* Actual result */}
                            {isFinished && actualDrv && (
                              <div style={{ flexShrink: 0, fontSize: 10, color: "#4b5563", textAlign: "center", width: 44 }}>
                                <div style={{ fontSize: 14 }}>{getFlag(actualDrv.nationality)}</div>
                                <div>{actualDrv.lastName.slice(0,5)}</div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Save button */}
                    {!isFinished && (
                      <button
                        onClick={() => savePrediction(race.round)}
                        disabled={saving || !hasPred}
                        style={{
                          width: "100%", padding: "11px",
                          background: saved ? "#22c55e" : hasPred ? "#ef4444" : "#1f2937",
                          border: "none", borderRadius: 10,
                          color: hasPred ? "#fff" : "#4b5563",
                          fontSize: 14, fontWeight: 700,
                          cursor: hasPred ? "pointer" : "not-allowed",
                          fontFamily: "inherit", marginBottom: 6,
                        }}
                      >{saving ? "Menyimpan..." : saved ? "✓ Tersimpan!" : "Simpan Prediksi"}</button>
                    )}

                    {/* Score summary */}
                    {isFinished && score !== null && (
                      <div style={{
                        background: "#1a1f2e", borderRadius: 10, padding: "10px 12px",
                        fontSize: 13, color: "#9ca3af", marginTop: 6,
                      }}>
                        Skor race ini: <strong style={{ color: score >= 9 ? "#22c55e" : score >= 4 ? "#fbbf24" : "#ef4444" }}>{score}/15 poin</strong>
                        {score === 15 && " 🎉 Sempurna!"}
                        {score >= 9 && score < 15 && " 🔥 Keren!"}
                        {score >= 4 && score < 9 && " 👍 Lumayan!"}
                        {score < 4 && " 😅 Nasib!"}
                      </div>
                    )}

                    {/* Prediksi orang lain */}
                    {isFinished && otherPreds.length > 0 && (
                      <div style={{ marginTop: 14 }}>
                        <div style={{ fontSize: 10, color: "#374151", letterSpacing: 1, marginBottom: 8, fontFamily: "monospace", borderTop: "1px solid #1a1f2e", paddingTop: 12 }}>
                          PREDIKSI PEMAIN LAIN
                        </div>
                        {otherPreds.map(({ user, prediction: p }) => {
                          const s = calcScore(p, actual);
                          return (
                            <div key={user} style={{
                              background: "#0d1117", border: "1px solid #1f2937",
                              borderRadius: 10, padding: "10px 12px", marginBottom: 6,
                              display: "flex", alignItems: "center", gap: 10,
                            }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{user}</div>
                                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                  {p.slice(0,5).map((dId, idx) => {
                                    const drv = DRIVERS_2026.find(d => d.id === dId);
                                    const cor = actual?.[idx] === dId;
                                    const pod = actual?.includes(dId);
                                    return (
                                      <span key={idx} style={{
                                        fontSize: 10, padding: "2px 7px", borderRadius: 5,
                                        background: cor ? "#22c55e20" : pod ? "#fbbf2420" : "#1f2937",
                                        color: cor ? "#22c55e" : pod ? "#fbbf24" : "#4b5563",
                                      }}>P{idx+1} {drv?.lastName?.slice(0,4) || "?"}</span>
                                    );
                                  })}
                                </div>
                              </div>
                              <div style={{ textAlign: "center", flexShrink: 0 }}>
                                <div style={{ fontSize: 18, fontWeight: 900, color: s >= 9 ? "#22c55e" : s >= 4 ? "#fbbf24" : "#6b7280" }}>{s}</div>
                                <div style={{ fontSize: 9, color: "#4b5563" }}>pts</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {races.length === 0 && !loading && (
            <div style={{
              textAlign: "center", padding: "50px 20px",
              background: "#0d1117", borderRadius: 14, border: "1px solid #1f2937",
            }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🎯</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Siapkan prediksimu!</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Australian GP · 8 Maret 2026</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

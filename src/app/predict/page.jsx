"use client";
// src/app/predict/page.jsx

import { useState, useEffect, useRef } from "react";
import { DRIVERS_2026 } from "@/lib/drivers2026";
import { getTeamColor, getCountryFlag } from "@/lib/teamColors";
import Link from "next/link";

const POSITIONS = [
  { label: "P1", emoji: "🥇" },
  { label: "P2", emoji: "🥈" },
  { label: "P3", emoji: "🥉" },
  { label: "P4", emoji: "4️⃣" },
  { label: "P5", emoji: "5️⃣" },
];

function calcScore(picks, actual) {
  if (!picks || !actual || actual.length === 0) return null;
  let score = 0;
  picks.forEach((driverId, idx) => {
    if (!driverId) return;
    if (actual[idx] === driverId) score += 3;
    else if (actual.includes(driverId)) score += 1;
  });
  return score;
}

function DriverPicker({ open, onClose, onSelect, selected, disabledIds, posLabel }) {
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) { setSearch(""); setTimeout(() => inputRef.current?.focus(), 100); }
  }, [open]);

  if (!open) return null;

  const filtered = DRIVERS_2026.filter(d =>
    !search ||
    d.lastName.toLowerCase().includes(search.toLowerCase()) ||
    d.firstName.toLowerCase().includes(search.toLowerCase()) ||
    d.teamName.toLowerCase().includes(search.toLowerCase()) ||
    String(d.num).includes(search)
  );

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:1000, display:"flex", alignItems:"flex-end" }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:"100%", maxWidth:480, margin:"0 auto",
        background:"var(--bg-surface)", borderRadius:"16px 16px 0 0",
        border:"1px solid var(--border)", borderBottom:"none",
        maxHeight:"70vh", display:"flex", flexDirection:"column",
        animation:"slideUp 0.2s ease",
      }}>
        <div style={{ padding:"16px 16px 0", flexShrink:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>Pilih Driver — {posLabel}</div>
            <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--text-secondary)", fontSize:18, cursor:"pointer", padding:4 }}>✕</button>
          </div>
          <input ref={inputRef} value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama driver atau tim..."
            style={{ width:"100%", background:"var(--bg-raised)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 14px", color:"var(--text-primary)", fontSize:13, fontFamily:"inherit", outline:"none", marginBottom:12 }} />
        </div>
        <div style={{ overflowY:"auto", padding:"0 16px 16px" }}>
          <div onClick={() => { onSelect(null); onClose(); }} style={{ padding:"10px 14px", borderRadius:10, marginBottom:6, background:"var(--bg-raised)", border:"1px solid var(--border)", cursor:"pointer", fontSize:12, color:"var(--text-secondary)" }}>
            — Kosongkan pilihan
          </div>
          {filtered.map(driver => {
            const isSelected = selected === driver.id;
            const isDisabled = disabledIds.includes(driver.id) && !isSelected;
            const color = getTeamColor(driver.team);
            return (
              <div key={driver.id} onClick={() => { if (!isDisabled) { onSelect(driver.id); onClose(); }}} style={{
                display:"flex", alignItems:"center", gap:12,
                padding:"10px 14px", borderRadius:10, marginBottom:4,
                background: isSelected ? "var(--bg-raised)" : "transparent",
                border:`1px solid ${isSelected ? color+"50" : "transparent"}`,
                cursor: isDisabled ? "not-allowed" : "pointer",
                opacity: isDisabled ? 0.35 : 1, transition:"background 0.1s",
              }}>
                <div style={{ width:32, height:32, borderRadius:8, background:color+"20", border:`1px solid ${color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:900, color, flexShrink:0 }}>
                  {driver.num}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color: isSelected ? color : "var(--text-primary)" }}>{driver.firstName} {driver.lastName}</div>
                  <div style={{ fontSize:10, color:"var(--text-secondary)" }}>{driver.teamName}</div>
                </div>
                {isSelected && <span style={{ fontSize:14, color }}>✓</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PredictPage() {
  const [schedule,    setSchedule]    = useState([]);
  const [results,     setResults]     = useState({});
  const [predictions, setPreds]       = useState({});
  const [activeRound, setActive]      = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [playerName,  setPlayerName]  = useState("");
  const [nameInput,   setNameInput]   = useState("");
  const [showSetup,   setShowSetup]   = useState(false);
  const [picker,      setPicker]      = useState(null);

  useEffect(() => {
    const name = localStorage.getItem("f1-player-name") || "";
    setPlayerName(name);
    setNameInput(name);
    if (!name) setShowSetup(true);
    fetch("/api/schedule")
      .then(r => r.json())
      .then(json => { if (json.success) setSchedule(json.data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!playerName) return;
    fetch(`/api/predictions?player=${encodeURIComponent(playerName.toLowerCase().trim())}`)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          const formatted = {};
          Object.entries(json.data).forEach(([round, val]) => { formatted[round] = val?.picks || val || []; });
          setPreds(formatted);
        }
      });
  }, [playerName]);

  useEffect(() => {
    const finished = schedule.filter(r => r.status === "finished");
    finished.forEach(race => {
      if (results[race.round]) return;
      fetch(`/api/race?round=${race.round}&session=race`)
        .then(r => r.json())
        .then(json => {
          if (json.success && json.data?.results) {
            const top5 = json.data.results.slice(0, 5).map(r => r.driver?.id);
            setResults(prev => ({ ...prev, [race.round]: top5 }));
          }
        });
    });
  }, [schedule]);

  function saveName() {
    const name = nameInput.trim();
    if (!name) return;
    localStorage.setItem("f1-player-name", name.toLowerCase().trim());
    setPlayerName(name.toLowerCase().trim());
    setShowSetup(false);
  }

  async function setPick(round, posIdx, driverId) {
    if (!playerName) { setShowSetup(true); return; }
    setPreds(prev => {
      const picks = [...(prev[round] || [null,null,null,null,null])];
      const existingIdx = picks.indexOf(driverId);
      if (existingIdx !== -1 && existingIdx !== posIdx) picks[existingIdx] = null;
      picks[posIdx] = driverId || null;
      return { ...prev, [round]: picks };
    });
    setSaving(true);
    try {
      const picks = [...(predictions[round] || [null,null,null,null,null])];
      const existingIdx = picks.indexOf(driverId);
      if (existingIdx !== -1 && existingIdx !== posIdx) picks[existingIdx] = null;
      picks[posIdx] = driverId || null;
      await fetch("/api/predictions", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ player:playerName, round, picks }) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error("Save failed:", e); }
    finally { setSaving(false); }
  }

  const totalScore = Object.entries(predictions).reduce((sum, [round, picks]) => {
    const score = calcScore(picks, results[parseInt(round)]);
    return sum + (score || 0);
  }, 0);

  const races = schedule.filter(r => r.status === "upcoming" || (r.status === "finished" && predictions[r.round]?.some(p => p)));

  return (
    <div>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse   { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
      `}</style>

      {/* Setup modal */}
      {showSetup && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"var(--bg-surface)", border:"1px solid var(--border)", borderRadius:16, padding:24, width:"100%", maxWidth:360 }}>
            <div style={{ fontSize:24, marginBottom:8 }}>👋</div>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:6, color:"var(--text-primary)" }}>Siapa nama kamu?</div>
            <div style={{ fontSize:12, color:"var(--text-secondary)", marginBottom:16 }}>Nama ini akan muncul di papan skor bersama.</div>
            <input value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => e.key==="Enter" && saveName()}
              placeholder="Contoh: arsa"
              style={{ width:"100%", background:"var(--bg-raised)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 14px", color:"var(--text-primary)", fontSize:14, fontFamily:"inherit", outline:"none", marginBottom:12 }} />
            <button onClick={saveName} style={{ width:"100%", background:"var(--red)", border:"none", borderRadius:10, padding:"11px", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
              Simpan & Mulai
            </button>
            {playerName && (
              <button onClick={() => setShowSetup(false)} style={{ width:"100%", background:"transparent", border:"none", padding:"8px", color:"var(--text-secondary)", fontSize:12, cursor:"pointer", marginTop:8 }}>Batal</button>
            )}
          </div>
        </div>
      )}

      {picker && (
        <DriverPicker open={!!picker} onClose={() => setPicker(null)}
          onSelect={driverId => setPick(picker.round, picker.posIdx, driverId)}
          selected={predictions[picker.round]?.[picker.posIdx]}
          disabledIds={(predictions[picker.round] || []).filter(Boolean)}
          posLabel={POSITIONS[picker.posIdx].label} />
      )}

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
          PREDIKSI
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
          <div>
            <h1 style={{ fontSize:30, fontWeight:900, letterSpacing:-1, marginBottom:4, color:"var(--text-primary)", fontFamily:"'Barlow Condensed',sans-serif" }}>Tebak Podium</h1>
            <p style={{ fontSize:11, color:"var(--text-secondary)" }}>Tebak P1–P5 sebelum race dimulai</p>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
            {totalScore > 0 && (
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:28, fontWeight:900, color:"var(--gold)", lineHeight:1 }}>{totalScore}</div>
                <div style={{ fontSize:9, color:"var(--text-secondary)" }}>TOTAL POIN</div>
              </div>
            )}
            <div style={{ background:"var(--bg-raised)", border:"1px solid var(--border)", borderRadius:10, padding:"8px 12px", display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:12, color:"var(--text-secondary)" }}>👤</span>
              <span style={{ fontSize:12, fontWeight:700, color:"var(--text-primary)" }}>{playerName || "—"}</span>
              <button onClick={() => setShowSetup(true)} style={{ background:"none", border:"none", fontSize:10, color:"var(--text-secondary)", cursor:"pointer", padding:0 }}>ganti</button>
            </div>
            <Link href="/leaderboard" style={{ background:"var(--bg-raised)", border:"1px solid var(--border)", borderRadius:10, padding:"8px 14px", fontSize:12, fontWeight:700, color:"var(--text-primary)", textDecoration:"none", display:"flex", alignItems:"center", gap:6 }}>
              🏆 Papan Skor
            </Link>
          </div>
        </div>
      </div>

      {/* Scoring guide */}
      <div style={{ background:"var(--bg-surface)", border:"1px solid var(--border)", borderRadius:12, padding:"10px 14px", marginBottom:20, display:"flex", gap:16, flexWrap:"wrap", fontSize:12, color:"var(--text-secondary)" }}>
        <span>🎯 Posisi tepat = <strong style={{ color:"var(--green)" }}>3 poin</strong></span>
        <span>✅ Ada di top 5 = <strong style={{ color:"var(--gold)" }}>1 poin</strong></span>
        <span>❌ Meleset = <strong style={{ color:"var(--red)" }}>0 poin</strong></span>
        <span style={{ marginLeft:"auto", color:"var(--text-muted)" }}>maks 15 poin/race</span>
      </div>

      {(saving || saved) && (
        <div style={{ fontSize:11, color: saving ? "var(--gold)" : "var(--green)", marginBottom:12, fontFamily:"monospace" }}>
          {saving ? "⏳ Menyimpan..." : "✓ Tersimpan"}
        </div>
      )}

      {loading ? (
        <div style={{ display:"grid", gap:10 }}>
          {[...Array(3)].map((_,i) => (
            <div key={i} style={{ height:80, background:"var(--bg-surface)", borderRadius:12, border:"1px solid var(--border)", animation:"pulse 1.5s ease infinite" }} />
          ))}
        </div>
      ) : (
        <div style={{ display:"grid", gap:12 }}>
          {races.map((race, i) => {
            const isFinished = race.status === "finished";
            const picks  = predictions[race.round] || [null,null,null,null,null];
            const actual = results[race.round];
            const score  = isFinished ? calcScore(picks, actual) : null;
            const isOpen = activeRound === race.round;

            return (
              <div key={race.round} style={{ animation:`fadeUp 0.3s ease ${i*40}ms both` }}>
                <div onClick={() => setActive(isOpen ? null : race.round)} style={{
                  background: isOpen ? "var(--bg-raised)" : "var(--bg-surface)",
                  border:`1px solid ${isOpen ? "var(--border-light)" : "var(--border)"}`,
                  borderRadius: isOpen ? "12px 12px 0 0" : 12,
                  padding:"14px 16px", cursor:"pointer",
                  display:"flex", alignItems:"center", gap:12, transition:"background 0.15s",
                }}>
                  <span style={{ fontSize:20 }}>{getCountryFlag(race.circuit?.country)}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:"var(--text-primary)" }}>R{race.round} · {race.name}</div>
                    <div style={{ fontSize:11, color:"var(--text-secondary)", marginTop:2 }}>
                      {new Date(race.date).toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" })}
                    </div>
                  </div>
                  {isFinished && score !== null && (
                    <div style={{ background: score>=12?"#22c55e20":score>=6?"var(--red-bg)":"var(--red-bg)", border:`1px solid ${score>=12?"#22c55e44":score>=6?"var(--red-border)":"var(--red-border)"}`, borderRadius:8, padding:"4px 12px", textAlign:"center" }}>
                      <div style={{ fontSize:18, fontWeight:900, color: score>=12?"#22c55e":score>=6?"var(--gold)":"var(--red)" }}>{score}</div>
                      <div style={{ fontSize:9, color:"var(--text-secondary)" }}>/ 15 PTS</div>
                    </div>
                  )}
                  {!isFinished && picks.some(p=>p) && <span style={{ fontSize:11, color:"var(--green)" }}>✓ Sudah ditebak</span>}
                  {!isFinished && !picks.some(p=>p) && <span style={{ fontSize:11, color:"var(--gold)" }}>Belum ditebak</span>}
                  <span style={{ fontSize:10, color:"var(--text-muted)", display:"inline-block", transition:"transform 0.2s", transform: isOpen?"rotate(180deg)":"none" }}>▼</span>
                </div>

                {isOpen && (
                  <div style={{ background:"var(--bg-raised)", border:"1px solid var(--border)", borderTop:"none", borderRadius:"0 0 12px 12px", padding:"16px 18px" }}>
                    <div style={{ display:"grid", gap:8, marginBottom:14 }}>
                      {POSITIONS.map(({ label, emoji }, posIdx) => {
                        const driverId  = picks[posIdx];
                        const driver    = DRIVERS_2026.find(d => d.id === driverId);
                        const actualId  = actual?.[posIdx];
                        const isCorrect = isFinished && driverId === actualId;
                        const isOnTop5  = isFinished && driverId && actual?.includes(driverId);
                        const color     = driver ? getTeamColor(driver.team) : "var(--border)";
                        return (
                          <div key={posIdx} onClick={() => !isFinished && setPicker({ round:race.round, posIdx })} style={{
                            display:"flex", alignItems:"center", gap:10,
                            background: driver ? color+"10" : "var(--bg-surface)",
                            border:`1px solid ${isCorrect?"#22c55e44":isOnTop5?"#fbbf2444":isFinished&&driverId?"var(--red-border)":driver?color+"30":"var(--border)"}`,
                            borderRadius:10, padding:"10px 14px",
                            cursor: isFinished ? "default" : "pointer", transition:"background 0.1s",
                          }}>
                            <div style={{ fontSize:16, minWidth:24 }}>{emoji}</div>
                            <div style={{ flex:1 }}>
                              {driver ? (
                                <>
                                  <div style={{ fontSize:13, fontWeight:700, color }}>{driver.firstName} {driver.lastName}</div>
                                  <div style={{ fontSize:10, color:"var(--text-secondary)" }}>{driver.teamName}</div>
                                </>
                              ) : (
                                <div style={{ fontSize:13, color:"var(--text-secondary)" }}>— Pilih driver</div>
                              )}
                            </div>
                            {isFinished && (
                              <div style={{ textAlign:"right", fontSize:11 }}>
                                {isCorrect && <span style={{ color:"var(--green)", fontWeight:700 }}>✓ +3</span>}
                                {isOnTop5 && !isCorrect && <span style={{ color:"var(--gold)", fontWeight:700 }}>≈ +1</span>}
                                {!isOnTop5 && driverId && <span style={{ color:"var(--red)" }}>✗ +0</span>}
                                {actualId && <div style={{ fontSize:10, color:"var(--text-secondary)", marginTop:2 }}>Aktual: {DRIVERS_2026.find(d=>d.id===actualId)?.lastName||actualId}</div>}
                              </div>
                            )}
                            {!isFinished && <span style={{ fontSize:10, color:"var(--text-muted)" }}>›</span>}
                          </div>
                        );
                      })}
                    </div>
                    {isFinished && score !== null && (
                      <div style={{ background:"var(--bg-surface)", borderRadius:10, padding:"10px 14px", fontSize:13, color:"var(--text-secondary)", border:"1px solid var(--border)" }}>
                        Skor race ini: <strong style={{ color: score>=12?"var(--green)":score>=6?"var(--gold)":"var(--red)" }}>{score}/15 poin</strong>
                        {score===15&&" 🎉 Sempurna!"}{score>=10&&score<15&&" 🔥 Bagus banget!"}{score>=5&&score<10&&" 👍 Lumayan!"}{score<5&&" 😅 Coba lagi!"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {races.length === 0 && (
            <div style={{ textAlign:"center", padding:"60px 20px", background:"var(--bg-surface)", borderRadius:14, border:"1px solid var(--border)" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🎯</div>
              <div style={{ fontSize:16, fontWeight:700, marginBottom:8, color:"var(--text-primary)" }}>Siapkan prediksimu!</div>
              <div style={{ fontSize:13, color:"var(--text-secondary)" }}>Race pertama musim ini segera dimulai.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
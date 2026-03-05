"use client";
// app/race/[round]/page.jsx

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { getTeamColor, getFlag } from "@/lib/teamColors";

const STATUS_COLOR = {
  "Finished": "#22c55e",
  "Lapped":   "#fbbf24",
  "Retired":  "#ef4444",
  "Disqualified": "#ef4444",
};

function SessionResult({ data, session }) {
  if (!data || !data.results) return (
    <div style={{ textAlign: "center", padding: "40px 0", color: "#4b5563", fontSize: 14 }}>
      Data {session.toUpperCase()} belum tersedia untuk race ini.
    </div>
  );

  const isRace  = session === "race";
  const isQuali = session === "qualifying";

  return (
    <div style={{ display: "grid", gap: 6 }}>
      {data.results.map((r, i) => {
        const color   = getTeamColor(r.team?.id);
        const flag    = getFlag(r.driver?.nationality);
        const isRetired = r.posText === "R" || r.posText === "D" || r.posText === "W" || r.posText === "E" || r.posText === "F";
        const isFastLap = isRace && r.fastestLap?.rank === 1;
        return (
          <div key={r.driver?.id || i} style={{
            background: i === 0 ? "#0d0a05" : "#0d1117",
            border: `1px solid ${i === 0 ? color + "44" : "#1f2937"}`,
            borderRadius: 10, padding: "12px 16px",
            display: "flex", alignItems: "center", gap: 12,
            opacity: isRetired ? 0.6 : 1,
          }}>
            {/* Pos */}
            <div style={{
              width: 30, height: 30, borderRadius: 6, flexShrink: 0,
              background: i < 3 ? color + "22" : "#1f2937",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 900,
              color: i === 0 ? color : i < 3 ? "#9ca3af" : "#4b5563",
            }}>{isRetired ? "DNF" : `P${r.pos}`}</div>

            <span style={{ fontSize: 18, flexShrink: 0 }}>{flag}</span>

            {/* Driver */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                {r.driver?.name}
                {isFastLap && <span style={{ fontSize: 9, background: "#a855f720", border: "1px solid #a855f744", borderRadius: 3, padding: "1px 5px", color: "#a855f7" }}>⚡ FL</span>}
              </div>
              <div style={{ fontSize: 11, color: color }}>{r.team?.name}</div>
            </div>

            {/* Qualifying times */}
            {isQuali && (
              <div style={{ display: "flex", gap: 8, fontFamily: "monospace", fontSize: 12, color: "#9ca3af" }}>
                {r.q1 && <span style={{ background: "#ef444415", borderRadius: 4, padding: "2px 8px" }}>Q1: {r.q1}</span>}
                {r.q2 && <span style={{ background: "#fbbf2415", borderRadius: 4, padding: "2px 8px" }}>Q2: {r.q2}</span>}
                {r.q3 && <span style={{ background: "#22c55e15", borderRadius: 4, padding: "2px 8px" }}>Q3: {r.q3}</span>}
                {!r.q1 && !r.q2 && !r.q3 && <span style={{ color: "#4b5563" }}>—</span>}
              </div>
            )}

            {/* Race info */}
            {isRace && !isRetired && (
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 12, fontFamily: "monospace", color: "#9ca3af" }}>
                  {i === 0 ? r.time : r.time ? `+${r.time}` : ""}
                </div>
                <div style={{ fontSize: 11, color: "#4b5563" }}>Grid: P{r.grid}</div>
              </div>
            )}
            {isRace && isRetired && (
              <div style={{ fontSize: 12, color: "#ef4444", textAlign: "right", flexShrink: 0 }}>{r.status}</div>
            )}

            {/* Practice time */}
            {!isRace && !isQuali && (
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontFamily: "monospace", color: "#9ca3af" }}>{r.time || "—"}</div>
                <div style={{ fontSize: 11, color: "#4b5563" }}>{r.laps} laps</div>
              </div>
            )}

            {/* Points */}
            {isRace && r.points > 0 && (
              <div style={{
                minWidth: 36, textAlign: "center", flexShrink: 0,
                background: "#fbbf2415", borderRadius: 6, padding: "4px 8px",
                fontSize: 12, fontWeight: 800, color: "#fbbf24",
              }}>+{r.points}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PitStopsView({ data }) {
  if (!data?.pitStops?.length) return (
    <div style={{ textAlign: "center", padding: "40px 0", color: "#4b5563", fontSize: 14 }}>
      Data pit stop belum tersedia.
    </div>
  );

  const sorted = [...data.pitStops].sort((a, b) => a.lap - b.lap);

  return (
    <div style={{ display: "grid", gap: 6 }}>
      {sorted.map((p, i) => (
        <div key={i} style={{
          background: "#0d1117", border: "1px solid #1f2937",
          borderRadius: 10, padding: "12px 18px",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{
            background: "#1f2937", borderRadius: 6, padding: "4px 10px",
            fontSize: 11, fontWeight: 700, color: "#6b7280", fontFamily: "monospace",
          }}>Lap {p.lap}</div>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{p.driverId}</div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>Stop #{p.stop}</div>
          <div style={{
            fontSize: 14, fontFamily: "monospace", color: "#22c55e", fontWeight: 700,
          }}>{p.duration}s</div>
        </div>
      ))}
    </div>
  );
}

const SESSIONS = [
  { key: "race",       label: "🏁 Race" },
  { key: "qualifying", label: "🔵 Qualifying" },
  { key: "fp3",        label: "🟡 FP3" },
  { key: "fp2",        label: "🟡 FP2" },
  { key: "fp1",        label: "🟡 FP1" },
  { key: "pitstops",   label: "🔧 Pit Stops" },
];

export default function RaceDetailPage({ params }) {
  const { round } = use(params);
  const [session, setSession] = useState("race");
  const [cache, setCache]     = useState({});
  const [loading, setLoading] = useState(false);
  const [raceInfo, setRaceInfo] = useState(null);

  useEffect(() => {
    // Load race info dari schedule
    fetch("/api/schedule")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const race = json.data.find((r) => r.round === parseInt(round));
          setRaceInfo(race);
        }
      });
  }, [round]);

  useEffect(() => {
    if (cache[session]) return; // sudah ada di cache, skip fetch
    setLoading(true);
    fetch(`/api/race?round=${round}&session=${session}`)
      .then((r) => r.json())
      .then((json) => {
        setCache((prev) => ({ ...prev, [session]: json.success ? json.data : null }));
      })
      .finally(() => setLoading(false));
  }, [session, round]);

  const data = cache[session];

  return (
    <div>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Back */}
      <Link href="/schedule" style={{ textDecoration: "none" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          fontSize: 12, color: "#6b7280", marginBottom: 20,
          padding: "6px 12px", background: "#0d1117",
          border: "1px solid #1f2937", borderRadius: 8, cursor: "pointer",
        }}>← Kalender</div>
      </Link>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4, fontFamily: "monospace" }}>
          ROUND {round} · {raceInfo?.circuit?.country || ""}
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5, marginBottom: 4 }}>
          {raceInfo ? raceInfo.name : `Race ${round}`}
        </h1>
        {raceInfo && (
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            {raceInfo.circuit?.name} · {raceInfo.circuit?.location} ·{" "}
            {new Date(raceInfo.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        )}
        {raceInfo?.status === "upcoming" && (
          <div style={{
            marginTop: 10, background: "#fbbf2410", border: "1px solid #fbbf2430",
            borderRadius: 8, padding: "8px 14px", fontSize: 12, color: "#fbbf24", display: "inline-block",
          }}>
            ⏳ Race belum berlangsung — hasil akan muncul otomatis setelah selesai
          </div>
        )}
      </div>

      {/* Session tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
        {SESSIONS.map((s) => (
          <button key={s.key} onClick={() => setSession(s.key)} style={{
            padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer",
            background: session === s.key ? "#ef4444" : "#0d1117",
            border: `1px solid ${session === s.key ? "#ef4444" : "#1f2937"}`,
            color: session === s.key ? "#fff" : "#6b7280",
            fontWeight: 600, fontSize: 12, fontFamily: "inherit", transition: "all 0.15s",
          }}>{s.label}</button>
        ))}
      </div>

      {/* Content */}
      {loading && (
        <div style={{ display: "grid", gap: 8 }}>
          {[...Array(10)].map((_, i) => (
            <div key={i} style={{ height: 56, background: "#0d1117", borderRadius: 10, animation: "pulse 1.5s ease infinite", animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
      )}

      {!loading && (
        <div style={{ animation: "fadeUp 0.3s ease" }}>
          {session === "pitstops"
            ? <PitStopsView data={data} />
            : <SessionResult data={data} session={session} />
          }
        </div>
      )}
    </div>
  );
}

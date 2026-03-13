"use client";
// app/standings/page.jsx

import { useState, useEffect } from "react";
import { getTeamColor, getFlagImg, getCountryFlagImg } from "@/lib/teamColors";

function FlagImg({ url, alt }) {
  if (!url) return <span style={{ fontSize: 20 }}>🏁</span>;
  return (
    <img
      src={url}
      alt={alt || "flag"}
      style={{ width: 24, height: "auto", flexShrink: 0, borderRadius: 2, display: "block" }}
    />
  );
}

function LoadingBar() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {[...Array(10)].map((_, i) => (
        <div key={i} style={{
          height: 60, background: "#0d1117", borderRadius: 10,
          animation: "pulse 1.5s ease-in-out infinite",
          animationDelay: `${i * 80}ms`,
        }} />
      ))}
    </div>
  );
}

export default function StandingsPage() {
  const [tab, setTab] = useState("drivers");
  const [drivers, setDrivers] = useState(null);
  const [constructors, setConstructors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const [dRes, cRes] = await Promise.all([
          fetch("/api/standings?type=drivers"),
          fetch("/api/standings?type=constructors"),
        ]);
        const dJson = await dRes.json();
        const cJson = await cRes.json();

        if (dJson.success) setDrivers(dJson.data);
        if (cJson.success) setConstructors(cJson.data);
        setLastUpdated(new Date());
      } catch (e) {
        setError("Gagal mengambil data standings. Coba refresh.");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const maxDriverPts = drivers?.drivers?.[0]?.points || 1;
  const maxConPts    = constructors?.constructors?.[0]?.points || 1;

  return (
    <div>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .row { transition: background 0.15s; }
        .row:hover { background: #111827 !important; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, color: "#ef4444", letterSpacing: 3, marginBottom: 8, fontFamily: "monospace" }}>
          🏆 STANDINGS
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1, marginBottom: 4 }}>
          Klasemen F1 {new Date().getFullYear()}
        </h1>
        {drivers && (
          <p style={{ fontSize: 12, color: "#6b7280" }}>
            Setelah Round {drivers.round} · {lastUpdated && `Update: ${lastUpdated.toLocaleTimeString("id-ID")}`}
          </p>
        )}
        {drivers?.round === 0 && (
          <div style={{
            marginTop: 8, background: "#fbbf2410", border: "1px solid #fbbf2430",
            borderRadius: 8, padding: "8px 14px", fontSize: 12, color: "#fbbf24", display: "inline-block",
          }}>
            ⏳ Musim belum dimulai — standings akan update otomatis setelah race pertama
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {[["drivers", "🧑‍✈️ Driver"], ["constructors", "🏎️ Konstruktor"]].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} style={{
            padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer",
            background: tab === v ? "#ef4444" : "#0d1117",
            color: tab === v ? "#fff" : "#6b7280",
            fontWeight: 600, fontSize: 13, fontFamily: "inherit",
            transition: "all 0.15s",
          }}>{l}</button>
        ))}
      </div>

      {error && (
        <div style={{
          background: "#ef444420", border: "1px solid #ef444440",
          borderRadius: 10, padding: 16, marginBottom: 16, color: "#ef4444", fontSize: 13,
        }}>
          ⚠️ {error}
        </div>
      )}

      {loading && <LoadingBar />}

      {/* DRIVER STANDINGS */}
      {!loading && tab === "drivers" && drivers && (
        <div style={{ display: "grid", gap: 8 }}>
          {drivers.drivers.map((d, i) => {
            const color   = getTeamColor(d.team.id);
            const flagUrl = getFlagImg(d.driver.nationality);
            return (
              <div key={d.driver.id} className="row" style={{
                background: i === 0 ? "#0d0a0a" : "#0d1117",
                border: `1px solid ${i === 0 ? color + "55" : "#1f2937"}`,
                borderRadius: 12, padding: "14px 18px",
                display: "flex", alignItems: "center", gap: 14,
                animation: `fadeUp 0.3s ease ${i * 30}ms both`,
              }}>
                {/* Position */}
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: i === 0 ? color + "22" : "#1f2937",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 900,
                  color: i === 0 ? color : i < 3 ? "#9ca3af" : "#4b5563",
                }}>P{d.pos}</div>

                {/* Flag */}
                <FlagImg url={flagUrl} alt={d.driver.nationality} />

                {/* Name & Team */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2, display: "flex", alignItems: "center", gap: 8 }}>
                    {d.driver.name}
                    {d.driver.code && (
                      <span style={{ fontSize: 10, color: "#4b5563", fontFamily: "monospace", fontWeight: 400 }}>
                        {d.driver.code}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: color }}>{d.team.name}</div>
                  {/* Progress bar */}
                  <div style={{ marginTop: 6, height: 3, background: "#1a1f2e", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      width: `${(d.points / maxDriverPts) * 100}%`,
                      height: "100%", background: color, borderRadius: 4,
                      transition: "width 1s ease",
                    }} />
                  </div>
                </div>

                {/* Wins */}
                <div style={{ textAlign: "center", flexShrink: 0, display: "grid", gap: 2 }}>
                  <div style={{ fontSize: 11, color: "#4b5563" }}>Wins</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: d.wins > 0 ? "#fbbf24" : "#4b5563" }}>{d.wins}</div>
                </div>

                {/* Points */}
                <div style={{ textAlign: "right", flexShrink: 0, minWidth: 52 }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: i === 0 ? color : "#e2e8f0", lineHeight: 1 }}>
                    {d.points}
                  </div>
                  <div style={{ fontSize: 10, color: "#4b5563" }}>PTS</div>
                </div>

                {/* Car number */}
                {d.driver.num && (
                  <div style={{
                    width: 32, height: 32, borderRadius: 6, flexShrink: 0,
                    background: "#1f2937", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#6b7280",
                  }}>{d.driver.num}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CONSTRUCTOR STANDINGS */}
      {!loading && tab === "constructors" && constructors && (
        <div style={{ display: "grid", gap: 8 }}>
          {constructors.constructors.map((c, i) => {
            const color   = getTeamColor(c.team.id);
            const flagUrl = getCountryFlagImg(c.team.nationality);
            return (
              <div key={c.team.id} className="row" style={{
                background: i === 0 ? "#0a0a0a" : "#0d1117",
                border: `1px solid ${i === 0 ? color + "55" : "#1f2937"}`,
                borderRadius: 12, padding: "14px 18px",
                display: "flex", alignItems: "center", gap: 14,
                animation: `fadeUp 0.3s ease ${i * 30}ms both`,
              }}>
                {/* Position */}
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: i === 0 ? color + "22" : "#1f2937",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 900, color: i === 0 ? color : "#4b5563",
                }}>P{c.pos}</div>

                {/* Flag */}
                <FlagImg url={flagUrl} alt={c.team.nationality} />

                {/* Name & Progress */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{c.team.name}</div>
                  <div style={{ height: 4, background: "#1a1f2e", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      width: `${(c.points / maxConPts) * 100}%`,
                      height: "100%", background: color, borderRadius: 4,
                    }} />
                  </div>
                </div>

                {/* Wins */}
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: "#4b5563" }}>Wins</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: c.wins > 0 ? "#fbbf24" : "#4b5563" }}>{c.wins}</div>
                </div>

                {/* Points */}
                <div style={{ textAlign: "right", flexShrink: 0, minWidth: 52 }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: i === 0 ? color : "#e2e8f0", lineHeight: 1 }}>
                    {c.points}
                  </div>
                  <div style={{ fontSize: 10, color: "#4b5563" }}>PTS</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
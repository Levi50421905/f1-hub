"use client";
// src/app/news/page.jsx

import { useState, useEffect } from "react";
import Link from "next/link";

function timeAgo(pub) {
  if (!pub) return "";
  const diff = Date.now() - new Date(pub);
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}j lalu`;
  return `${Math.floor(h / 24)}h lalu`;
}

const SOURCE_COLORS = {
  "Autosport":      "#ef4444",
  "Motorsport.com": "#f97316",
  "BBC Sport":      "#3b82f6",
  "NewsAPI":        "#8b5cf6",
};

export default function NewsPage() {
  const [news,    setNews]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("Semua");

  useEffect(() => {
    fetch("/api/news")
      .then(r => r.json())
      .then(d => { if (d.success) setNews(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const sources  = ["Semua", ...Array.from(new Set(news.map(n => n.source)))];
  const filtered = filter === "Semua" ? news : news.filter(n => n.source === filter);
  const featured = filtered[0];
  const rest     = filtered.slice(1);

  return (
    <div style={{ paddingBottom: 24 }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .news-card:hover { background: #111827 !important; }
        .news-card { transition: background 0.15s; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 16, animation: "fadeUp 0.3s ease" }}>
        <div style={{ fontSize: 10, color: "#ef4444", letterSpacing: 3, fontFamily: "monospace", marginBottom: 4 }}>
          📰 BERITA F1
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5, marginBottom: 12 }}>
          Formula 1 News
        </h1>

        {/* Source filter */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {sources.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              background: filter === s ? (SOURCE_COLORS[s] || "#ef4444") : "#0d1117",
              border: `1px solid ${filter === s ? (SOURCE_COLORS[s] || "#ef4444") : "#1a1f2e"}`,
              color: filter === s ? "#fff" : "#6b7280",
              borderRadius: 20, padding: "4px 12px", fontSize: 11,
              fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
            }}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "grid", gap: 8 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              background: "#0d1117", border: "1px solid #1a1f2e",
              borderRadius: 12, padding: 16, height: 80,
              animation: "pulse 1.5s ease infinite",
            }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", color: "#4b5563", padding: 40, fontSize: 13 }}>
          Tidak ada berita tersedia saat ini.
        </div>
      ) : (
        <div>
          {/* Featured article */}
          {featured && (
            <a href={featured.link} target="_blank" rel="noopener noreferrer"
              style={{ textDecoration: "none", display: "block", marginBottom: 12 }}>
              <div className="news-card" style={{
                background: "#0d1117", border: "1px solid #1a1f2e",
                borderRadius: 14, overflow: "hidden", animation: "fadeUp 0.3s ease 0.1s both",
              }}>
                {featured.img && (
                  <div style={{ width: "100%", height: 180, overflow: "hidden", background: "#111" }}>
                    <img src={featured.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => { e.target.style.display = "none"; }} />
                  </div>
                )}
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{
                      background: (SOURCE_COLORS[featured.source] || "#ef4444") + "22",
                      color: SOURCE_COLORS[featured.source] || "#ef4444",
                      border: `1px solid ${(SOURCE_COLORS[featured.source] || "#ef4444")}44`,
                      borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700,
                    }}>{featured.source}</span>
                    <span style={{ fontSize: 10, color: "#4b5563" }}>{timeAgo(featured.pub)}</span>
                    <span style={{ fontSize: 10, background: "#ef444422", color: "#ef4444", borderRadius: 4, padding: "1px 6px" }}>TERBARU</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.4, marginBottom: 6 }}>{featured.title}</div>
                  {featured.desc && (
                    <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>{featured.desc}...</div>
                  )}
                </div>
              </div>
            </a>
          )}

          {/* Rest of articles */}
          <div style={{ display: "grid", gap: 8 }}>
            {rest.map((item, i) => (
              <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                style={{ textDecoration: "none" }}>
                <div className="news-card" style={{
                  background: "#0d1117", border: "1px solid #1a1f2e",
                  borderRadius: 12, padding: "12px 14px",
                  display: "flex", gap: 12, alignItems: "flex-start",
                  animation: `fadeUp 0.3s ease ${0.05 * i}s both`,
                }}>
                  {item.img && (
                    <div style={{ width: 72, height: 54, flexShrink: 0, borderRadius: 8, overflow: "hidden", background: "#111" }}>
                      <img src={item.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={e => { e.target.parentElement.style.display = "none"; }} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{
                        color: SOURCE_COLORS[item.source] || "#ef4444",
                        fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                      }}>{item.source.toUpperCase()}</span>
                      <span style={{ fontSize: 9, color: "#374151" }}>·</span>
                      <span style={{ fontSize: 9, color: "#4b5563" }}>{timeAgo(item.pub)}</span>
                    </div>
                    <div style={{
                      fontSize: 13, fontWeight: 700, lineHeight: 1.4,
                      overflow: "hidden", display: "-webkit-box",
                      WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    }}>{item.title}</div>
                  </div>
                  <span style={{ fontSize: 14, color: "#374151", flexShrink: 0, marginTop: 2 }}>↗</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
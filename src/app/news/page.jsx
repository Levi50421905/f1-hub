"use client";
// src/app/news/page.jsx

import { useState, useEffect } from "react";

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
    <div style={{ paddingBottom:24 }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        .news-card:hover { background:var(--bg-hover) !important; }
        .news-card { transition:background 0.15s; }
      `}</style>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #10060c 0%, #0e0618 50%, #0c0e1a 100%)",
        border: "1px solid #2a1535",
        borderRadius: "var(--r-xl)", padding: "24px 24px 20px",
        marginBottom: 16, position: "relative", overflow: "hidden",
        animation: "fadeUp 0.3s ease",
      }}>
        <div style={{ position:"absolute", top:-50, right:-50, width:180, height:180, background:"radial-gradient(circle, rgba(232,52,74,0.1) 0%, transparent 65%)", pointerEvents:"none" }} />
        <div style={{ fontSize:10, color:"var(--red)", letterSpacing:3, marginBottom:8, fontFamily:"'JetBrains Mono',monospace", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:16, height:1, background:"var(--red)" }} />
          BERITA F1
        </div>
        <h1 style={{ fontSize:30, fontWeight:900, letterSpacing:-0.5, marginBottom:16, color:"var(--text-primary)", fontFamily:"'Barlow Condensed',sans-serif" }}>
          Formula 1 News
        </h1>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {sources.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              background: filter === s ? (SOURCE_COLORS[s] || "var(--red)") : "var(--bg-raised)",
              border: `1px solid ${filter === s ? (SOURCE_COLORS[s] || "var(--red)") : "var(--border)"}`,
              color: filter === s ? "#fff" : "var(--text-secondary)",
              borderRadius:20, padding:"4px 14px", fontSize:11,
              fontWeight:600, cursor:"pointer", transition:"all 0.15s",
              fontFamily:"'Outfit',sans-serif",
            }}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display:"grid", gap:8 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background:"var(--bg-surface)", border:"1px solid var(--border)", borderRadius:12, height:80, animation:"pulse 1.5s ease infinite" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:"center", color:"var(--text-secondary)", padding:40, fontSize:13 }}>
          Tidak ada berita tersedia saat ini.
        </div>
      ) : (
        <div>
          {featured && (
            <a href={featured.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none", display:"block", marginBottom:12 }}>
              <div className="news-card" style={{ background:"var(--bg-surface)", border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", animation:"fadeUp 0.3s ease 0.1s both" }}>
                {featured.img && (
                  <div style={{ width:"100%", height:200, overflow:"hidden", background:"var(--bg-raised)" }}>
                    <img src={featured.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}
                      onError={e => { e.target.style.display="none"; }} />
                  </div>
                )}
                <div style={{ padding:"16px 18px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                    <span style={{ background:(SOURCE_COLORS[featured.source]||"var(--red)")+"22", color:SOURCE_COLORS[featured.source]||"var(--red)", border:`1px solid ${(SOURCE_COLORS[featured.source]||"var(--red)")}44`, borderRadius:20, padding:"2px 10px", fontSize:10, fontWeight:700 }}>{featured.source}</span>
                    <span style={{ fontSize:11, color:"var(--text-secondary)" }}>{timeAgo(featured.pub)}</span>
                    <span style={{ fontSize:10, background:"var(--red-bg)", color:"var(--red)", borderRadius:4, padding:"1px 6px", border:"1px solid var(--red-border)" }}>TERBARU</span>
                  </div>
                  <div style={{ fontSize:16, fontWeight:800, lineHeight:1.4, marginBottom:8, color:"var(--text-primary)" }}>{featured.title}</div>
                  {featured.desc && (
                    <div style={{ fontSize:12, color:"var(--text-secondary)", lineHeight:1.6 }}>{featured.desc}...</div>
                  )}
                </div>
              </div>
            </a>
          )}

          <div style={{ display:"grid", gap:8 }}>
            {rest.map((item, i) => (
              <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                <div className="news-card" style={{
                  background:"var(--bg-surface)", border:"1px solid var(--border)",
                  borderRadius:12, padding:"12px 14px",
                  display:"flex", gap:12, alignItems:"flex-start",
                  animation:`fadeUp 0.3s ease ${0.05*i}s both`,
                }}>
                  {item.img && (
                    <div style={{ width:72, height:54, flexShrink:0, borderRadius:8, overflow:"hidden", background:"var(--bg-raised)" }}>
                      <img src={item.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}
                        onError={e => { e.target.parentElement.style.display="none"; }} />
                    </div>
                  )}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
                      <span style={{ color:SOURCE_COLORS[item.source]||"var(--red)", fontSize:9, fontWeight:700, letterSpacing:0.5 }}>{item.source.toUpperCase()}</span>
                      <span style={{ fontSize:9, color:"var(--text-muted)" }}>·</span>
                      <span style={{ fontSize:10, color:"var(--text-secondary)" }}>{timeAgo(item.pub)}</span>
                    </div>
                    <div style={{ fontSize:13, fontWeight:700, lineHeight:1.4, color:"var(--text-primary)", overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                      {item.title}
                    </div>
                  </div>
                  <span style={{ fontSize:14, color:"var(--text-muted)", flexShrink:0, marginTop:2 }}>↗</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
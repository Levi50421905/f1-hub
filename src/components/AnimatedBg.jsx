"use client";
// src/components/AnimatedBg.jsx
// Racing telemetry background — grid dots + moving particles

import { useEffect, useRef } from "react";

export default function AnimatedBg() {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let raf;

    function resize() {
      cv.width  = window.innerWidth;
      cv.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // ── Grid dots ──────────────────────────────────────────
    const COLS = 24, ROWS = 16;
    const dots = [];
    for (let r = 0; r <= ROWS; r++) {
      for (let c = 0; c <= COLS; c++) {
        dots.push({ bx: c / COLS, by: r / ROWS, phase: Math.random() * Math.PI * 2 });
      }
    }

    // ── Scan lines ─────────────────────────────────────────
    const scanLines = Array.from({ length: 2 }, () => ({
      y:     Math.random(),
      speed: 0.00012 + Math.random() * 0.00008,
      alpha: 0.025 + Math.random() * 0.025,
    }));

    // ── Particle paths ─────────────────────────────────────
    const NUM_PATHS = 7;

    function makePath() {
      const W = cv.width, H = cv.height;
      const pts = [];
      const n = 5 + Math.floor(Math.random() * 5);
      let x = Math.random() * W;
      let y = Math.random() * H;
      for (let i = 0; i < n; i++) {
        pts.push({ x, y });
        x = Math.max(0, Math.min(W, x + (Math.random() - 0.3) * 220));
        y = Math.max(0, Math.min(H, y + (Math.random() - 0.5) * 130));
      }
      const isRed = Math.random() < 0.18;
      return {
        pts, isRed,
        t: Math.random(),
        speed: 0.0007 + Math.random() * 0.0013,
        tail: [],
        tailLen: 16 + Math.floor(Math.random() * 18),
      };
    }

    const paths = Array.from({ length: NUM_PATHS }, makePath);

    function getPoint(pts, t) {
      const total = pts.length - 1;
      const seg = Math.min(Math.floor(t * total), total - 1);
      const lt  = (t * total) - seg;
      const a = pts[seg], b = pts[seg + 1];
      return { x: a.x + (b.x - a.x) * lt, y: a.y + (b.y - a.y) * lt };
    }

    let frame = 0;

    function draw() {
      frame++;
      const W = cv.width, H = cv.height;

      // Clear
      ctx.clearRect(0, 0, W, H);

      // Grid dots
      const t = frame * 0.007;
      for (const d of dots) {
        const pulse = 0.5 + 0.5 * Math.sin(t + d.phase);
        ctx.beginPath();
        ctx.arc(d.bx * W, d.by * H, 0.7 + pulse * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74,82,120,${0.05 + pulse * 0.09})`;
        ctx.fill();
      }

      // Scan lines (horizontal glow sweep)
      for (const sl of scanLines) {
        sl.y = (sl.y + sl.speed) % 1;
        const y = sl.y * H;
        const g = ctx.createLinearGradient(0, y - 80, 0, y + 80);
        g.addColorStop(0,   "rgba(232,52,74,0)");
        g.addColorStop(0.5, `rgba(232,52,74,${sl.alpha})`);
        g.addColorStop(1,   "rgba(232,52,74,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, y - 80, W, 160);
      }

      // Faint path lines
      for (const p of paths) {
        if (p.pts.length < 2) continue;
        ctx.beginPath();
        ctx.moveTo(p.pts[0].x, p.pts[0].y);
        for (let i = 1; i < p.pts.length; i++) {
          const mx = (p.pts[i-1].x + p.pts[i].x) / 2;
          const my = (p.pts[i-1].y + p.pts[i].y) / 2;
          ctx.quadraticCurveTo(p.pts[i-1].x, p.pts[i-1].y, mx, my);
        }
        ctx.strokeStyle = p.isRed ? "rgba(232,52,74,0.07)" : "rgba(30,35,56,0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Particles + tails
      for (const p of paths) {
        p.t += p.speed;
        if (p.t >= 1) {
          const fresh = makePath();
          Object.assign(p, fresh);
          p.t = 0;
          p.tail = [];
          continue;
        }

        const pos = getPoint(p.pts, p.t);
        p.tail.push({ x: pos.x, y: pos.y });
        if (p.tail.length > p.tailLen) p.tail.shift();

        // Tail
        for (let i = 1; i < p.tail.length; i++) {
          const prog  = i / p.tail.length;
          const alpha = prog * (p.isRed ? 0.65 : 0.3);
          ctx.beginPath();
          ctx.moveTo(p.tail[i-1].x, p.tail[i-1].y);
          ctx.lineTo(p.tail[i].x,   p.tail[i].y);
          ctx.strokeStyle = p.isRed
            ? `rgba(232,52,74,${alpha})`
            : `rgba(74,82,120,${alpha})`;
          ctx.lineWidth = p.isRed ? 1.5 : 1;
          ctx.stroke();
        }

        // Head
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, p.isRed ? 2.5 : 1.8, 0, Math.PI * 2);
        ctx.fillStyle = p.isRed ? "#e8344a" : "rgba(100,115,180,0.85)";
        ctx.fill();

        if (p.isRed) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 7, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(232,52,74,0.12)";
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 1,
      }}
    />
  );
}
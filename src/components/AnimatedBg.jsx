"use client";
// src/components/AnimatedBg.jsx

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

    const COLS = 28, ROWS = 18;
    const dots = [];
    for (let r = 0; r <= ROWS; r++) {
      for (let c = 0; c <= COLS; c++) {
        dots.push({
          bx: c / COLS, by: r / ROWS,
          phase: Math.random() * Math.PI * 2,
          size: 0.8 + Math.random() * 0.8,
        });
      }
    }

    const scanLines = [
      { y: 0.25, speed: 0.00013, alpha: 0.07 },
      { y: 0.72, speed: 0.00008, alpha: 0.05 },
    ];

    const NUM = 10;

    function makePath() {
      const W = cv.width, H = cv.height;
      const pts = [];
      const n = 6 + Math.floor(Math.random() * 4);
      let x = Math.random() * W;
      let y = Math.random() * H;
      for (let i = 0; i < n; i++) {
        pts.push({ x, y });
        x = Math.max(0, Math.min(W, x + (Math.random() - 0.35) * 240));
        y = Math.max(0, Math.min(H, y + (Math.random() - 0.5)  * 140));
      }
      const isRed = Math.random() < 0.2;
      return {
        pts, isRed,
        t: Math.random(),
        speed: 0.0006 + Math.random() * 0.001,
        tail: [],
        tailLen: 20 + Math.floor(Math.random() * 20),
      };
    }

    const paths = Array.from({ length: NUM }, makePath);

    function getPoint(pts, t) {
      const total = pts.length - 1;
      const seg = Math.min(Math.floor(t * total), total - 1);
      const lt  = (t * total) - seg;
      const a = pts[seg], b = pts[seg + 1];
      return { x: a.x + (b.x - a.x) * lt, y: a.y + (b.y - a.y) * lt };
    }

    function drawCircuitLines(W, H) {
      const lines = [
        [[0.05*W,0.25*H],[0.3*W,0.25*H],[0.42*W,0.12*H],[0.68*W,0.12*H],[0.78*W,0.22*H]],
        [[0.55*W,0.78*H],[0.7*W,0.62*H],[0.88*W,0.62*H],[0.95*W,0.75*H]],
        [[0.04*W,0.65*H],[0.18*W,0.52*H],[0.38*W,0.52*H],[0.48*W,0.68*H],[0.52*W,0.88*H]],
        [[0.82*W,0.08*H],[0.88*W,0.38*H],[0.76*W,0.48*H],[0.7*W,0.35*H]],
        [[0.2*W,0.85*H],[0.35*W,0.72*H],[0.5*W,0.72*H]],
      ];
      ctx.lineWidth = 0.8;
      for (const line of lines) {
        ctx.beginPath();
        ctx.moveTo(line[0][0], line[0][1]);
        for (let i = 1; i < line.length; i++) ctx.lineTo(line[i][0], line[i][1]);
        ctx.strokeStyle = "rgba(35,42,72,0.8)";
        ctx.stroke();
      }
    }

    let frame = 0;

    function draw() {
      frame++;
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);

      // Grid dots
      const t = frame * 0.007;
      for (const d of dots) {
        const pulse = 0.5 + 0.5 * Math.sin(t + d.phase);
        ctx.beginPath();
        ctx.arc(d.bx * W, d.by * H, d.size * (0.5 + pulse * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(80,95,150,${0.1 + pulse * 0.16})`;
        ctx.fill();
      }

      drawCircuitLines(W, H);

      // Scan lines
      for (const sl of scanLines) {
        sl.y = (sl.y + sl.speed) % 1;
        const y = sl.y * H;
        const g = ctx.createLinearGradient(0, y - 120, 0, y + 120);
        g.addColorStop(0,   "rgba(232,52,74,0)");
        g.addColorStop(0.5, `rgba(232,52,74,${sl.alpha})`);
        g.addColorStop(1,   "rgba(232,52,74,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, y - 120, W, 240);
      }

      // Path outlines
      for (const p of paths) {
        if (p.pts.length < 2) continue;
        ctx.beginPath();
        ctx.moveTo(p.pts[0].x, p.pts[0].y);
        for (let i = 1; i < p.pts.length; i++) {
          const mx = (p.pts[i-1].x + p.pts[i].x) / 2;
          const my = (p.pts[i-1].y + p.pts[i].y) / 2;
          ctx.quadraticCurveTo(p.pts[i-1].x, p.pts[i-1].y, mx, my);
        }
        ctx.strokeStyle = p.isRed ? "rgba(232,52,74,0.12)" : "rgba(45,55,95,0.55)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Particles + tails
      for (const p of paths) {
        p.t += p.speed;
        if (p.t >= 1) {
          Object.assign(p, makePath());
          p.t = 0; p.tail = [];
          continue;
        }
        const pos = getPoint(p.pts, p.t);
        p.tail.push({ x: pos.x, y: pos.y });
        if (p.tail.length > p.tailLen) p.tail.shift();

        for (let i = 1; i < p.tail.length; i++) {
          const prog  = i / p.tail.length;
          const alpha = prog * (p.isRed ? 0.85 : 0.5);
          ctx.beginPath();
          ctx.moveTo(p.tail[i-1].x, p.tail[i-1].y);
          ctx.lineTo(p.tail[i].x,   p.tail[i].y);
          ctx.strokeStyle = p.isRed
            ? `rgba(232,52,74,${alpha})`
            : `rgba(100,120,200,${alpha})`;
          ctx.lineWidth = p.isRed ? 2 : 1.4;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, p.isRed ? 3 : 2, 0, Math.PI * 2);
        ctx.fillStyle = p.isRed ? "#e8344a" : "rgba(130,155,225,0.95)";
        ctx.fill();

        if (p.isRed) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(232,52,74,0.14)";
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
      }}
    />
  );
}
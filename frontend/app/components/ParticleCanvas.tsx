"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ox: number;
  oy: number;
  size: number;
  alpha: number;
  color: string;
  phase: number;
}

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#818cf8", "#4f46e5", "#7c3aed"];
const COUNT = 120;
const GRAVITY = 0.18;      // attraction strength toward cursor
const RETURN = 0.04;       // pull back to origin
const DAMPING = 0.82;      // velocity damping
const REPEL_RADIUS = 90;   // cursor influence radius
const REPEL_STRENGTH = 6;  // push away strength when very close

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const particles = useRef<Particle[]>([]);
  const rafId = useRef<number>(0);
  const tick = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const init = () => {
      particles.current = Array.from({ length: COUNT }, () => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        return {
          x, y, vx: 0, vy: 0, ox: x, oy: y,
          size: Math.random() * 2 + 1,
          alpha: Math.random() * 0.5 + 0.2,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          phase: Math.random() * Math.PI * 2,
        };
      });
    };

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      mouse.current = { x: -9999, y: -9999 };
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouse.current.x;
      const my = mouse.current.y;
      tick.current += 0.012;

      for (const p of particles.current) {
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        if (dist < REPEL_RADIUS) {
          // attract toward cursor
          const force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
          p.vx += (dx / dist) * force * GRAVITY;
          p.vy += (dy / dist) * force * GRAVITY;
        }

        // spring back to origin
        p.vx += (p.ox - p.x) * RETURN;
        p.vy += (p.oy - p.y) * RETURN;

        // continuous idle wander so particles never fully stop
        p.vx += Math.sin(tick.current + p.phase) * 0.06;
        p.vy += Math.cos(tick.current + p.phase * 1.3) * 0.06;

        // damping
        p.vx *= DAMPING;
        p.vy *= DAMPING;

        p.x += p.vx;
        p.y += p.vy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafId.current = requestAnimationFrame(draw);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", resize);
    resize();
    draw();

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  freq: number;
  radius: number;
  baseAlpha: number;
  glow: boolean;
}

function createParticle(w: number, h: number): Particle {
  const glow = Math.random() < 0.3;
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
    phase: Math.random() * Math.PI * 2,
    freq: 0.003 + Math.random() * 0.007,
    radius: glow ? 1.5 : 1,
    baseAlpha: 0.3 + Math.random() * 0.5,
    glow,
  };
}

export function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;
    let particles: Particle[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function initParticles() {
      const count = window.innerWidth < 768 ? 60 : 120;
      particles = Array.from({ length: count }, () =>
        createParticle(canvas!.width, canvas!.height),
      );
    }

    function draw(time: number) {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // Update and draw particles
      for (const p of particles) {
        // Breathing oscillation
        const breathX = Math.sin(time * p.freq + p.phase) * 1.2;
        const breathY = Math.cos(time * p.freq * 0.7 + p.phase) * 1.2;

        p.x += p.vx + breathX * 0.08;
        p.y += p.vy + breathY * 0.08;

        // Toroidal wrap
        if (p.x < 0) p.x += w;
        if (p.x > w) p.x -= w;
        if (p.y < 0) p.y += h;
        if (p.y > h) p.y -= h;

        // Pulsing alpha
        const alpha =
          p.baseAlpha * (0.7 + 0.3 * Math.sin(time * p.freq * 2 + p.phase));

        if (p.glow) {
          ctx.shadowColor = "rgba(221,34,0,0.6)";
          ctx.shadowBlur = 6;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(221,34,0,${alpha.toFixed(3)})`;
        ctx.fill();
      }

      // Reset shadow after particles
      ctx.shadowBlur = 0;

      // Draw connections between nearby particles
      const maxDist = 100;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const opacity = 0.12 * (1 - dist / maxDist);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(221,34,0,${opacity.toFixed(3)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animFrameId = requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    animFrameId = requestAnimationFrame(draw);

    window.addEventListener("resize", () => {
      resize();
      initParticles();
    });

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", resize);
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
        zIndex: 1,
      }}
    />
  );
}

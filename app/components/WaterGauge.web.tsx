import { useEffect, useRef } from "react";

interface WaterGaugeProps {
  percentage: number;
  size?: number;
  animated?: boolean;
}

function getColors(pct: number) {
  if (pct >= 70) return { water: "#2ECC71", wave: "#27AE60", glow: "#2ECC7140", label: "Thriving 🌿", bg: "#F0FBF4" };
  if (pct >= 50) return { water: "#F39C12", wave: "#E67E22", glow: "#F39C1240", label: "Doing Okay 🌤", bg: "#FFFBF0" };
  if (pct >= 30) return { water: "#E67E22", wave: "#D35400", glow: "#E67E2240", label: "Needs Boost ⚡", bg: "#FFF5EE" };
  return { water: "#E74C3C", wave: "#C0392B", glow: "#E74C3C40", label: "Recharge 🔴", bg: "#FFF0EE" };
}

export function WaterGauge({ percentage, size = 220, animated = true }: WaterGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const phaseRef = useRef(0);
  const currentPctRef = useRef(0);

  const colors = getColors(percentage);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.42;

    function draw() {
      ctx.clearRect(0, 0, size, size);

      if (animated) {
        phaseRef.current += 0.04;
        if (currentPctRef.current < percentage) {
          currentPctRef.current = Math.min(currentPctRef.current + 0.6, percentage);
        } else if (currentPctRef.current > percentage) {
          currentPctRef.current = Math.max(currentPctRef.current - 0.6, percentage);
        }
      } else {
        currentPctRef.current = percentage;
      }

      const col = getColors(currentPctRef.current);
      const fillRatio = currentPctRef.current / 100;
      const waterY = cy + r - fillRatio * 2 * r;

      const glowGrad = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r + 10);
      glowGrad.addColorStop(0, col.glow);
      glowGrad.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, r + 10, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle = "#F5F5F5";
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      if (currentPctRef.current > 0) {
        ctx.beginPath();
        ctx.moveTo(cx - r, waterY);
        const waveAmp = r * 0.04;
        const waveLen = r * 0.7;
        for (let x = cx - r; x <= cx + r; x += 1) {
          const relX = x - (cx - r);
          const y = waterY + Math.sin((relX / waveLen) * Math.PI * 2 + phaseRef.current) * waveAmp
                           + Math.sin((relX / (waveLen * 0.7)) * Math.PI * 2 + phaseRef.current * 1.3) * (waveAmp * 0.5);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(cx + r, cy + r);
        ctx.lineTo(cx - r, cy + r);
        ctx.closePath();

        const waterGrad = ctx.createLinearGradient(0, waterY, 0, cy + r);
        waterGrad.addColorStop(0, col.water + "DD");
        waterGrad.addColorStop(1, col.wave + "FF");
        ctx.fillStyle = waterGrad;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx - r, waterY + 4);
        for (let x = cx - r; x <= cx + r; x += 1) {
          const relX = x - (cx - r);
          const y = waterY + 4 + Math.sin((relX / waveLen) * Math.PI * 2 + phaseRef.current + 1) * (waveAmp * 0.8);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(cx + r, cy + r);
        ctx.lineTo(cx - r, cy + r);
        ctx.closePath();
        ctx.fillStyle = col.wave + "60";
        ctx.fill();
      }

      ctx.beginPath();
      ctx.ellipse(cx - r * 0.3, cy - r * 0.3, r * 0.12, r * 0.25, -0.4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fill();

      ctx.restore();

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = col.water + "80";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `bold ${size * 0.18}px 'DM Serif Display', serif`;
      ctx.fillStyle = currentPctRef.current > 45 ? "#fff" : "#1C2B2A";
      ctx.fillText(`${Math.round(currentPctRef.current)}%`, cx, cy - 4);

      ctx.font = `${size * 0.07}px 'DM Sans', sans-serif`;
      ctx.fillStyle = currentPctRef.current > 45 ? "rgba(255,255,255,0.8)" : "#7A8B88";
      ctx.fillText("today", cx, cy + size * 0.1);

      if (animated) {
        animRef.current = requestAnimationFrame(draw);
      }
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [percentage, size, animated]);

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
      />
      <span
        className="px-4 py-1.5 rounded-full text-sm font-medium"
        style={{ backgroundColor: colors.bg, color: colors.water }}
      >
        {colors.label}
      </span>
    </div>
  );
}
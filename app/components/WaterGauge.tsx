import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

interface WaterGaugeProps {
  percentage: number;
  size?: number;
  animated?: boolean;
}

export function WaterGauge({ percentage, size = 220, animated = true }: WaterGaugeProps) {
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.updatePercentage) {
          window.updatePercentage(${percentage});
        }
        true;
      `);
    }
  }, [percentage]);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
      <style>
        body { 
          margin: 0; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          height: 100vh; 
          background: transparent; 
          font-family: 'DM Sans', sans-serif; 
          overflow: hidden;
        }
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px; /* gap-3 equivalent */
        }
        #badge {
          padding: 6px 16px; /* px-4 py-1.5 equivalent */
          border-radius: 9999px; /* rounded-full */
          font-size: 14px; /* text-sm */
          font-weight: 500; /* font-medium */
          display: inline-block;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <canvas id="gauge"></canvas>
        <span id="badge"></span>
      </div>

      <script>
        function getColors(pct) {
          if (pct >= 70) return { water: "#2ECC71", wave: "#27AE60", glow: "#2ECC7140", label: "Thriving 🌿", bg: "#F0FBF4" };
          if (pct >= 50) return { water: "#F39C12", wave: "#E67E22", glow: "#F39C1240", label: "Doing Okay 🌤", bg: "#FFFBF0" };
          if (pct >= 30) return { water: "#E67E22", wave: "#D35400", glow: "#E67E2240", label: "Needs Boost ⚡", bg: "#FFF5EE" };
          return { water: "#E74C3C", wave: "#C0392B", glow: "#E74C3C40", label: "Recharge 🔴", bg: "#FFF0EE" };
        }

        const canvas = document.getElementById("gauge");
        const badge = document.getElementById("badge");
        const ctx = canvas.getContext("2d");
        
        let targetPercentage = ${percentage};
        let currentPct = 0;
        const size = ${size};
        const animated = ${animated};
        let phase = 0;
        let animId;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        ctx.scale(dpr, dpr);

        const cx = size / 2;
        const cy = size / 2;
        const r = size * 0.42;

        function updateUI() {
          const colors = getColors(targetPercentage);
          badge.textContent = colors.label;
          badge.style.backgroundColor = colors.bg;
          badge.style.color = colors.water;
        }

        window.updatePercentage = function(newPct) {
          targetPercentage = newPct;
          updateUI();
        };

        updateUI();

        function draw() {
          ctx.clearRect(0, 0, size, size);

          if (animated) {
            phase += 0.04;
            if (currentPct < targetPercentage) {
              currentPct = Math.min(currentPct + 0.6, targetPercentage);
            } else if (currentPct > targetPercentage) {
              currentPct = Math.max(currentPct - 0.6, targetPercentage);
            }
          } else {
            currentPct = targetPercentage;
          }

          const col = getColors(currentPct);
          const fillRatio = currentPct / 100;
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

          if (currentPct > 0) {
            ctx.beginPath();
            ctx.moveTo(cx - r, waterY);
            const waveAmp = r * 0.04;
            const waveLen = r * 0.7;
            for (let x = cx - r; x <= cx + r; x += 1) {
              const relX = x - (cx - r);
              const y = waterY + Math.sin((relX / waveLen) * Math.PI * 2 + phase) * waveAmp
                               + Math.sin((relX / (waveLen * 0.7)) * Math.PI * 2 + phase * 1.3) * (waveAmp * 0.5);
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
              const y = waterY + 4 + Math.sin((relX / waveLen) * Math.PI * 2 + phase + 1) * (waveAmp * 0.8);
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
          ctx.font = \`bold \${size * 0.18}px 'DM Serif Display', serif\`;
          ctx.fillStyle = currentPct > 45 ? "#fff" : "#1C2B2A";
          ctx.fillText(\`\${Math.round(currentPct)}%\`, cx, cy - 4);

          ctx.font = \`\${size * 0.07}px 'DM Sans', sans-serif\`;
          ctx.fillStyle = currentPct > 45 ? "rgba(255,255,255,0.8)" : "#7A8B88";
          ctx.fillText("today", cx, cy + size * 0.1);

          if (animated) {
            animId = requestAnimationFrame(draw);
          }
        }

        // Font load ayyaka draw cheyadam safe
        document.fonts.ready.then(function() {
          draw();
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={{ width: size, height: size + 50, backgroundColor: 'transparent' }}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        androidLayerType="hardware"
      />
    </View>
  );
}
import React, { useEffect, useRef } from 'react';
import { Platform, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface WaterGaugeProps {
  percentage: number;
  size?: number;
  animated?: boolean;
}

export function WaterGauge({ percentage, size = 220, animated = true }: WaterGaugeProps) {
  const webViewRef = useRef<WebView>(null);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
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
          gap: 14px;
        }
        #badge {
          padding: 6px 16px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 700;
          display: inline-block;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <canvas id="gauge"></canvas>
        <span id="badge">Balanced</span>
      </div>

      <script>
        function getStatusDetails(score) {
          if (score > 100) return { label: "Overloaded", color: "#6366F1", bg: "rgba(99, 102, 241, 0.08)", fluid: "#6366F1", wave: "#4F46E5" };
          if (score >= 75) return { label: "Flourishing", color: "#336956", bg: "rgba(51, 105, 86, 0.08)", fluid: "#336956", wave: "#1B4235" };
          if (score >= 50) return { label: "Balanced", color: "#E09643", bg: "rgba(224, 150, 67, 0.08)", fluid: "#E09643", wave: "#C67E28" };
          if (score >= 30) return { label: "Strained", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.08)", fluid: "#F59E0B", wave: "#D97706" };
          return { label: "Depleted", color: "#DC2626", bg: "rgba(220, 38, 38, 0.08)", fluid: "#DC2626", wave: "#B91C1C" };
        }

        const canvas = document.getElementById("gauge");
        const badge = document.getElementById("badge");
        const ctx = canvas.getContext("2d");
        
        let targetPercentage = ${percentage};
        let currentPct = 0;
        const size = ${size};
        const animated = ${animated};
        let phase = 0;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        ctx.scale(dpr, dpr);

        const cx = size / 2;
        const cy = size / 2;
        const r = size * 0.44;

        function updateUI(score) {
          const status = getStatusDetails(score);
          badge.textContent = status.label;
          badge.style.backgroundColor = status.bg;
          badge.style.color = status.color;
        }

        window.updatePercentage = function(newPct) {
          targetPercentage = newPct;
          updateUI(newPct);
        };

        updateUI(targetPercentage);

        function draw() {
          ctx.clearRect(0, 0, size, size);

          if (animated) {
            phase += 0.03;
            if (currentPct < targetPercentage) {
              currentPct = Math.min(currentPct + 0.8, targetPercentage);
            } else if (currentPct > targetPercentage) {
              currentPct = Math.max(currentPct - 0.8, targetPercentage);
            }
          } else {
            currentPct = targetPercentage;
          }

          const status = getStatusDetails(currentPct);
          const fillRatio = Math.min(currentPct, 100) / 100;
          const waterY = cy + r - fillRatio * 2 * r;

          ctx.beginPath();
          ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,0,0,0.01)";
          ctx.fill();

          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.clip();

          ctx.fillStyle = "#F5F7F6";
          ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

          if (currentPct > 0) {
            ctx.beginPath();
            ctx.moveTo(cx - r, waterY);
            const waveAmp = r * 0.035;
            const waveLen = r * 0.85;
            for (let x = cx - r; x <= cx + r; x += 1) {
              const relX = x - (cx - r);
              const y = waterY + Math.sin((relX / waveLen) * Math.PI * 2 + phase) * waveAmp;
              ctx.lineTo(x, y);
            }
            ctx.lineTo(cx + r, cy + r);
            ctx.lineTo(cx - r, cy + r);
            ctx.closePath();

            const waterGrad = ctx.createLinearGradient(0, waterY, 0, cy + r);
            waterGrad.addColorStop(0, status.fluid);
            waterGrad.addColorStop(1, status.wave);
            ctx.fillStyle = waterGrad;
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(cx - r, waterY + 2);
            for (let x = cx - r; x <= cx + r; x += 1) {
              const relX = x - (cx - r);
              const y = waterY + 2 + Math.sin((relX / waveLen) * Math.PI * 2 + phase + 1.5) * waveAmp;
              ctx.lineTo(x, y);
            }
            ctx.lineTo(cx + r, cy + r);
            ctx.lineTo(cx - r, cy + r);
            ctx.closePath();
            ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
            ctx.fill();
          }

          ctx.restore();

          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = "bold " + (size * 0.22) + "px 'DM Sans', sans-serif";
          
          ctx.fillStyle = currentPct > 52 ? "#FFFFFF" : "#11231D";
          ctx.fillText(Math.round(currentPct) + "%", cx, cy);

          if (animated) {
            requestAnimationFrame(draw);
          }
        }

        document.fonts.ready.then(function() {
          draw();
        });
      </script>
    </body>
    </html>
  `;

  useEffect(() => {
    if (Platform.OS !== 'web' && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.updatePercentage) {
          window.updatePercentage(${percentage});
        }
        true;
      `);
    }
  }, [percentage]);

  // 🔥 Web/Desktop ప్లాట్‌ఫారమ్ కోసం సేఫ్ హ్యాండ్లింగ్
  if (Platform.OS === 'web') {
    return (
      <View style={{ width: size, height: size + 45, backgroundColor: 'transparent', overflow: 'hidden' }}>
        <iframe
          srcDoc={htmlContent}
          style={{ width: '100%', height: '100%', border: 'none', backgroundColor: 'transparent' }}
          title="Water Gauge"
        />
      </View>
    );
  }

  return (
    <View style={{ width: size, height: size + 45, backgroundColor: 'transparent', overflow: 'hidden' }}>
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
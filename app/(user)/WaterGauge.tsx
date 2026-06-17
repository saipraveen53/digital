// components/WaterGauge.tsx
import React, { useEffect, useRef } from "react";
import { Platform, View } from "react-native";

let WebView: any = null;
if (Platform.OS !== "web") {
  WebView = require("react-native-webview").WebView;
}

interface WaterGaugeProps {
  percentage: number;
  size?: number;
  animated?: boolean;
}

export function WaterGauge({
  percentage,
  size = 220,
  animated = true,
}: WaterGaugeProps) {
  const webViewRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const containerWidth = size * 1.4;
  const containerHeight = size * 1.35;

  useEffect(() => {
    if (Platform.OS === "web") {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: "UPDATE_PCT", value: percentage },
          "*",
        );
      }
    } else {
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          if (window.updatePercentage) {
            window.updatePercentage(${percentage});
          }
          true;
        `);
      }
    }
  }, [percentage]);

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
          align-items: center;
          justify-content: center;
          position: relative;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <canvas id="gauge"></canvas>
      </div>

      <script>
        function getColors(pct) {
          if (pct >= 75) return { water: "#0E9F9D", wave: "#0b7d7b" }; 
          if (pct >= 45) return { water: "#F59E0B", wave: "#D97706" }; 
          return { water: "#EF4444", wave: "#DC2626" }; 
        }

        const canvas = document.getElementById("gauge");
        const ctx = canvas.getContext("2d");
        
        let targetPercentage = ${percentage};
        let currentPct = 0;
        const totalW = ${containerWidth};
        const totalH = ${containerHeight};
        const animated = ${animated};
        let phase = 0;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = totalW * dpr;
        canvas.height = totalH * dpr;
        canvas.style.width = totalW + 'px';
        canvas.style.height = totalH + 'px';
        ctx.scale(dpr, dpr);

        const tankW = totalW * 0.52;
        const tankH = totalH * 0.85;
        const tankX = 20;
        const tankY = (totalH - tankH) / 2;
        const tankRadius = tankW * 0.38;

        window.updatePercentage = function(newPct) {
          targetPercentage = newPct;
        };

        window.addEventListener("message", function(event) {
          if (event.data && (event.data.type === "UPDATE_PCT" || event.type === "UPDATE_PCT")) {
            window.updatePercentage(event.data.value);
          }
        });

        function drawCapsule(c, x, y, width, height, radius) {
          c.beginPath();
          c.moveTo(x + radius, y);
          c.lineTo(x + width - radius, y);
          c.arcTo(x + width, y, x + width, y + radius, radius);
          c.lineTo(x + width, y + height - radius);
          c.arcTo(x + width, y + height, x + width - radius, y + height, radius);
          c.lineTo(x + radius, y + height);
          c.arcTo(x, y + height, x, y + height - radius, radius);
          c.lineTo(x, y + radius);
          c.arcTo(x, y, x + radius, y, radius);
          c.closePath();
        }

        function draw() {
          ctx.clearRect(0, 0, totalW, totalH);

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
          const waterY = (tankY + tankH) - (fillRatio * tankH);

          // 1. CAPSULE BACKGROUND TANK
          ctx.save();
          drawCapsule(ctx, tankX, tankY, tankW, tankH, tankRadius);
          ctx.fillStyle = "#FFFFFF";
          ctx.fill();
          ctx.restore();

          // 2. RENDERING CLIPPED WATER WAVES LOGIC
          ctx.save();
          drawCapsule(ctx, tankX, tankY, tankW, tankH, tankRadius);
          ctx.clip();

          if (currentPct > 0) {
            ctx.beginPath();
            ctx.moveTo(tankX, waterY);
            let waveAmp = tankW * 0.04;
            let waveLen = tankW * 0.85;
            for (let x = tankX; x <= tankX + tankW; x += 1) {
              let relX = x - tankX;
              let y = waterY + Math.sin((relX / waveLen) * Math.PI * 2 + phase) * waveAmp;
              ctx.lineTo(x, y);
            }
            ctx.lineTo(tankX + tankW, tankY + tankH);
            ctx.lineTo(tankX, tankY + tankH);
            ctx.closePath();
            ctx.fillStyle = col.water + "40";
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(tankX, waterY);
            for (let x = tankX; x <= tankX + tankW; x += 1) {
              let relX = x - tankX;
              let y = waterY + Math.sin((relX / (waveLen * 0.9)) * Math.PI * 2 - phase * 1.1) * waveAmp;
              ctx.lineTo(x, y);
            }
            ctx.lineTo(tankX + tankW, tankY + tankH);
            ctx.lineTo(tankX, tankY + tankH);
            ctx.closePath();

            const waterGrad = ctx.createLinearGradient(tankX, waterY, tankX, tankY + tankH);
            waterGrad.addColorStop(0, col.water);
            waterGrad.addColorStop(1, col.wave);
            ctx.fillStyle = waterGrad;
            ctx.fill();
          }
          ctx.restore();

          // 3. CENTER HIGHLIGHT METRICS (Arrow Symbol)
          ctx.save();
          ctx.beginPath();
          const arrowX = tankX + tankW / 2;
          const arrowY = tankY + tankH * 0.44;
          const arrowW = tankW * 0.28;
          
          ctx.moveTo(arrowX, arrowY - arrowW * 0.6);
          ctx.lineTo(arrowX - arrowW * 0.5, arrowY);
          ctx.lineTo(arrowX - arrowW * 0.2, arrowY);
          ctx.lineTo(arrowX - arrowW * 0.2, arrowY + arrowW * 0.6);
          ctx.lineTo(arrowX + arrowW * 0.2, arrowY + arrowW * 0.6);
          ctx.lineTo(arrowX + arrowW * 0.2, arrowY);
          ctx.lineTo(arrowX + arrowW * 0.5, arrowY);
          ctx.closePath();
          
          // Dynamic arrow color calculation relative to wave water intersection thresholds
          const midPointY = tankY + tankH * 0.22;
          ctx.fillStyle = waterY < arrowY ? "rgba(255, 255, 255, 0.35)" : col.water + "25";
          ctx.fill();
          ctx.restore();

          // FIX: Smart contrast adaptive text visibility logic execution block
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = "900 " + (tankW * 0.28) + "px 'DM Sans', sans-serif";
          
          // If water line level passes below text element rendering threshold, make text readable dark gray
          ctx.fillStyle = waterY < (midPointY + 15) ? "#FFFFFF" : "#1E293B"; 
          ctx.fillText(Math.round(currentPct) + "%", tankX + tankW / 2, midPointY);

          // 4. RIGHT SIDE DYNAMIC SCALE MARKINGS
          const rulerX = tankX + tankW + 24;
          const rulerTotalLines = 11; 
          ctx.lineWidth = 2;
          
          const activeLineIndex = Math.round((currentPct / 100) * (rulerTotalLines - 1));

          for (let i = 0; i < rulerTotalLines; i++) {
            const lineRatio = i / (rulerTotalLines - 1);
            const lineY = (tankY + tankH) - (lineRatio * tankH);
            const isMajor = i === 0 || i === 5 || i === 10;
            const lineLength = isMajor ? 14 : 7;

            const isCurrentlyActive = i === activeLineIndex;

            ctx.beginPath();
            ctx.moveTo(rulerX, lineY);
            ctx.lineTo(rulerX + (isCurrentlyActive ? 16 : lineLength), lineY);
            
            ctx.strokeStyle = isCurrentlyActive ? "#1E293B" : (isMajor ? "#64748B" : "#CBD5E1");
            if (isCurrentlyActive) {
              ctx.lineWidth = 3;
            }
            ctx.stroke();
            ctx.lineWidth = 2; 

            if (isCurrentlyActive) {
              ctx.fillStyle = "#1E293B";
              ctx.font = "bold 13px 'DM Sans', sans-serif";
              ctx.textAlign = "left";
              ctx.textBaseline = "middle";
              ctx.fillText(Math.round(currentPct) + "%", rulerX + 24, lineY);
            }
          }

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

  return (
    <View
      style={{
        width: containerWidth,
        height: containerHeight,
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {Platform.OS === "web" ? (
        <iframe
          ref={iframeRef}
          srcDoc={htmlContent}
          style={{
            width: containerWidth,
            height: containerHeight,
            border: "none",
            backgroundColor: "transparent",
          }}
          scrolling="no"
        />
      ) : (
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html: htmlContent }}
          style={{
            width: containerWidth,
            height: containerHeight,
            backgroundColor: "transparent",
          }}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          androidLayerType="hardware"
        />
      )}
    </View>
  );
}

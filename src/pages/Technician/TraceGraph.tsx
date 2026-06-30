// src/pages/Technician/TraceGraph.tsx
import React, { useEffect, useRef } from "react";
import type { TickSample } from "./timingMath";

interface TraceGraphProps {
  ticks: TickSample[];
  width?: number;
  height?: number;
  windowSizeSeconds?: number; // How many seconds of history to show on screen
}

export const TraceGraph: React.FC<TraceGraphProps> = ({
  ticks,
  width = 500,
  height = 200,
  windowSizeSeconds = 10, // Shows a clean 10-second rolling window
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Draw Background
    ctx.fillStyle = "#020617"; // Slate 950 match
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Subtle Reference Grid Lines
    ctx.strokeStyle = "#1e293b"; // Slate 800
    ctx.lineWidth = 1;
    for (let y = 20; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (ticks.length === 0) return;

    // 3. Establish a Rolling Window Viewport
    const latestTime = ticks[ticks.length - 1].t;
    const tMin = Math.max(0, latestTime - windowSizeSeconds);
    const tMax = tMin + windowSizeSeconds;
    const timeSpan = windowSizeSeconds;

    // Filter down to only render what's actually visible inside our time window
    const visibleTicks = ticks.filter((t) => t.t >= tMin && t.t <= tMax);

    const centerY = height / 2;
    
    /**
     * Standard watch beat periods range from ~0.1 to ~0.25 seconds.
     * We calculate deviation against a fixed center baseline (0.125s to 0.2s)
     * so that if the watch runs fast, the slope tilts visually UP, and if slow, DOWN.
     */
    const assumedBasePeriod = 3600 / 18000; // 0.2s center baseline target
    const scaleY = height * 4; // Generates a balanced vertical displacement spacing

    visibleTicks.forEach((tick) => {
      // Linear mapping of X timeline coordinates 
      const x = ((tick.t - tMin) / timeSpan) * width;

      // Calculate vertical offset relative to baseline
      const deviation = tick.interval - assumedBasePeriod;
      
      // Separate ticks and tocks vertically by a tiny offset to easily read beat error
      const sideOffset = tick.side === "tick" ? -8 : 8;
      const y = centerY + (deviation * scaleY) + sideOffset;

      // Skip rendering if it falls out of boundary limits
      if (y < 0 || y > height) return;

      // Alternate color tracking channels: Neon Green vs Neon Cyan
      ctx.fillStyle = tick.side === "tick" ? "#22c55e" : "#06b6d4";

      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [ticks, width, height, windowSizeSeconds]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} width={width} height={height} className="w-full block rounded-lg" />
      {/* Small UI Legend Badge */}
      <div className="absolute bottom-2 right-2 flex gap-3 bg-slate-900/80 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-800">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>Tick</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block"></span>Tock</span>
      </div>
    </div>
  );
};
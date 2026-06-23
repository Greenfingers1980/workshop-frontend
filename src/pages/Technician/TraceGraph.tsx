// src/pages/Technician/TraceGraph.tsx
import React, { useEffect, useRef } from "react";
import type { TickSample } from "./timingMath";

interface TraceGraphProps {
  ticks: TickSample[];
  width?: number;
  height?: number;
}

export const TraceGraph: React.FC<TraceGraphProps> = ({
  ticks,
  width = 400,
  height = 160,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    for (let y = height / 2; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (ticks.length === 0) return;

    const tMin = ticks[0].t;
    const tMax = ticks[ticks.length - 1].t;
    const span = tMax - tMin || 1;

    const centerY = height / 2;
    const scaleY = 800;

    ctx.fillStyle = "#0f0";

    ticks.forEach((tick) => {
      const x = ((tick.t - tMin) / span) * width;
      const dy = (tick.interval - span / ticks.length) * scaleY;
      const y = centerY + dy;

      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [ticks, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};


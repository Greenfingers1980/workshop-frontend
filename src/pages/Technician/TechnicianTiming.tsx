// src/pages/Technician/TechnicianTiming.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  computeTimingStats,
  type TimingStats,
  type TickSample,
} from "./timingMath";
import { TraceGraph } from "./TraceGraph";

interface TechnicianTimingProps {
  onSavePosition: (position: string, stats: TimingStats) => void;
}

const POSITIONS = [
  "Dial Up",
  "Dial Down",
  "Crown Up",
  "Crown Down",
  "Crown Left",
  "Crown Right",
];

export const TechnicianTiming: React.FC<TechnicianTimingProps> = ({
  onSavePosition,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [position, setPosition] = useState("Dial Up");
  const [stats, setStats] = useState<TimingStats | null>(null);
  const [ticks, setTicks] = useState<TickSample[]>([]);
  const [liftAngle, setLiftAngle] = useState(52);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const lastTickTimeRef = useRef<number | null>(null);
  const lastSideRef = useRef<"tick" | "tock">("tick");
  const tickIntervalsRef = useRef<number[]>([]);
  const tockIntervalsRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      stopEngine();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEngine = async () => {
    if (isRunning) return;
    setIsRunning(true);

    tickIntervalsRef.current = [];
    tockIntervalsRef.current = [];
    setTicks([]);
    setStats(null);

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;

    const source = audioCtx.createMediaStreamSource(stream);
    sourceRef.current = source;

    const processor = audioCtx.createScriptProcessor(2048, 1, 1);
    processorRef.current = processor;

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;

    source.connect(analyser);
    analyser.connect(processor);
    processor.connect(audioCtx.destination);

    const buffer = new Float32Array(analyser.fftSize);
    startTimeRef.current = audioCtx.currentTime;
    lastTickTimeRef.current = null;

    processor.onaudioprocess = () => {
      analyser.getFloatTimeDomainData(buffer);
      detectTicks(buffer, audioCtx.currentTime);
    };
  };

  const stopEngine = () => {
    setIsRunning(false);

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }

    const finalStats = computeTimingStats(
      tickIntervalsRef.current,
      tockIntervalsRef.current,
      liftAngle
    );
    setStats(finalStats);
  };

  const detectTicks = (buffer: Float32Array, now: number) => {
    const threshold = 0.25;
    let lastSample = 0;
    const sr = audioCtxRef.current?.sampleRate || 44100;

    for (let i = 0; i < buffer.length; i++) {
      const s = buffer[i];
      if (lastSample < threshold && s >= threshold) {
        const t = now - (buffer.length - i) / sr;
        registerTick(t);
      }
      lastSample = s;
    }
  };

  const registerTick = (t: number) => {
    const last = lastTickTimeRef.current;
    const side = lastSideRef.current === "tick" ? "tock" : "tick";
    lastSideRef.current = side;

    if (last != null) {
      const interval = t - last;
      if (side === "tick") {
        tickIntervalsRef.current.push(interval);
      } else {
        tockIntervalsRef.current.push(interval);
      }

      const relT = t - startTimeRef.current;
      setTicks((prev) => [
        ...prev,
        { t: relT, side, interval },
      ]);

      const s = computeTimingStats(
        tickIntervalsRef.current,
        tockIntervalsRef.current,
        liftAngle
      );
      setStats(s);
    }

    lastTickTimeRef.current = t;
  };

  const handleSave = () => {
    if (!stats) return;
    onSavePosition(position, stats);
  };

  return (
    <div className="tech-panel tech-panel--timing">
      <h3>Timing (Weishi)</h3>

      <div className="tech-row tech-row--stats">
        <div>
          <span className="tech-label">Position</span>
          <br />
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          >
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="tech-label">Lift Angle</span>
          <br />
          <input
            type="number"
            value={liftAngle}
            onChange={(e) =>
              setLiftAngle(Number(e.target.value) || 52)
            }
            style={{ width: "60px" }}
          />{" "}
          °
        </div>

        <div>
          <span className="tech-label">Rate</span>
          <br />
          <strong>
            {stats
              ? `${stats.rateSecondsPerDay.toFixed(1)} s/day`
              : "—"}
          </strong>
        </div>

        <div>
          <span className="tech-label">Beat Error</span>
          <br />
          <strong>
            {stats ? `${stats.beatErrorMs.toFixed(2)} ms` : "—"}
          </strong>
        </div>

        <div>
          <span className="tech-label">Amplitude</span>
          <br />
          <strong>
            {stats ? `${stats.amplitudeDeg.toFixed(0)}°` : "—"}
          </strong>
        </div>

        <div>
          <span className="tech-label">BPH</span>
          <br />
          <strong>{stats ? stats.bph : "—"}</strong>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <TraceGraph ticks={ticks} />
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        {!isRunning ? (
          <button onClick={startEngine}>Start</button>
        ) : (
          <button onClick={stopEngine}>Stop</button>
        )}
        <button onClick={handleSave} disabled={!stats}>
          Save Position
        </button>
      </div>
    </div>
  );
};

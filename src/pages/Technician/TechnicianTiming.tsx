// src/pages/Technician/TechnicianTiming.tsx
import React, { useEffect, useRef, useState } from "react";
import { Play, Square, Save, Activity, ShieldAlert } from "lucide-react";
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
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null); // Track the active stream
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
    setAudioError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false, // Don't filter out sharp watch escapement clicks
          noiseSuppression: false, // Don't mute the high frequency click/tock sounds
          autoGainControl: false,  // Don't modify amplitude gains dynamically
        },
        video: false,
      });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;

      // 2048 buffer length at 44.1kHz is ~46ms of audio data per event handler frame
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
      tickIntervalsRef.current = [];
      tockIntervalsRef.current = [];
      
      setTicks([]);
      setStats(null);
      setIsRunning(true);

      processor.onaudioprocess = () => {
        analyser.getFloatTimeDomainData(buffer);
        detectTicks(buffer, audioCtx.currentTime);
      };
    } catch (err: any) {
      console.error("Microphone hardware access denied or unavailable", err);
      setAudioError("Microphone hardware access denied or unavailable.");
      setIsRunning(false);
    }
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
      if (audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
      }
      audioCtxRef.current = null;
    }
    // CRITICAL FIX: Explicitly shut off hardware stream pins to kill the recording indicator
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
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
      
      // Debounce false-triggers (watches can't cycle faster than ~10 ticks per second)
      if (interval < 0.08) return; 

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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-md">
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold tracking-wide">Acoustic Timing Analysis (Weishi)</h3>
        </div>
        {isRunning && (
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
        )}
      </div>

      {audioError && (
        <div className="mb-4 bg-rose-950/40 border border-rose-900/60 rounded-lg p-3 flex items-center gap-2 text-xs text-rose-300">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          {audioError}
        </div>
      )}

      {/* Control Strip Layout */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-850 mb-5">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Position</label>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-sm font-medium text-slate-200 focus:outline-none focus:border-sky-500"
          >
            {POSITIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Lift Angle</label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={liftAngle}
              onChange={(e) => setLiftAngle(Number(e.target.value) || 52)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-sm font-medium text-slate-200 focus:outline-none focus:border-sky-500 text-center"
            />
            <span className="text-sm text-slate-400">°</span>
          </div>
        </div>

        <div className="border-l border-slate-850 pl-2">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Rate</label>
          <span className={`text-base font-bold font-mono ${stats && stats.rateSecondsPerDay > 10 ? 'text-amber-400' : 'text-slate-200'}`}>
            {stats ? `${stats.rateSecondsPerDay.toFixed(1)} s/d` : "—"}
          </span>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Beat Error</label>
          <span className="text-base font-bold font-mono text-slate-200">
            {stats ? `${stats.beatErrorMs.toFixed(2)} ms` : "—"}
          </span>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Amplitude</label>
          <span className="text-base font-bold font-mono text-sky-400">
            {stats ? `${stats.amplitudeDeg.toFixed(0)}°` : "—"}
          </span>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">BPH</label>
          <span className="text-base font-bold font-mono text-emerald-400">
            {stats ? stats.bph : "—"}
          </span>
        </div>
      </div>

      {/* Waveform/Trace Visualization Area */}
      <div className="bg-slate-950 rounded-xl border border-slate-850 p-2 overflow-hidden shadow-inner">
        <TraceGraph ticks={ticks} />
      </div>

      {/* Bottom Actions Row */}
      <div className="mt-5 flex gap-3">
        {!isRunning ? (
          <button
            type="button"
            onClick={startEngine}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm py-2 px-4 rounded-lg transition"
          >
            <Play className="w-4 h-4 fill-current" /> Start Telemetry
          </button>
        ) : (
          <button
            type="button"
            onClick={stopEngine}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm py-2 px-4 rounded-lg transition"
          >
            <Square className="w-4 h-4 fill-current" /> Stop Listening
          </button>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={!stats || isRunning}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium text-sm py-2 px-4 rounded-lg transition ml-auto"
        >
          <Save className="w-4 h-4" /> Save Position Record
        </button>
      </div>
    </div>
  );
};
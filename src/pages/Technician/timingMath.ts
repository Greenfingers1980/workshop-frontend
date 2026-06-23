// src/pages/Technician/timingMath.ts

export type BeatRatePreset =
  | 14400
  | 16000
  | 16200
  | 18000
  | 19800
  | 21600
  | 25200
  | 28800
  | 36000;

export interface TimingStats {
  rateSecondsPerDay: number;
  beatErrorMs: number;
  amplitudeDeg: number;
  bph: BeatRatePreset;
}

export interface TickSample {
  t: number;      // time in seconds from start
  side: "tick" | "tock";
  interval: number; // seconds since previous same-side tick
}

/**
 * Given an array of tick intervals (seconds), estimate BPH by comparing
 * to known beat rates.
 */
export function autoDetectBPH(intervals: number[]): BeatRatePreset {
  const presets: BeatRatePreset[] = [
    14400, 16000, 16200, 18000, 19800, 21600, 25200, 28800, 36000,
  ];

  if (intervals.length === 0) return 18000;

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const beatsPerHourEstimate = 3600 / avgInterval;

  let best: BeatRatePreset = 18000;
  let bestDiff = Infinity;

  for (const p of presets) {
    const diff = Math.abs(p - beatsPerHourEstimate);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = p;
    }
  }

  return best;
}

/**
 * Compute rate (s/day) and beat error (ms) from tick/tock intervals.
 * Very simplified model but good enough for workshop use.
 */
export function computeTimingStats(
  tickIntervals: number[],
  tockIntervals: number[],
  liftAngleDeg = 52
): TimingStats {
  const allIntervals = [...tickIntervals, ...tockIntervals];
  if (allIntervals.length < 4) {
    return {
      rateSecondsPerDay: 0,
      beatErrorMs: 0,
      amplitudeDeg: 0,
      bph: 18000,
    };
  }

  const avgTick =
    tickIntervals.reduce((a, b) => a + b, 0) /
    (tickIntervals.length || 1);
  const avgTock =
    tockIntervals.reduce((a, b) => a + b, 0) /
    (tockIntervals.length || 1);
  const avgBeat = (avgTick + avgTock) / 2;

  const bph = autoDetectBPH(allIntervals);
  const idealBeat = 3600 / bph;

  const rateSecondsPerDay =
    ((avgBeat - idealBeat) / idealBeat) * 86400;

  const beatErrorMs = Math.abs(avgTick - avgTock) * 1000;

  // crude amplitude estimate: smaller spread => higher amplitude
  const variance =
    allIntervals
      .map((x) => (x - avgBeat) * (x - avgBeat))
      .reduce((a, b) => a + b, 0) / allIntervals.length;
  const stability = Math.max(0, 1 - variance / (idealBeat * idealBeat));
  const amplitudeDeg = 180 * stability * (liftAngleDeg / 52);

  return {
    rateSecondsPerDay,
    beatErrorMs,
    amplitudeDeg,
    bph,
  };
}
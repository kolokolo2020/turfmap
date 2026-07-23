"use client";

import { Play, Pause, X, Clock } from "lucide-react";

interface TimeSliderProps {
  year: number;
  minYear: number;
  maxYear: number;
  playing: boolean;
  onYearChange: (year: number) => void;
  onTogglePlay: () => void;
  onClose: () => void;
}

export default function TimeSlider({
  year,
  minYear,
  maxYear,
  playing,
  onYearChange,
  onTogglePlay,
  onClose,
}: TimeSliderProps) {
  const pct = ((year - minYear) / (maxYear - minYear)) * 100;
  const tickCount = 5;
  const ticks = Array.from({ length: tickCount }, (_, i) =>
    Math.round(minYear + (i / (tickCount - 1)) * (maxYear - minYear))
  );

  return (
    <div
      role="group"
      aria-label="Time machine"
      className="panel-enter absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-md rounded-2xl px-4 py-3 flex items-center gap-3"
      style={{
        background: "var(--panel-glass)",
        border: "1px solid var(--chip-border)",
        backdropFilter: "blur(14px)",
      }}
    >
      <button
        onClick={onTogglePlay}
        aria-label={playing ? "Pause" : "Play through history"}
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-105"
        style={{ background: "#ef4444", color: "#fff", boxShadow: "0 2px 10px rgba(239,68,68,0.45)" }}
      >
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
      </button>

      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="label flex items-center gap-1" style={{ color: "var(--fg2)" }}>
            <Clock className="w-3 h-3" />
            Time Machine
          </span>
          <span className="text-xs font-black tabular-nums" style={{ color: "var(--fg)" }}>
            {year}
          </span>
        </div>
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
          aria-label="Scrub through years"
          className="time-slider-range w-full"
          style={{
            background: `linear-gradient(to right, #ef4444 ${pct}%, var(--chip-bg) ${pct}%)`,
          }}
        />
        <div className="flex items-center justify-between" aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} className="text-[9px] font-semibold tabular-nums" style={{ color: "var(--fg2)" }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={onClose}
        aria-label="Close time machine"
        className="hover-surface shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
        style={{ color: "var(--fg2)" }}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

"use client";

import { GENRE_COLORS, GENRE_LABELS, LOCATIONS } from "@/data/locations";

const GENRES = ["all", "hip-hop", "grime", "reggae", "afrobeats", "latin", "jazz", "blues"];

interface NavbarProps {
  activeGenre: string;
  onGenreChange: (genre: string) => void;
}

export default function Navbar({ activeGenre, onGenreChange }: NavbarProps) {
  const visibleCount =
    activeGenre === "all"
      ? LOCATIONS.length
      : LOCATIONS.filter((l) => l.genre === activeGenre).length;

  return (
    <header
      className="absolute top-0 inset-x-0 z-20 flex items-center justify-between gap-4 px-5 h-16"
      style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)" }}
    >
      {/* Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div
          className="w-7 h-7 rounded-sm flex items-center justify-center font-black text-sm"
          style={{
            background: "linear-gradient(135deg, #ef4444, #f97316)",
            color: "#0a0a0a",
            boxShadow: "0 0 14px rgba(239,68,68,0.4)",
          }}
        >
          T
        </div>
        <div className="leading-tight">
          <span
            className="font-black text-lg tracking-tighter select-none block"
            style={{ color: "white", letterSpacing: "-0.04em" }}
          >
            TURF
          </span>
          <span className="label block -mt-0.5" style={{ color: "var(--fg2)", letterSpacing: "0.1em" }}>
            music mapped
          </span>
        </div>
      </div>

      {/* Genre filter */}
      <div
        className="hidden md:flex items-center gap-1 px-1.5 py-1.5 rounded-full overflow-x-auto"
        style={{ background: "rgba(20,20,20,0.7)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(10px)" }}
      >
        {GENRES.map((key) => {
          const isActive = activeGenre === key;
          const color = key === "all" ? "#fff" : GENRE_COLORS[key];
          const label = key === "all" ? "All" : GENRE_LABELS[key];
          return (
            <button
              key={key}
              onClick={() => onGenreChange(key)}
              className="label px-3 py-1.5 rounded-full transition-all whitespace-nowrap flex items-center gap-1.5"
              style={
                isActive
                  ? { background: key === "all" ? "white" : color, color: key === "all" ? "#0a0a0a" : "#0a0a0a" }
                  : { color: "var(--fg2)" }
              }
            >
              {key !== "all" && (
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: isActive ? "#0a0a0a" : color }}
                />
              )}
              {label}
            </button>
          );
        })}
      </div>

      {/* Location count */}
      <div
        className="label flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full"
        style={{ background: "rgba(20,20,20,0.7)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--fg2)" }}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{
            background: activeGenre === "all" ? "#ef4444" : GENRE_COLORS[activeGenre],
            boxShadow: `0 0 6px ${activeGenre === "all" ? "#ef4444" : GENRE_COLORS[activeGenre]}`,
          }}
        />
        {visibleCount} location{visibleCount !== 1 ? "s" : ""}
      </div>
    </header>
  );
}

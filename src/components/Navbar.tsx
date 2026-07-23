"use client";

import { useState } from "react";
import { Info, Sun, Moon } from "lucide-react";
import { GENRE_COLORS, GENRE_LABELS, LOCATIONS } from "@/data/locations";
import type { Theme } from "@/hooks/useTheme";
import AboutModal from "./AboutModal";

const GENRES = [
  "all",
  "hip-hop",
  "grime",
  "reggae",
  "afrobeats",
  "latin",
  "jazz",
  "blues",
  "country",
  "k-pop",
  "edm",
  "rock",
  "soul",
  "reggaeton",
  "music-videos",
];

interface NavbarProps {
  activeGenre: string;
  onGenreChange: (genre: string) => void;
  theme: Theme;
  onThemeToggle: () => void;
}

interface GenreChipsProps {
  activeGenre: string;
  onGenreChange: (genre: string) => void;
  className?: string;
}

function GenreChips({ activeGenre, onGenreChange, className = "" }: GenreChipsProps) {
  return (
    <div
      className={`flex items-center gap-1 px-1.5 py-1.5 rounded-full overflow-x-auto ${className}`}
      style={{ background: "var(--chip-bg)", border: "1px solid var(--chip-border)", backdropFilter: "blur(10px)" }}
    >
      {GENRES.map((key) => {
        const isActive = activeGenre === key;
        const color = key === "all" ? "var(--chip-active-bg)" : GENRE_COLORS[key];
        const label = key === "all" ? "All" : GENRE_LABELS[key];
        return (
          <button
            key={key}
            onClick={() => onGenreChange(key)}
            aria-pressed={isActive}
            className="label px-3 py-1.5 rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0"
            style={
              isActive
                ? { background: color, color: key === "all" ? "var(--chip-active-fg)" : "#0a0a0a" }
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
  );
}

export default function Navbar({ activeGenre, onGenreChange, theme, onThemeToggle }: NavbarProps) {
  const [aboutOpen, setAboutOpen] = useState(false);
  const visibleCount =
    activeGenre === "all"
      ? LOCATIONS.length
      : LOCATIONS.filter((l) => l.genre === activeGenre).length;

  return (
    <header
      className="absolute top-0 inset-x-0 z-20 flex flex-col gap-2.5 px-5 pt-4 pb-2.5 md:h-16 md:flex-row md:items-center md:justify-between md:gap-4 md:py-0"
      style={{ background: "linear-gradient(to bottom, var(--header-scrim), transparent)" }}
    >
      <div className="flex items-center justify-between gap-4">
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
              style={{ color: "var(--fg)", letterSpacing: "-0.04em" }}
            >
              TURF
            </span>
            <span className="label block -mt-0.5" style={{ color: "var(--fg2)", letterSpacing: "0.1em" }}>
              music mapped
            </span>
          </div>
          <button
            onClick={() => setAboutOpen(true)}
            aria-label="About TURF"
            className="hover-surface w-6 h-6 flex items-center justify-center rounded-full transition-colors shrink-0"
            style={{ color: "var(--fg2)" }}
          >
            <Info className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onThemeToggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="hover-surface w-6 h-6 flex items-center justify-center rounded-full transition-colors shrink-0"
            style={{ color: "var(--fg2)" }}
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Location count — desktop only here; shown inline on mobile's second row */}
        <div
          className="label hidden md:flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full"
          style={{ background: "var(--chip-bg)", border: "1px solid var(--chip-border)", color: "var(--fg2)" }}
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
      </div>

      {/* Desktop genre filter — centered in the row */}
      <GenreChips activeGenre={activeGenre} onGenreChange={onGenreChange} className="hidden md:flex" />

      {/* Mobile genre filter — its own row, full width, scrollable */}
      <div className="flex md:hidden items-center gap-2">
        <GenreChips activeGenre={activeGenre} onGenreChange={onGenreChange} className="flex-1 min-w-0" />
        <div
          className="label flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-full"
          style={{ background: "var(--chip-bg)", border: "1px solid var(--chip-border)", color: "var(--fg2)" }}
        >
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{
              background: activeGenre === "all" ? "#ef4444" : GENRE_COLORS[activeGenre],
              boxShadow: `0 0 6px ${activeGenre === "all" ? "#ef4444" : GENRE_COLORS[activeGenre]}`,
            }}
          />
          {visibleCount}
        </div>
      </div>

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </header>
  );
}

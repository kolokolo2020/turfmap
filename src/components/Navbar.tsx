"use client";

import { useState } from "react";
import { GENRE_COLORS } from "@/data/locations";

const GENRES = [
  { key: "all",     label: "All" },
  { key: "hip-hop", label: "Hip-Hop" },
  { key: "grime",   label: "Grime" },
  { key: "reggae",  label: "Reggae" },
  { key: "jazz",    label: "Jazz" },
];

export default function Navbar() {
  const [active, setActive] = useState("all");

  return (
    <header
      className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 h-14"
      style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)" }}
    >
      {/* Wordmark */}
      <div className="flex items-center gap-3">
        <span
          className="font-black text-xl tracking-tighter select-none"
          style={{ color: "white", letterSpacing: "-0.04em" }}
        >
          TURF
        </span>
        <span className="label" style={{ color: "var(--fg2)" }}>
          music mapped
        </span>
      </div>

      {/* Genre filter */}
      <div className="hidden sm:flex items-center gap-1">
        {GENRES.map(({ key, label }) => {
          const isActive = active === key;
          const color = key === "all" ? "#fff" : GENRE_COLORS[key];
          return (
            <button
              key={key}
              onClick={() => setActive(key)}
              className="label px-3 py-1.5 rounded-full transition-all"
              style={
                isActive
                  ? { background: key === "all" ? "white" : `${color}22`, color, border: `1px solid ${key === "all" ? "white" : color}` }
                  : { color: "var(--fg2)", border: "1px solid rgba(255,255,255,0.1)" }
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Location count */}
      <div className="label flex items-center gap-1.5" style={{ color: "var(--fg2)" }}>
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: "#ef4444", boxShadow: "0 0 6px #ef4444" }}
        />
        19 locations
      </div>
    </header>
  );
}

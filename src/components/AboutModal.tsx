"use client";

import { X } from "lucide-react";
import { GENRE_COLORS, GENRE_LABELS, LOCATIONS } from "@/data/locations";

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AboutModal({ open, onClose }: AboutModalProps) {
  if (!open) return null;

  const genreKeys = Object.keys(GENRE_LABELS).filter((g) =>
    LOCATIONS.some((l) => l.genre === g)
  );

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(5,5,8,0.55)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="About TURF"
        className="panel-enter fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl overflow-hidden"
        style={{
          background: "rgba(13,12,11,0.92)",
          backdropFilter: "blur(28px) saturate(150%)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-sm flex items-center justify-center font-black text-sm shrink-0"
                style={{
                  background: "linear-gradient(135deg, #ef4444, #f97316)",
                  color: "#0a0a0a",
                }}
              >
                T
              </div>
              <h2 className="font-black text-lg text-white tracking-tight">TURF</h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
              style={{ color: "var(--fg2)" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.75)" }}>
            {`TURF maps ${LOCATIONS.length} neighborhoods, blocks, and streets around the world to the genres and artists that were born there — from Clarksdale’s Delta blues to Kingston’s reggae to Lagos’ afrobeats. Click a pin to explore its artists, discography, and signature tracks.`}
          </p>

          <p className="label mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Genres on the map</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
            {genreKeys.map((g) => (
              <div key={g} className="flex items-center gap-1.5">
                <span
                  className="inline-block w-2 h-2 rounded-full shrink-0"
                  style={{ background: GENRE_COLORS[g], boxShadow: `0 0 6px ${GENRE_COLORS[g]}` }}
                />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
                  {GENRE_LABELS[g]}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs leading-relaxed" style={{ color: "var(--fg3)" }}>
            Maps by Mapbox. Artist photos via Wikipedia. Have a location to suggest? This is a
            work in progress — more cities and genres are on the way.
          </p>
        </div>
      </div>
    </>
  );
}

"use client";

import Image from "next/image";
import { X, MapPin } from "lucide-react";
import { GENRE_COLORS, GENRE_LABELS } from "@/data/locations";
import { Location } from "@/lib/types";

interface LocationListProps {
  open: boolean;
  locations: Location[];
  onSelect: (loc: Location) => void;
  onClose: () => void;
}

export default function LocationList({ open, locations, onSelect, onClose }: LocationListProps) {
  if (!open) return null;

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
        aria-label="All locations"
        className="panel-enter fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] sm:max-h-[75dvh] sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl flex flex-col rounded-t-xl sm:rounded-xl overflow-hidden"
        style={{
          background: "rgba(13,12,11,0.92)",
          backdropFilter: "blur(28px) saturate(150%)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          className="flex items-center justify-between gap-3 px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div>
            <h2 className="font-black text-lg text-white tracking-tight leading-none">All Locations</h2>
            <p className="label mt-1" style={{ color: "var(--fg2)" }}>
              {locations.length} location{locations.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
            style={{ color: "var(--fg2)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-3">
          {locations.length === 0 ? (
            <p className="text-sm text-center py-10" style={{ color: "var(--fg3)" }}>
              No locations match this filter.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {locations.map((loc) => {
                const color = GENRE_COLORS[loc.genre] ?? "#ef4444";
                return (
                  <button
                    key={loc.id}
                    onClick={() => {
                      onSelect(loc);
                      onClose();
                    }}
                    className="group flex items-center gap-3 p-2 rounded-lg text-left transition-colors hover:bg-white/5"
                  >
                    <div className="relative w-14 h-14 rounded-md overflow-hidden shrink-0" style={{ background: "#0c0b0a" }}>
                      <Image src={loc.coverUrl} alt={loc.name} fill className="object-cover" sizes="56px" unoptimized />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{loc.name}</p>
                      <p className="text-xs truncate flex items-center gap-1" style={{ color: "var(--fg2)" }}>
                        <MapPin className="w-3 h-3 shrink-0" />
                        {loc.city}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: color }}
                        />
                        <span className="text-xs truncate" style={{ color }}>
                          {GENRE_LABELS[loc.genre] ?? loc.genre}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

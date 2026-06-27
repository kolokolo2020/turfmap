"use client";

import { Location, Artist } from "@/lib/types";
import { X, ExternalLink, MapPin } from "lucide-react";

interface ArtistPanelProps {
  location: Location | null;
  onClose: () => void;
}

function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <div
      className="flex-none w-64 rounded-sm p-4 flex flex-col gap-3"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Avatar + name row */}
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
          style={{ background: `${artist.color}22`, color: artist.color, border: `1.5px solid ${artist.color}44` }}
        >
          {artist.initials}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm text-white truncate">{artist.name}</p>
          <p className="label mt-0.5" style={{ color: "var(--fg2)" }}>{artist.genre}</p>
        </div>
      </div>

      {/* Bio */}
      <p className="text-xs leading-relaxed" style={{ color: "var(--fg2)" }}>
        {artist.bio}
      </p>

      {/* Signature track */}
      <div
        className="flex items-center justify-between p-2.5 rounded-sm"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="min-w-0 mr-2">
          <p className="label mb-0.5" style={{ color: "var(--fg2)" }}>Signature Track</p>
          <p className="text-xs font-semibold text-white truncate">{artist.signatureTrack}</p>
        </div>
        <a
          href={artist.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-sm label transition-all hover:opacity-80"
          style={{ background: "#1DB954", color: "#000" }}
          onClick={(e) => e.stopPropagation()}
        >
          ▶
        </a>
      </div>
    </div>
  );
}

export default function ArtistPanel({ location, onClose }: ArtistPanelProps) {
  if (!location) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30"
        style={{ background: "rgba(0,0,0,0.4)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="panel-enter fixed bottom-0 inset-x-0 z-40 max-h-[70dvh] flex flex-col rounded-t-xl overflow-hidden"
        style={{ background: "var(--panel)", borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full" style={{ background: "var(--fg3)" }} />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-3 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--fg2)" }} />
              <span className="label" style={{ color: "var(--fg2)" }}>
                {location.city} · {location.country} · {location.era}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">{location.name}</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--fg2)" }}>{location.fullName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-white/5 mt-0.5"
            style={{ color: "var(--fg2)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Artist cards — horizontal scroll */}
        <div className="flex gap-3 px-5 overflow-x-auto pb-4" style={{ scrollSnapType: "x mandatory" }}>
          {location.artists.map((artist) => (
            <div key={artist.id} style={{ scrollSnapAlign: "start" }}>
              <ArtistCard artist={artist} />
            </div>
          ))}
        </div>

        {/* Description */}
        <div
          className="mx-5 mb-5 p-4 rounded-sm"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p className="text-xs leading-relaxed" style={{ color: "var(--fg2)" }}>
            {location.description}
          </p>
        </div>
      </div>
    </>
  );
}

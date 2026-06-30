"use client";

import Image from "next/image";
import { Location, Artist } from "@/lib/types";
import { GENRE_LABELS } from "@/data/locations";
import { X, MapPin, Calendar, Play, Disc3 } from "lucide-react";

interface ArtistPanelProps {
  location: Location | null;
  onClose: () => void;
}

function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <div
      className="relative flex-none w-80 rounded-md overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
      style={{ border: `1px solid ${artist.color}33` }}
    >
      {/* Wallpaper background — the artist's own photo, blurred + darkened */}
      <div className="absolute inset-0" style={{ background: "#0c0b0a" }}>
        {artist.imageUrl ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${artist.imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(18px) brightness(0.45) saturate(1.1)",
              transform: "scale(1.2)",
            }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(circle at 30% 20%, ${artist.color}33, #0c0b0a 75%)` }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(165deg, ${artist.color}22 0%, rgba(0,0,0,0.55) 100%)` }}
        />
      </div>

      {/* Content */}
      <div className="relative p-4 flex flex-col gap-3">
        {/* Avatar + name row */}
        <div className="flex items-center gap-3">
          <div
            className="relative w-14 h-14 rounded-full shrink-0"
            style={{
              background: `conic-gradient(from 180deg, ${artist.color}, ${artist.color}55, ${artist.color})`,
              padding: "2px",
            }}
          >
            {artist.imageUrl ? (
              <div className="relative w-full h-full rounded-full overflow-hidden" style={{ background: "#0c0b0a" }}>
                <Image
                  src={artist.imageUrl}
                  alt={artist.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                  unoptimized
                />
              </div>
            ) : (
              <div
                className="w-full h-full rounded-full flex items-center justify-center font-black text-sm"
                style={{ background: "#0c0b0a", color: artist.color }}
              >
                {artist.initials}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-base text-white truncate leading-tight" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
              {artist.name}
            </p>
            <p className="label mt-1" style={{ color: artist.color }}>
              {GENRE_LABELS[artist.genre] ?? artist.genre}
            </p>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.82)" }}>
          {artist.bio}
        </p>

        {/* Discography */}
        {artist.albums && artist.albums.length > 0 && (
          <div>
            <p className="label flex items-center gap-1.5 mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
              <Disc3 className="w-3 h-3" />
              Notable Albums
            </p>
            <div className="flex flex-wrap gap-1.5">
              {artist.albums.map((album) => (
                <span
                  key={album}
                  className="text-xs px-2 py-1 rounded-sm"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {album}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Signature track */}
        <a
          href={artist.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between p-2.5 rounded-sm transition-colors"
          style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div className="min-w-0 mr-2">
            <p className="label mb-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>Signature Track</p>
            <p className="text-xs font-semibold text-white truncate">{artist.signatureTrack}</p>
          </div>
          <span
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-transform group-hover:scale-110"
            style={{ background: "#1DB954" }}
          >
            <Play className="w-3 h-3 fill-black text-black ml-0.5" />
          </span>
        </a>
      </div>
    </div>
  );
}

export default function ArtistPanel({ location, onClose }: ArtistPanelProps) {
  if (!location) return null;

  return (
    <>
      {/* Backdrop — fully blurred so nothing behind it (map labels, etc.)
          is ever legible, regardless of how tall the panel ends up being. */}
      <div
        className="fixed inset-0 z-30"
        style={{ background: "rgba(5,5,8,0.4)", backdropFilter: "blur(10px)" }}
        onClick={onClose}
      />

      {/* Panel — frosted glass */}
      <div
        className="panel-enter fixed bottom-0 inset-x-0 z-40 max-h-[80dvh] flex flex-col rounded-t-xl overflow-hidden"
        style={{
          background: "rgba(13,12,11,0.82)",
          backdropFilter: "blur(28px) saturate(150%)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderBottom: "none",
        }}
      >
        {/* Cover photo header */}
        <div className="relative h-36 sm:h-44 shrink-0">
          <Image
            src={location.coverUrl}
            alt={location.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(13,12,11,0.95) 0%, rgba(13,12,11,0.5) 55%, rgba(13,12,11,0.1) 100%)" }}
          />

          {/* Drag handle */}
          <div className="absolute top-3 inset-x-0 flex justify-center">
            <div className="w-9 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.4)" }} />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-black/40"
            style={{ background: "rgba(0,0,0,0.4)", color: "white", backdropFilter: "blur(6px)" }}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Title block over the photo */}
          <div className="absolute bottom-0 inset-x-0 px-5 pb-4">
            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
              <span className="label flex items-center gap-1" style={{ color: "rgba(255,255,255,0.75)" }}>
                <MapPin className="w-3 h-3" />
                {location.city} · {location.country}
              </span>
              <span className="label flex items-center gap-1" style={{ color: "rgba(255,255,255,0.75)" }}>
                <Calendar className="w-3 h-3" />
                {location.era}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
              {location.name}
            </h2>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>{location.fullName}</p>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto">
          {/* Artist cards */}
          <div className="flex gap-3 px-5 pt-4 overflow-x-auto pb-1" style={{ scrollSnapType: "x mandatory" }}>
            {location.artists.map((artist) => (
              <div key={artist.id} style={{ scrollSnapAlign: "start" }}>
                <ArtistCard artist={artist} />
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="mx-5 my-5 pl-4" style={{ borderLeft: "2px solid rgba(255,255,255,0.15)" }}>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
              {location.description}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

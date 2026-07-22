"use client";

import { useEffect } from "react";
import { X, ExternalLink, Navigation } from "lucide-react";

interface StreetViewProps {
  open: boolean;
  lat: number;
  lng: number;
  name: string;
  onClose: () => void;
}

export default function StreetView({ open, lat, lng, name, onClose }: StreetViewProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Capture phase + stopPropagation: swallow this Escape before it also
        // reaches ArtistPanel's own listener, so it closes just this modal
        // instead of the whole panel underneath it.
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  if (!open) return null;

  // No API key required: Google's "svembed" output renders a Street View
  // panorama in a plain iframe. Coverage isn't guaranteed at every pin (some
  // are rooftops, deserts, or private land), so we always pair it with a
  // "open in Google Maps" escape hatch rather than pretending it always works.
  const embedSrc = `https://maps.google.com/maps?layer=c&cbll=${lat},${lng}&cbp=12,0,0,0,0&output=svembed`;
  const mapsUrl = `https://www.google.com/maps?layer=c&cbll=${lat},${lng}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <>
      <div
        className="fixed inset-0 z-[60]"
        style={{ background: "rgba(5,5,8,0.7)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Street View — ${name}`}
        className="panel-enter fixed inset-x-4 top-1/2 -translate-y-1/2 z-[70] max-w-3xl mx-auto rounded-xl overflow-hidden sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[90vw]"
        style={{
          background: "var(--panel)",
          border: "1px solid var(--border)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="flex items-center justify-between gap-3 px-4 py-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="min-w-0">
            <p className="label" style={{ color: "var(--fg2)" }}>Street View</p>
            <p className="text-sm font-bold truncate" style={{ color: "var(--fg)" }}>{name}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Get directions"
              aria-label="Get directions"
              className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
              style={{ color: "var(--fg2)" }}
            >
              <Navigation className="w-3.5 h-3.5" />
            </a>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in Google Maps"
              aria-label="Open in Google Maps"
              className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
              style={{ color: "var(--fg2)" }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
              style={{ color: "var(--fg2)" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative w-full" style={{ aspectRatio: "16 / 9", background: "#000" }}>
          <iframe
            src={embedSrc}
            className="absolute inset-0 w-full h-full"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            title={`Street View of ${name}`}
          />
        </div>

        <p className="px-4 py-2.5 text-xs" style={{ color: "var(--fg3)", borderTop: "1px solid var(--border)" }}>
          No imagery here? Some locations are indoors, remote, or private — try{" "}
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="underline">
            opening in Google Maps
          </a>{" "}
          directly.
        </p>
      </div>
    </>
  );
}

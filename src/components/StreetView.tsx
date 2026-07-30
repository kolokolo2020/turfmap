"use client";

import { useEffect, useRef, useState } from "react";
import { X, ExternalLink, Navigation, Loader2 } from "lucide-react";
import { loadGoogleMaps } from "@/lib/googleMapsLoader";

interface StreetViewProps {
  open: boolean;
  lat: number;
  lng: number;
  name: string;
  onClose: () => void;
}

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

// Without a key, "iframe" reproduces the original keyless svembed behavior.
// With a key, we ask the JS API for the nearest panorama restricted to
// `source: OUTDOOR` — the keyless iframe has no such restriction, which is
// why it sometimes resolves to an indoor Local Guide photosphere (e.g. inside
// a restaurant) instead of the actual street-level view of the pin.
type Status = "loading" | "panorama" | "no-coverage" | "iframe";

export default function StreetView({ open, lat, lng, name, onClose }: StreetViewProps) {
  const [status, setStatus] = useState<Status>(GOOGLE_MAPS_KEY ? "loading" : "iframe");
  const [lastKey, setLastKey] = useState(`${lat},${lng}`);
  const panoContainerRef = useRef<HTMLDivElement>(null);

  // Reset to "loading" during render (not inside the effect below) whenever a
  // different pin is opened — same pattern used elsewhere in this app — so
  // the async lookup effect only ever writes its own result, never a reset.
  const key = `${lat},${lng}`;
  if (open && GOOGLE_MAPS_KEY && key !== lastKey) {
    setLastKey(key);
    setStatus("loading");
  }

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

  useEffect(() => {
    if (!open || !GOOGLE_MAPS_KEY) return;
    let cancelled = false;

    loadGoogleMaps(GOOGLE_MAPS_KEY)
      .then((google) => {
        if (cancelled || !panoContainerRef.current) return;
        const svService = new google.maps.StreetViewService();
        svService.getPanorama(
          {
            location: { lat, lng },
            radius: 60,
            source: google.maps.StreetViewSource.OUTDOOR,
          },
          (data: { location: { pano: string } }, apiStatus: string) => {
            if (cancelled) return;
            if (apiStatus !== "OK" || !panoContainerRef.current) {
              setStatus("no-coverage");
              return;
            }
            new google.maps.StreetViewPanorama(panoContainerRef.current, {
              pano: data.location.pano,
              addressControl: false,
              showRoadLabels: false,
              motionTracking: false,
              motionTrackingControl: false,
              fullscreenControl: false,
            });
            setStatus("panorama");
          }
        );
      })
      .catch(() => {
        // Script failed to load (network issue, misconfigured key) — the
        // legacy iframe is a better fallback than a dead modal.
        if (!cancelled) setStatus("iframe");
      });

    return () => {
      cancelled = true;
    };
  }, [open, lat, lng]);

  if (!open) return null;

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
          {status === "iframe" && (
            <iframe
              src={embedSrc}
              className="absolute inset-0 w-full h-full"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              title={`Street View of ${name}`}
            />
          )}

          {status === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-white/60" />
            </div>
          )}

          {status === "no-coverage" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-center px-6" style={{ color: "rgba(255,255,255,0.6)" }}>
                No outdoor Street View imagery near this pin.
              </p>
            </div>
          )}

          {/* Always mounted so the ref exists before the panorama loads —
              hidden behind the states above until it actually has content. */}
          <div
            ref={panoContainerRef}
            className="absolute inset-0 w-full h-full"
            style={{ visibility: status === "panorama" ? "visible" : "hidden" }}
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

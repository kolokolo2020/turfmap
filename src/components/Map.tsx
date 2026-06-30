"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Shuffle, Share2, Check } from "lucide-react";
import { LOCATIONS, GENRE_COLORS } from "@/data/locations";
import { Location } from "@/lib/types";
import ArtistPanel from "./ArtistPanel";

// Get your free token at mapbox.com → account → tokens
const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

interface MapProps {
  activeGenre: string;
}

interface MarkerEntry {
  marker: mapboxgl.Marker;
  el: HTMLDivElement;
  genre: string;
}

export default function Map({ activeGenre }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<MarkerEntry[]>([]);
  const [selected, setSelected] = useState<Location | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSelect = useCallback((loc: Location, fly = true) => {
    setSelected(loc);
    if (fly) {
      mapRef.current?.flyTo({
        center: [loc.lng, loc.lat],
        zoom: 13.5,
        pitch: 45,
        duration: 1400,
        essential: true,
      });
    }
    // Deep link so a location can be shared directly
    const url = new URL(window.location.href);
    url.searchParams.set("loc", loc.id);
    window.history.replaceState({}, "", url);
  }, []);

  const handleClose = useCallback(() => {
    setSelected(null);
    mapRef.current?.easeTo({ pitch: 0, duration: 800 });
    const url = new URL(window.location.href);
    url.searchParams.delete("loc");
    window.history.replaceState({}, "", url);
  }, []);

  const handleShuffle = useCallback(() => {
    const pool =
      activeGenre === "all" ? LOCATIONS : LOCATIONS.filter((l) => l.genre === activeGenre);
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    handleSelect(pick);
  }, [activeGenre, handleSelect]);

  const handleShare = useCallback(() => {
    navigator.clipboard?.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!TOKEN) return;

    mapboxgl.accessToken = TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      // Real-world colors (green parks, blue water, beige roads) — like Google Maps.
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-40, 30],
      zoom: 2.2,
      minZoom: 1.5,
      maxZoom: 18,
      // Flat Mercator, not globe — HTML markers track screen position reliably
      // at every zoom level.
      projection: { name: "mercator" } as mapboxgl.Projection,
      // A single copy of the world. With world copies on (the default), at low
      // zoom Mapbox renders the map several times side by side, and an HTML
      // marker only "belongs" to one copy — so it can appear to float over a
      // *different* repeated copy of the ocean than the one you're looking at.
      // That's the "dots aren't on the real locations when zoomed out" bug.
      renderWorldCopies: false,
      attributionControl: false,
    });

    map.on("load", () => setMapReady(true));

    mapRef.current = map;

    // Window resize events don't always fire under CDP viewport emulation —
    // watch the container element directly so the canvas always matches it.
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      markersRef.current.forEach((m) => m.marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Build markers once the map is ready
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    LOCATIONS.forEach((loc) => {
      const color = GENRE_COLORS[loc.genre] ?? "#ef4444";

      const el = document.createElement("div");
      el.className = "turf-marker";
      el.style.cssText = `
        position: relative;
        width: 18px;
        height: 18px;
        cursor: pointer;
        transition: opacity 0.25s ease, transform 0.25s ease;
      `;

      // Crisp solid pin: colored fill, white ring, small drop shadow.
      // (No soft blurred halo — at low zoom a blurred radial-gradient
      // compresses down into a fuzzy, illegible blob, which read as "weird".)
      const core = document.createElement("div");
      core.style.cssText = `
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: ${color};
        border: 2.5px solid #fff;
        box-shadow: 0 1px 4px rgba(0,0,0,0.5);
        transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1);
      `;

      // Small, subtle pulse — a thin ring, not a glowing blob.
      const ring = document.createElement("div");
      ring.className = "marker-ping";
      ring.style.cssText = `
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        border: 1.5px solid ${color};
        opacity: 0.55;
      `;

      // Hover tooltip
      const tooltip = document.createElement("div");
      tooltip.style.cssText = `
        position: absolute;
        bottom: calc(100% + 10px);
        left: 50%;
        transform: translateX(-50%) translateY(4px);
        white-space: nowrap;
        background: rgba(10,10,10,0.95);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 3px;
        padding: 6px 10px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.18s ease, transform 0.18s ease;
        z-index: 10;
      `;
      const tName = document.createElement("div");
      tName.textContent = loc.name;
      tName.style.cssText = `font-size: 11px; font-weight: 700; color: #fff; letter-spacing: -0.01em;`;
      const tCity = document.createElement("div");
      tCity.textContent = loc.city;
      tCity.style.cssText = `font-size: 9px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: ${color}; margin-top: 1px;`;
      tooltip.appendChild(tName);
      tooltip.appendChild(tCity);

      el.appendChild(ring);
      el.appendChild(core);
      el.appendChild(tooltip);

      el.addEventListener("mouseenter", () => {
        core.style.transform = "scale(1.4)";
        tooltip.style.opacity = "1";
        tooltip.style.transform = "translateX(-50%) translateY(0)";
      });
      el.addEventListener("mouseleave", () => {
        core.style.transform = "scale(1)";
        tooltip.style.opacity = "0";
        tooltip.style.transform = "translateX(-50%) translateY(4px)";
      });
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        handleSelect(loc);
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([loc.lng, loc.lat])
        .addTo(mapRef.current!);

      markersRef.current.push({ marker, el, genre: loc.genre });
    });

    // Deep link: open a location directly if ?loc=<id> is present
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("loc");
    if (requested) {
      const found = LOCATIONS.find((l) => l.id === requested);
      if (found) handleSelect(found);
    }
  }, [mapReady, handleSelect]);

  // Filter markers by active genre (visual fade, not full re-mount)
  useEffect(() => {
    markersRef.current.forEach(({ el, genre }) => {
      const visible = activeGenre === "all" || genre === activeGenre;
      el.style.opacity = visible ? "1" : "0.08";
      el.style.transform = visible ? "scale(1)" : "scale(0.7)";
      el.style.pointerEvents = visible ? "auto" : "none";
    });
  }, [activeGenre]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {!TOKEN && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center p-6 rounded-lg z-20 max-w-sm"
          style={{ background: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <p className="text-white font-bold mb-2">Missing Mapbox Token</p>
          <p className="text-xs leading-relaxed" style={{ color: "var(--fg2)" }}>
            Get a free token at <strong className="text-white">mapbox.com</strong> →
            Account → Tokens, then add it to <code className="text-yellow-400">.env.local</code>:
          </p>
          <code
            className="block mt-3 p-2 rounded text-xs text-left"
            style={{ background: "rgba(255,255,255,0.05)", color: "#4ade80" }}
          >
            NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ...
          </code>
        </div>
      )}

      {/* Floating action buttons */}
      {TOKEN && (
        <div className="absolute bottom-6 right-4 z-20 flex flex-col gap-2">
          {selected && (
            <button
              onClick={handleShare}
              title="Copy link to this location"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
              style={{ background: "rgba(12,11,10,0.92)", border: "1px solid rgba(255,255,255,0.12)", color: copied ? "#4ade80" : "#fff" }}
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={handleShuffle}
            title="Jump to a random location"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={{ background: "#ef4444", color: "#fff", boxShadow: "0 2px 12px rgba(239,68,68,0.45)" }}
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      )}

      <ArtistPanel location={selected} onClose={handleClose} />
    </div>
  );
}

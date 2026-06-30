"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
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

  const handleSelect = useCallback((loc: Location) => {
    setSelected(loc);
    mapRef.current?.flyTo({
      center: [loc.lng, loc.lat],
      zoom: 13.5,
      pitch: 45,
      duration: 1400,
      essential: true,
    });
  }, []);

  const handleClose = useCallback(() => {
    setSelected(null);
    mapRef.current?.easeTo({ pitch: 0, duration: 800 });
  }, []);

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
      // at every zoom level. The globe projection caused markers to visibly
      // drift from their pinned coordinates during pan/zoom.
      projection: { name: "mercator" } as mapboxgl.Projection,
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
        width: 26px;
        height: 26px;
        cursor: pointer;
        transition: opacity 0.25s ease, transform 0.25s ease;
      `;

      // Outer pulse ring
      const ring = document.createElement("div");
      ring.className = "marker-ping";
      ring.style.cssText = `
        position: absolute;
        inset: 6px;
        border-radius: 50%;
        background: ${color};
        opacity: 0.4;
      `;

      // Outer glow halo (static, soft)
      const halo = document.createElement("div");
      halo.style.cssText = `
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: radial-gradient(circle, ${color}33 0%, transparent 70%);
      `;

      // Core pin
      const core = document.createElement("div");
      core.style.cssText = `
        position: absolute;
        inset: 8px;
        border-radius: 50%;
        background: radial-gradient(circle at 35% 30%, ${color}, ${color}cc 60%, ${color}88 100%);
        border: 2px solid rgba(255,255,255,0.85);
        box-shadow: 0 0 10px ${color}, 0 0 2px rgba(0,0,0,0.6);
        transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1);
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

      el.appendChild(halo);
      el.appendChild(ring);
      el.appendChild(core);
      el.appendChild(tooltip);

      el.addEventListener("mouseenter", () => {
        core.style.transform = "scale(1.35)";
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

      <ArtistPanel location={selected} onClose={handleClose} />
    </div>
  );
}

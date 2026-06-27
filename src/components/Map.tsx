"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { LOCATIONS, GENRE_COLORS } from "@/data/locations";
import { Location } from "@/lib/types";
import ArtistPanel from "./ArtistPanel";

// Get your free token at mapbox.com → account → tokens
const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export default function Map() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selected, setSelected] = useState<Location | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const handleSelect = useCallback((loc: Location) => {
    setSelected(loc);
    mapRef.current?.flyTo({
      center: [loc.lng, loc.lat],
      zoom: 14,
      duration: 1200,
      essential: true,
    });
  }, []);

  const handleClose = useCallback(() => {
    setSelected(null);
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    // Don't initialise Mapbox without a token — it throws a runtime error
    if (!TOKEN) return;

    mapboxgl.accessToken = TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-40, 30],
      zoom: 2.2,
      minZoom: 1.5,
      maxZoom: 18,
      projection: { name: "globe" } as mapboxgl.Projection,
      attributionControl: false,
    });

    map.on("style.load", () => {
      // Atmosphere on the globe
      map.setFog({
        color: "rgb(10, 10, 15)",
        "high-color": "rgb(15, 10, 30)",
        "horizon-blend": 0.03,
        "space-color": "rgb(5, 5, 10)",
        "star-intensity": 0.6,
      });
      setMapReady(true);
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Add markers once map is ready
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    LOCATIONS.forEach((loc) => {
      const color = GENRE_COLORS[loc.genre] ?? "#ef4444";

      // Build custom HTML marker
      const el = document.createElement("div");
      el.className = "turf-marker";
      el.style.cssText = `
        position: relative;
        width: 14px;
        height: 14px;
        cursor: pointer;
      `;

      // Outer pulse ring
      const ring = document.createElement("div");
      ring.className = "marker-ping";
      ring.style.cssText = `
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: ${color};
        opacity: 0.35;
      `;

      // Inner dot
      const dot = document.createElement("div");
      dot.style.cssText = `
        position: absolute;
        inset: 3px;
        border-radius: 50%;
        background: ${color};
        box-shadow: 0 0 6px ${color};
        transition: transform 0.15s ease;
      `;

      el.appendChild(ring);
      el.appendChild(dot);

      el.addEventListener("mouseenter", () => {
        dot.style.transform = "scale(1.5)";
      });
      el.addEventListener("mouseleave", () => {
        dot.style.transform = "scale(1)";
      });
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        handleSelect(loc);
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([loc.lng, loc.lat])
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [mapReady, handleSelect]);

  return (
    <div className="relative w-full h-full">
      {/* Map container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* No token warning */}
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

      {/* Artist panel */}
      <ArtistPanel location={selected} onClose={handleClose} />
    </div>
  );
}

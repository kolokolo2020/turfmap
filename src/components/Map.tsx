"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Shuffle, Share2, Check, List, Locate } from "lucide-react";
import { LOCATIONS, GENRE_COLORS } from "@/data/locations";
import { Location } from "@/lib/types";
import type { Theme } from "@/hooks/useTheme";
import ArtistPanel from "./ArtistPanel";
import SearchBar from "./SearchBar";
import LocationList from "./LocationList";

const MAP_STYLES: Record<Theme, string> = {
  dark: "mapbox://styles/mapbox/dark-v11",
  light: "mapbox://styles/mapbox/streets-v12",
};

const WORLD_VIEW = { center: [-40, 30] as [number, number], zoom: 2.2, pitch: 0, bearing: 0 };

// Get your free token at mapbox.com → account → tokens
const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

const SOURCE_ID = "turf-locations";
const PIN_LAYER = "turf-pins";
const GLOW_LAYER = "turf-glow";

// Pins are GL circle layers, not DOM markers. DOM markers are positioned by
// writing to el.style.transform — which fought our own hover/filter scale()
// transforms and CSS transitions, so pins lagged the map and could end up
// hundreds of pixels from their coordinates. Circle layers render in the same
// WebGL pass as the basemap, so they can never desync from it.

// ["zoom"] is only legal as the input of a TOP-LEVEL interpolate/step, so the
// hover/selected multiplier lives inside each stop's output, not around it.
const stateMultiplier = [
  "case",
  ["boolean", ["feature-state", "selected"], false], 1.45,
  ["boolean", ["feature-state", "hover"], false], 1.3,
  1,
];

const pinRadius = [
  "interpolate", ["linear"], ["zoom"],
  1.5, ["*", 5, stateMultiplier],
  6, ["*", 7.5, stateMultiplier],
  12, ["*", 10, stateMultiplier],
] as mapboxgl.ExpressionSpecification;

const glowRadius = [
  "interpolate", ["linear"], ["zoom"],
  1.5, 12,
  6, 18,
  12, 24,
] as mapboxgl.ExpressionSpecification;

const locationsGeoJSON: GeoJSON.FeatureCollection<GeoJSON.Point> = {
  type: "FeatureCollection",
  features: LOCATIONS.map((loc) => ({
    type: "Feature",
    properties: {
      id: loc.id,
      name: loc.name,
      city: loc.city,
      genre: loc.genre,
      color: GENRE_COLORS[loc.genre] ?? "#ef4444",
    },
    geometry: { type: "Point", coordinates: [loc.lng, loc.lat] },
  })),
};

interface MapProps {
  activeGenre: string;
  theme: Theme;
}

export default function Map({ activeGenre, theme }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipNameRef = useRef<HTMLDivElement>(null);
  const tooltipCityRef = useRef<HTMLDivElement>(null);
  const hoverIdRef = useRef<string | null>(null);
  const activeGenreRef = useRef(activeGenre);
  const selectedRef = useRef<Location | null>(null);
  const isFirstThemeRun = useRef(true);
  const [selected, setSelected] = useState<Location | null>(null);
  // Bumped every time the source + layers are (re)built — once on initial
  // load, and again after every theme swap, since setStyle() wipes them.
  // Effects that depend on the layers existing key off this instead of a
  // plain "ready" boolean, so they re-fire on every rebuild, not just the first.
  const [styleVersion, setStyleVersion] = useState(0);
  const [copied, setCopied] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  useEffect(() => {
    activeGenreRef.current = activeGenre;
  }, [activeGenre]);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const hideTooltip = useCallback(() => {
    if (tooltipRef.current) tooltipRef.current.style.opacity = "0";
  }, []);

  const clearHover = useCallback(() => {
    const map = mapRef.current;
    if (map && hoverIdRef.current !== null && map.getSource(SOURCE_ID)) {
      map.setFeatureState({ source: SOURCE_ID, id: hoverIdRef.current }, { hover: false });
    }
    hoverIdRef.current = null;
  }, []);

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
    let pool =
      activeGenre === "all" ? LOCATIONS : LOCATIONS.filter((l) => l.genre === activeGenre);
    if (pool.length > 1 && selectedRef.current) {
      pool = pool.filter((l) => l.id !== selectedRef.current!.id);
    }
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

  // Close the panel on Escape — only while it's open, so a stray Escape
  // doesn't reset the map pitch for no reason.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, handleClose]);

  const handleResetView = useCallback(() => {
    handleClose();
    mapRef.current?.flyTo({ ...WORLD_VIEW, duration: 1200, essential: true });
  }, [handleClose]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!TOKEN) return;

    mapboxgl.accessToken = TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLES[theme],
      center: WORLD_VIEW.center,
      zoom: WORLD_VIEW.zoom,
      minZoom: 1.5,
      maxZoom: 18,
      // Flat Mercator, not globe — circle layers project 1:1 with the basemap.
      projection: { name: "mercator" } as mapboxgl.Projection,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");

    // Delegated layer listeners (map.on(type, layerId, handler)) query the
    // named layer as soon as they fire — registering them before the layer
    // exists risks Mapbox throwing on the very first mousemove. So they're
    // attached inside setupLayers instead, guarded to run only once: the
    // listener itself keeps working across later setStyle() calls as long as
    // a layer with the same id gets re-added, which setupLayers also does.
    let listenersAttached = false;

    // Re-adds the source + layers whenever the style (re)loads — which
    // happens once on first load, and again after every theme swap, since
    // setStyle() throws away all custom sources and layers.
    const setupLayers = () => {
      if (map.getSource(SOURCE_ID)) return;

      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: locationsGeoJSON,
        promoteId: "id",
      });

      // Soft halo under each pin — static, no animation cost.
      map.addLayer({
        id: GLOW_LAYER,
        type: "circle",
        source: SOURCE_ID,
        paint: {
          "circle-radius": glowRadius,
          "circle-color": ["get", "color"],
          "circle-blur": 1,
          "circle-opacity": 0.4,
        },
      });

      map.addLayer({
        id: PIN_LAYER,
        type: "circle",
        source: SOURCE_ID,
        paint: {
          "circle-radius": pinRadius,
          "circle-color": ["get", "color"],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });

      if (!listenersAttached) {
        listenersAttached = true;

        map.on("mousemove", PIN_LAYER, (e) => {
          const f = e.features?.[0];
          if (!f) return;
          const props = f.properties as { id: string; name: string; city: string; genre: string; color: string };
          const genre = activeGenreRef.current;
          if (genre !== "all" && props.genre !== genre) {
            // Dimmed-out pin — behave as if it isn't there.
            map.getCanvas().style.cursor = "";
            clearHover();
            hideTooltip();
            return;
          }
          map.getCanvas().style.cursor = "pointer";
          if (hoverIdRef.current !== props.id) {
            clearHover();
            hoverIdRef.current = props.id;
            map.setFeatureState({ source: SOURCE_ID, id: props.id }, { hover: true });
          }
          const tip = tooltipRef.current;
          if (tip && tooltipNameRef.current && tooltipCityRef.current) {
            tooltipNameRef.current.textContent = props.name;
            tooltipCityRef.current.textContent = props.city;
            tooltipCityRef.current.style.color = props.color;
            tip.style.left = `${e.point.x}px`;
            tip.style.top = `${e.point.y}px`;
            tip.style.opacity = "1";
          }
        });

        map.on("mouseleave", PIN_LAYER, () => {
          map.getCanvas().style.cursor = "";
          clearHover();
          hideTooltip();
        });

        map.on("click", (e) => {
          if (!map.getLayer(PIN_LAYER)) return;
          // Small bbox so pins are easy to hit on touch screens.
          const pad = 6;
          const features = map
            .queryRenderedFeatures(
              [
                [e.point.x - pad, e.point.y - pad],
                [e.point.x + pad, e.point.y + pad],
              ],
              { layers: [PIN_LAYER] }
            )
            .filter(
              (f) =>
                activeGenreRef.current === "all" ||
                (f.properties as { genre: string }).genre === activeGenreRef.current
            );
          const hit = features[0];
          if (hit) {
            const loc = LOCATIONS.find((l) => l.id === (hit.properties as { id: string }).id);
            if (loc) {
              hideTooltip();
              handleSelect(loc);
            }
          } else if (selectedRef.current) {
            // Clicking empty map dismisses the open panel (desktop has no backdrop).
            handleClose();
          }
        });
      }

      setStyleVersion((v) => v + 1);
    };

    map.on("style.load", setupLayers);

    mapRef.current = map;

    // Window resize events don't always fire under CDP viewport emulation —
    // watch the container element directly so the canvas always matches it.
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // theme intentionally excluded — the map is created once with whatever
    // theme is current at mount; later changes are handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleSelect, handleClose, clearHover, hideTooltip]);

  // Swap the basemap when the theme changes (skip the very first run — the
  // map's already constructed with the correct starting style above).
  useEffect(() => {
    if (isFirstThemeRun.current) {
      isFirstThemeRun.current = false;
      return;
    }
    mapRef.current?.setStyle(MAP_STYLES[theme]);
  }, [theme]);

  // Deep link: open a location directly if ?loc=<id> is present.
  useEffect(() => {
    if (!styleVersion) return;
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("loc");
    if (requested) {
      const found = LOCATIONS.find((l) => l.id === requested);
      if (found) queueMicrotask(() => handleSelect(found));
    }
  }, [styleVersion, handleSelect]);

  // Fade pins that don't match the active genre.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleVersion || !map.getLayer(PIN_LAYER)) return;
    const match: mapboxgl.ExpressionSpecification | null =
      activeGenre === "all" ? null : ["==", ["get", "genre"], activeGenre];
    map.setPaintProperty(PIN_LAYER, "circle-opacity", match ? ["case", match, 1, 0.12] : 1);
    map.setPaintProperty(PIN_LAYER, "circle-stroke-opacity", match ? ["case", match, 1, 0.12] : 1);
    map.setPaintProperty(GLOW_LAYER, "circle-opacity", match ? ["case", match, 0.4, 0.04] : 0.4);
  }, [activeGenre, styleVersion]);

  // Highlight the selected pin.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleVersion || !selected || !map.getSource(SOURCE_ID)) return;
    const id = selected.id;
    map.setFeatureState({ source: SOURCE_ID, id }, { selected: true });
    return () => {
      if (mapRef.current?.getSource(SOURCE_ID)) {
        mapRef.current.setFeatureState({ source: SOURCE_ID, id }, { selected: false });
      }
    };
  }, [selected, styleVersion]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Hover tooltip — one element for all pins, positioned from the mouse event. */}
      <div
        ref={tooltipRef}
        aria-hidden="true"
        className="absolute z-10 pointer-events-none"
        style={{
          opacity: 0,
          transform: "translate(-50%, calc(-100% - 14px))",
          whiteSpace: "nowrap",
          background: "rgba(10,10,10,0.95)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 4,
          padding: "6px 10px",
          transition: "opacity 0.15s ease",
        }}
      >
        <div
          ref={tooltipNameRef}
          style={{ fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}
        />
        <div
          ref={tooltipCityRef}
          style={{
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginTop: 1,
          }}
        />
      </div>

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

      {/* Search */}
      {TOKEN && (
        <div className="absolute top-[112px] md:top-[68px] left-4 right-4 md:right-auto z-20 flex items-center gap-2">
          <div className="flex-1 min-w-0 md:w-72">
            <SearchBar onSelect={handleSelect} />
          </div>
          <button
            onClick={() => setListOpen(true)}
            title="Browse all locations"
            aria-label="Browse all locations as a list"
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-105"
            style={{ background: "var(--chip-bg)", border: "1px solid var(--chip-border)", color: "var(--fg2)", backdropFilter: "blur(10px)" }}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating action buttons */}
      {TOKEN && (
        <div className="absolute bottom-6 right-4 z-20 flex flex-col gap-2">
          <button
            onClick={handleResetView}
            title="Reset view"
            aria-label="Reset map to the world view"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={{ background: "rgba(12,11,10,0.92)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
          >
            <Locate className="w-4 h-4" />
          </button>
          {selected && (
            <button
              onClick={handleShare}
              title="Copy link to this location"
              aria-label={copied ? "Link copied" : "Copy link to this location"}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
              style={{ background: "rgba(12,11,10,0.92)", border: "1px solid rgba(255,255,255,0.12)", color: copied ? "#4ade80" : "#fff" }}
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={handleShuffle}
            title="Jump to a random location"
            aria-label="Jump to a random location"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={{ background: "#ef4444", color: "#fff", boxShadow: "0 2px 12px rgba(239,68,68,0.45)" }}
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      )}

      <ArtistPanel location={selected} onClose={handleClose} />

      <LocationList
        open={listOpen}
        locations={activeGenre === "all" ? LOCATIONS : LOCATIONS.filter((l) => l.genre === activeGenre)}
        onSelect={handleSelect}
        onClose={() => setListOpen(false)}
      />
    </div>
  );
}

"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Shuffle, Share2, Check, List, Locate, Flame, Clock } from "lucide-react";
import { LOCATIONS, GENRE_COLORS, eraStartYear } from "@/data/locations";
import { Location } from "@/lib/types";
import type { Theme } from "@/hooks/useTheme";
import ArtistPanel from "./ArtistPanel";
import SearchBar from "./SearchBar";
import LocationList from "./LocationList";
import TimeSlider from "./TimeSlider";

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
const CLUSTER_LAYER = "turf-clusters";
const CLUSTER_COUNT_LAYER = "turf-cluster-count";
const HEATMAP_LAYER = "turf-heatmap";

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

// Cluster circle size/color scale with how many locations they group —
// bigger, redder clusters mean "more to discover here." A fixed brand color
// (rather than genre color) since a cluster's contents are usually mixed.
const clusterRadius = [
  "step", ["get", "point_count"],
  16, 10,
  20, 50,
  26, 200,
  32,
] as mapboxgl.ExpressionSpecification;

const clusterColor = [
  "step", ["get", "point_count"],
  "#f97316", 10,
  "#ef4444", 50,
  "#b91c1c", 200,
  "#7f1d1d",
] as mapboxgl.ExpressionSpecification;

// Heatmap weight counts a cluster as its full point count, so density reads
// correctly at low zoom where the same source is still clustered.
const heatmapWeight = [
  "case", ["has", "point_count"], ["min", ["/", ["get", "point_count"], 8], 6], 1,
] as mapboxgl.ExpressionSpecification;

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = Math.min(1900, ...LOCATIONS.map((l) => eraStartYear(l.era)));

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
      startYear: eraStartYear(loc.era),
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
  const timeMachineOnRef = useRef(false);
  const sliderYearRef = useRef(CURRENT_YEAR);
  const isFirstThemeRun = useRef(true);
  const [selected, setSelected] = useState<Location | null>(null);
  // Bumped every time the source + layers are (re)built — once on initial
  // load, and again after every theme swap, since setStyle() wipes them.
  // Effects that depend on the layers existing key off this instead of a
  // plain "ready" boolean, so they re-fire on every rebuild, not just the first.
  const [styleVersion, setStyleVersion] = useState(0);
  const [copied, setCopied] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [heatmapOn, setHeatmapOn] = useState(false);
  const [timeMachineOn, setTimeMachineOn] = useState(false);
  const [sliderYear, setSliderYear] = useState(CURRENT_YEAR);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    activeGenreRef.current = activeGenre;
  }, [activeGenre]);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    timeMachineOnRef.current = timeMachineOn;
  }, [timeMachineOn]);

  useEffect(() => {
    sliderYearRef.current = sliderYear;
  }, [sliderYear]);

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

  const handleToggleHeatmap = useCallback(() => {
    setHeatmapOn((v) => !v);
  }, []);

  const handleToggleTimeMachine = useCallback(() => {
    setTimeMachineOn((v) => {
      const next = !v;
      if (next) {
        setSliderYear(MIN_YEAR);
      } else {
        setIsPlaying(false);
      }
      return next;
    });
  }, []);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((p) => {
      const next = !p;
      // Replaying from the end just re-runs the same frame forever — restart.
      if (next && sliderYearRef.current >= CURRENT_YEAR) setSliderYear(MIN_YEAR);
      return next;
    });
  }, []);

  // Animate the slider forward a couple of years per tick while "playing."
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setSliderYear((y) => {
        if (y >= CURRENT_YEAR) {
          setIsPlaying(false);
          return CURRENT_YEAR;
        }
        return Math.min(CURRENT_YEAR, y + 2);
      });
    }, 110);
    return () => clearInterval(id);
  }, [isPlaying]);

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
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Soft halo under each pin — static, no animation cost. Clusters get
      // their own layer below, so these two are unclustered points only.
      map.addLayer({
        id: GLOW_LAYER,
        type: "circle",
        source: SOURCE_ID,
        filter: ["!", ["has", "point_count"]],
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
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-radius": pinRadius,
          "circle-color": ["get", "color"],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });

      // Cluster bubbles — shown instead of individual pins wherever many
      // locations are close together at the current zoom. Sized/colored by
      // how many locations they group.
      map.addLayer({
        id: CLUSTER_LAYER,
        type: "circle",
        source: SOURCE_ID,
        filter: ["has", "point_count"],
        paint: {
          "circle-radius": clusterRadius,
          "circle-color": clusterColor,
          "circle-opacity": 0.88,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });

      map.addLayer({
        id: CLUSTER_COUNT_LAYER,
        type: "symbol",
        source: SOURCE_ID,
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": 12,
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
        },
        paint: { "text-color": "#ffffff" },
      });

      // Density view — an alternate visualization toggled on by the flame
      // button, hidden by default. Weighted by cluster size so it reads
      // correctly even when zoomed out and the source is still clustered.
      map.addLayer({
        id: HEATMAP_LAYER,
        type: "heatmap",
        source: SOURCE_ID,
        layout: { visibility: "none" },
        paint: {
          "heatmap-weight": heatmapWeight,
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 1.5, 0.6, 9, 2],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 1.5, 14, 9, 34],
          "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 1.5, 0.85, 14, 0.4],
          "heatmap-color": [
            "interpolate", ["linear"], ["heatmap-density"],
            0, "rgba(0,0,0,0)",
            0.2, "#3b82f6",
            0.4, "#22c55e",
            0.6, "#f59e0b",
            0.8, "#ef4444",
            1, "#f43f5e",
          ],
        },
      });

      if (!listenersAttached) {
        listenersAttached = true;

        map.on("mousemove", PIN_LAYER, (e) => {
          const f = e.features?.[0];
          if (!f) return;
          const props = f.properties as {
            id: string;
            name: string;
            city: string;
            genre: string;
            color: string;
            startYear: number;
          };
          const genre = activeGenreRef.current;
          const genreOk = genre === "all" || props.genre === genre;
          const yearOk = !timeMachineOnRef.current || props.startYear <= sliderYearRef.current;
          if (!genreOk || !yearOk) {
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

        map.on("mouseenter", CLUSTER_LAYER, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", CLUSTER_LAYER, () => {
          map.getCanvas().style.cursor = "";
        });

        // Clicking a cluster zooms in just enough to break it apart.
        map.on("click", CLUSTER_LAYER, (e) => {
          const f = e.features?.[0];
          if (!f) return;
          const clusterId = (f.properties as { cluster_id: number }).cluster_id;
          const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource;
          source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err || zoom == null) return;
            map.easeTo({
              center: (f.geometry as GeoJSON.Point).coordinates as [number, number],
              zoom,
              duration: 600,
            });
          });
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
            .filter((f) => {
              const p = f.properties as { genre: string; startYear: number };
              const genreOk =
                activeGenreRef.current === "all" || p.genre === activeGenreRef.current;
              const yearOk =
                !timeMachineOnRef.current || p.startYear <= sliderYearRef.current;
              return genreOk && yearOk;
            });
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

  // Fade pins that don't match the active genre and/or the time machine's
  // current year. Clusters are left alone — their contents are usually mixed
  // genres/eras, so per-genre or per-year dimming of the aggregate wouldn't
  // read cleanly; only the unclustered pin/glow layers respond.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleVersion || !map.getLayer(PIN_LAYER)) return;

    const genreMatch: mapboxgl.ExpressionSpecification | null =
      activeGenre === "all" ? null : ["==", ["get", "genre"], activeGenre];
    const yearMatch: mapboxgl.ExpressionSpecification | null = timeMachineOn
      ? ["<=", ["get", "startYear"], sliderYear]
      : null;

    const buildExpr = (
      visibleOpacity: number,
      dimmedOpacity: number
    ): mapboxgl.ExpressionSpecification | number => {
      if (genreMatch && yearMatch) {
        return ["case", ["all", genreMatch, yearMatch], visibleOpacity, dimmedOpacity] as mapboxgl.ExpressionSpecification;
      }
      if (genreMatch) return ["case", genreMatch, visibleOpacity, dimmedOpacity] as mapboxgl.ExpressionSpecification;
      if (yearMatch) return ["case", yearMatch, visibleOpacity, dimmedOpacity] as mapboxgl.ExpressionSpecification;
      return visibleOpacity;
    };

    map.setPaintProperty(PIN_LAYER, "circle-opacity", buildExpr(1, 0.12));
    map.setPaintProperty(PIN_LAYER, "circle-stroke-opacity", buildExpr(1, 0.12));
    map.setPaintProperty(GLOW_LAYER, "circle-opacity", buildExpr(0.4, 0.04));
  }, [activeGenre, timeMachineOn, sliderYear, styleVersion]);

  // Toggle between the pin/cluster view and the heatmap density view.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleVersion || !map.getLayer(HEATMAP_LAYER)) return;
    const pinVisibility = heatmapOn ? "none" : "visible";
    map.setLayoutProperty(HEATMAP_LAYER, "visibility", heatmapOn ? "visible" : "none");
    map.setLayoutProperty(PIN_LAYER, "visibility", pinVisibility);
    map.setLayoutProperty(GLOW_LAYER, "visibility", pinVisibility);
    map.setLayoutProperty(CLUSTER_LAYER, "visibility", pinVisibility);
    map.setLayoutProperty(CLUSTER_COUNT_LAYER, "visibility", pinVisibility);
  }, [heatmapOn, styleVersion]);

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

  const filteredLocations = useMemo(
    () => (activeGenre === "all" ? LOCATIONS : LOCATIONS.filter((l) => l.genre === activeGenre)),
    [activeGenre]
  );

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
            onClick={handleToggleTimeMachine}
            title="Time Machine — travel through music history"
            aria-label="Toggle the time machine slider"
            aria-pressed={timeMachineOn}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={
              timeMachineOn
                ? { background: "#ef4444", color: "#fff", boxShadow: "0 2px 12px rgba(239,68,68,0.45)" }
                : { background: "rgba(12,11,10,0.92)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }
            }
          >
            <Clock className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleHeatmap}
            title="Toggle heatmap density view"
            aria-label="Toggle heatmap density view"
            aria-pressed={heatmapOn}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={
              heatmapOn
                ? { background: "#ef4444", color: "#fff", boxShadow: "0 2px 12px rgba(239,68,68,0.45)" }
                : { background: "rgba(12,11,10,0.92)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }
            }
          >
            <Flame className="w-4 h-4" />
          </button>
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

      {timeMachineOn && (
        <TimeSlider
          year={sliderYear}
          minYear={MIN_YEAR}
          maxYear={CURRENT_YEAR}
          playing={isPlaying}
          onYearChange={(y) => {
            setIsPlaying(false);
            setSliderYear(y);
          }}
          onTogglePlay={handleTogglePlay}
          onClose={handleToggleTimeMachine}
        />
      )}

      <ArtistPanel location={selected} onClose={handleClose} />

      <LocationList
        open={listOpen}
        locations={filteredLocations}
        onSelect={handleSelect}
        onClose={() => setListOpen(false)}
      />
    </div>
  );
}

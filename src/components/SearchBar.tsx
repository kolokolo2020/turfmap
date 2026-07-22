"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, MapPin, Mic2, X } from "lucide-react";
import { LOCATIONS, GENRE_COLORS, GENRE_LABELS } from "@/data/locations";
import { Location, Artist } from "@/lib/types";

interface SearchBarProps {
  onSelect: (location: Location) => void;
}

type SearchResult =
  | { type: "location"; loc: Location }
  | { type: "artist"; loc: Location; artist: Artist };

export default function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Flat searchable index — built once
  const index = useMemo<SearchResult[]>(() => {
    const items: SearchResult[] = [];
    for (const loc of LOCATIONS) {
      items.push({ type: "location", loc });
      for (const artist of loc.artists) {
        items.push({ type: "artist", loc, artist });
      }
    }
    return items;
  }, []);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return index
      .filter((r) => {
        if (r.type === "location") {
          return (
            r.loc.name.toLowerCase().includes(q) ||
            r.loc.city.toLowerCase().includes(q) ||
            r.loc.fullName.toLowerCase().includes(q)
          );
        }
        return r.artist.name.toLowerCase().includes(q);
      })
      .slice(0, 8);
  }, [query, index]);

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handlePick = (r: SearchResult) => {
    onSelect(r.loc);
    setQuery("");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = results[highlighted];
      if (pick) handlePick(pick);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative w-full max-w-xs">
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all"
        style={{
          background: "var(--chip-bg)",
          border: `1px solid ${open && results.length ? "rgba(239,68,68,0.4)" : "var(--chip-border)"}`,
          backdropFilter: "blur(10px)",
        }}
      >
        <Search className="w-3.5 h-3.5 shrink-0" aria-hidden="true" style={{ color: "var(--fg3)" }} />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setHighlighted(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search artist or place…"
          aria-label="Search artist or place"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls="search-results-listbox"
          aria-activedescendant={open && results.length > 0 ? `search-result-${highlighted}` : undefined}
          autoComplete="off"
          className="bg-transparent outline-none text-xs w-full text-[var(--fg)] placeholder:text-[var(--fg3)]"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setOpen(false); }}
            aria-label="Clear search"
            className="shrink-0"
          >
            <X className="w-3 h-3" style={{ color: "var(--fg3)" }} />
          </button>
        )}
      </div>

      {open && query && (
        <div
          ref={listRef}
          id="search-results-listbox"
          role="listbox"
          className="absolute top-[calc(100%+8px)] left-0 right-0 max-h-80 overflow-y-auto rounded-lg z-30"
          style={{ background: "var(--panel)", border: "1px solid var(--border)", backdropFilter: "blur(20px)" }}
        >
          {results.length === 0 ? (
            <p className="text-xs px-4 py-3" style={{ color: "var(--fg3)" }}>No matches for &ldquo;{query}&rdquo;</p>
          ) : (
            results.map((r, i) => {
              const color = GENRE_COLORS[r.loc.genre] ?? "#ef4444";
              const isHighlighted = i === highlighted;
              return (
                <button
                  key={`${r.type}-${r.type === "artist" ? r.artist.id : r.loc.id}-${i}`}
                  id={`search-result-${i}`}
                  role="option"
                  aria-selected={isHighlighted}
                  onClick={() => handlePick(r)}
                  onMouseEnter={() => setHighlighted(i)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                  style={{
                    borderBottom: i < results.length - 1 ? "1px solid var(--border)" : "none",
                    background: isHighlighted ? "var(--hover-surface)" : "transparent",
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `${color}22`, color }}
                  >
                    {r.type === "artist" ? <Mic2 className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--fg)] truncate">
                      {r.type === "artist" ? r.artist.name : r.loc.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: "var(--fg3)" }}>
                      {r.type === "artist" ? `${r.loc.name} · ${r.loc.city}` : `${r.loc.city} · ${GENRE_LABELS[r.loc.genre]}`}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

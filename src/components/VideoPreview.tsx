"use client";

import { useEffect, useState } from "react";
import { X, ExternalLink, Loader2 } from "lucide-react";
import { fetchVideoPreview, registerPlaying } from "@/lib/mediaPreview";

interface VideoPreviewProps {
  open: boolean;
  artistName: string;
  videoTitle: string;
  fallbackUrl: string;
  onClose: () => void;
}

// All seeded `videoUrl` values are YouTube *search-results* links, not real
// videos — YouTube dropped keyless search-result embedding in 2020, so this
// resolves a real short clip via Apple's keyless iTunes Search API instead,
// falling back to the original outbound search link when nothing matches.
export default function VideoPreview({ open, artistName, videoTitle, fallbackUrl, onClose }: VideoPreviewProps) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lastKey, setLastKey] = useState("");

  // Reset to "loading" during render (not inside the effect below) whenever a
  // new video is requested — same pattern ArtistPanel uses for Street View,
  // so the async fetch effect only ever writes its own result, never a reset.
  const key = `${artistName}::${videoTitle}`;
  if (open && key !== lastKey) {
    setLastKey(key);
    setState("loading");
    setPreviewUrl(null);
  }

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetchVideoPreview(artistName, videoTitle).then((preview) => {
      if (cancelled) return;
      if (preview) {
        setPreviewUrl(preview.previewUrl);
        setState("ready");
      } else {
        setState("error");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open, artistName, videoTitle]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  if (!open) return null;

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
        aria-label={`Filmed here — ${videoTitle}`}
        className="panel-enter fixed inset-x-4 top-1/2 -translate-y-1/2 z-[70] max-w-3xl mx-auto rounded-xl overflow-hidden sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[90vw]"
        style={{
          background: "var(--panel)",
          border: "1px solid var(--border)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="min-w-0">
            <p className="label" style={{ color: "var(--fg2)" }}>Filmed Here</p>
            <p className="text-sm font-bold truncate" style={{ color: "var(--fg)" }}>{videoTitle}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Search on YouTube"
              aria-label="Search on YouTube"
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

        <div className="relative w-full flex items-center justify-center" style={{ aspectRatio: "16 / 9", background: "#000" }}>
          {state === "loading" && <Loader2 className="w-6 h-6 animate-spin text-white/60" />}
          {state === "ready" && previewUrl && (
            <video
              src={previewUrl}
              controls
              autoPlay
              playsInline
              onPlay={(e) => registerPlaying(e.currentTarget)}
              className="absolute inset-0 w-full h-full"
            />
          )}
          {state === "error" && (
            <p className="text-sm text-center px-6" style={{ color: "rgba(255,255,255,0.6)" }}>
              No preview clip found for this one.
            </p>
          )}
        </div>

        <p className="px-4 py-2.5 text-xs" style={{ color: "var(--fg3)", borderTop: "1px solid var(--border)" }}>
          {state === "error" ? "No inline preview available. " : "Short preview clip — for the full official video, "}
          <a href={fallbackUrl} target="_blank" rel="noopener noreferrer" className="underline">
            search on YouTube
          </a>
          .
        </p>
      </div>
    </>
  );
}

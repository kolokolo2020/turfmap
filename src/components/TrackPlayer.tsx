"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Loader2 } from "lucide-react";
import { Artist } from "@/lib/types";
import { fetchAudioPreview, registerPlaying, unregisterPlaying } from "@/lib/mediaPreview";

// Most seeded `spotifyUrl` values are Spotify *search* links, not track/artist
// URIs, so they can't be embedded (Spotify's embed player only accepts real
// content URIs). This resolves a real 30-second preview clip via Apple's
// keyless iTunes Search API instead, and only falls back to the plain
// outbound Spotify link if no match is found.
export default function TrackPlayer({ artist }: { artist: Artist }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const el = audioRef.current;
    return () => {
      if (el) unregisterPlaying(el);
    };
  }, []);

  const handleClick = async () => {
    const el = audioRef.current;
    if (el) {
      if (playing) el.pause();
      else el.play().catch(() => setFailed(true));
      return;
    }
    if (loading) return;
    setLoading(true);
    const preview = await fetchAudioPreview(artist.name, artist.signatureTrack);
    setLoading(false);
    if (!preview) {
      setFailed(true);
      return;
    }
    setPreviewUrl(preview.previewUrl);
  };

  if (failed) {
    return (
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
    );
  }

  return (
    <div className="rounded-sm overflow-hidden" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}>
      <button
        onClick={handleClick}
        className="group w-full flex items-center justify-between p-2.5 transition-colors text-left"
      >
        <div className="min-w-0 mr-2">
          <p className="label mb-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
            {previewUrl ? "30-Sec Preview" : "Signature Track"}
          </p>
          <p className="text-xs font-semibold text-white truncate">{artist.signatureTrack}</p>
        </div>
        <span
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-transform group-hover:scale-110"
          style={{ background: "#1DB954" }}
        >
          {loading ? (
            <Loader2 className="w-3 h-3 text-black animate-spin" />
          ) : playing ? (
            <Pause className="w-3 h-3 fill-black text-black" />
          ) : (
            <Play className="w-3 h-3 fill-black text-black ml-0.5" />
          )}
        </span>
      </button>

      {previewUrl && (
        <>
          <div className="h-0.5" style={{ background: "rgba(255,255,255,0.15)" }}>
            <div
              style={{
                width: `${progress * 100}%`,
                height: "100%",
                background: "#1DB954",
                transition: "width 0.1s linear",
              }}
            />
          </div>
          <audio
            ref={audioRef}
            src={previewUrl}
            autoPlay
            onPlay={(e) => {
              setPlaying(true);
              registerPlaying(e.currentTarget);
            }}
            onPause={() => setPlaying(false)}
            onEnded={() => {
              setPlaying(false);
              setProgress(0);
            }}
            onTimeUpdate={(e) => {
              const t = e.currentTarget;
              if (t.duration) setProgress(t.currentTime / t.duration);
            }}
            onError={() => setFailed(true)}
            className="hidden"
          />
        </>
      )}
    </div>
  );
}

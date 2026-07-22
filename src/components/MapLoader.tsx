"use client";

import dynamic from "next/dynamic";
import type { Theme } from "@/hooks/useTheme";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: "var(--bg)" }}
    >
      <div className="text-center">
        <div
          className="w-2 h-2 rounded-full mx-auto mb-3"
          style={{
            background: "#ef4444",
            boxShadow: "0 0 12px #ef4444",
            animation: "ping 1s cubic-bezier(0,0,0.2,1) infinite",
          }}
        />
        <p
          className="text-xs font-bold tracking-widest uppercase"
          style={{ color: "var(--fg3)" }}
        >
          Loading TURF
        </p>
      </div>
    </div>
  ),
});

interface MapLoaderProps {
  activeGenre: string;
  theme: Theme;
}

export default function MapLoader({ activeGenre, theme }: MapLoaderProps) {
  return <Map activeGenre={activeGenre} theme={theme} />;
}

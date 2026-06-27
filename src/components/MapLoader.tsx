"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: "#0a0a0a" }}
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
          style={{ color: "#3a3530" }}
        >
          Loading TURF
        </p>
      </div>
    </div>
  ),
});

export default function MapLoader() {
  return <Map />;
}

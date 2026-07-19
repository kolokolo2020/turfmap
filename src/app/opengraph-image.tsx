import { ImageResponse } from "next/og";
import { LOCATIONS } from "@/data/locations";

export const alt = "TURF — Music Mapped";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 96,
            height: 96,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            fontWeight: 900,
            color: "#0a0a0a",
            background: "linear-gradient(135deg, #ef4444, #f97316)",
            marginBottom: 32,
          }}
        >
          T
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 900,
            color: "#f0ede8",
            letterSpacing: -4,
          }}
        >
          TURF
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#7a7570",
            marginTop: 12,
          }}
        >
          Music Mapped
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "#3a3530",
            marginTop: 40,
          }}
        >
          {`${LOCATIONS.length} neighborhoods · hip-hop · grime · reggae · afrobeats · latin · jazz · blues`}
        </div>
      </div>
    ),
    { ...size }
  );
}

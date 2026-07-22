import { Location, Genre } from "@/lib/types";
import { hipHopLocations } from "./hip-hop";
import { grimeLocations } from "./grime";
import { reggaeLocations } from "./reggae";
import { jazzLocations } from "./jazz";
import { bluesLocations } from "./blues";
import { countryLocations } from "./country";
import { afrobeatsLocations } from "./afrobeats";
import { latinLocations } from "./latin";
import { musicVideosLocations } from "./music-videos";
import { kPopLocations } from "./k-pop";
import { edmLocations } from "./edm";
import { rockLocations } from "./rock";
import { soulLocations } from "./soul";
import { reggaetonLocations } from "./reggaeton";

export { eraStartYear } from "./helpers";

export const LOCATIONS: Location[] = [
  ...hipHopLocations,
  ...grimeLocations,
  ...reggaeLocations,
  ...jazzLocations,
  ...bluesLocations,
  ...countryLocations,
  ...afrobeatsLocations,
  ...latinLocations,
  ...musicVideosLocations,
  ...kPopLocations,
  ...edmLocations,
  ...rockLocations,
  ...soulLocations,
  ...reggaetonLocations,
];

export const GENRE_COLORS = {
  "hip-hop":      "#ef4444",
  "grime":        "#6366f1",
  "reggae":       "#22c55e",
  "jazz":         "#f59e0b",
  "blues":        "#3b82f6",
  "country":      "#a78bfa",
  "afrobeats":    "#f97316",
  "latin":        "#eab308",
  "music-videos": "#ec4899",
  "k-pop":        "#06b6d4",
  "edm":          "#84cc16",
  "rock":         "#64748b",
  "soul":         "#78350f",
  "reggaeton":    "#0d9488",
} satisfies Record<Genre, string> as Record<string, string>;

export const GENRE_LABELS = {
  "hip-hop":      "Hip-Hop",
  "grime":        "Grime",
  "reggae":       "Reggae",
  "jazz":         "Jazz",
  "blues":        "Blues",
  "country":      "Country",
  "afrobeats":    "Afrobeats",
  "latin":        "Latin",
  "music-videos": "Music Videos",
  "k-pop":        "K-Pop",
  "edm":          "EDM",
  "rock":         "Rock",
  "soul":         "Soul",
  "reggaeton":    "Reggaetón",
} satisfies Record<Genre, string> as Record<string, string>;

import { Location } from "@/lib/types";
import { img } from "./helpers";

export const popLocations: Location[] = [
  {
    id: "quakertown-pennsylvania",
    name: "Quakertown",
    fullName: "Quakertown, Bucks County",
    city: "Quakertown, PA",
    country: "US",
    lat: 40.4407,
    lng: -75.3427,
    genre: "pop",
    era: "2021 – present",
    coverUrl: img("photo-1519501025264-65ba15a82390"),
    description:
      "A small Bucks County town with no pop-star history, where a homeschooled kid balancing acting auditions against a self-paced curriculum eventually became one of the biggest pop stars on the planet.",
    artists: [
      {
        id: "sabrina-carpenter",
        name: "Sabrina Carpenter",
        genre: "pop",
        color: "#d946ef",
        initials: "SC",
        bio: "Sabrina Carpenter grew up in Quakertown before moving to LA for acting around age 13. 'Espresso' and 'Please Please Please' (2024) made her pop's breakout star of the decade.",
        albums: ["Emails I Can't Send", "Short n' Sweet", "Man's Best Friend"],
        spotifyUrl: "https://open.spotify.com/search/Sabrina%20Carpenter%20Espresso",
        signatureTrack: "Espresso",
        trending: true,
      },
    ],
  },
  {
    id: "temecula-california",
    name: "Temecula",
    fullName: "Temecula, Riverside County",
    city: "Temecula, CA",
    country: "US",
    lat: 33.4936,
    lng: -117.1484,
    genre: "pop",
    era: "2021 – present",
    coverUrl: img("photo-1444723121867-7a241cacace9"),
    description:
      "A Southern California wine-country suburb where a Disney kid raised on No Doubt and the White Stripes wrote a breakup song in a school parking lot — 'drivers license' broke streaming records within days of release.",
    artists: [
      {
        id: "olivia-rodrigo",
        name: "Olivia Rodrigo",
        genre: "pop",
        color: "#ef4444",
        initials: "OR",
        bio: "Olivia Rodrigo grew up in Temecula before Disney roles led to music. 'Drivers License' (2021) and her debut album 'SOUR' won her three Grammys and redefined teen-pop songwriting.",
        albums: ["SOUR", "GUTS"],
        spotifyUrl: "https://open.spotify.com/search/Olivia%20Rodrigo%20drivers%20license",
        signatureTrack: "drivers license",
        trending: true,
      },
    ],
  },
  {
    id: "naples-florida",
    name: "Naples",
    fullName: "Naples, Southwest Florida",
    city: "Naples, FL",
    country: "US",
    lat: 26.1420,
    lng: -81.7948,
    genre: "pop",
    era: "2017 – present",
    coverUrl: img("photo-1483721310020-03333e577078"),
    description:
      "A quiet Gulf Coast retirement city that raised a genre-blurring songwriter through a genuinely rough childhood — juvenile detention, a SoundCloud following, and a Columbia Records deal all before he turned 21.",
    artists: [
      {
        id: "dominic-fike",
        name: "Dominic Fike",
        genre: "pop",
        color: "#f97316",
        initials: "DF",
        bio: "Dominic Fike grew up in Naples in and out of stable housing before SoundCloud hits like '3 Nights' led to a Columbia deal and a role on HBO's 'Euphoria.'",
        albums: ["What Could Possibly Go Wrong", "Sunburn"],
        spotifyUrl: "https://open.spotify.com/search/Dominic%20Fike%203%20Nights",
        signatureTrack: "3 Nights",
      },
    ],
  },
];

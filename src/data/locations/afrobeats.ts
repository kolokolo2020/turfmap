import { Location } from "@/lib/types";
import { img, wiki } from "./helpers";

export const afrobeatsLocations: Location[] = [
  {
    id: "ajegunle",
    name: "Ajegunle",
    fullName: "Ajegunle, Lagos Mainland",
    city: "Lagos",
    country: "Nigeria",
    lat: 6.4584,
    lng: 3.3260,
    genre: "afrobeats",
    era: "2010 – present",
    coverUrl: img("photo-1483721310020-03333e577078"),
    description:
      "Known locally as 'AJ City,' one of Lagos's densest and most musically prolific neighborhoods. For decades it's been a launching pad for raw Nigerian street music — the percussive, low-budget energy that fed directly into the global Afrobeats explosion.",
    artists: [
      {
        id: "burna-boy",
        name: "Burna Boy",
        genre: "afrobeats",
        color: "#16a34a",
        initials: "BB",
        imageUrl: wiki("commons/thumb/c/ce/Untold_2024_-Burna_Boy_%2853926047977%29_%28cropped%29.jpg/330px-Untold_2024_-Burna_Boy_%2853926047977%29_%28cropped%29.jpg"),
        bio: "Damini Ogulu won the Grammy for Best Global Music Album with 'Twice as Tall,' calling himself the 'African Giant.'",
        albums: ["African Giant", "Twice as Tall", "Love, Damini"],
        spotifyUrl: "https://open.spotify.com/artist/5a2EaR3hamoenG9rDuVn8j",
        signatureTrack: "Last Last",
      },
    ],
  },
  {
    id: "ojuelegba",
    name: "Ojuelegba",
    fullName: "Ojuelegba, Surulere",
    city: "Lagos",
    country: "Nigeria",
    lat: 6.5083,
    lng: 3.3633,
    genre: "afrobeats",
    era: "2011 – present",
    coverUrl: img("photo-1518609878373-06d740f60d8b"),
    description:
      "A chaotic, beloved bus-stop intersection in Surulere — one of Lagos's busiest and loudest junctions, where danfo buses, hawkers, and commuters collide every day. The hustle of getting through it became a metaphor for hustling out of Lagos entirely.",
    artists: [
      {
        id: "wizkid",
        name: "Wizkid",
        genre: "afrobeats",
        color: "#0ea5e9",
        initials: "WK",
        imageUrl: wiki("commons/thumb/b/b6/Artworks-UWHjOik17qMFy0Sb-64tibA-t500x500.jpg/330px-Artworks-UWHjOik17qMFy0Sb-64tibA-t500x500.jpg"),
        bio: "Ayodeji Balogun's feature on Drake's 'One Dance' became the most-streamed song in Spotify history at the time, breaking Afrobeats into Western radio.",
        albums: ["Superstar", "Sounds from the Other Side", "Made in Lagos"],
        spotifyUrl: "https://open.spotify.com/artist/3tVQdUvClmAT7URs9V3rsh",
        signatureTrack: "Ojuelegba",
      },
    ],
  },
  {
    id: "ikeja-lagos",
    name: "Kalakuta Republic",
    fullName: "Kalakuta Republic, Ikeja",
    city: "Lagos",
    country: "Nigeria",
    lat: 6.6018,
    lng: 3.3515,
    genre: "afrobeats",
    era: "1970 – 1997",
    coverUrl: img("photo-1483721310020-03333e577078"),
    description:
      "Fela Kuti declared his walled Lagos compound an independent republic — commune, recording studio, and shrine all at once. Raided by soldiers repeatedly, it was the birthplace of Afrobeat, the horn-driven, politically defiant genre that begat modern Afrobeats.",
    artists: [
      {
        id: "fela-kuti",
        name: "Fela Kuti",
        genre: "afrobeats",
        color: "#ea580c",
        initials: "FK",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Fela_Kuti_circa_1986.jpg/330px-Fela_Kuti_circa_1986.jpg",
        bio: "Fela Anikulapo Kuti fused jazz, funk, and Yoruba rhythm into Afrobeat, using it as a direct weapon against Nigeria's military government for two decades.",
        albums: ["Zombie", "Expensive Shit"],
        spotifyUrl: "https://open.spotify.com/search/Fela%20Kuti%20Zombie",
        signatureTrack: "Zombie",
      },
    ],
  },
];

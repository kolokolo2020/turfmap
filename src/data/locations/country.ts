import { Location } from "@/lib/types";
import { img } from "./helpers";

export const countryLocations: Location[] = [
  {
    id: "dyess-arkansas",
    name: "Dyess",
    fullName: "Dyess Colony, Mississippi County",
    city: "Dyess, AR",
    country: "US",
    lat: 35.5931,
    lng: -90.2726,
    genre: "country",
    era: "1935 – 1954",
    coverUrl: img("photo-1519501025264-65ba15a82390"),
    description:
      "A New Deal farming colony carved out of Depression-era swampland and handed to 500 struggling families by lottery. One five-year-old boy picked cotton here before radio and the Grand Ole Opry carried his voice far beyond it.",
    artists: [
      {
        id: "johnny-cash",
        name: "Johnny Cash",
        genre: "country",
        color: "#1f2937",
        initials: "JC",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Johnny_Cash_1977.jpg/330px-Johnny_Cash_1977.jpg",
        bio: "J.R. Cash's family farmed a 20-acre Dyess Colony plot through the Depression. The 'Man in Black' later built one of country music's most enduring, genre-crossing catalogs.",
        albums: ["At Folsom Prison", "American IV: The Man Comes Around"],
        spotifyUrl: "https://open.spotify.com/search/Johnny%20Cash%20Ring%20of%20Fire",
        signatureTrack: "Ring of Fire",
      },
    ],
  },
  {
    id: "butcher-hollow-kentucky",
    name: "Butcher Hollow",
    fullName: "Butcher Hollow, Van Lear",
    city: "Van Lear, KY",
    country: "US",
    lat: 37.5350,
    lng: -82.7601,
    genre: "country",
    era: "1935 – 1960",
    coverUrl: img("photo-1519501025264-65ba15a82390"),
    description:
      "A remote Appalachian coal-mining hollow in eastern Kentucky, accessible even today mostly by a single winding road. One miner's daughter turned its hardship into a country songbook so vivid it earned its own Oscar-winning film.",
    artists: [
      {
        id: "loretta-lynn",
        name: "Loretta Lynn",
        genre: "country",
        color: "#a78bfa",
        initials: "LL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/LorettaLynn1960s.jpg/330px-LorettaLynn1960s.jpg",
        bio: "Loretta Webb grew up the daughter of a Butcher Hollow coal miner. 'Coal Miner's Daughter' became both her signature song and an Oscar-winning biopic title.",
        albums: ["Coal Miner's Daughter", "Van Lear Rose"],
        spotifyUrl: "https://open.spotify.com/search/Loretta%20Lynn%20Coal%20Miner%27s%20Daughter",
        signatureTrack: "Coal Miner's Daughter",
      },
    ],
  },
  {
    id: "oildale-bakersfield",
    name: "Oildale",
    fullName: "Oildale, Bakersfield",
    city: "Bakersfield, CA",
    country: "US",
    lat: 35.4064,
    lng: -119.0187,
    genre: "country",
    era: "1953 – 1970",
    coverUrl: img("photo-1519501025264-65ba15a82390"),
    description:
      "A dusty oil-field company town across the river from Bakersfield, settled by Dust Bowl migrants from Texas and Oklahoma. Their honky-tonks gave rise to the twangy, drum-driven 'Bakersfield Sound' — country music's blunt, working-class answer to Nashville's polish.",
    artists: [
      {
        id: "merle-haggard",
        name: "Merle Haggard",
        genre: "country",
        color: "#92400e",
        initials: "MH",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Merle_Haggard_in_1971.jpg/330px-Merle_Haggard_in_1971.jpg",
        bio: "Raised in a converted boxcar in Oildale, Haggard did a stint in San Quentin before becoming the Bakersfield Sound's defining voice on 'Okie from Muskogee.'",
        albums: ["Mama Tried", "Okie from Muskogee"],
        spotifyUrl: "https://open.spotify.com/search/Merle%20Haggard%20Mama%20Tried",
        signatureTrack: "Mama Tried",
      },
    ],
  },
];

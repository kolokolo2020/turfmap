export type Genre = "hip-hop" | "grime" | "reggae" | "jazz" | "blues" | "country" | "afrobeats" | "latin";

export interface Artist {
  id: string;
  name: string;
  genre: Genre;
  color: string;         // accent color for this artist's card
  initials: string;      // fallback when no photo
  imageUrl?: string;     // real photo — falls back to initials when absent
  bio: string;           // 1-2 sentences
  albums?: string[];     // most notable releases
  spotifyUrl: string;
  signatureTrack: string;
}

export interface Location {
  id: string;
  name: string;          // "O'Block"
  fullName: string;      // "79th & St. Lawrence, South Side"
  city: string;
  country: string;
  lat: number;
  lng: number;
  genre: Genre;
  coverUrl: string;       // street/neighborhood photo shown in the panel
  description: string;   // why this place matters
  artists: Artist[];
  era: string;           // "2012 – present"
}

// Keyless, no-account preview lookup via Apple's public iTunes Search API —
// used to give pin cards real inline audio/video playback even though most
// of the seeded spotifyUrl/videoUrl values are search-result links rather
// than direct tracks (Spotify/YouTube don't offer a keyless equivalent).
export interface MediaPreview {
  previewUrl: string;
  artworkUrl?: string;
}

async function searchItunes(
  term: string,
  entity: "song" | "musicVideo"
): Promise<MediaPreview | null> {
  const media = entity === "musicVideo" ? "musicVideo" : "music";
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=${media}&entity=${entity}&limit=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const hit = data.results?.[0];
  if (!hit?.previewUrl) return null;
  return { previewUrl: hit.previewUrl as string, artworkUrl: hit.artworkUrl100 as string | undefined };
}

export const fetchAudioPreview = (artistName: string, trackTitle: string) =>
  searchItunes(`${artistName} ${trackTitle}`, "song");

export const fetchVideoPreview = (artistName: string, videoTitle: string) =>
  searchItunes(`${artistName} ${videoTitle}`, "musicVideo");

// Only one preview should play at a time across the whole page — registering
// a newly-playing element pauses whatever played before it, regardless of
// which component (audio card or video modal) owns either element.
let currentlyPlaying: HTMLMediaElement | null = null;

export function registerPlaying(el: HTMLMediaElement) {
  if (currentlyPlaying && currentlyPlaying !== el) currentlyPlaying.pause();
  currentlyPlaying = el;
}

export function unregisterPlaying(el: HTMLMediaElement) {
  if (currentlyPlaying === el) currentlyPlaying = null;
}

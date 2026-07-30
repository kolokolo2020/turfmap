// Lazily loads the Google Maps JavaScript API once and caches the promise,
// so opening Street View repeatedly doesn't re-inject the script tag. Typed
// loosely as `any` — this project doesn't carry the (large) @types/google.maps
// package for the handful of Street View calls that need it.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GoogleNamespace = any;

declare global {
  interface Window {
    google?: GoogleNamespace;
  }
}

let loadPromise: Promise<GoogleNamespace> | null = null;

export function loadGoogleMaps(apiKey: string): Promise<GoogleNamespace> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.google?.maps) return Promise.resolve(window.google);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const callbackName = "__turfGoogleMapsReady";
    (window as unknown as Record<string, () => void>)[callbackName] = () => {
      resolve(window.google);
    };
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=${callbackName}`;
    script.async = true;
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Google Maps JavaScript API"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

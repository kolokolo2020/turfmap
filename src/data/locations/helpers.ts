export const img = (id: string) => `https://images.unsplash.com/${id}?w=800&h=600&fit=crop&q=80`;
export const wiki = (path: string) => `https://upload.wikimedia.org/wikipedia/${path}`;

// Parses the leading 4-digit year out of an `era` string ("2012 – present",
// "1920 – 1950", "1983") for the time-travel slider. Falls back to 1900 for
// anything unparseable rather than throwing, since era is free-text.
export function eraStartYear(era: string): number {
  const match = era.match(/\d{4}/);
  return match ? parseInt(match[0], 10) : 1900;
}

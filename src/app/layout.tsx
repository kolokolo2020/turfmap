import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const title = "TURF — Music Mapped";
const description =
  "Explore hip-hop, grime, reggae, afrobeats, latin, jazz, and blues mapped to the exact streets and blocks where they were born.";

export const metadata: Metadata = {
  metadataBase: new URL("https://turf-map.com"),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://turf-map.com",
    siteName: "TURF",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark light",
};

// Runs before paint so the correct theme applies immediately — without this,
// React's own theme state (which can't read localStorage until after mount)
// would render the wrong theme for one frame on every load.
const themeInitScript = `(function(){try{var t=localStorage.getItem('turf-theme');if(t!=='dark'&&t!=='light'){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the inline script below sets data-theme
    // before React hydrates, on purpose, so server/client attributes will
    // legitimately differ here — same technique libraries like next-themes use.
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} h-full overflow-hidden`}>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}

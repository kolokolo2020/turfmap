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
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}

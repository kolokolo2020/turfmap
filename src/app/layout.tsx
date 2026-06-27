import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TURF — Music Mapped",
  description: "Explore hip-hop, grime, reggae, and more mapped to the exact streets and blocks where they were born.",
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

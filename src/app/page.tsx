"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import MapLoader from "@/components/MapLoader";
import { useTheme } from "@/hooks/useTheme";

export default function HomePage() {
  const [activeGenre, setActiveGenre] = useState("all");
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative w-full h-full">
      <Navbar
        activeGenre={activeGenre}
        onGenreChange={setActiveGenre}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
      <MapLoader activeGenre={activeGenre} theme={theme} />
    </div>
  );
}

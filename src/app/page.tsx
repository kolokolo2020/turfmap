"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import MapLoader from "@/components/MapLoader";

export default function HomePage() {
  const [activeGenre, setActiveGenre] = useState("all");

  return (
    <div className="relative w-full h-full">
      <Navbar activeGenre={activeGenre} onGenreChange={setActiveGenre} />
      <MapLoader activeGenre={activeGenre} />
    </div>
  );
}

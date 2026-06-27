import Navbar from "@/components/Navbar";
import MapLoader from "@/components/MapLoader";

export default function HomePage() {
  return (
    <div className="relative w-full h-full">
      <Navbar />
      <MapLoader />
    </div>
  );
}

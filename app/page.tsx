import HeroSlider from "@/components/HeroSlider";
import PropertyExplorer from "@/components/PropertyExplorer";
import ServiceSlider from "@/components/ServiceSlider";
import OurProjectsSlider from "@/components/OurProjectsSlider";
import SearchBar from "@/components/SearchBar";
import { getOurProjects, getProperties } from "@/lib/properties";
import { getActiveServices } from "@/lib/services";
import { connection } from "next/server";

export default async function Home() {
  await connection();
  const [properties, services, projects] = await Promise.all([getProperties(), getActiveServices(), getOurProjects()]);

  // console.log("Fetched properties:", properties);
  // console.log("Fetched services:", services);

  return (
    <main className="flex flex-1 flex-col bg-[#f4f2ed]">
      <section><HeroSlider /></section>
      <div className="absolute -bottom-16 left-0 z-20 mx-auto w-full max-w-2xl px-4 sm:px-0">
        <SearchBar />
      </div>
      <ServiceSlider services={services} compact />
      <OurProjectsSlider projects={projects} />
      <PropertyExplorer properties={properties} />
    </main>
  );
}

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
      <section className="relative">
        <HeroSlider />
        <div className="absolute inset-x-0 md:inset-x-auto  md:left-10 -bottom-16 z-20 mx-auto hidden w-full max-w-2xl md:flex justify-end">
          <SearchBar />
        </div>
      </section>
      <section className="bg-[#f4f2ed] px-4 py-12 md:hidden">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-bold tracking-[0.18em] text-brand-gold">جست‌وجوی ملک</p>
          <h2 className="mb-7 mt-3 text-3xl font-black text-brand-dark">ملک مناسب خود را پیدا کنید</h2>
          <SearchBar />
        </div>
      </section>
      <ServiceSlider services={services} compact />
      <OurProjectsSlider projects={projects} />
      <PropertyExplorer properties={properties} />
    </main>
  );
}

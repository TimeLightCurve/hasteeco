import { connection } from "next/server";
import ServiceSlider from "@/components/ServiceSlider";
import { getActiveServices } from "@/lib/services";

export default async function ServicesPage() {
  await connection();
  const services = await getActiveServices();

  return (
    <main className="min-h-screen bg-[#f4f2ed]">
      <ServiceSlider services={services}  />
    </main>
  );
}

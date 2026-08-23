import { connection } from "next/server";
import OurProjectsSlider from "@/components/OurProjectsSlider";
import { getOurProjects } from "@/lib/properties";

export default async function ProjectsPage() {
  await connection();
  const projects = await getOurProjects();
  return <main className="bg-black"><OurProjectsSlider projects={projects} /></main>;
}

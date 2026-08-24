import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VillaTour } from "@/components/villa-tour";
import { ExternalVirtualTour } from "@/components/external-virtual-tour";
import { getVirtualTourBySlug } from "@/lib/virtual-tours";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getVirtualTourBySlug(slug);
  if (!project) return { title: "Virtual tour not found | Haste Eco" };
  return {
    title: `${project.name} | Haste Eco`,
    description: `Explore ${project.name} as an immersive 360-degree virtual tour.`,
  };
}

export default async function VirtualTourProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getVirtualTourBySlug(slug);
  if (!project) notFound();

  if (project.displayMode === "iframe" && project.iframeUrl) {
    return <ExternalVirtualTour name={project.name} url={project.iframeUrl} />;
  }

  return <VillaTour initialScenes={project.scenes} projectName={project.name} />;
}

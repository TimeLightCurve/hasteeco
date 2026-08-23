import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/auth";
import { TourAdmin } from "@/components/tour-admin";
import { getManagedProperties } from "@/lib/admin-properties";
import { getManagedVirtualTours } from "@/lib/virtual-tours";

export const metadata: Metadata = {
  title: "Virtual Tour Studio | Haste Eco",
};

export default async function VirtualTourAdminPage() {
  if (!(await requireAdmin())) redirect("/login?callbackUrl=/admin/virtual-tour");
  const [projects, properties] = await Promise.all([
    getManagedVirtualTours(),
    getManagedProperties(),
  ]);
  return (
    <TourAdmin
      initialProjects={projects}
      properties={properties.map(({ listingId, slug, title, titleFa }) => ({ listingId, slug, title, titleFa }))}
    />
  );
}

import { redirect } from "next/navigation";
import { requireAdmin } from "@/auth";
import AdminPropertiesManager from "@/components/AdminPropertiesManager";
import { getManagedProperties } from "@/lib/admin-properties";

type Props = { searchParams: Promise<{ new?: string }> };

export default async function AdminProjectsPage({ searchParams }: Props) {
  const session = await requireAdmin();
  if (!session) redirect("/login?callbackUrl=/admin/projects");
  const [properties, params] = await Promise.all([getManagedProperties(), searchParams]);
  return (
    <AdminPropertiesManager
      initialProperties={properties.filter((property) => property.our_project)}
      nextListingIdOverride={Math.max(0, ...properties.map((property) => property.listingId)) + 1}
      openNewInitially={params.new === "1"}
      canDelete={session.user.role === "admin"}
      projectMode
    />
  );
}

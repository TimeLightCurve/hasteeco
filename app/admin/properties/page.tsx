import { redirect } from "next/navigation";
import { requireAdmin } from "@/auth";
import AdminPropertiesManager from "@/components/AdminPropertiesManager";
import { getManagedProperties } from "@/lib/admin-properties";

type Props = { searchParams: Promise<{ new?: string }> };

export default async function ManagePropertiesPage({ searchParams }: Props) {
  const session = await requireAdmin();
  if (!session) redirect("/login?callbackUrl=/admin/properties");
  const [properties, params] = await Promise.all([getManagedProperties(), searchParams]);
  return <AdminPropertiesManager initialProperties={properties} openNewInitially={params.new === "1"} canDelete={session.user.role === "admin"} />;
}

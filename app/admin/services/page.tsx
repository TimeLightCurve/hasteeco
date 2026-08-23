import { redirect } from "next/navigation";
import { requireAdmin } from "@/auth";
import AdminServicesManager from "@/components/AdminServicesManager";
import { getManagedServices } from "@/lib/admin-services";

export default async function AdminServicesPage() {
  if (!(await requireAdmin())) redirect("/login?callbackUrl=/admin/services");
  const services = await getManagedServices();
  return <AdminServicesManager initialServices={services} />;
}

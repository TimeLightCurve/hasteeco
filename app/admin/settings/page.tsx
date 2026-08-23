import { redirect } from "next/navigation";
import { requireAdmin } from "@/auth";
import AdminCompanySettings from "@/components/AdminCompanySettings";
import { getCompanySettings } from "@/lib/company-settings";

export default async function AdminSettingsPage() {
  if (!(await requireAdmin())) redirect("/login?callbackUrl=/admin/settings");
  return <AdminCompanySettings initialSettings={await getCompanySettings()} />;
}

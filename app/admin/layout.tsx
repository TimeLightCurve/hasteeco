import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminShell from "@/components/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");

  return (
    <AdminShell
      user={{
        name: session.user.name ?? "Admin",
        email: session.user.email ?? "",
        role: session.user.role ?? "editor",
      }}
    >
      {children}
    </AdminShell>
  );
}

import { requireAdmin } from "@/auth";
import { getCompanySettings, updateCompanySettings } from "@/lib/company-settings";
import { companySettingsInputSchema } from "@/lib/company-settings-schema";

export async function GET() {
  if (!(await requireAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ data: await getCompanySettings() });
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON body" }, { status: 400 }); }
  const parsed = companySettingsInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("؛ ") }, { status: 400 });
  }
  return Response.json({ data: await updateCompanySettings(parsed.data) });
}

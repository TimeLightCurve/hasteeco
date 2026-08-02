import { requireAdmin } from "@/auth";
import { getManagedServices } from "@/lib/admin-services";
import { serviceInputSchema } from "@/lib/service-schema";
import { upsertService } from "@/lib/services";

export async function GET() {
  if (!(await requireAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const services = await getManagedServices();
  return Response.json({ data: services, count: services.length });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await readJson(request);
  if (body === null) return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  const parsed = serviceInputSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues.map((issue) => issue.message).join("؛ ") }, { status: 400 });
  const service = await upsertService(parsed.data.serviceType, parsed.data);
  return Response.json({ data: service }, { status: 201 });
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

import { requireAdmin } from "@/auth";
import { serviceInputSchema } from "@/lib/service-schema";
import { upsertService } from "@/lib/services";

type Params = { params: Promise<{ serviceType: string }> };

export async function PUT(request: Request, { params }: Params) {
  if (!(await requireAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { serviceType } = await params;
  const body = await readJson(request);
  if (body === null) return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  const parsed = serviceInputSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues.map((issue) => issue.message).join("؛ ") }, { status: 400 });
  const service = await upsertService(serviceType as never, parsed.data);
  return Response.json({ data: service });
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

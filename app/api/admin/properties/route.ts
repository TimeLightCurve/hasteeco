import { requireAdmin } from "@/auth";
import { createManagedProperty, getManagedProperties } from "@/lib/admin-properties";
import { propertyInputSchema, propertyValidationMessage } from "@/lib/property-schema";

export async function GET() {
  if (!(await requireAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const properties = await getManagedProperties();
  return Response.json({ data: properties, count: properties.length });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await readJson(request);
  if (body === null) return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  const parsed = propertyInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: propertyValidationMessage(parsed.error) }, { status: 400 });
  }

  const input = {
    ...parsed.data,
    location: {
      ...parsed.data.location,
      geo: {
        type: "Point" as const,
        coordinates: [
          parsed.data.location.coordinates.longitude,
          parsed.data.location.coordinates.latitude,
        ] as [number, number],
      },
    },
  };

  try {
    const property = await createManagedProperty(input);
    return Response.json({ data: property }, { status: 201 });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return Response.json({ error: "شناسه یا slug قبلاً استفاده شده است." }, { status: 409 });
    }
    throw error;
  }
}

function isDuplicateKeyError(error: unknown): error is { code: number } {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

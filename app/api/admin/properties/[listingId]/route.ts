import { requireAdmin } from "@/auth";
import { deleteManagedProperty, updateManagedProperty } from "@/lib/admin-properties";
import { propertyInputSchema, propertyValidationMessage } from "@/lib/property-schema";

type Context = { params: Promise<{ listingId: string }> };

export async function PUT(request: Request, { params }: Context) {
  if (!(await requireAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const listingId = parseListingId((await params).listingId);
  if (listingId === null) return Response.json({ error: "Invalid listing ID" }, { status: 400 });

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
    const property = await updateManagedProperty(listingId, input);
    if (!property) return Response.json({ error: "Property not found" }, { status: 404 });
    return Response.json({ data: property });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return Response.json({ error: "شناسه یا slug قبلاً استفاده شده است." }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") {
    return Response.json({ error: "Only administrators can delete properties" }, { status: 403 });
  }

  const listingId = parseListingId((await params).listingId);
  if (listingId === null) return Response.json({ error: "Invalid listing ID" }, { status: 400 });
  const result = await deleteManagedProperty(listingId);
  if (!result.deletedCount) return Response.json({ error: "Property not found" }, { status: 404 });
  return Response.json({ success: true });
}

function parseListingId(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
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

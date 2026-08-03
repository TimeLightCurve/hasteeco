import { requireAdmin } from "@/auth";
import { deleteManagedProperty, updateManagedProperty } from "@/lib/admin-properties";
import { propertyInputSchema, propertyValidationIssues } from "@/lib/property-schema";

type Context = { params: Promise<{ listingId: string }> };

export async function PUT(request: Request, { params }: Context) {
  if (!(await requireAdmin())) return Response.json({ error: "نشست شما منقضی شده است. دوباره وارد پنل شوید." }, { status: 401 });
  const listingId = parseListingId((await params).listingId);
  if (listingId === null) return Response.json({ error: "شناسه ملک معتبر نیست." }, { status: 400 });

  const body = await readJson(request);
  if (body === null) {
    return Response.json({ error: "بدنه درخواست معتبر نیست. صفحه را تازه‌سازی کرده و دوباره تلاش کنید." }, { status: 400 });
  }
  const parsed = propertyInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: "بعضی از اطلاعات ملک معتبر نیست. موارد زیر را اصلاح کنید.",
        issues: propertyValidationIssues(parsed.error),
      },
      { status: 400 },
    );
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
    if (!property) return Response.json({ error: "ملک موردنظر پیدا نشد." }, { status: 404 });
    return Response.json({ data: property });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return Response.json({ error: "شناسه یا slug قبلاً استفاده شده است." }, { status: 409 });
    }
    console.error(`Failed to update property ${listingId}`, error);
    return Response.json(
      { error: "ویرایش ملک به دلیل خطای سرور انجام نشد. دوباره تلاش کنید." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "نشست شما منقضی شده است. دوباره وارد پنل شوید." }, { status: 401 });
  if (session.user.role !== "admin") {
    return Response.json({ error: "فقط مدیر سیستم اجازه حذف ملک را دارد." }, { status: 403 });
  }

  const listingId = parseListingId((await params).listingId);
  if (listingId === null) return Response.json({ error: "شناسه ملک معتبر نیست." }, { status: 400 });
  try {
    const result = await deleteManagedProperty(listingId);
    if (!result.deletedCount) return Response.json({ error: "ملک موردنظر پیدا نشد." }, { status: 404 });
    return Response.json({ success: true });
  } catch (error) {
    console.error(`Failed to delete property ${listingId}`, error);
    return Response.json(
      { error: "حذف ملک به دلیل خطای سرور انجام نشد. دوباره تلاش کنید." },
      { status: 500 },
    );
  }
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

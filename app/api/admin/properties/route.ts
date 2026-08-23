import { requireAdmin } from "@/auth";
import { createManagedProperty, getManagedProperties } from "@/lib/admin-properties";
import { propertyInputSchema, propertyValidationIssues } from "@/lib/property-schema";

export async function GET() {
  if (!(await requireAdmin())) return Response.json({ error: "نشست شما منقضی شده است. دوباره وارد پنل شوید." }, { status: 401 });
  try {
    const properties = await getManagedProperties();
    return Response.json({ data: properties, count: properties.length });
  } catch (error) {
    console.error("Failed to load properties", error);
    return Response.json(
      { error: "دریافت فهرست املاک به دلیل خطای سرور انجام نشد." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "نشست شما منقضی شده است. دوباره وارد پنل شوید." }, { status: 401 });

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
    const property = await createManagedProperty(input);
    return Response.json({ data: property }, { status: 201 });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return Response.json({ error: "شناسه یا slug قبلاً استفاده شده است." }, { status: 409 });
    }
    console.error("Failed to create property", error);
    return Response.json(
      { error: "ذخیره ملک به دلیل خطای سرور انجام نشد. دوباره تلاش کنید." },
      { status: 500 },
    );
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

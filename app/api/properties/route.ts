import { getProperties } from "@/lib/properties";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const properties = await getProperties({
    type: searchParams.get("type") ?? undefined,
    city: searchParams.get("city") ?? undefined,
    query: searchParams.get("q") ?? undefined,
  });

  return Response.json({ data: properties, count: properties.length });
}

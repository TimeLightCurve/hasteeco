import { requireAdmin } from "@/auth";
import { parseVirtualTourProjectInput } from "@/lib/virtual-tour-schema";
import { createManagedVirtualTour, getManagedVirtualTours } from "@/lib/virtual-tours";

export async function GET() {
  if (!(await requireAdmin())) return unauthorized();

  try {
    const projects = await getManagedVirtualTours();
    return Response.json({ data: projects, count: projects.length });
  } catch (error) {
    console.error("Failed to load virtual tour projects", error);
    return Response.json({ error: "Could not load virtual tour projects." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorized();

  const parsed = parseVirtualTourProjectInput(await readJson(request));
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const project = await createManagedVirtualTour(parsed.data);
    return Response.json({ data: project }, { status: 201 });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return Response.json({ error: "This virtual tour slug already exists." }, { status: 409 });
    }
    console.error("Failed to create virtual tour project", error);
    return Response.json({ error: "Could not create the virtual tour project." }, { status: 500 });
  }
}

function unauthorized() {
  return Response.json({ error: "Your admin session has expired." }, { status: 401 });
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

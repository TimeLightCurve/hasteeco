import { requireAdmin } from "@/auth";
import { parseVirtualTourProjectInput } from "@/lib/virtual-tour-schema";
import { deleteManagedVirtualTour, updateManagedVirtualTour } from "@/lib/virtual-tours";

type Context = { params: Promise<{ slug: string }> };

export async function PUT(request: Request, { params }: Context) {
  if (!(await requireAdmin())) return unauthorized();

  const parsed = parseVirtualTourProjectInput(await readJson(request));
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const { slug } = await params;
    const project = await updateManagedVirtualTour(decodeURIComponent(slug), parsed.data);
    if (!project) return Response.json({ error: "Virtual tour project not found." }, { status: 404 });
    return Response.json({ data: project });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return Response.json({ error: "This virtual tour slug already exists." }, { status: 409 });
    }
    console.error("Failed to update virtual tour project", error);
    return Response.json({ error: "Could not update the virtual tour project." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  if (!(await requireAdmin())) return unauthorized();

  try {
    const { slug } = await params;
    const result = await deleteManagedVirtualTour(decodeURIComponent(slug));
    if (!result.deletedCount) return Response.json({ error: "Virtual tour project not found." }, { status: 404 });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete virtual tour project", error);
    return Response.json({ error: "Could not delete the virtual tour project." }, { status: 500 });
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

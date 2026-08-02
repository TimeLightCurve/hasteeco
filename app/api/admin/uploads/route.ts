import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { requireAdmin } from "@/auth";

export const runtime = "nodejs";

const extensions: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};
const maximumFileSize = 8 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const files = form.getAll("files").filter((value): value is File => value instanceof File);
  if (!files.length) return Response.json({ error: "هیچ تصویری انتخاب نشده است." }, { status: 400 });
  if (files.length > 30) return Response.json({ error: "حداکثر ۳۰ تصویر قابل بارگذاری است." }, { status: 400 });

  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDirectory, { recursive: true });
  const saved: string[] = [];
  for (const file of files) {
    const extension = extensions[file.type];
    if (!extension) return Response.json({ error: "فرمت تصویر باید JPG، PNG، WEBP یا AVIF باشد." }, { status: 400 });
    if (file.size > maximumFileSize) return Response.json({ error: "حجم هر تصویر باید کمتر از ۸ مگابایت باشد." }, { status: 400 });
    const fileName = `${randomUUID()}${extension}`;
    await writeFile(path.join(uploadDirectory, fileName), Buffer.from(await file.arrayBuffer()));
    saved.push(`/uploads/${fileName}`);
  }
  return Response.json({ data: saved }, { status: 201 });
}

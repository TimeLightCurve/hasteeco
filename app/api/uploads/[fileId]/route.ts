import { GridFSBucket, ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

type Context = { params: Promise<{ fileId: string }> };

export async function GET(_request: Request, { params }: Context) {
  const fileId = (await params).fileId;
  if (!ObjectId.isValid(fileId)) {
    return Response.json({ error: "شناسه تصویر معتبر نیست." }, { status: 400 });
  }

  try {
    const db = await getDb();
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });
    const id = new ObjectId(fileId);
    const file = await bucket.find({ _id: id }).next();
    if (!file) return Response.json({ error: "تصویر پیدا نشد." }, { status: 404 });

    const chunks: Buffer[] = [];
    for await (const chunk of bucket.openDownloadStream(id)) {
      chunks.push(Buffer.from(chunk));
    }
    const contents = Buffer.concat(chunks);
    const contentType = typeof file.metadata?.contentType === "string"
      ? file.metadata.contentType
      : "application/octet-stream";

    return new Response(new Uint8Array(contents), {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(contents.length),
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error(`Failed to load uploaded image ${fileId}`, error);
    return Response.json({ error: "دریافت تصویر از سرور انجام نشد." }, { status: 500 });
  }
}

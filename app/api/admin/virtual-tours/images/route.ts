import { GridFSBucket, ObjectId, type Db } from "mongodb";
import sharp from "sharp";
import { requireAdmin } from "@/auth";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

const acceptedContentTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const maximumFileSize = 20 * 1024 * 1024;
const panoramaSize = { width: 4096, height: 2048 };
const thumbnailSize = { width: 512, height: 256 };

type StoredAsset = {
  id: ObjectId;
  url: string;
};

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return Response.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const value = form.get("file");
    file = value instanceof File && value.size > 0 ? value : null;
  } catch {
    return Response.json({ error: "The upload request is invalid." }, { status: 400 });
  }

  if (!file) return Response.json({ error: "Choose a panorama image to upload." }, { status: 400 });
  if (!acceptedContentTypes.has(file.type)) {
    return Response.json({ error: "The panorama must be a JPG, PNG, WebP, or AVIF image." }, { status: 400 });
  }
  if (file.size > maximumFileSize) {
    return Response.json({ error: "The source panorama must be smaller than 20 MB." }, { status: 400 });
  }

  const stored: StoredAsset[] = [];
  let bucket: GridFSBucket | undefined;
  try {
    const sourceBuffer = Buffer.from(await file.arrayBuffer());
    const source = sharp(sourceBuffer, { failOn: "error", limitInputPixels: 120_000_000 }).rotate();
    const metadata = await source.metadata();
    if (!metadata.width || !metadata.height) {
      return Response.json({ error: "The panorama dimensions could not be read." }, { status: 400 });
    }

    const aspectRatio = metadata.width / metadata.height;
    if (aspectRatio < 1.9 || aspectRatio > 2.1) {
      return Response.json({ error: "A 360° panorama must use an approximately 2:1 aspect ratio." }, { status: 400 });
    }

    const [panoramaBuffer, thumbnailBuffer] = await Promise.all([
      source
        .clone()
        .resize(panoramaSize.width, panoramaSize.height, { fit: "fill", kernel: sharp.kernel.lanczos3 })
        .webp({ quality: 82, effort: 5, smartSubsample: true })
        .toBuffer(),
      source
        .clone()
        .resize(thumbnailSize.width, thumbnailSize.height, { fit: "fill", kernel: sharp.kernel.lanczos3 })
        .webp({ quality: 74, effort: 4, smartSubsample: true })
        .toBuffer(),
    ]);

    const db = await getDb();
    bucket = new GridFSBucket(db, { bucketName: "uploads" });
    const pairId = new ObjectId().toHexString();
    const baseName = sanitizeFilename(file.name);

    const panorama = await storeBuffer(bucket, panoramaBuffer, `${baseName}.webp`, {
      kind: "virtual-tour-panorama",
      pairId,
      originalName: file.name,
      width: panoramaSize.width,
      height: panoramaSize.height,
    });
    stored.push(panorama);

    const thumbnail = await storeBuffer(bucket, thumbnailBuffer, `${baseName}-thumb.webp`, {
      kind: "virtual-tour-thumbnail",
      pairId,
      originalName: file.name,
      width: thumbnailSize.width,
      height: thumbnailSize.height,
    });
    stored.push(thumbnail);

    return Response.json({
      data: {
        panorama: panorama.url,
        thumbnail: thumbnail.url,
        width: panoramaSize.width,
        height: panoramaSize.height,
      },
    }, { status: 201 });
  } catch (error) {
    const cleanupBucket = bucket;
    if (cleanupBucket) await Promise.allSettled(stored.map((asset) => cleanupBucket.delete(asset.id)));
    console.error("Failed to process virtual-tour panorama", error);
    return Response.json({ error: "The panorama could not be processed or stored." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return Response.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });
  }

  let paths: string[];
  try {
    const body = await request.json() as { paths?: unknown };
    paths = Array.isArray(body.paths)
      ? body.paths.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return Response.json({ error: "The delete request is invalid." }, { status: 400 });
  }

  const ids = [...new Set(paths.map(parseUploadId).filter((id): id is string => Boolean(id)))].map((id) => new ObjectId(id));
  if (!ids.length) return Response.json({ data: { deleted: 0, retained: 0 } });

  try {
    const db = await getDb();
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });
    const files = await bucket.find({ _id: { $in: ids } }).toArray();
    let deleted = 0;
    let retained = 0;

    for (const file of files) {
      const kind = file.metadata?.kind;
      if (kind !== "virtual-tour-panorama" && kind !== "virtual-tour-thumbnail") {
        retained += 1;
        continue;
      }

      const url = `/api/uploads/${file._id.toHexString()}`;
      if (await isAssetReferenced(db, url)) {
        retained += 1;
        continue;
      }

      await bucket.delete(file._id);
      deleted += 1;
    }

    return Response.json({ data: { deleted, retained } });
  } catch (error) {
    console.error("Failed to delete virtual-tour image", error);
    return Response.json({ error: "The uploaded image could not be deleted." }, { status: 500 });
  }
}

async function storeBuffer(
  bucket: GridFSBucket,
  contents: Buffer,
  filename: string,
  metadata: Record<string, unknown>,
): Promise<StoredAsset> {
  const id = new ObjectId();
  const stream = bucket.openUploadStreamWithId(id, filename, {
    metadata: { ...metadata, contentType: "image/webp", size: contents.length },
  });

  await new Promise<void>((resolve, reject) => {
    stream.once("error", reject);
    stream.once("finish", resolve);
    stream.end(contents);
  });

  return { id, url: `/api/uploads/${id.toHexString()}` };
}

function parseUploadId(path: string) {
  return path.match(/^\/api\/uploads\/([a-f\d]{24})$/i)?.[1];
}

async function isAssetReferenced(db: Db, url: string) {
  return Boolean(await db.collection("virtual_tours").findOne({
    $or: [
      { "scenes.panorama": url },
      { "scenes.thumbnail": url },
    ],
  }, { projection: { _id: 1 } }));
}

function sanitizeFilename(filename: string) {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "panorama";
}

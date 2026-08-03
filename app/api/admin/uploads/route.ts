import { GridFSBucket, ObjectId } from "mongodb";
import { requireAdmin } from "@/auth";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

const acceptedContentTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const maximumFileSize = 4 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return Response.json({ error: "نشست شما منقضی شده است. دوباره وارد پنل شوید." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch (error) {
    console.warn("Unable to parse image upload form data", error);
    return Response.json({ error: "درخواست بارگذاری تصویر معتبر نیست." }, { status: 400 });
  }

  const files = form
    .getAll("files")
    .filter((value): value is File => value instanceof File && value.size > 0);
  if (!files.length) {
    return Response.json({ error: "هیچ تصویری انتخاب نشده است." }, { status: 400 });
  }
  if (files.length > 30) {
    return Response.json({ error: "حداکثر ۳۰ تصویر قابل بارگذاری است." }, { status: 400 });
  }

  const unsupportedFile = files.find((file) => !acceptedContentTypes.has(file.type));
  if (unsupportedFile) {
    return Response.json(
      { error: `فرمت تصویر «${unsupportedFile.name}» باید JPG، PNG، WEBP یا AVIF باشد.` },
      { status: 400 },
    );
  }

  const oversizedFile = files.find((file) => file.size > maximumFileSize);
  if (oversizedFile) {
    return Response.json(
      { error: `حجم تصویر «${oversizedFile.name}» باید کمتر از ۴ مگابایت باشد.` },
      { status: 400 },
    );
  }

  let bucket: GridFSBucket | undefined;
  const storedIds: ObjectId[] = [];
  try {
    const db = await getDb();
    bucket = new GridFSBucket(db, { bucketName: "uploads" });

    for (const file of files) {
      const id = new ObjectId();
      await storeImage(bucket, id, file);
      storedIds.push(id);
    }

    return Response.json(
      { data: storedIds.map((id) => `/api/uploads/${id.toHexString()}`) },
      { status: 201 },
    );
  } catch (error) {
    const cleanupBucket = bucket;
    if (cleanupBucket) {
      await Promise.allSettled(storedIds.map((id) => cleanupBucket.delete(id)));
    }
    console.error("Failed to store uploaded images", error);
    return Response.json(
      { error: "ذخیره تصویر روی سرور انجام نشد. اتصال پایگاه داده را بررسی کرده و دوباره تلاش کنید." },
      { status: 500 },
    );
  }
}

async function storeImage(bucket: GridFSBucket, id: ObjectId, file: File) {
  const uploadStream = bucket.openUploadStreamWithId(id, file.name || id.toHexString(), {
    metadata: {
      contentType: file.type,
      size: file.size,
    },
  });
  const contents = Buffer.from(await file.arrayBuffer());

  await new Promise<void>((resolve, reject) => {
    uploadStream.once("error", reject);
    uploadStream.once("finish", resolve);
    uploadStream.end(contents);
  });
}

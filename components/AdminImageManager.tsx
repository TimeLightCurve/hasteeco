"use client";

import Image from "next/image";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

type Props = {
  name: string;
  initialImages: string[];
  multiple?: boolean;
  label: string;
};

export default function AdminImageManager({ name, initialImages, multiple = true, label }: Props) {
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    const body = new FormData();
    Array.from(files).forEach((file) => body.append("files", file));
    try {
      const response = await fetch("/api/admin/uploads", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "بارگذاری تصویر انجام نشد.");
      const uploaded = result.data as string[];
      setImages((current) => multiple ? [...current, ...uploaded].slice(0, 30) : uploaded.slice(-1));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "بارگذاری تصویر انجام نشد.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={images.join("\n")} />
      <div className="mb-3 flex items-center justify-between gap-4">
        <span className="text-xs font-bold text-stone-500">{label}</span>
        <span className="text-[10px] text-stone-400">{images.length} تصویر</span>
      </div>
      <div className={`grid gap-3 ${multiple ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1"}`}>
        {images.map((src, index) => (
          <div key={`${src}-${index}`} className={`group relative overflow-hidden rounded-2xl bg-stone-100 ${multiple ? "aspect-[4/3]" : "aspect-video"}`}>
            <Image src={src} alt={`تصویر ${index + 1}`} fill sizes={multiple ? "240px" : "600px"} className="object-cover" />
            <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/25" />
            <button type="button" onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`حذف تصویر ${index + 1}`} className="absolute left-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white text-red-600 shadow-lg transition hover:bg-red-600 hover:text-white">
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ))}
        {(multiple || images.length === 0) && (
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className={`grid min-h-36 place-items-center rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 p-5 text-center text-stone-500 transition hover:border-brand-green hover:bg-brand-green/5 hover:text-brand-green disabled:opacity-50 ${multiple ? "aspect-[4/3]" : "aspect-video"}`}>
            <span className="flex flex-col items-center gap-3">{uploading ? <LoaderCircle className="h-7 w-7 animate-spin" /> : <ImagePlus className="h-7 w-7" />}<span className="text-xs font-bold">{uploading ? "در حال بارگذاری…" : "افزودن تصویر"}</span></span>
          </button>
        )}
      </div>
      {!multiple && images.length > 0 && <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs font-bold text-stone-600 transition hover:border-brand-green hover:text-brand-green"><ImagePlus className="h-4 w-4" />{uploading ? "در حال بارگذاری…" : "تغییر تصویر"}</button>}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple={multiple} onChange={(event) => void upload(event.target.files)} className="sr-only" />
      {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-red-700">{error}</p>}
    </div>
  );
}

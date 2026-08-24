import Link from "next/link";
import { BackIcon } from "@/components/icons";

type ExternalVirtualTourProps = {
  name: string;
  url: string;
};

export function ExternalVirtualTour({ name, url }: ExternalVirtualTourProps) {
  return (
    <main className="fixed inset-0 z-[100] bg-black" dir="rtl">
      <iframe
        src={url}
        title={`تور مجازی ${name}`}
        className="absolute inset-0 h-full w-full border-0"
        allow="fullscreen; gyroscope; accelerometer"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <Link
        href="/"
        aria-label="بازگشت به صفحه اصلی"
        className="absolute left-5 top-5 z-10 grid h-12 w-12 place-items-center rounded-full border border-white/35 bg-black/45 text-white shadow-xl backdrop-blur-md transition hover:border-white hover:bg-brand-dark sm:left-8 sm:top-8"
      >
        <BackIcon className="h-5 w-5" />
      </Link>
    </main>
  );
}

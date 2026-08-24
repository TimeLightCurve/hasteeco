"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useHorizontalSwipe } from "@/hooks/useHorizontalSwipe";
import { ArrowLeft, ArrowRight } from "lucide-react";

const slides = [
  {
    id: 1,
    imageSrc: "/images/properties/villa-130-exterior.jpg",
    gradient: "from-stone-600 via-stone-700 to-stone-900",
    heading: "با ما به دنیای رویاهایتان قدم بگذارید!",
    subtext:
      "از طراحی بی نظیر ویلاها تا بازسازی فضاهای زندگی، هر پروژه ما به یک داستان زیبا تبدیل می شود",
    cta: "مشاهده خدمات ما",
    ctaHref: "/services",
  },
  {
    id: 2,
    imageSrc: "/images/properties/villa-130-interior.jpg",
    gradient: "from-emerald-900 via-emerald-800 to-stone-900",
    heading: "بهترین ملک را با ما پیدا کنید",
    subtext:
      "با هزاران آگهی معتبر، خانه رویایی خود را در سراسر ایران بیابید",
    cta: "مشاهده پروژه های ما",
    ctaHref: "/projects",
  },
  {
    id: 3,
    imageSrc: "/images/properties/villa-130-twilight.jpg",
    gradient: "from-slate-700 via-slate-800 to-stone-900",
    heading: "سرمایه‌گذاری هوشمندانه در ملک",
    subtext:
      "با مشاوران متخصص ما بهترین فرصت‌های سرمایه‌گذاری ملکی را کشف کنید",
    cta: "مشاوره رایگان",
    ctaHref: "/contact",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % slides.length),
    []
  );
  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + slides.length) % slides.length),
    []
  );

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [paused, next]);

  const activeSlide = slides[current];
  const swipeHandlers = useHorizontalSwipe(next, prev);

  return (
    <div
      {...swipeHandlers}
      className="relative min-h-[100svh] w-full overflow-hidden bg-stone-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out bg-gradient-to-br ${slide.gradient} ${
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
          style={
            slide.imageSrc
              ? {
                  backgroundImage: `url(${slide.imageSrc})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/35" />

          {/* Text overlay — RTL start = visual right */}
          <div className="absolute inset-0 flex items-center pb-48 md:pb-0">
            <div className="w-full mx-auto px-8 md:px-36">
              <div className="max-w-2xl space-y-5 text-white">
                <h1 className="text-3xl md:text-8xl font-black leading-tight drop-shadow-md">
                  {slide.heading}
                </h1>
                {/* <p className="text-base md:text-lg leading-8 text-white/90 drop-shadow">
                  {slide.subtext}
                </p> */}
                {/* <Link
                  href={slide.ctaHref}
                  className="inline-block bg-brand-gold hover:brightness-110 text-white font-semibold px-8 py-3 rounded-md transition shadow-md"
                >
                  {slide.cta}
                </Link> */}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Prev arrow — visual right (RTL: start side) */}
      <button
        onClick={prev}
        className="absolute right-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40 md:flex"
        aria-label="اسلاید قبلی"
      >
        <ArrowRight className="h-5 w-5" aria-hidden />
      </button>

      {/* Next arrow — visual left (RTL: end side) */}
      <button
        onClick={next}
        className="absolute left-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40 md:flex"
        aria-label="اسلاید بعدی"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 gap-2 md:flex">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current
                ? "bg-white w-8"
                : "bg-white/50 w-2 hover:bg-white/70"
            }`}
            aria-label={`اسلاید ${i + 1}`}
          />
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 bg-black text-white md:hidden">
        <div className="grid min-h-44 grid-cols-[1fr_auto]">
          <div className="flex min-w-0 flex-col justify-between gap-4 p-6">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-white/45">HASTE ECO / {String(current + 1).padStart(2, "0")}</p>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/70">{activeSlide.subtext}</p>
            </div>
            <Link href={activeSlide.ctaHref} className="flex w-fit items-center gap-2 text-xs font-bold text-white transition hover:text-brand-gold">{activeSlide.cta}<ArrowLeft className="h-4 w-4" aria-hidden /></Link>
          </div>
          <div className="flex items-end gap-2 border-r border-white/15 p-5">
            <MobileArrow label="اسلاید قبلی" onClick={prev} direction="right" />
            <MobileArrow label="اسلاید بعدی" onClick={next} direction="left" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileArrow({ label, onClick, direction }: { label: string; onClick: () => void; direction: "left" | "right" }) {
  return <button type="button" aria-label={label} onClick={onClick} className="grid h-11 w-11 place-items-center rounded-full border border-white/35 transition hover:bg-white hover:text-black">{direction === "left" ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}</button>;
}

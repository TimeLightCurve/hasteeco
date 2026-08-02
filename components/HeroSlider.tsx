"use client";

import { useState, useEffect, useCallback } from "react";

const slides = [
  {
    id: 1,
    imageSrc: "/images/properties/villa-130-exterior.png",
    gradient: "from-stone-600 via-stone-700 to-stone-900",
    heading: "با ما به دنیای رویاهایتان قدم بگذارید!",
    subtext:
      "از طراحی بی نظیر ویلاها تا بازسازی فضاهای زندگی، هر پروژه ما به یک داستان زیبا تبدیل می شود",
    cta: "مشاهده خدمات ما",
    ctaHref: "/services",
  },
  {
    id: 2,
    imageSrc: "/images/properties/villa-130-interior.png",
    gradient: "from-emerald-900 via-emerald-800 to-stone-900",
    heading: "بهترین ملک را با ما پیدا کنید",
    subtext:
      "با هزاران آگهی معتبر، خانه رویایی خود را در سراسر ایران بیابید",
    cta: "مشاهده پروژه های ما",
    ctaHref: "/projects",
  },
  {
    id: 3,
    imageSrc: "/images/properties/villa-130-twilight.png",
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

  return (
    <div
      className="relative w-full h-screen min-h-[500px] overflow-hidden"
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
          <div className="absolute inset-0 flex items-center">
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
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
        aria-label="اسلاید قبلی"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Next arrow — visual left (RTL: end side) */}
      <button
        onClick={next}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
        aria-label="اسلاید بعدی"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
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
    </div>
  );
}

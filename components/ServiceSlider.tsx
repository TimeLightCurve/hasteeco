"use client"

import type { Service } from "@/lib/services"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useHorizontalSwipe } from "@/hooks/useHorizontalSwipe"
import { ArrowLeft, ArrowRight } from "lucide-react"

type Props = {
  services: Service[]
  compact?: boolean
}

const fallbackTypeMap: Record<string, string> = {
  villa: "villa",
  apartment: "apartment",
  land: "land",
  commercial: "commercial",
  decoration: "commercial",
  renovation: "commercial",
}

export default function ServiceSlider({ services, compact = false }: Props) {
  const [current, setCurrent] = useState(0)
  const next = () => setCurrent((value) => (value + 1) % services.length)
  const previous = () => setCurrent((value) => (value - 1 + services.length) % services.length)
  const swipeHandlers = useHorizontalSwipe(next, previous)

  useEffect(() => {
    if (services.length < 2) return
    const timer = window.setInterval(() => {
      setCurrent((value) => (value + 1) % services.length)
    }, 5500)
    return () => window.clearInterval(timer)
  }, [services.length])

  if (!services.length) return null

  const active = services[current]
  const targetType = active.relatedPropertyType ?? fallbackTypeMap[active.serviceType] ?? "villa"

  return (
    <section {...swipeHandlers} id="services" className={compact ? "touch-pan-y scroll-mt-20 px-4 pb-12 pt-12 sm:px-8 md:pt-28" : "min-h-screen touch-pan-y scroll-mt-20 px-4 py-8 sm:px-8"}>
      <div className={`mx-auto w-full overflow-hidden rounded-0 bg-black ${compact ? "" : "min-h-[85vh]"}`}>
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-105 lg:min-h-[85vh] ">
            <Image src={active.image} alt={active.title} fill priority className="object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-black/20" />
            <div className="absolute inset-0 flex items-end p-6 sm:p-10 lg:p-14">
              <div className="max-w-3xl text-white">
                <p className="mb-3 text-base font-bold tracking-[0.3em] text-white/60">SERVICES</p>
                <h2 className="text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">{active.title}</h2>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">{active.description}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={`/listings?type=${encodeURIComponent(targetType)}`}
                    className="rounded-none bg-white px-6 py-3 text-sm font-bold text-brand-dark transition hover:bg-brand-gold hover:text-white"
                  >
                    <span className="flex items-center gap-2">نمونه کارهای مرتبط <ArrowLeft className="h-4 w-4" aria-hidden /></span>
                  </Link>
                  {/* <Link
                    href="/services"
                    className="rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    Explore services
                  </Link> */}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 bg-[#f6f3ee] p-2 sm:p-8 lg:min-h-[85vh] lg:p-10">
            <div>
              {/* <p className="text-base font-bold tracking-[0.22em] text-brand-gold">خدمات ما</p> */}
              <h3 className="mt-3 text-3xl font-black text-brand-dark sm:text-4xl">خدمات ما</h3>
              {/* <p className="mt-4 max-w-lg text-sm leading-7 text-stone-500">
                Each card is pulled from MongoDB. Clicking a service takes the user to the property listings that match that service&apos;s property type.
              </p> */}
            </div>

            <div className="hidden gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-2">
              {services.map((service, index) => (
                <button
                  key={service.serviceType}
                  onClick={() => setCurrent(index)}
                  className={`group flex min-w-0 items-center gap-3 border p-3 text-right transition ${index === current
                      ? "border-brand-dark bg-black text-white"
                      : "border-stone-200 bg-white hover:border-brand-dark/40 hover:bg-white"
                    }`}
                >
                  <div className="relative h-24 w-28 shrink-0 overflow-hidden bg-stone-100 sm:h-36 sm:w-36 lg:h-32 lg:w-32">
                    <Image src={service.image} alt={service.title} fill className="object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {/* <p className={`text-base font-bold tracking-[0.2em] ${index === current ? "text-white/60" : "text-stone-400"}`}>
                      {service.serviceType}
                    </p> */}
                    <h4 className="mt-1 text-sm font-black leading-6 sm:text-base">{service.title}</h4>
                    {/* <p className={`mt-1 line-clamp-2 text-base md:text-base leading-5 ${index === current ? "text-white/70" : "text-stone-500"}`}>
                      {service.description}
                    </p> */}
                  </div>
                </button>
              ))}
            </div>

            <article className="overflow-hidden rounded-0 bg-black text-white sm:hidden">
              <div className="flex items-center gap-4 p-3">
                <div className="relative h-24 w-28 shrink-0 overflow-hidden ">
                  <Image src={active.image} alt={active.title} fill className="object-cover" />
                </div>
                <div className="min-w-0"><p className="text-base uppercase tracking-[0.18em] text-white/45">{active.serviceType}</p><h4 className="mt-2 text-base font-black leading-6">{active.title}</h4></div>
              </div>
              <div className="flex items-center justify-between border-t border-white/15 p-4">
                <Link href={`/listings?type=${encodeURIComponent(targetType)}`} className="flex items-center gap-2 text-xs font-bold text-white/70">مشاهده املاک مرتبط <ArrowLeft className="h-4 w-4" aria-hidden /></Link>
                <div className="flex gap-2"><SliderArrow label="سرویس قبلی" onClick={previous}><ArrowRight className="h-5 w-5" /></SliderArrow><SliderArrow label="سرویس بعدی" onClick={next}><ArrowLeft className="h-5 w-5" /></SliderArrow></div>
              </div>
            </article>

            <div className="hidden items-center justify-between gap-4 sm:flex">
              <div className="flex gap-2">
                {services.map((service, index) => (
                  <button
                    key={service.serviceType}
                    onClick={() => setCurrent(index)}
                    aria-label={service.title}
                    className={`h-2 rounded-full transition-all ${index === current ? "w-8 bg-brand-dark" : "w-2 bg-stone-300"}`}
                  />
                ))}
              </div>
              <p className="text-lg font-bold text-stone-400">
                {current + 1}/{services.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SliderArrow({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-label={label} onClick={onClick} className="grid h-10 w-10 place-items-center rounded-full border border-white/30 transition hover:bg-white hover:text-black">{children}</button>
}

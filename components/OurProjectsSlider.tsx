"use client"

import type { Property } from "@/lib/properties"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { useHorizontalSwipe } from "@/hooks/useHorizontalSwipe"
import { ArrowLeft, ArrowRight } from "lucide-react"

export default function OurProjectsSlider({ projects }: { projects: Property[] }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const next = useCallback(() => setCurrent((value) => (value + 1) % projects.length), [projects.length])
  const previous = useCallback(() => setCurrent((value) => (value - 1 + projects.length) % projects.length), [projects.length])
  const swipeHandlers = useHorizontalSwipe(next, previous)

  useEffect(() => {
    if (paused || projects.length < 2) return
    const timer = window.setInterval(next, 6500)
    return () => window.clearInterval(timer)
  }, [next, paused, projects.length])

  if (!projects.length) return null
  const project = projects[current]

  return (
    <section {...swipeHandlers} id="projects" className="relative min-h-[100svh] touch-pan-y overflow-hidden bg-black text-white md:overflow-visible" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {projects.map((item, index) => (
        <div
          key={item.listingId}
          className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${index === current ? "scale-100 opacity-100" : "scale-105 opacity-0"}`}
          style={{ backgroundImage: `url(${item.images[0]})` }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/15 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1600px] flex-col justify-between px-6 py-8 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between text-base font-bold tracking-[0.18em]">
          <p>HASTE ECO / OUR PROJECTS</p>
          <p>{String(current + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</p>
        </div>

        <div className="pb-72 sm:pb-52 lg:pb-16">
          <p className="mb-4 text-base font-bold uppercase tracking-[0.28em] text-white/65">{project.propertyType} · {project.location.city}</p>
          <h2 className="max-w-5xl text-5xl font-black uppercase leading-[0.88] tracking-[-0.055em] sm:text-7xl lg:text-[7.5rem]">{project.title}</h2>
        </div>
      </div>

      <div className="absolute bottom-0 md:-bottom-10 left-0 z-20 w-full bg-black sm:w-[72%] lg:w-[36%]">
        <div className="grid min-h-44 grid-cols-1 items-stretch sm:grid-cols-[1fr_auto]">
          <div className="flex flex-col justify-between gap-5 p-6 sm:p-8 lg:px-12">
            <div className="flex gap-8">
              <div><p className="text-xs text-white/55 sm:text-sm">متراژ</p><strong className="mt-1 block text-2xl font-black sm:text-3xl">{project.buildingAreaSqM} متر مربع</strong></div>
              <div><p className="text-xs text-white/55 sm:text-sm">نوع املاک</p><strong className="mt-1 block text-base font-black capitalize sm:text-lg">{project.propertyType}</strong></div>
            </div>
            <Link href={`/properties/${project.slug}`} className="flex w-fit items-center gap-2 text-base font-bold uppercase tracking-[0.16em] text-white/70 transition hover:text-white">
              مشاهده پروژه <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="flex flex-row-reverse items-end gap-2 border-t border-white/15 p-5 sm:border-l sm:border-t-0 sm:p-7">
            <ArrowButton label="Previous project" onClick={previous} direction="left" />
            <ArrowButton label="Next project" onClick={next} direction="right" />
          </div>
        </div>
      </div>
    </section>
  )
}

function ArrowButton({ label, onClick, direction }: { label: string; onClick: () => void; direction: "left" | "right" }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="grid h-12 w-12 place-items-center rounded-full border border-white/35 text-xl transition hover:bg-white hover:text-black">
      {direction === "left" ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
    </button>
  )
}

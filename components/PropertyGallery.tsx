"use client"

import Image from "next/image"
import { useState } from "react"

export default function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0)

  return (
    <div className="relative h-[62vh] min-h-130 overflow-hidden bg-stone-900 lg:h-[72vh]">
      {images.map((image, index) => (
        <Image
          key={image}
          src={image}
          alt={`${title} — تصویر ${index + 1}`}
          fill
          priority={index === 0}
          sizes="100vw"
          className={`object-cover object-[50%_80%] transition-opacity duration-700 ${index === active ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/20" />
      <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-5 sm:bottom-10 sm:left-10 sm:right-10">
        <div className="flex gap-2" dir="ltr">
          {images.map((image, index) => (
            <button
              key={image}
              onClick={() => setActive(index)}
              aria-label={`نمایش تصویر ${index + 1}`}
              className={`relative h-14 w-16 overflow-hidden rounded-xl border-2 transition sm:h-20 sm:w-24 ${active === index ? "border-white opacity-100" : "border-white/30 opacity-65 hover:opacity-100"
                }`}
            >
              <Image src={image} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
        <p className="rounded-full bg-black/35 px-4 py-2 text-base font-bold text-white backdrop-blur" dir="ltr">
          {active + 1} / {images.length}
        </p>
      </div>
    </div>
  )
}

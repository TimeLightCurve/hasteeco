"use client"

import type { Property } from "@/lib/properties"
import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"
import { ArrowUpLeft } from "lucide-react"
import { useMemo, useState } from "react"

type Props = {
  properties: Property[]
}

const PropertyMap = dynamic(() => import("@/components/PropertyMap"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center bg-stone-200 text-sm text-stone-500">در حال بارگذاری نقشه…</div>,
})

const typeLabels: Record<string, string> = {
  villa: "ویلا",
  apartment: "آپارتمان",
  house: "خانه",
  land: "زمین",
  commercial: "تجاری",
}

function formatPrice(property: Property) {
  return `${new Intl.NumberFormat("fa-IR").format(property.price.amount)} تومان / ماهانه`
}

export default function PropertyExplorer({ properties }: Props) {
  const [type, setType] = useState("")
  const [city, setCity] = useState("")
  const [query, setQuery] = useState("")
  const [selectedSlug, setSelectedSlug] = useState(properties[0]?.slug ?? "")

  const cities = useMemo(
    () => [...new Set(properties.map((property) => property.location.city))],
    [properties],
  )
  const types = useMemo(
    () => [...new Set(properties.map((property) => property.propertyType))],
    [properties],
  )

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return properties.filter((property) => {
      if (type && property.propertyType !== type) return false
      if (city && property.location.city !== city) return false
      return (
        !normalizedQuery ||
        [property.title, property.titleFa, property.location.address, String(property.listingId)].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        )
      )
    })
  }, [city, properties, query, type])

  const selected =
    filtered.find((property) => property.slug === selectedSlug) ?? filtered[0] ?? properties[0]

  return (
    <section id="property-search" className="px-4 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto w-full">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-sm font-bold tracking-[0.18em] text-brand-gold">جست‌وجوی هوشمند</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-brand-dark md:text-5xl">
              خانه‌تان را روی نقشه پیدا کنید
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-7 text-stone-500 md:text-base">
            فیلتر کنید، موقعیت دقیق را ببینید و بدون خروج از صفحه جزئیات ملک را مرور کنید.
          </p>
        </div>

        <div className=" bg-transparent ">
          <div className="grid gap-6 lg:min-h-[670px] lg:grid-cols-5">
            <div className="relative z-10 flex min-w-0 flex-col gap-5 p-0 sm:p-6 lg:col-span-3 lg:px-2 lg:py-0">
              <div className="grid gap-3 rounded-2xl bg-white p-3 shadow-sm sm:grid-cols-3">
                <label className="rounded-xl bg-stone-50 px-4 py-3">
                  <span className="mb-1 block text-[11px] font-bold text-stone-400">نوع ملک</span>
                  <select
                    value={type}
                    onChange={(event) => setType(event.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-brand-dark outline-none"
                  >
                    <option value="">همه</option>
                    {types.map((item) => (
                      <option value={item} key={item}>{typeLabels[item] ?? item}</option>
                    ))}
                  </select>
                </label>
                <label className="rounded-xl bg-stone-50 px-4 py-3">
                  <span className="mb-1 block text-[11px] font-bold text-stone-400">شهر</span>
                  <select
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-brand-dark outline-none"
                  >
                    <option value="">همه</option>
                    {cities.map((item) => <option value={item} key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="rounded-xl bg-stone-50 px-4 py-3">
                  <span className="mb-1 block text-[11px] font-bold text-stone-400">شناسه یا نام</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="مثلاً ۱۳۰"
                    className="w-full bg-transparent text-sm font-semibold text-brand-dark outline-none placeholder:text-stone-300"
                  />
                </label>
              </div>

              {selected ? (
                <article className="overflow-hidden rounded-3xl bg-transparent">
                  <Link href={`/properties/${selected.slug}`} className="group flex flex-col gap-4" aria-label={`مشاهده ${selected.titleFa}`}>
                  <div className="relative block h-64 w-full overflow-hidden text-right sm:h-72 rounded-4xl">
                    <Image
                      src={selected.images[0]}
                      alt={selected.titleFa}
                      fill
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className="object-cover transition duration-700 group-hover:scale-[1.03]"
                    />
                    <span className="absolute right-4 top-4 rounded-full bg-white/90 px-4 py-2 text-base md:text-lg font-bold text-brand-dark backdrop-blur">
                      {typeLabels[selected.propertyType] ?? selected.propertyType}
                    </span>
                    <span className="absolute bottom-4 left-4 rounded-full bg-brand-dark px-4 py-2 text-base font-bold text-white">
                      شناسه {new Intl.NumberFormat("fa-IR").format(selected.listingId)}
                    </span>
                  </div>
                  <div className="p-5 sm:p-6 bg-brand-dark rounded-4xl overflow-hidden">
                    <p className="mb-2 text-base md:text-lg font-semibold text-stone-400">{selected.location.address}</p>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-extrabold text-white sm:text-2xl">{selected.titleFa}</h3>
                        <p className="mt-2 text-sm font-bold text-white/70">{formatPrice(selected)}</p>
                      </div>
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-brand-dark transition group-hover:bg-brand-green group-hover:text-white"><ArrowUpLeft className="h-5 w-5" aria-hidden /></span>
                    </div>
                    <div className="mt-6 grid grid-cols-4 divide-x divide-x-reverse divide-stone-100 rounded-2xl bg-stone-50 py-4 text-center">
                      <Stat value={selected.buildingAreaSqM} label="متر بنا" />
                      <Stat value={selected.bedrooms} label="خواب" />
                      <Stat value={selected.bathrooms} label="حمام" />
                      <Stat value={selected.parkingSpaces} label="پارکینگ" />
                    </div>
                  </div>
                  </Link>
                </article>
              ) : (
                <div className="grid flex-1 place-items-center rounded-3xl bg-white p-10 text-center text-stone-400">
                  ملکی با این مشخصات پیدا نشد.
                </div>
              )}

              {filtered.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {filtered.map((property) => (
                    <button
                      key={property.slug}
                      onClick={() => setSelectedSlug(property.slug)}
                      className={`whitespace-nowrap rounded-full px-4 py-2 text-base font-bold ${selected?.slug === property.slug ? "bg-brand-dark text-white" : "bg-white text-stone-500"
                        }`}
                    >
                      {property.titleFa}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative min-h-[420px] lg:col-span-2 lg:min-h-full">
              <div className="absolute inset-0 overflow-hidden rounded-4xl shadow-[0_30px_80px_rgba(30,58,47,0.26)]">
                <PropertyMap properties={filtered} selectedSlug={selected?.slug} onSelect={setSelectedSlug} />
              </div>
              {selected && (
                <div className="pointer-events-none absolute left-5 top-5 rounded-2xl bg-brand-dark/95 px-5 py-4 text-white shadow-xl backdrop-blur sm:left-8 sm:top-8">
                  <p className="text-[10px] text-white/60">موقعیت انتخاب‌شده</p>
                  <p className="mt-1 text-lg font-extrabold">{selected.location.city}</p>
                  <p dir="ltr" className="mt-1 text-base text-white/70">
                    {selected.location.coordinates.latitude.toFixed(4)}, {selected.location.coordinates.longitude.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="px-1">
      <strong className="block text-xl text-brand-dark">{new Intl.NumberFormat("fa-IR").format(value)}</strong>
      <span className="mt-1 block text-[10px] text-stone-400">{label}</span>
    </div>
  )
}

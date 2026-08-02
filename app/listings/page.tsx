import SearchBar from "@/components/SearchBar"
import { getProperties } from "@/lib/properties"
import Image from "next/image"
import Link from "next/link"

type PageProps = { searchParams: Promise<{ type?: string; city?: string; q?: string }> }

export default async function ListingsPage({ searchParams }: PageProps) {
  const filters = await searchParams
  const properties = await getProperties({ type: filters.type, city: filters.city, query: filters.q })

  return (
    <main className="min-h-screen bg-linear-to-bl bg-linear-to-tr  from-[#eaf1ef] to-[#e7e7e7]  px-4 py-12 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <p className="text-base font-bold tracking-[0.18em] text-brand-gold">فهرست املاک</p>
        <h1 className="mt-3 text-4xl font-black text-brand-dark sm:text-6xl">ملک مناسب شما</h1>
        <div className="mt-10"><SearchBar listPage /></div>
        <p className="my-8 text-sm text-stone-500">{properties.length} ملک پیدا شد</p>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {properties.map((property) => (
            <Link key={property.slug} href={`/properties/${property.slug}`} className="group overflow-hidden bg-white shadow-sm">
              <div className="relative h-72 overflow-hidden">
                <Image src={property.images[0]} alt={property.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <div className="p-6">
                <p className="text-base font-bold text-brand-gold">شناسه {new Intl.NumberFormat("fa-IR").format(property.listingId)}</p>
                <h2 className="mt-2 text-xl font-black text-brand-dark">{property.title}</h2>
                <p className="mt-3 text-sm text-stone-400">{property.location.address}</p>
                <div className="mt-5 flex justify-between border-t border-stone-100 pt-5 text-base font-bold text-stone-500">
                  <span>{property.buildingAreaSqM} متر بنا</span><span>{property.bedrooms} خواب</span><span>{property.parkingSpaces} پارکینگ</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}

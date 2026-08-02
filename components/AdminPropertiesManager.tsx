"use client"

import type { ManagedProperty } from "@/lib/admin-properties"
import type { PropertyInput } from "@/lib/property-schema"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useMemo, useState } from "react"

type Props = { initialProperties: ManagedProperty[]; openNewInitially?: boolean; canDelete: boolean; projectMode?: boolean; nextListingIdOverride?: number }

export default function AdminPropertiesManager({ initialProperties, openNewInitially = false, canDelete, projectMode = false, nextListingIdOverride }: Props) {
  const router = useRouter()
  const [properties, setProperties] = useState(initialProperties)
  const [query, setQuery] = useState("")
  const [editing, setEditing] = useState<ManagedProperty | null>(null)
  const [formOpen, setFormOpen] = useState(openNewInitially)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null)

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return properties
    return properties.filter((property) => [property.title, property.slug, property.location.city, String(property.listingId)].some((item) => item.toLowerCase().includes(value)))
  }, [properties, query])

  function openCreate() {
    setEditing(null)
    setMessage(null)
    setFormOpen(true)
  }

  function openEdit(property: ManagedProperty) {
    setEditing(property)
    setMessage(null)
    setFormOpen(true)
  }

  async function submitProperty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setMessage(null)
    const input = propertyFromForm(new FormData(event.currentTarget))
    const endpoint = editing ? `/api/admin/properties/${editing.listingId}` : "/api/admin/properties"
    const response = await fetch(endpoint, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const result = await response.json()

    if (!response.ok) {
      setMessage({ kind: "error", text: result.error ?? "ذخیره ملک انجام نشد." })
      setPending(false)
      return
    }

    const saved = result.data as ManagedProperty
    setProperties((current) => {
      const updated = editing ? current.map((item) => item.listingId === editing.listingId ? saved : item) : [saved, ...current]
      return projectMode ? updated.filter((item) => item.our_project) : updated
    })
    setMessage({ kind: "success", text: editing ? "تغییرات ملک ذخیره شد." : "ملک جدید ایجاد شد." })
    setPending(false)
    setEditing(saved)
    router.refresh()
  }

  async function removeProperty(property: ManagedProperty) {
    if (!canDelete || !window.confirm(`ملک «${property.title}» حذف شود؟ این عملیات قابل بازگشت نیست.`)) return
    const response = await fetch(`/api/admin/properties/${property.listingId}`, { method: "DELETE" })
    const result = await response.json()
    if (!response.ok) {
      setMessage({ kind: "error", text: result.error ?? "حذف ملک انجام نشد." })
      return
    }
    setProperties((current) => current.filter((item) => item.listingId !== property.listingId))
    setMessage({ kind: "success", text: "ملک با موفقیت حذف شد." })
    router.refresh()
  }

  const nextListingId = nextListingIdOverride ?? Math.max(0, ...properties.map((property) => property.listingId)) + 1

  return (
    <div className="p-5 sm:p-8 lg:p-10">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div><p className="text-base font-bold tracking-[0.16em] text-brand-gold">مدیریت محتوا</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">{projectMode ? "پروژه‌های ما" : "مدیریت املاک"}</h1><p className="mt-2 text-sm text-stone-400">{projectMode ? "مدیریت املاکی که در اسلایدر پروژه‌ها نمایش داده می‌شوند" : "ایجاد، ویرایش و کنترل تمام آگهی‌های ملکی"}</p></div>
        <button onClick={openCreate} className="rounded-xl bg-brand-dark px-6 py-3.5 text-sm font-bold text-white transition hover:bg-brand-green">+ {projectMode ? "افزودن پروژه جدید" : "افزودن ملک جدید"}</button>
      </div>

      {message && !formOpen && <Notice message={message} />}

      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-3 sm:flex-row sm:items-center">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجو با نام، شناسه، slug یا شهر…" className="flex-1 rounded-xl bg-stone-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-green/20" />
        <span className="px-3 text-base font-bold text-stone-400">{new Intl.NumberFormat("fa-IR").format(filtered.length)} ملک</span>
      </div>

      <section className="mt-5 overflow-hidden rounded-3xl border border-stone-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-right text-sm">
            <thead className="bg-stone-50 text-[11px] text-stone-400"><tr><th className="px-5 py-4">ملک</th><th className="px-5 py-4">شناسه</th><th className="px-5 py-4">نوع</th><th className="px-5 py-4">وضعیت</th><th className="px-5 py-4">زیربنا</th><th className="px-5 py-4">قیمت</th><th className="px-5 py-4">عملیات</th></tr></thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((property) => (
                <tr key={property.listingId} className="group hover:bg-stone-50">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="relative h-12 w-16 overflow-hidden rounded-lg bg-stone-100"><Image src={property.images[0]} alt="" fill sizes="64px" className="object-cover" /></div><div><strong className="block max-w-56 truncate">{property.title}</strong><span className="text-[10px] text-stone-400">{property.location.city}</span></div></div></td>
                  <td className="px-5 py-4 text-stone-400">#{property.listingId}</td>
                  <td className="px-5 py-4">{property.propertyType}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-[10px] font-bold ${property.status === "for-sale" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{property.status === "for-sale" ? "فروش" : "اجاره"}</span></td>
                  <td className="px-5 py-4">{property.buildingAreaSqM} m²</td>
                  <td className="px-5 py-4 font-bold">{new Intl.NumberFormat("fa-IR").format(property.price.amount)} تومان</td>
                  <td className="px-5 py-4"><div className="flex gap-2"><button onClick={() => openEdit(property)} className="rounded-lg bg-brand-dark/5 px-3 py-2 text-base font-bold text-brand-dark hover:bg-brand-dark hover:text-white">ویرایش</button><Link href={`/properties/${property.slug}`} target="_blank" className="rounded-lg bg-stone-100 px-3 py-2 text-base font-bold text-stone-500 hover:bg-stone-200">نمایش</Link>{canDelete && <button onClick={() => removeProperty(property)} className="rounded-lg bg-red-50 px-3 py-2 text-base font-bold text-red-600 hover:bg-red-600 hover:text-white">حذف</button>}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && <div className="p-16 text-center text-sm text-stone-400">ملکی پیدا نشد.</div>}
      </section>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-brand-dark/40 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormOpen(false) }}>
          <div className="h-full w-full max-w-3xl overflow-y-auto bg-[#f8f7f4] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white/95 px-5 py-5 backdrop-blur sm:px-8"><div><h2 className="text-xl font-black">{editing ? "ویرایش ملک" : "ملک جدید"}</h2><p className="mt-1 text-[10px] text-stone-400">مقادیر پایگاه داده به زبان انگلیسی ثبت می‌شوند.</p></div><button onClick={() => setFormOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-stone-100 text-lg">×</button></div>
            <PropertyForm key={editing?.listingId ?? `new-${nextListingId}`} property={editing} nextListingId={nextListingId} onSubmit={submitProperty} pending={pending} message={message} defaultOurProject={projectMode} />
          </div>
        </div>
      )}
    </div>
  )
}

function PropertyForm({ property, nextListingId, onSubmit, pending, message, defaultOurProject }: { property: ManagedProperty | null; nextListingId: number; onSubmit: (event: FormEvent<HTMLFormElement>) => void; pending: boolean; message: { kind: "success" | "error"; text: string } | null; defaultOurProject: boolean }) {
  return (
    <form onSubmit={onSubmit} className="space-y-6 p-5 sm:p-8">
      {message && <Notice message={message} />}
      <FormSection title="اطلاعات پایه" description="عنوان، شناسه و وضعیت انتشار">
        <div className="grid gap-4 sm:grid-cols-2"><Field name="listingId" label="شناسه" type="number" required defaultValue={property?.listingId ?? nextListingId} /><Field name="slug" label="Slug انگلیسی" dir="ltr" required defaultValue={property?.slug} placeholder="modern-villa-lavasan" /></div>
        <Field name="title" label="عنوان انگلیسی" dir="ltr" required defaultValue={property?.title} placeholder="Modern Villa in Lavasan" />
        <Field name="summary" label="خلاصه انگلیسی" dir="ltr" required defaultValue={property?.summary} />
        <TextArea name="description" label="توضیحات انگلیسی" dir="ltr" required defaultValue={property?.description} rows={5} />
        <div className="grid gap-4 sm:grid-cols-2"><SelectField name="propertyType" label="نوع ملک" defaultValue={property?.propertyType ?? "villa"} options={["villa", "apartment", "house", "land", "commercial"]} /><SelectField name="status" label="وضعیت" defaultValue={property?.status ?? "for-sale"} options={["for-sale", "for-rent"]} /><label className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-base font-bold"><input name="featured" type="checkbox" defaultChecked={property?.featured ?? false} className="accent-brand-green" /> ملک ویژه</label><label className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-base font-bold"><input name="our_project" type="checkbox" defaultChecked={property?.our_project ?? defaultOurProject} className="accent-brand-green" /> نمایش در پروژه‌های ما</label></div>
      </FormSection>

      <FormSection title="ابعاد و فضاها" description="تمام مقادیر مساحت بر حسب متر مربع">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Field name="buildingAreaSqM" label="زیربنا" type="number" step="any" required defaultValue={property?.buildingAreaSqM ?? 0} /><Field name="landAreaSqM" label="مساحت ملک" type="number" step="any" required defaultValue={property?.landAreaSqM ?? 0} /><Field name="dimension1" label="بعد اول" type="number" step="any" required defaultValue={property?.buildingDimensions[0] ?? 0} /><Field name="dimension2" label="بعد دوم" type="number" step="any" required defaultValue={property?.buildingDimensions[1] ?? 0} /></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><Field name="dimension3" label="بعد سوم" type="number" step="any" defaultValue={property?.buildingDimensions[2]} /><Field name="rooms" label="اتاق" type="number" required defaultValue={property?.rooms ?? 0} /><Field name="bedrooms" label="خواب" type="number" required defaultValue={property?.bedrooms ?? 0} /><Field name="bathrooms" label="حمام" type="number" required defaultValue={property?.bathrooms ?? 0} /><Field name="parkingSpaces" label="پارکینگ" type="number" required defaultValue={property?.parkingSpaces ?? 0} /></div>
      </FormSection>

      <FormSection title="قیمت و سال ساخت" description="مبلغ بر اساس تومان نمایش داده می‌شود">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Field name="priceAmount" label="مبلغ" type="number" step="any" required defaultValue={property?.price.amount ?? 0} /><SelectField name="billingPeriod" label="دوره پرداخت" defaultValue={property?.price.billingPeriod ?? "total"} options={["total", "monthly"]} /><Field name="solarHijri" label="سال شمسی" type="number" required defaultValue={property?.yearBuilt.solarHijri ?? 1400} /><Field name="gregorianApprox" label="سال میلادی" type="number" required defaultValue={property?.yearBuilt.gregorianApprox ?? 2021} /></div>
      </FormSection>

      <FormSection title="موقعیت" description="مختصات برای نمایش روی Google Maps استفاده می‌شود">
        <Field name="address" label="آدرس انگلیسی" dir="ltr" required defaultValue={property?.location.address} />
        <div className="grid gap-4 sm:grid-cols-2"><Field name="city" label="شهر انگلیسی" dir="ltr" required defaultValue={property?.location.city ?? "Lavasan"} /><Field name="province" label="استان انگلیسی" dir="ltr" required defaultValue={property?.location.province ?? "Tehran"} /><Field name="country" label="کشور انگلیسی" dir="ltr" required defaultValue={property?.location.country ?? "Iran"} /><div className="grid grid-cols-2 gap-2"><Field name="latitude" label="Latitude" type="number" step="any" dir="ltr" required defaultValue={property?.location.coordinates.latitude ?? 35.8234} /><Field name="longitude" label="Longitude" type="number" step="any" dir="ltr" required defaultValue={property?.location.coordinates.longitude ?? 51.6334} /></div></div>
      </FormSection>

      <FormSection title="ویژگی‌ها و تصاویر" description="هر مورد را در یک خط جدا وارد کنید">
        <TextArea name="features" label="ویژگی‌های انگلیسی" dir="ltr" defaultValue={property?.features.join("\n")} rows={5} placeholder="Private pool&#10;Landscaped garden" />
        <TextArea name="images" label="مسیر محلی تصاویر (شروع با /)" dir="ltr" required defaultValue={property?.images.join("\n") ?? "/images/properties/villa-130-exterior.png"} rows={5} />
      </FormSection>

      <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-stone-200 bg-[#f8f7f4]/95 py-5 backdrop-blur"><button type="submit" disabled={pending} className="rounded-xl bg-brand-dark px-8 py-3.5 text-sm font-bold text-white transition hover:bg-brand-green disabled:opacity-50">{pending ? "در حال ذخیره…" : property ? "ذخیره تغییرات" : "ایجاد ملک"}</button></div>
    </form>
  )
}

function propertyFromForm(form: FormData): PropertyInput {
  const text = (name: string) => String(form.get(name) ?? "").trim()
  const number = (name: string) => Number(form.get(name))
  const latitude = number("latitude")
  const longitude = number("longitude")
  const dimensions = [number("dimension1"), number("dimension2")]
  if (text("dimension3")) dimensions.push(number("dimension3"))
  const lines = (name: string) => text(name).split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean)

  return {
    listingId: number("listingId"), slug: text("slug"), title: text("title"), summary: text("summary"), description: text("description"),
    propertyType: text("propertyType") as PropertyInput["propertyType"], status: text("status") as PropertyInput["status"],
    buildingAreaSqM: number("buildingAreaSqM"), landAreaSqM: number("landAreaSqM"), buildingDimensions: dimensions,
    rooms: number("rooms"), bedrooms: number("bedrooms"), bathrooms: number("bathrooms"), parkingSpaces: number("parkingSpaces"),
    price: { amount: number("priceAmount"), currency: "IRR", displayUnit: "toman", billingPeriod: text("billingPeriod") as "monthly" | "total" },
    yearBuilt: { solarHijri: number("solarHijri"), gregorianApprox: number("gregorianApprox") },
    location: { address: text("address"), city: text("city"), province: text("province"), country: text("country"), coordinates: { latitude, longitude }, geo: { type: "Point", coordinates: [longitude, latitude] } },
    features: lines("features"), images: lines("images"), featured: form.get("featured") === "on", our_project: form.get("our_project") === "on",
  }
}

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) { return <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6"><div className="border-b border-stone-100 pb-4"><h3 className="font-black">{title}</h3><p className="mt-1 text-[10px] text-stone-400">{description}</p></div>{children}</section> }
function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) { const { label, ...inputProps } = props; return <label className="block"><span className="mb-1.5 block text-[10px] font-bold text-stone-500">{label}</span><input {...inputProps} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-3 text-sm outline-none focus:border-brand-green focus:bg-white focus:ring-3 focus:ring-brand-green/10" /></label> }
function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) { const { label, ...inputProps } = props; return <label className="block"><span className="mb-1.5 block text-[10px] font-bold text-stone-500">{label}</span><textarea {...inputProps} className="w-full resize-y rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-3 text-sm leading-6 outline-none focus:border-brand-green focus:bg-white focus:ring-3 focus:ring-brand-green/10" /></label> }
function SelectField({ name, label, defaultValue, options }: { name: string; label: string; defaultValue: string; options: string[] }) { return <label className="block"><span className="mb-1.5 block text-[10px] font-bold text-stone-500">{label}</span><select name={name} defaultValue={defaultValue} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-3 text-sm outline-none focus:border-brand-green">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label> }
function Notice({ message }: { message: { kind: "success" | "error"; text: string } }) { return <p role="status" className={`rounded-xl px-4 py-3 text-base font-bold ${message.kind === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{message.text}</p> }

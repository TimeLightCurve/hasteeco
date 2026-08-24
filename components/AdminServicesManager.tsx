"use client"

import type { ManagedService } from "@/lib/admin-services"
import type { ServiceInput } from "@/lib/service-schema"
import Image from "next/image"
import { FormEvent, useMemo, useState } from "react"
import AdminImageManager from "@/components/AdminImageManager"

type Props = { initialServices: ManagedService[] }

export default function AdminServicesManager({ initialServices }: Props) {
  const [services, setServices] = useState(initialServices)
  const [editing, setEditing] = useState<ManagedService | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null)

  const sorted = useMemo(() => [...services].sort((a, b) => a.order - b.order), [services])

  function openEdit(service: ManagedService) {
    setEditing(service)
    setMessage(null)
    setFormOpen(true)
  }

  async function submitService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setMessage(null)
    const input = serviceFromForm(new FormData(event.currentTarget))
    const endpoint = `/api/admin/services/${editing?.serviceType ?? input.serviceType}`
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const result = await response.json()
    if (!response.ok) {
      setMessage({ kind: "error", text: result.error ?? "ذخیره سرویس انجام نشد." })
      setPending(false)
      return
    }
    const saved = result.data as ManagedService
    setServices((current) => current.map((item) => item.serviceType === saved.serviceType ? saved : item))
    setMessage({ kind: "success", text: "سرویس ذخیره شد." })
    setPending(false)
    setEditing(saved)
  }

  return (
    <div className="p-5 sm:p-8 lg:p-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-base font-bold tracking-[0.16em] text-brand-gold">مدیریت سرویس‌ها</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">سرویس‌های صفحه اصلی</h1>
          <p className="mt-2 text-sm text-stone-400">عنوان، تصویر، توضیح و ترتیب نمایش را از اینجا تغییر بدهید.</p>
        </div>
      </div>

      {message && <Notice message={message} />}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((service) => (
          <button
            key={service.serviceType}
            onClick={() => openEdit(service)}
            className="overflow-hidden rounded-3xl border border-stone-200 bg-white text-right shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative h-52 w-full">
              <Image src={service.image} alt={service.title} fill className="object-cover" />
            </div>
            <div className="p-5">
              <p className="text-[11px] font-bold tracking-[0.2em] text-brand-gold">{service.serviceType}</p>
              <h2 className="mt-2 text-lg font-black text-brand-dark">{service.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-stone-500">{service.description}</p>
            </div>
          </button>
        ))}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-brand-dark/40 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormOpen(false) }}>
          <div className="h-full w-full max-w-2xl overflow-y-auto bg-[#f8f7f4] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white/95 px-5 py-5 backdrop-blur sm:px-8">
              <div>
                <h2 className="text-xl font-black">{editing ? "ویرایش سرویس" : "سرویس جدید"}</h2>
                <p className="mt-1 text-[10px] text-stone-400">فقط داده‌های نمایشی سرویس‌ها در این بخش نگه‌داری می‌شود.</p>
              </div>
              <button onClick={() => setFormOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-stone-100 text-lg">×</button>
            </div>
            <form onSubmit={submitService} className="space-y-6 p-5 sm:p-8">
              {message && <Notice message={message} />}
              <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
                <Field name="serviceType" label="Service type" dir="ltr" defaultValue={editing?.serviceType ?? "villa"} />
                <Field name="relatedPropertyType" label="Related property type" dir="ltr" defaultValue={editing?.relatedPropertyType ?? "villa"} />
                <Field name="title" label="Title" dir="ltr" required defaultValue={editing?.title} />
                <TextArea name="description" label="Description" dir="ltr" required defaultValue={editing?.description} rows={5} />
                <AdminImageManager name="image" label="تصویر سرویس" initialImages={[editing?.image ?? "/images/properties/villa-130-exterior.jpg"]} multiple={false} />
                <Field name="order" label="Order" type="number" required defaultValue={editing?.order ?? 1} />
                <label className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-base font-bold">
                  <input name="active" type="checkbox" defaultChecked={editing?.active ?? true} className="accent-brand-green" />
                  Active
                </label>
              </section>
              <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-stone-200 bg-[#f8f7f4]/95 py-5 backdrop-blur">
                <button type="submit" disabled={pending} className="rounded-xl bg-brand-dark px-8 py-3.5 text-sm font-bold text-white transition hover:bg-brand-green disabled:opacity-50">
                  {pending ? "در حال ذخیره…" : "ذخیره سرویس"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function serviceFromForm(form: FormData): ServiceInput {
  return {
    serviceType: String(form.get("serviceType") || "villa") as ServiceInput["serviceType"],
    relatedPropertyType: (String(form.get("relatedPropertyType") || "").trim() || null) as ServiceInput["relatedPropertyType"],
    title: String(form.get("title") || "").trim(),
    description: String(form.get("description") || "").trim(),
    image: String(form.get("image") || "").trim(),
    order: Number(form.get("order")),
    active: form.get("active") === "on",
  }
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, style, ...inputProps } = props
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold text-stone-500">{label}</span>
      <input {...inputProps} style={latinFormControlStyle(style)} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-3 text-left text-sm outline-none focus:border-brand-green focus:bg-white focus:ring-3 focus:ring-brand-green/10" />
    </label>
  )
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  const { label, style, ...inputProps } = props
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold text-stone-500">{label}</span>
      <textarea {...inputProps} style={latinFormControlStyle(style)} className="w-full resize-y rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-3 text-left text-sm leading-6 outline-none focus:border-brand-green focus:bg-white focus:ring-3 focus:ring-brand-green/10" />
    </label>
  )
}

function latinFormControlStyle(style?: React.CSSProperties): React.CSSProperties {
  return { fontFamily: "var(--font-neoSans), Arial, sans-serif", wordSpacing: "0.12em", ...style }
}


function Notice({ message }: { message: { kind: "success" | "error"; text: string } }) {
  return <p role="status" className={`mt-4 rounded-xl px-4 py-3 text-base font-bold ${message.kind === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{message.text}</p>
}

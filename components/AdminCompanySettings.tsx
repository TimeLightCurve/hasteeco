"use client"

import type { CompanySettings } from "@/lib/company-settings"
import type { CompanySettingsInput } from "@/lib/company-settings-schema"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

export default function AdminCompanySettings({ initialSettings }: { initialSettings: CompanySettings }) {
  const router = useRouter()
  const [settings, setSettings] = useState(initialSettings)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setMessage(null)
    const form = new FormData(event.currentTarget)
    const input = Object.fromEntries([
      "companyName", "phone", "phoneDisplay", "email", "address", "workingHours",
      "instagram", "telegram", "whatsapp", "linkedin",
    ].map((name) => [name, String(form.get(name) ?? "").trim()])) as CompanySettingsInput
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const result = await response.json()
    if (!response.ok) {
      setMessage({ kind: "error", text: result.error ?? "ذخیره اطلاعات انجام نشد." })
    } else {
      setSettings(result.data)
      setMessage({ kind: "success", text: "اطلاعات شرکت با موفقیت ذخیره شد." })
      router.refresh()
    }
    setPending(false)
  }

  return (
    <div className="p-5 sm:p-8 lg:p-10">
      <p className="text-base font-bold tracking-[0.16em] text-brand-gold">تنظیمات عمومی</p>
      <h1 className="mt-2 text-3xl font-black sm:text-4xl">اطلاعات تماس و شبکه‌های اجتماعی</h1>
      <p className="mt-2 text-sm text-stone-400">این اطلاعات در تمام بخش‌های عمومی سایت استفاده می‌شوند.</p>
      <form onSubmit={submit} className="mt-8 max-w-5xl space-y-6">
        {message && <p role="status" className={`rounded-xl px-4 py-3 text-base font-bold ${message.kind === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{message.text}</p>}
        <Section title="اطلاعات شرکت">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="companyName" label="نام شرکت" defaultValue={settings.companyName} required />
            <Field name="email" label="ایمیل" type="email" dir="ltr" defaultValue={settings.email} required />
            <Field name="phone" label="شماره استاندارد برای لینک تماس" dir="ltr" defaultValue={settings.phone} placeholder="+989123456789" required />
            <Field name="phoneDisplay" label="شماره قابل نمایش" defaultValue={settings.phoneDisplay} required />
            <Field name="address" label="آدرس" defaultValue={settings.address} required />
            <Field name="workingHours" label="ساعات کاری" defaultValue={settings.workingHours} required />
          </div>
        </Section>
        <Section title="شبکه‌های اجتماعی">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="instagram" label="Instagram URL" type="url" dir="ltr" defaultValue={settings.instagram} required />
            <Field name="telegram" label="Telegram URL" type="url" dir="ltr" defaultValue={settings.telegram} required />
            <Field name="whatsapp" label="WhatsApp URL" type="url" dir="ltr" defaultValue={settings.whatsapp} required />
            <Field name="linkedin" label="LinkedIn URL" type="url" dir="ltr" defaultValue={settings.linkedin} required />
          </div>
        </Section>
        <div className="flex justify-end"><button type="submit" disabled={pending} className="rounded-xl bg-brand-dark px-8 py-4 text-sm font-bold text-white transition hover:bg-brand-green disabled:opacity-50">{pending ? "در حال ذخیره…" : "ذخیره تنظیمات"}</button></div>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-7"><h2 className="mb-6 border-b border-stone-100 pb-4 text-lg font-black">{title}</h2>{children}</section>
}
function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...inputProps } = props
  return <label className="block"><span className="mb-2 block text-base font-bold text-stone-500">{label}</span><input {...inputProps} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-sm outline-none focus:border-brand-green focus:bg-white focus:ring-3 focus:ring-brand-green/10" /></label>
}

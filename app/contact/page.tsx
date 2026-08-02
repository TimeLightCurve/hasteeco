import { getCompanySettings } from "@/lib/company-settings"
import type { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
  title: "تماس با ما | هاستکو",
  description: "برای خرید، فروش، اجاره یا دریافت مشاوره تخصصی ملک با تیم هاستکو در ارتباط باشید.",
}

export default async function ContactPage() {
  const settings = await getCompanySettings()
  return (
    <main dir="rtl" className="min-h-screen bg-[#f4f2ed] text-brand-dark">
      <section className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative min-h-[62vh] overflow-hidden bg-black lg:min-h-screen">
          <Image src="/images/properties/villa-130-exterior.png" alt="پروژه ویلایی هاستکو" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/35" />
          <div className="absolute inset-x-0 bottom-0 z-10 p-7 text-white sm:p-10 lg:p-14">
            <p className="text-base font-bold tracking-[0.25em] text-white/55">CONTACT HASTE ECO</p>
            <h1 className="mt-5 text-5xl font-black leading-[0.95] sm:text-7xl lg:text-8xl">بیایید<br />گفت‌وگو کنیم</h1>
            <p className="mt-7 max-w-lg text-sm leading-8 text-white/70">برای خرید، فروش، اجاره یا مشاوره درباره پروژه بعدی‌تان، پیام بگذارید. کارشناسان ما در اولین فرصت با شما تماس می‌گیرند.</p>
          </div>
        </div>

        <div className="flex flex-col justify-center px-6 pb-16 pt-36 sm:px-12 lg:px-16 lg:py-28 xl:px-24">
          <div className="grid gap-6 border-b border-stone-300 pb-10 sm:grid-cols-2">
            <ContactItem label="شماره تماس" value={settings.phoneDisplay} href={`tel:${settings.phone}`} />
            <ContactItem label="ایمیل" value={settings.email} href={`mailto:${settings.email}`} ltr />
            <ContactItem label="ساعات پاسخ‌گویی" value={settings.workingHours} />
            <ContactItem label="دفتر مرکزی" value={settings.address} />
          </div>

          <form action={`mailto:${settings.email}`} method="post" encType="text/plain" className="mt-10 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <Field name="name" label="نام و نام خانوادگی" placeholder="نام شما" required />
              <Field name="phone" label="شماره تماس" placeholder="۰۹۱۲ ۰۰۰ ۰۰۰۰" required inputMode="tel" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field name="email" label="ایمیل" placeholder="name@example.com" type="email" dir="ltr" />
              <label className="block"><span className="mb-2 block text-base font-bold text-stone-500">موضوع</span><select name="subject" className="w-full border-0 border-b border-stone-300 bg-transparent px-0 py-3 text-sm outline-none focus:border-brand-green"><option>خرید ملک</option><option>فروش ملک</option><option>اجاره ملک</option><option>دکوراسیون و بازسازی</option><option>سایر موارد</option></select></label>
            </div>
            <label className="block"><span className="mb-2 block text-base font-bold text-stone-500">پیام شما</span><textarea name="message" rows={5} required placeholder="چطور می‌توانیم کمکتان کنیم؟" className="w-full resize-y border-0 border-b border-stone-300 bg-transparent px-0 py-3 text-sm leading-7 outline-none placeholder:text-stone-400 focus:border-brand-green" /></label>
            <div className="flex flex-col items-start justify-between gap-5 pt-3 sm:flex-row sm:items-center">
              <p className="max-w-sm text-[11px] leading-6 text-stone-400">با ارسال فرم، برنامه ایمیل دستگاه شما برای فرستادن پیام به هاستکو باز می‌شود.</p>
              <button type="submit" className="rounded-full bg-brand-dark px-8 py-4 text-sm font-bold text-white transition hover:bg-brand-green">ارسال پیام ←</button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}

function ContactItem({ label, value, href, ltr = false }: { label: string; value: string; href?: string; ltr?: boolean }) {
  const content = <span dir={ltr ? "ltr" : undefined} className="mt-2 block text-base font-black">{value}</span>
  return <div><p className="text-[10px] font-bold tracking-[0.12em] text-brand-gold">{label}</p>{href ? <a href={href} className="transition hover:text-brand-green">{content}</a> : content}</div>
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...inputProps } = props
  return <label className="block"><span className="mb-2 block text-base font-bold text-stone-500">{label}</span><input {...inputProps} className="w-full border-0 border-b border-stone-300 bg-transparent px-0 py-3 text-sm outline-none placeholder:text-stone-400 focus:border-brand-green" /></label>
}

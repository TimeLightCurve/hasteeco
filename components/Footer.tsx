"use client"

import type { CompanySettings } from "@/lib/company-settings"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { SVGProps } from "react"

const primaryLinks = [
  { label: "خانه", href: "/" },
  { label: "پروژه‌های ما", href: "/projects" },
  { label: "آگهی‌های ملکی", href: "/listings" },
  { label: "خدمات ما", href: "/services" },
  { label: "درباره ما", href: "/about" },
  { label: "ارتباط با ما", href: "/contact" },
]

const propertyLinks = [
  { label: "ویلا", href: "/listings?type=villa" },
  { label: "آپارتمان", href: "/listings?type=apartment" },
  { label: "خانه", href: "/listings?type=house" },
  { label: "زمین", href: "/listings?type=land" },
  { label: "ملک تجاری", href: "/listings?type=commercial" },
]

export default function Footer({ settings }: { settings: CompanySettings }) {
  const pathname = usePathname()
  if (pathname === "/login" || pathname.startsWith("/admin")) return null
  const socialLinks = [
    { label: "اینستاگرام", href: settings.instagram, icon: InstagramIcon },
    { label: "تلگرام", href: settings.telegram, icon: TelegramIcon },
    { label: "واتساپ", href: settings.whatsapp, icon: WhatsAppIcon },
    { label: "لینکدین", href: settings.linkedin, icon: LinkedInIcon },
  ]

  return (
    <footer dir="rtl" className="overflow-hidden bg-[#101512] text-white">
      <div className="mx-auto max-w-[1600px] px-6 pb-8 pt-20 sm:px-10 lg:px-16 lg:pt-28">
        <div className="grid gap-14 border-b border-white/12 pb-16 lg:grid-cols-[1.25fr_0.7fr_0.7fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-4" aria-label="هاستکو، صفحه اصلی">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-brand-dark">
                <LogoIcon className="h-7 w-7" />
              </span>
              <span dir="ltr" className="text-2xl font-black tracking-[-0.04em]">HASTE ECO</span>
            </Link>
            <p className="mt-8 max-w-md text-sm leading-8 text-white/55">همراه شما برای انتخاب، خرید، فروش و سرمایه‌گذاری آگاهانه در املاک متمایز؛ از نخستین گفت‌وگو تا نهایی‌شدن تصمیم.</p>
            <div className="mt-8 flex gap-3">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label} className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white/70 transition hover:border-brand-gold hover:bg-brand-gold hover:text-white">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <FooterLinks title="دسترسی سریع" links={primaryLinks} />
          <FooterLinks title="انواع ملک" links={propertyLinks} />

          <div>
            <p className="text-base font-bold tracking-[0.16em] text-brand-gold">ارتباط با ما</p>
            <address className="mt-7 space-y-5 text-sm not-italic leading-7 text-white/60">
              <p>{settings.address}</p>
              <p><a dir="ltr" href={`tel:${settings.phone}`} className="inline-block transition hover:text-white">{settings.phoneDisplay}</a></p>
              <p><a dir="ltr" href={`mailto:${settings.email}`} className="inline-block transition hover:text-white">{settings.email}</a></p>
            </address>
            <Link href="/contact" className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-base font-bold text-brand-dark transition hover:bg-brand-gold hover:text-white">درخواست مشاوره <span aria-hidden>←</span></Link>
          </div>
        </div>

        <div className="flex flex-col gap-5 border-b border-white/12 py-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-7 text-white/45">برای آگاهی از تازه‌ترین املاک و پروژه‌های منتخب، شبکه‌های اجتماعی هاستکو را دنبال کنید.</p>
          <Link href="/listings" className="group flex items-center gap-5 text-sm font-bold"><span>مشاهده تمام املاک</span><span className="grid h-10 w-10 place-items-center rounded-full border border-white/25 transition group-hover:border-white group-hover:bg-white group-hover:text-black">←</span></Link>
        </div>

        <div className="flex flex-col-reverse gap-4 pt-8 text-[11px] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© ۲۰۲۶ هاستکو. تمامی حقوق محفوظ است.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/about" className="transition hover:text-white">درباره مجموعه</Link>
            <Link href="/contact" className="transition hover:text-white">اطلاعات تماس</Link>
            <Link href="/admin" className="transition hover:text-white">ورود مدیریت</Link>
          </div>
        </div>
      </div>
      <p dir="ltr" aria-hidden className="-mb-[0.18em] select-none whitespace-nowrap text-center text-[18vw] font-black leading-[0.7] tracking-[-0.08em] text-white/[0.035]">HASTE ECO</p>
    </footer>
  )
}

function FooterLinks({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return <div><p className="text-base font-bold tracking-[0.16em] text-brand-gold">{title}</p><nav className="mt-7 flex flex-col items-start gap-4">{links.map((link) => <Link key={link.href} href={link.href} className="text-sm text-white/55 transition hover:translate-x-[-3px] hover:text-white">{link.label}</Link>)}</nav></div>
}

function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><path d="m3 10 9-7 9 7-9 11L3 10Z" /><path d="m3 10 9 4 9-4M12 14v7M12 3v11" /></svg>
}
function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
}
function TelegramIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><path d="m21 3-7.5 18-4.2-7.3L3 10.5 21 3Z" /><path d="m9.3 13.7 5.2-4.8" /></svg>
}
function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.4-4.7A8.5 8.5 0 1 1 20.5 11.6Z" /><path d="M8.4 7.5c.4 3.8 2.4 5.8 6.1 7.2l1.5-1.5" /></svg>
}
function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 10v7M8 7v.01M12 17v-4a3 3 0 0 1 6 0v4M12 10v7" /></svg>
}

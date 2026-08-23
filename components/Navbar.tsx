"use client"

import type { CompanySettings } from "@/lib/company-settings"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { JSX, useState, type SVGProps } from "react"

type NavLink = {
  label: string
  href: string
  active?: boolean
  icon: (props: SVGProps<SVGSVGElement>) => JSX.Element
  dropdown?: { label: string; href: string }[]
}

const navLinks: NavLink[] = [
  { label: "تور مجازی", href: "/virtual-tour", icon: TourIcon },
  { label: "خانه", href: "/", active: true, icon: HomeIcon },
  // { label: "Ø®Ø¯Ù…Ø§Øª Ù…Ø§", href: "/services" },
  { label: "پروژه‌ها", href: "/projects", icon: BriefcaseIcon },
  { label: "آگهی‌ها", href: "/listings", icon: BuildingIcon },
  { label: "درباره ما", href: "/about", icon: UsersIcon },
  // {
  //   label: "وبلاگ",
  //   href: "/blog",
  //   icon: BlogIcon,
  //   dropdown: [
  //     { label: "همه مقالات", href: "/blog" },
  //     { label: "اخبار ملکی", href: "/blog/news" },
  //     { label: "راهنمای خرید", href: "/blog/tips" },
  //   ],
  // },
  { label: "ارتباط با ما", href: "/contact", icon: MailIcon },
]

function TourIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  )
}

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10.5V20h14v-9.5" />
      <path d="M9 20v-6h6v6" />
    </svg>
  )
}

function BriefcaseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M9 7V6a3 3 0 0 1 6 0v1" />
      <path d="M3 12h18" />
    </svg>
  )
}

function BuildingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M4 21V3h10v18" />
      <path d="M14 8h6v13" />
      <path d="M8 7h2M8 11h2M8 15h2" />
      <path d="M18 12h2M18 16h2" />
    </svg>
  )
}

function UsersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M17 21v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" />
      <circle cx="10" cy="7" r="4" />
      <path d="M22 21v-1a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

export default function Navbar({ settings }: { settings: CompanySettings }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [blogOpen, setBlogOpen] = useState(false)

  if (pathname === "/login" || pathname.startsWith("/admin") || pathname.startsWith("/virtual-tour")) return null

  return (
    <header className="fixed inset-x-4 top-4 z-50 max-w-[calc(100vw-2rem)] rounded-3xl bg-black/85 shadow-xl backdrop-blur-xl md:inset-x-auto md:right-8 md:top-8 md:max-w-[calc(100vw-4rem)] md:rounded-full md:bg-black/5 md:shadow-sm">
      <div className="h-full mx-auto px-4 md:px-4">
        <div className="flex h-full min-w-0 items-center justify-between gap-2 py-3 md:gap-6 xl:gap-12">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="px-4 w-full rounded-lg flex items-center justify-center">
              {/* <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg> */}
              <p className="text-white font-bold md:text-xl">HasteeCo</p>
            </div>
          </Link>

          <nav className="hidden min-w-0 items-center justify-center gap-4 px-4 text-sm font-medium md:flex lg:gap-8 lg:px-6 xl:gap-12">
            {navLinks.map((link) =>
              link.dropdown ? (
                <div key={link.href} className="relative">
                  <button
                    onClick={() => setBlogOpen((v) => !v)}
                    onBlur={() => setTimeout(() => setBlogOpen(false), 150)}
                    className="flex items-center justify-center text-white hover:text-brand-dark transition-colors py-1"
                    aria-label={link.label}
                    title={link.label}
                  >
                    <link.icon className="h-8 w-8" />
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className={`ml-1 transition-transform ${blogOpen ? "rotate-180" : ""}`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {blogOpen && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[160px] z-50">
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block px-4 py-2 text-sm text-white hover:bg-gray-50 hover:text-brand-dark transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`py-1 transition-colors ${pathname === link.href
                      ? " text-white bg-black rounded-full font-bold aspect-square flex justify-center items-center px-3 "
                      : "text-white hover:text-brand-dark "
                    }`}
                  aria-label={link.label}
                  title={link.label}
                >
                  <link.icon className="h-7 w-7" />
                </Link>
              )
            )}
          </nav>

          <div className="flex flex-col-reverse items-center gap-3 flex-shrink-0">
            <div className="hidden md:flex flex-col items-end leading-tight" />
            {/* <div className="hidden md:flex w-10 h-10 bg-brand-dark rounded-full items-center justify-center flex-shrink-0">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.07 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.36 6.36l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
            </div> */}

            <button
              className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white transition hover:bg-white/10 md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "بستن منو" : "باز کردن منو"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="space-y-1 border-t border-white/15 pb-3 pt-3 md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-xl px-4 py-3 text-sm ${pathname === link.href
                    ? "bg-white text-brand-dark font-bold"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                onClick={() => setMobileOpen(false)}
                aria-label={link.label}
                title={link.label}
              >
                <span className="flex items-center gap-3">
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </span>
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-3 border-t border-white/15 px-4 pt-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.07 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.36 6.36l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-white/45">شماره تماس</p>
                <a href={`tel:${settings.phone}`} className="text-sm font-bold text-white" dir="ltr">{settings.phoneDisplay}</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

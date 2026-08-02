import { logoutAction } from "@/app/admin/actions"
import { auth } from "@/auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ExternalLink } from "lucide-react"
import AdminMobileNav from "@/components/AdminMobileNav"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login?callbackUrl=/admin")

  return (
    <div className="min-h-screen bg-[#f4f2ed] text-brand-dark" dir="rtl">
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-64 flex-col bg-brand-dark p-6 text-white lg:flex">
        <Link href="/admin" className="flex items-center gap-3 border-b border-white/10 pb-7">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-xl text-brand-dark">⌂</span>
          <span>
            <strong className="block text-lg">Hasteeco</strong>
            <small className="text-[10px] text-white/45">ADMIN CONSOLE</small>
          </span>
        </Link>
        <nav className="mt-8 space-y-2 text-sm font-bold">
          <Link href="/admin" className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3.5 transition hover:bg-white/15">
            <span>◌</span> داشبورد
          </Link>
          <Link href="/admin/properties" className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-white/65 transition hover:bg-white/10 hover:text-white">
            <span>⌂</span> مدیریت املاک
          </Link>
          <Link href="/admin/services" className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-white/65 transition hover:bg-white/10 hover:text-white">
            <span>◌</span> مدیریت سرویس‌ها
          </Link>
          <Link href="/admin/projects" className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-white/65 transition hover:bg-white/10 hover:text-white">
            <span>◇</span> پروژه‌های ما
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-white/65 transition hover:bg-white/10 hover:text-white">
            <span>⚙</span> اطلاعات شرکت
          </Link>
          <Link href="/" className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-white/65 transition hover:bg-white/10 hover:text-white">
            <ExternalLink className="h-4 w-4" aria-hidden /> مشاهده وب‌سایت
          </Link>
        </nav>
        <div className="mt-auto border-t border-white/10 pt-5">
          <p className="text-base font-bold">{session.user.name}</p>
          <p className="mt-1 text-[10px] text-white/45" dir="ltr">
            {session.user.email}
          </p>
          <form action={logoutAction}>
            <button className="mt-4 w-full rounded-xl border border-white/15 px-4 py-3 text-base font-bold text-white/70 transition hover:bg-white hover:text-brand-dark">
              خروج از حساب
            </button>
          </form>
        </div>
      </aside>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-stone-200 bg-white/90 px-5 py-4 backdrop-blur lg:mr-64 lg:px-10">
        <AdminMobileNav />
        <Link href="/admin" className="font-black lg:hidden">
          Hasteeco Admin
        </Link>
        <div className="mr-auto flex items-center gap-3">
          <div className="hidden text-left sm:block">
            <p className="text-base font-bold">{session.user.name}</p>
            <p className="text-[10px] text-stone-400">
              {session.user.role === "admin" ? "مدیر سیستم" : "ویرایشگر"}
            </p>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-gold font-black text-white">
            {session.user.name?.slice(0, 1).toUpperCase()}
          </div>
        </div>
      </header>
      <main className="lg:mr-64">{children}</main>
    </div>
  )
}

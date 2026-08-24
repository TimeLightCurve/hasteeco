import { auth } from "@/auth"
import LoginForm from "@/components/LoginForm"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"

export const metadata: Metadata = { title: "ورود مدیریت | Hasteeco" }

export default async function LoginPage() {
  const session = await auth()
  if (session?.user) redirect("/admin")

  return (
    <main className="grid min-h-screen bg-[#f4f2ed] lg:grid-cols-[1.1fr_0.9fr]" dir="rtl">
      <section className="relative hidden overflow-hidden lg:block">
        <Image src="/images/properties/villa-130-twilight.jpg" alt="ویلای هستیکو" fill priority sizes="55vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/10 to-black/20" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white xl:p-20">
          <p className="text-base font-bold tracking-[0.22em] text-brand-gold">HASTE ECO ADMIN</p>
          <h2 className="mt-5 max-w-2xl text-4xl font-black leading-tight">مدیریت دقیق برای خانه‌های متمایز.</h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-white/65">املاک، وضعیت انتشار و اطلاعات فروش را در یک فضای امن و یکپارچه مدیریت کنید.</p>
        </div>
      </section>
      <section className="flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-[0_25px_80px_rgba(30,58,47,0.12)] sm:p-10">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-dark text-white">⌂</div>
            <div><strong className="block text-xl text-brand-dark">Hasteeco</strong><span className="text-base text-stone-400">پنل مدیریت املاک</span></div>
          </div>
          <h1 className="mt-10 text-3xl font-black text-brand-dark">خوش آمدید</h1>
          <p className="mt-2 text-sm text-stone-400">برای ادامه وارد حساب مدیریتی شوید.</p>
          <Suspense fallback={<div className="mt-10 h-64 animate-pulse rounded-2xl bg-stone-100" />}><LoginForm /></Suspense>
          <Link href="/" className="mt-7 block text-center text-base font-bold text-stone-400 transition hover:text-brand-dark">بازگشت به وب‌سایت</Link>
        </div>
      </section>
    </main>
  )
}

import { requireAdmin } from "@/auth"
import { getDashboardMetrics, getManagedProperties } from "@/lib/admin-properties"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default async function AdminDashboard() {
  if (!(await requireAdmin())) redirect("/login?callbackUrl=/admin")
  const [metrics, properties] = await Promise.all([getDashboardMetrics(), getManagedProperties()])
  const number = new Intl.NumberFormat("fa-IR")

  return (
    <div className="p-5 sm:p-8 lg:p-10">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="text-base font-bold tracking-[0.16em] text-brand-gold">نمای کلی</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">داشبورد مدیریت</h1><p className="mt-2 text-sm text-stone-400">وضعیت لحظه‌ای مجموعه املاک هاستکو</p></div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/properties?new=1" className="rounded-xl bg-brand-dark px-6 py-3.5 text-center text-sm font-bold text-white transition hover:bg-brand-green">+ افزودن ملک</Link>
          <Link href="/admin/services" className="rounded-xl border border-brand-dark/10 bg-white px-6 py-3.5 text-center text-sm font-bold text-brand-dark transition hover:bg-brand-dark hover:text-white">+ مدیریت سرویس‌ها</Link>
          <Link href="/admin/projects" className="rounded-xl border border-brand-dark/10 bg-white px-6 py-3.5 text-center text-sm font-bold text-brand-dark transition hover:bg-brand-dark hover:text-white">+ مدیریت پروژه‌ها</Link>
        </div>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="کل املاک" value={number.format(metrics.total)} note="ثبت‌شده در پایگاه داده" color="bg-brand-dark" />
        <Metric label="برای فروش" value={number.format(metrics.forSale)} note="آگهی فروش فعال" color="bg-brand-green" />
        <Metric label="برای اجاره" value={number.format(metrics.forRent)} note="آگهی اجاره فعال" color="bg-brand-gold" />
        <Metric label="ویژه" value={number.format(metrics.featured)} note="نمایش در صفحه اصلی" color="bg-stone-700" />
        <Metric label="پروژه‌های ما" value={number.format(metrics.projects)} note="نمایش در اسلایدر پروژه‌ها" color="bg-sky-700" />
      </div>
      <section className="mt-10 overflow-hidden rounded-3xl border border-stone-200 bg-white">
        <div className="flex items-center justify-between border-b border-stone-100 p-6"><div><h2 className="text-lg font-black">آخرین املاک</h2><p className="mt-1 text-base text-stone-400">مدیریت سریع آگهی‌های ثبت‌شده</p></div><Link href="/admin/properties" className="flex items-center gap-2 text-base font-bold text-brand-green">مشاهده همه <ArrowLeft className="h-4 w-4" aria-hidden /></Link></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-right text-sm"><thead className="bg-stone-50 text-[11px] text-stone-400"><tr><th className="px-6 py-4">ملک</th><th className="px-6 py-4">شناسه</th><th className="px-6 py-4">وضعیت</th><th className="px-6 py-4">شهر</th><th className="px-6 py-4">قیمت</th></tr></thead><tbody className="divide-y divide-stone-100">{properties.slice(0, 6).map((property) => <tr key={property.listingId} className="hover:bg-stone-50"><td className="px-6 py-4 font-bold">{property.title}</td><td className="px-6 py-4 text-stone-400">#{property.listingId}</td><td className="px-6 py-4"><span className="rounded-full bg-brand-green/10 px-3 py-1 text-[10px] font-bold text-brand-green">{property.status === "for-sale" ? "فروش" : "اجاره"}</span></td><td className="px-6 py-4">{property.location.city}</td><td className="px-6 py-4 font-bold">{number.format(property.price.amount)} تومان</td></tr>)}</tbody></table></div>
      </section>
    </div>
  )
}

function Metric({ label, value, note, color }: { label: string; value: string; note: string; color: string }) {
  return <article className="rounded-3xl border border-stone-200 bg-white p-6"><div className={`mb-8 h-2 w-10 rounded-full ${color}`} /><p className="text-base font-bold text-stone-400">{label}</p><strong className="mt-2 block text-4xl font-black">{value}</strong><p className="mt-3 text-[10px] text-stone-400">{note}</p></article>
}

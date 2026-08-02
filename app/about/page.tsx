import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "درباره ما | هاستکو",
  description: "با رویکرد، تجربه و ارزش‌های مجموعه املاک و معماری هاستکو آشنا شوید.",
}

const values = [
  { number: "۰۱", title: "نگاه دقیق", text: "هر ملک را فراتر از اعداد و مشخصات می‌بینیم و کیفیت فضا، موقعیت و آینده آن را بررسی می‌کنیم." },
  { number: "۰۲", title: "اعتماد پایدار", text: "شفافیت در اطلاعات، صداقت در مشاوره و همراهی تا پایان معامله، پایه رابطه ما با شماست." },
  { number: "۰۳", title: "انتخاب متمایز", text: "مجموعه‌ای گزیده از ویلاها، خانه‌ها و فرصت‌های سرمایه‌گذاری را با وسواس انتخاب می‌کنیم." },
]

export default function AboutPage() {
  return (
    <main dir="rtl" className="bg-[#f4f2ed] text-brand-dark">
      <section className="relative min-h-screen overflow-hidden bg-black text-white">
        <Image src="/images/properties/villa-130-twilight.png" alt="ویلای مدرن در طبیعت" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-l from-black/75 via-black/25 to-black/45" />
        <div className="relative z-10 mx-auto flex min-h-screen max-w-[1600px] flex-col justify-end px-6 pb-16 pt-36 sm:px-10 lg:px-16 lg:pb-20">
          <p className="mb-6 text-base font-bold tracking-[0.3em] text-white/60">ABOUT HASTE ECO</p>
          <h1 className="max-w-5xl text-6xl font-black leading-[0.92] sm:text-8xl lg:text-[9rem]">فضاهایی برای<br />زندگی بهتر</h1>
          <div className="mt-10 grid max-w-4xl gap-6 border-t border-white/25 pt-6 sm:grid-cols-[1fr_2fr]">
            <p className="text-sm font-bold">داستان ما</p>
            <p className="max-w-2xl text-base leading-8 text-white/75">هاستکو نقطه تلاقی شناخت بازار ملک، معماری معاصر و تجربه انسانی است. ما کمک می‌کنیم انتخاب یک خانه یا سرمایه‌گذاری، به تصمیمی روشن و مطمئن تبدیل شود.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-12 px-6 py-24 sm:px-10 lg:grid-cols-2 lg:px-16 lg:py-32">
        <div className="relative min-h-[520px] overflow-hidden rounded-[2rem]">
          <Image src="/images/properties/villa-130-interior.png" alt="فضای داخلی یکی از پروژه‌های هاستکو" fill className="object-cover" />
          <div className="absolute bottom-0 left-0 bg-black p-7 text-white sm:p-9">
            <strong className="text-5xl font-black">+۱۰</strong>
            <p className="mt-2 text-base text-white/60">سال تجربه تخصصی</p>
          </div>
        </div>
        <div className="flex flex-col justify-center lg:pr-10">
          <p className="text-base font-bold tracking-[0.22em] text-brand-gold">نگاه ما</p>
          <h2 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">ملک خوب، آغاز یک داستان ماندگار است.</h2>
          <p className="mt-8 text-base leading-9 text-stone-600">از نخستین گفت‌وگو تا بازدید، ارزیابی و نهایی‌شدن قرارداد، تیم ما کنار شماست. تجربه محلی، تحلیل دقیق و شناخت معماری به ما کمک می‌کند گزینه‌هایی پیشنهاد دهیم که با سبک زندگی و هدف مالی شما هماهنگ باشند.</p>
          <Link href="/projects" className="mt-10 flex w-fit items-center gap-2 rounded-full bg-brand-dark px-7 py-4 text-sm font-bold text-white transition hover:bg-brand-green">مشاهده پروژه‌های ما <ArrowLeft className="h-4 w-4" aria-hidden /></Link>
        </div>
      </section>

      <section className="bg-brand-dark px-6 py-24 text-white sm:px-10 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col justify-between gap-6 border-b border-white/15 pb-10 sm:flex-row sm:items-end">
            <div><p className="text-base font-bold tracking-[0.22em] text-brand-gold">ارزش‌های ما</p><h2 className="mt-4 text-4xl font-black sm:text-6xl">آنچه به آن پایبندیم</h2></div>
            <p className="max-w-md text-sm leading-7 text-white/55">برای ما کیفیت تجربه شما به اندازه کیفیت ملکی که انتخاب می‌کنید اهمیت دارد.</p>
          </div>
          <div className="grid lg:grid-cols-3">
            {values.map((value) => <article key={value.number} className="border-b border-white/15 py-10 lg:border-b-0 lg:border-l lg:px-9 lg:first:pr-0 lg:last:border-l-0"><span className="text-base font-bold text-brand-gold">{value.number}</span><h3 className="mt-10 text-2xl font-black">{value.title}</h3><p className="mt-4 text-sm leading-8 text-white/60">{value.text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 sm:px-10 lg:px-16 lg:py-32">
        <div className="mx-auto flex max-w-[1500px] flex-col items-start justify-between gap-8 rounded-[2rem] bg-brand-gold p-8 text-white sm:p-12 lg:flex-row lg:items-end lg:p-16">
          <div><p className="text-base font-bold tracking-[0.2em] text-white/65">شروع یک همکاری</p><h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">برای انتخاب بعدی شما آماده‌ایم.</h2></div>
          <Link href="/contact" className="flex shrink-0 items-center gap-2 rounded-full bg-black px-8 py-4 text-sm font-bold text-white transition hover:bg-brand-dark">ارتباط با ما <ArrowLeft className="h-4 w-4" aria-hidden /></Link>
        </div>
      </section>
    </main>
  )
}

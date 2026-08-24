import PropertyGallery from "@/components/PropertyGallery"
import { getCompanySettings } from "@/lib/company-settings"
import { getPropertyBySlug } from "@/lib/properties"
import { getVirtualToursForProperty } from "@/lib/virtual-tours"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const property = await getPropertyBySlug(slug)
  if (!property) return { title: "ملک پیدا نشد | Hasteeco" }

  return {
    title: `${property.title} | Hasteeco`,
    description: property.summary,
    openGraph: { title: property.title, description: property.summary, images: [property.images[0]] },
  }
}

export default async function PropertyPage({ params }: PageProps) {
  const { slug } = await params
  const [property, company, virtualTours] = await Promise.all([
    getPropertyBySlug(slug),
    getCompanySettings(),
    getVirtualToursForProperty(slug),
  ])
  if (!property) notFound()

  const number = new Intl.NumberFormat("fa-IR")

  return (
    <main className="bg-[#f4f2ed] text-brand-dark">
      <section className="relative overflow-hidden bg-stone-900">
        <PropertyGallery images={property.images} title={property.title} />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 mx-auto flex max-w-9xl items-start justify-between gap-5 px-5 pt-24 text-white sm:px-16 sm:pt-36">
          <div>
            <p className="mb-3 text-base font-bold tracking-[0.2em] text-white/70" dir="ltr">
              HASTE ECO — PROPERTY {property.listingId}
            </p>
            <h1 className="max-w-6xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-7xl">
              {property.titleFa}
            </h1>
          </div>
          <Link href="#contact" className="pointer-events-auto hidden rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-bold backdrop-blur transition hover:bg-white hover:text-brand-dark sm:block text-nowrap">
            رزرو بازدید
          </Link>
        </div>
      </section>

      <section className="mx-auto grid w-full lg:grid-cols-[0.7fr_1.3fr]">
        <div className="bg-brand-dark px-6 py-12 text-white sm:px-10 lg:px-14 lg:py-4 flex h-full">
          <div className="mb-0 flex items-center justify-between  ">
            {/* <div>
              <p className="text-base font-semibold text-white/50">قیمت پیشنهادی</p>
              <p className="mt-2 text-3xl font-black sm:text-4xl">
                {number.format(property.price.amount)} <span className="text-base font-medium text-white/60">تومان / ماهانه</span>
              </p>
            </div>
            <span className="rounded-full bg-brand-gold px-4 py-2 text-base font-bold text-white">برای فروش</span> */}
            <Image src="/H-JMSLOC10SA-locksley-41-floor-plan-RHS.png" alt="Hasteeco Logo" width={440} height={180} className="" />
          </div>
          {/* <p className="mb-4 text-base font-bold tracking-[0.16em] text-brand-gold">زندگی معاصر، در دل طبیعت</p>
          <h2 className="max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl">فضایی آرام با مرزهای محو میان خانه و باغ</h2>
          <p className="mt-6 max-w-2xl text-sm leading-8 text-white/65 sm:text-base">
            ویلایی مدرن در میان درختان بالغ لواسان؛ ترکیبی از سنگ روشن، چوب گرم و شیشه‌های سرتاسری. پلان چهار اتاقه شامل سه اتاق خواب مستقل، فضای یکپارچه پذیرایی و غذاخوری، باغ محوطه‌سازی‌شده و پارکینگ اختصاصی است.
          </p> */}
        </div>

        <div className="grid grid-cols-2 bg-white sm:grid-cols-3 w-ful h-full">
          <Spec value={number.format(property.buildingAreaSqM)} unit="متر مربع" label="زیربنا" />
          <Spec value={number.format(property.landAreaSqM)} unit="متر مربع" label="مساحت ملک" />
          <Spec value={number.format(property.rooms)} unit="اتاق" label="تعداد فضاها" />
          <Spec value={number.format(property.bedrooms)} unit="خواب" label="اتاق خواب" />
          <Spec value={number.format(property.bathrooms)} unit="حمام" label="سرویس" />
          <Spec value={number.format(property.parkingSpaces)} unit="خودرو" label="پارکینگ" />
        </div>
      </section>

      <section id="Description" className="mx-auto grid w-full  lg:grid-cols-2 ">
        <div className="pointer-events-none z-10 col-span-2 flex w-full items-start justify-between gap-5 px-5 pt-7 text-black sm:px-8 sm:py-16 ">
          <div className="flex w-full">
            <div className="flex flex-col w-1/2 gap-4">
              <h3 className=" text-2xl font-bold text-black/80 leading-[0.95] tracking-tight sm:text-3xl lg:text-4xl">
                {property.titleFa}
              </h3>
              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {number.format(property.buildingAreaSqM)} متر مربع
              </h1>

            </div>
            <p className="mt-6 flex shrink-0 w-1/2 text-sm leading-8 text-black/65 sm:text-base items-end">
              {property.description}
            </p>
          </div>
          {/* <Link href="#contact" className="pointer-events-auto hidden rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-bold backdrop-blur transition hover:bg-white hover:text-brand-dark sm:block">
          رزرو بازدید
        </Link> */}
        </div>
      </section>

      <section className="mx-auto grid w-full bg-white lg:grid-cols-2">
        <div className="relative min-h-[500px] overflow-hidden bg-[#e7e3db] p-8 sm:p-12">
          {/* <p className="text-base font-bold tracking-[0.18em] text-brand-green">پلان و ابعاد</p>
          <h2 className="mt-3 text-3xl font-black">خوانش روشن از فضا</h2>
          <div className="mx-auto mt-10 grid aspect-square max-w-md grid-cols-2 grid-rows-2 gap-2 border-[10px] border-brand-dark bg-brand-dark">
            <Room label="پذیرایی" detail="نورگیر ۶ ساعت / روز" className="col-span-2" />
            <Room label="اتاق خواب" detail="آرام و رو به باغ" />
            <Room label="خدمات" detail="حمام و دسترسی" />
          </div> */}
          <Image src={property.images[1] ?? property.images[0]} alt={property.title} fill className="object-cover" />

        </div>
        <div className="flex flex-col justify-between p-8 sm:p-12 lg:p-16">
          <div>
            <p className="text-base font-bold tracking-[0.18em] text-brand-gold">اطلاعات تکمیلی</p>
            <h2 className="mt-3 text-4xl font-black">جزئیات ملک</h2>
            <dl className="mt-10 divide-y divide-stone-200 border-y border-stone-200">
              <Detail label="شناسه" value={number.format(property.listingId)} />
              <Detail label="نوع ملک" value={propertyTypeLabels[property.propertyType] ?? property.propertyType} />
              <Detail label="سال ساخت" value={number.format(property.yearBuilt.solarHijri)} />
              <Detail label="ابعاد ثبت‌شده" value={`${property.buildingDimensions.map((item) => number.format(item)).join(" × ")} متر`} />
              <Detail label="موقعیت" value={property.location.address} />
              <Detail label="وضعیت" value={property.status === "for-sale" ? "برای فروش" : "برای اجاره"} />
            </dl>
          </div>
          <div className="mt-12 flex flex-wrap gap-2">
            {property.features.map((feature) => (
              <span key={feature} className="rounded-full bg-[#f4f2ed] px-4 py-2 text-base font-bold text-stone-600">{feature}</span>
            ))}
          </div>
        </div>
      </section>

      {virtualTours.length > 0 && (
        <section id="virtual-tour" className="bg-[#101512] px-4 py-14 text-white sm:px-8 lg:px-12 lg:py-20" dir="rtl">
          <div className="mx-auto max-w-[1600px]">
            <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-base font-bold tracking-[0.18em] text-brand-gold">بازدید آنلاین ملک</p>
                <h2 className="mt-3 text-4xl font-black sm:text-5xl">تور مجازی ۳۶۰ درجه</h2>
                <p className="mt-4 max-w-2xl text-sm leading-8 text-white/55 sm:text-base">
                  در فضای ملک حرکت کنید، اتاق‌ها را ببینید و جزئیات پروژه را از هر زاویه بررسی کنید.
                </p>
              </div>
              {virtualTours.length === 1 && (
                <Link
                  href={`/virtual-tour/${virtualTours[0].slug}`}
                  target="_blank"
                  className="w-fit rounded-full border border-white/20 px-6 py-3 text-sm font-bold transition hover:border-brand-gold hover:bg-brand-gold"
                >
                  نمایش تمام‌صفحه
                </Link>
              )}
            </div>

            <div className="space-y-10">
              {virtualTours.map((tour) => (
                <article key={tour.slug}>
                  {virtualTours.length > 1 && (
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <h3 className="text-xl font-bold">{tour.name}</h3>
                      <Link href={`/virtual-tour/${tour.slug}`} target="_blank" className="text-sm font-bold text-brand-gold">
                        نمایش تمام‌صفحه
                      </Link>
                    </div>
                  )}
                  <div className="relative h-[72vh] min-h-[520px] overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl">
                    <iframe
                      src={tour.displayMode === "iframe" && tour.iframeUrl
                        ? tour.iframeUrl
                        : `/virtual-tour/${tour.slug}?embed=1`}
                      title={`تور مجازی ${tour.name}`}
                      className="absolute inset-0 h-full w-full border-0"
                      loading="lazy"
                      allow="fullscreen; gyroscope; accelerometer"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="contact" className="bg-brand-gold px-6 py-16 text-white sm:px-10 lg:py-24">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="text-base font-bold tracking-[0.18em] text-white/70">یک قدم تا بازدید</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">این خانه را از نزدیک تجربه کنید.</h2>
          </div>
          <a href={`tel:${company.phone}`} className="rounded-full bg-brand-dark px-8 py-4 text-sm font-bold shadow-xl transition hover:-translate-y-1">
            تماس با مشاور {company.phoneDisplay}
          </a>
        </div>
      </section>
    </main>
  )
}

function Spec({ value, unit, label }: { value: string; unit: string; label: string }) {
  return <div className="flex min-h-32 flex-col justify-between border-b border-l border-stone-200 p-6 sm:p-6"><span className="text-base font-bold text-stone-400">{label}</span><div><strong className="text-3xl font-black sm:text-4xl">{value}</strong><span className="mr-1 text-base text-stone-400">{unit}</span></div></div>
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-5 py-4 text-sm"><dt className="text-stone-400">{label}</dt><dd className="font-bold text-brand-dark">{value}</dd></div>
}

const propertyTypeLabels: Record<string, string> = {
  villa: "ویلا",
  apartment: "آپارتمان",
  house: "خانه",
  land: "زمین",
  commercial: "ملک تجاری",
}

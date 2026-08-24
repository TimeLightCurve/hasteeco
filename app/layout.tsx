import type { Metadata } from "next";
import { Poppins, Vazirmatn } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCompanySettings } from "@/lib/company-settings";
import localFont from 'next/font/local'

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-vazirmatn",
  display: "swap",
});


const poppins = Poppins({ subsets: ['latin'], weight: '400' })


const nian = localFont({
  src: [
    {
      path: '../public/fonts/nian/Nian ExtraLight.ttf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../public/fonts/nian/Nian Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/nian/Nian.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/nian/Nian Thin.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../public/fonts/nian/Nian SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },

    {
      path: '../public/fonts/nian/Nian Bold.ttf',
      weight: '700',
      style: 'normal',
    },

    {
      path: '../public/fonts/nian/Nian Black.ttf',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--font-nian-source',
})
//NeoSansPro-Medium.B9XxyJoC.woff2

const neoSans = localFont({
  src: [
    {
      path: '../public/fonts/NeoSansPro-Medium.woff2',
      weight: '400',
      style: 'normal',
    }
  ],
  variable: '--font-neoSans',
})

//TWKLausanne-200.DUfGGNya.woff2
const lausanne = localFont({
  src: [
    {
      path: '../public/fonts/TWKLausanne-200.DUfGGNya.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../public/fonts/TWKLausanne-250.Dq0HLRo1.woff2',
      weight: '250',
      style: 'normal',
    },
  ],
  variable: '--font-lausanne',
})


export const metadata: Metadata = {
  title: "هستیکو | خرید، فروش و اجاره ملک",
  description: "بهترین پلتفرم برای خرید، فروش و اجاره ملک در ایران",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const companySettings = await getCompanySettings();
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} ${poppins.className} ${nian.variable} ${neoSans.variable} ${lausanne.variable} `}>
      <body className="relative min-h-full flex flex-col font-sans  h-full w-full overflow-x-hidden">
        <Navbar settings={companySettings} />
        {children}
        <Footer settings={companySettings} />
      </body>
    </html>
  );
}

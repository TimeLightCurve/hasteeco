"use client";

import { useState } from "react";

const propertyTypes = [
  { value: "apartment", label: "آپارتمان" },
  { value: "villa", label: "ویلا" },
  { value: "house", label: "خانه" },
  { value: "land", label: "زمین" },
  { value: "commercial", label: "تجاری" },
];
const cities = [
  { value: "Lavasan", label: "لواسان" },
  { value: "Tehran", label: "تهران" },
  { value: "Mashhad", label: "مشهد" },
  { value: "Isfahan", label: "اصفهان" },
  { value: "Shiraz", label: "شیراز" },
];

export default function SearchBar({ listPage = false }: { listPage?: boolean }) {
  const [propertyType, setPropertyType] = useState("");
  const [city, setCity] = useState("");
  const [keyword, setKeyword] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (propertyType) params.set("type", propertyType);
    if (city) params.set("city", city);
    if (keyword) params.set("q", keyword);
    window.location.href = `/listings?${params.toString()}`;
  }

  return (
    <form
      onSubmit={handleSearch}
      className={`${listPage ? "bg-white shadow-md border border-white/20 " : "bg-black shadow-xl "} backdrop-blur-2xl  px-4 py-4 md:px-16 md:py-10 md:pb-12`}
    >
      <div className="flex flex-col h-full min-h-64 md:grid md:grid-cols-2 md:items-center gap-4 md:gap-4">

        {/* نوع ملک */}
        <div className={`${listPage ? "" : "border-b border-white/20"} flex h-full min-w-0 items-center gap-4 md:px-5 md:py-1`}>
          <p className={`shrink-0 text-xl font-semibold ${listPage ? "text-brand-dark" : "text-white"} mb-1.5`}>نوع</p>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className={`${listPage ? "bg-transparent text-black" : "bg-black text-white/90"} min-w-0 flex-1 cursor-pointer appearance-none px-2 text-sm outline-none`}
          >
            <option value="" className= { `${listPage ? "bg-transparent" : "bg-black"} px-2`}>نوع ملک</option>
            {propertyTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* <div className="hidden md:flex  w-px self-stretch bg-gray-200 my-1" /> */}

        {/* موقعیت */}
        <div className={`${listPage ? "" : "border-b border-white/20"} flex h-full min-w-0 items-center gap-4 md:px-5 md:py-1`}>
          <p className={`shrink-0 text-xl font-semibold ${listPage ? "text-brand-dark" : "text-white"} mb-1.5`}>موقعیت</p>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={`min-w-0 flex-1 cursor-pointer appearance-none px-2 text-sm outline-none ${listPage ? "text-brand-dark" : "bg-black text-gray-300"}`}
          >
            <option value="" className= { `${listPage ? "bg-transparent" : "bg-black"} px-2`}>تمام شهر ها</option>
            {cities.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* <div className="hidden md:block w-px self-stretch bg-gray-200 my-1" /> */}

        {/* جستجو */}
        <div className="flex h-full min-w-0 w-full flex-col gap-2 md:gap-4 md:px-0 md:py-0">
          <p className={`text-xl font-semibold ${listPage ? "text-brand-dark" : "text-white"} md:mr-4`}>جستجو</p>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="کلید واژه را وارد کنید"
            className={`h-12 min-w-0 w-full px-4 py-4 text-sm outline-none md:h-16 ${listPage ? "text-brand-dark placeholder:text-gray-800" : "bg-white/20 text-gray-300 placeholder:bg placeholder:text-gray-400"}`}
          />
        </div>

        {/* <div className="hidden md:block w-px self-stretch bg-gray-200 my-1" /> */}

        {/* Advanced search + button */}
        <div className="flex items-center gap-4 md:ps-4">
          {/* <button
            type="button"
            className="hidden md:flex items-center gap-1.5 text-xl text-white hover:text-brand-dark transition-colors whitespace-nowrap"
          >
           
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            جستجوی پیشرفته
          </button> */}

          <button
            type="submit"
            className="flex items-center gap-2 bg-brand-dark hover:bg-brand-green text-white text-sm font-semibold px-6 py-6 transition-colors whitespace-nowrap w-full md:w-full md:h-16 place-self-end justify-center"
          >
            {/* Search icon */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            جست و جو
          </button>
        </div>
      </div>
    </form>
  );
}

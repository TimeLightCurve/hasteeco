"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Building2, ExternalLink, FolderKanban, Gauge, Menu, Settings, Shapes, X } from "lucide-react";

const links = [
  { href: "/admin", label: "داشبورد", icon: Gauge },
  { href: "/admin/properties", label: "مدیریت املاک", icon: Building2 },
  { href: "/admin/projects", label: "پروژه‌های ما", icon: FolderKanban },
  { href: "/admin/services", label: "مدیریت سرویس‌ها", icon: Shapes },
  { href: "/admin/settings", label: "اطلاعات شرکت", icon: Settings },
];

export default function AdminMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "بستن منوی مدیریت" : "باز کردن منوی مدیریت"} className="grid h-10 w-10 place-items-center rounded-xl bg-brand-dark text-white">
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <div className="absolute inset-x-4 top-[calc(100%+0.5rem)] overflow-hidden rounded-2xl border border-stone-200 bg-white p-2 shadow-2xl">
          <nav className="space-y-1">
            {links.map(({ href, label, icon: Icon }) => {
              const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
              return <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${active ? "bg-brand-dark text-white" : "text-stone-600 hover:bg-stone-100"}`}><Icon className="h-5 w-5" aria-hidden />{label}</Link>;
            })}
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-stone-600 transition hover:bg-stone-100"><ExternalLink className="h-5 w-5" aria-hidden />مشاهده وب‌سایت</Link>
          </nav>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  ExternalLink,
  Eye,
  FolderKanban,
  Gauge,
  LogOut,
  PanelRightClose,
  PanelRightOpen,
  Settings,
  Shapes,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import AdminMobileNav from "@/components/AdminMobileNav";

const links = [
  { href: "/admin", label: "داشبورد", icon: Gauge },
  { href: "/admin/properties", label: "مدیریت املاک", icon: Building2 },
  { href: "/admin/services", label: "مدیریت سرویس‌ها", icon: Shapes },
  { href: "/admin/projects", label: "پروژه‌های ما", icon: FolderKanban },
  { href: "/admin/virtual-tour", label: "تور مجازی", icon: Eye },
  { href: "/admin/settings", label: "اطلاعات شرکت", icon: Settings },
];

type AdminShellProps = {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    role: string;
  };
};

export default function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const [sidebarHidden, setSidebarHidden] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f2ed] text-brand-dark" dir="rtl">
      <aside className={`fixed inset-y-0 right-0 z-30 hidden w-64 flex-col bg-brand-dark p-6 text-white transition-transform duration-300 lg:flex ${sidebarHidden ? "translate-x-full" : "translate-x-0"}`}>
        <Link href="/admin" className="flex items-center gap-3 border-b border-white/10 pb-7">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-xl text-brand-dark">⌂</span>
          <span>
            <strong className="block text-lg">Hasteeco</strong>
            <small className="text-xs text-white/50">ADMIN CONSOLE</small>
          </span>
        </Link>
        <nav className="mt-8 space-y-2 text-base font-bold">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3.5 transition ${active ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                {label}
              </Link>
            );
          })}
          <Link href="/" className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-white/70 transition hover:bg-white/10 hover:text-white">
            <ExternalLink className="h-5 w-5 shrink-0" aria-hidden /> مشاهده وب‌سایت
          </Link>
        </nav>
        <div className="mt-auto border-t border-white/10 pt-5">
          <p className="text-base font-bold">{user.name}</p>
          <p className="mt-1 text-xs text-white/50" dir="ltr">{user.email}</p>
          <form action={logoutAction}>
            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-base font-bold text-white/75 transition hover:bg-white hover:text-brand-dark">
              <LogOut className="h-4 w-4" aria-hidden /> خروج از حساب
            </button>
          </form>
        </div>
      </aside>

      <header className={`sticky top-0 z-20 flex items-center justify-between border-b border-stone-200 bg-white/90 px-5 py-4 backdrop-blur transition-[margin] duration-300 lg:px-10 ${sidebarHidden ? "lg:mr-0" : "lg:mr-64"}`}>
        <div className="flex items-center gap-3">
          <AdminMobileNav />
          <button
            type="button"
            onClick={() => setSidebarHidden((value) => !value)}
            className="hidden h-11 w-11 place-items-center rounded-xl border border-stone-200 bg-white text-brand-dark shadow-sm transition hover:bg-stone-100 lg:grid"
            aria-label={sidebarHidden ? "نمایش نوار کناری" : "پنهان کردن نوار کناری"}
            aria-expanded={!sidebarHidden}
          >
            {sidebarHidden ? <PanelRightOpen className="h-5 w-5" /> : <PanelRightClose className="h-5 w-5" />}
          </button>
          <Link href="/admin" className="font-black lg:hidden">Hasteeco Admin</Link>
        </div>
        <div className="mr-auto flex items-center gap-3">
          <div className="hidden text-left sm:block">
            <p className="text-base font-bold">{user.name}</p>
            <p className="text-xs text-stone-400">{user.role === "admin" ? "مدیر سیستم" : "ویرایشگر"}</p>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-gold font-black text-white">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
        </div>
      </header>

      <main className={`transition-[margin] duration-300 ${sidebarHidden ? "lg:mr-0" : "lg:mr-64"}`}>
        {children}
      </main>
    </div>
  );
}

"use client"

import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { FormEvent, useState } from "react"

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError("")

    const data = new FormData(event.currentTarget)
    const result = await signIn("credentials", {
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
      redirect: false,
    })

    if (result?.error) {
      setError("ایمیل یا رمز عبور صحیح نیست.")
      setPending(false)
      return
    }

    const callbackUrl = searchParams.get("callbackUrl")
    const destination = callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/admin"
    router.push(destination)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-5">
      <label className="block">
        <span className="mb-2 block text-base font-bold text-stone-500">ایمیل</span>
        <input name="email" type="email" autoComplete="email" required dir="ltr" placeholder="admin@hasteeco.com" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-left text-sm outline-none transition focus:border-brand-green focus:bg-white focus:ring-4 focus:ring-brand-green/10" />
      </label>
      <label className="block">
        <span className="mb-2 block text-base font-bold text-stone-500">رمز عبور</span>
        <input name="password" type="password" autoComplete="current-password" required minLength={8} dir="ltr" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-left text-sm outline-none transition focus:border-brand-green focus:bg-white focus:ring-4 focus:ring-brand-green/10" />
      </label>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-base font-bold text-red-700">{error}</p>}
      <button disabled={pending} className="w-full rounded-2xl bg-brand-dark px-5 py-4 text-sm font-bold text-white transition hover:bg-brand-green disabled:cursor-wait disabled:opacity-60">
        {pending ? "در حال ورود…" : "ورود به پنل مدیریت"}
      </button>
    </form>
  )
}

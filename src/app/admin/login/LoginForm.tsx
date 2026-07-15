"use client";

import { useFormStatus } from "react-dom";

import { login } from "@/app/admin/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Giriş Yapılıyor..." : "Giriş Yap"}
    </button>
  );
}

export function LoginForm() {
  return (
    <form action={login} className="space-y-5">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-200" htmlFor="email">
          E-posta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 sm:text-sm"
          placeholder="ornek@samandiraidmanyurdu.com"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-200" htmlFor="password">
          Şifre
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 sm:text-sm"
          placeholder="Şifreniz"
        />
      </div>

      <SubmitButton />
    </form>
  );
}

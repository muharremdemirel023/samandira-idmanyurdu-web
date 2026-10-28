"use client";

import { useFormStatus } from "react-dom";

import { parentLogin } from "@/app/(site)/veli/actions";

const fieldClass =
  "w-full rounded-xl border border-border-subtle bg-white px-4 py-3 text-base text-text-primary outline-none transition placeholder:text-text-muted/55 focus:border-accent focus:ring-2 focus:ring-accent/25 sm:text-sm";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-[2.75rem] w-full cursor-pointer items-center justify-center rounded-full border border-accent bg-accent px-6 py-3 text-sm font-bold text-white shadow-[0_10px_24px_-14px_rgba(194,65,12,0.55)] transition hover:border-accent-strong hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Giriş Yapılıyor..." : "Giriş Yap"}
    </button>
  );
}

export function LoginForm() {
  return (
    <form action={parentLogin} className="space-y-5">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-text-primary" htmlFor="phone">
          Telefon numarası
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          className={fieldClass}
          placeholder="05XX XXX XX XX"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-text-primary" htmlFor="password">
          Şifre
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={fieldClass}
          placeholder="Şifreniz"
        />
      </div>

      <SubmitButton />
    </form>
  );
}

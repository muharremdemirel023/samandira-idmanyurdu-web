"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { submitPreRegistration } from "@/app/(site)/on-kayit/actions";
import { initialPreRegistrationFormState } from "@/app/(site)/on-kayit/form-state";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";

const initialState = initialPreRegistrationFormState;

const fieldClass =
  "w-full rounded-xl border border-border-subtle bg-white px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted/55 focus:border-accent focus:ring-2 focus:ring-accent/25";

const labelClass = "flex flex-col gap-2 type-label-caps text-text-muted";

const groupTitleClass = "type-label-caps-accent text-accent";

export function PreRegistrationForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    submitPreRegistration,
    initialState,
  );

  useEffect(() => { if (state.ok) router.push("/tesekkurler"); }, [state.ok, router]);

  return (
    <form
      action={formAction}
      className="club-soft-panel overflow-hidden bg-white"
    >
      <div className="border-b border-border-subtle bg-surface-base px-6 py-5 sm:px-8">
        <h3 className="type-heading-md text-text-primary">Ön kayıt formu</h3>
        <p className="type-body mt-1">
          Tüm alanları doldurmanız değerlendirmeyi hızlandırır.
        </p>
      </div>

      <div className="px-6 py-7 sm:px-8 sm:py-8">
        <fieldset className="m-0 border-0 p-0">
          <legend className={groupTitleClass}>Veli bilgileri</legend>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <label className={labelClass}>
              Veli adı
              <input
                className={fieldClass}
                name="parent_name"
                placeholder="Ad soyad"
                required
              />
            </label>
            <label className={labelClass}>
              Telefon
              <input className={fieldClass} name="phone" placeholder="+90 ..." required />
            </label>
          </div>
        </fieldset>

        <fieldset className="m-0 mt-7 border-0 p-0">
          <legend className={groupTitleClass}>Oyuncu bilgileri</legend>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <label className={labelClass}>
              Oyuncu adı
              <input
                className={fieldClass}
                name="child_name"
                placeholder="Ad soyad"
                required
              />
            </label>
            <label className={labelClass}>
              Doğum yılı
              <input className={fieldClass} name="birth_year" placeholder="2014" required />
            </label>
          </div>
        </fieldset>

        <label className={`${labelClass} mt-7`}>
          Not (isteğe bağlı)
          <textarea
            className={fieldClass}
            name="notes"
            rows={4}
            placeholder="Oyuncunun mevcut deneyimi, mevki bilgisi veya sormak istediğiniz konu"
          />
        </label>

        {state.message ? (
          <p
            role="status"
            className={
              state.ok
                ? "mt-6 rounded-xl border border-accent/30 bg-accent/[0.08] px-4 py-3 text-sm font-semibold text-text-primary"
                : "mt-6 rounded-xl border border-red-200 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700"
            }
          >
            {state.message}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-[2.75rem] cursor-pointer items-center justify-center rounded-full bg-accent px-7 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_-14px_rgba(194,65,12,0.55)] transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-deep sm:flex-1"
          >
            {pending ? "Gönderiliyor..." : "Başvuruyu gönder"}
          </button>
          <Button
            href={siteConfig.whatsAppHref}
            target="_blank"
            rel="noreferrer noopener"
            variant="outline"
            className="min-h-[2.75rem] border-accent/35 bg-transparent"
          >
            WhatsApp ile yaz
          </Button>
        </div>

        <p className="type-meta mt-5 normal-case tracking-normal text-text-muted/80">
          Bilgileriniz yalnızca akademi başvurunuzun değerlendirilmesi için
          kullanılır ve üçüncü kişilerle paylaşılmaz.
        </p>
      </div>
    </form>
  );
}

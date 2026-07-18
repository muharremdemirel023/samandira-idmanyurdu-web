"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { submitPreRegistration } from "@/app/(site)/on-kayit/actions";
import { initialPreRegistrationFormState } from "@/app/(site)/on-kayit/form-state";
import { TurnstileWidget } from "@/app/(site)/on-kayit/TurnstileWidget";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { PRE_REGISTRATION_NOTE_MAX_LENGTH } from "@/lib/pre-registration/constants";

const fieldClass =
  "w-full rounded-xl border border-border-subtle bg-white px-4 py-3 text-base text-text-primary outline-none transition placeholder:text-text-muted/55 focus:border-accent focus:ring-2 focus:ring-accent/25 sm:text-sm";
const labelClass = "flex flex-col gap-2 type-label-caps text-text-muted";
const groupTitleClass = "type-label-caps-accent text-accent";
const errorClass = "text-sm font-semibold normal-case tracking-normal text-red-700";
const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

function RequiredMark() {
  return <span className="text-red-700" aria-hidden>*</span>;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <span id={id} role="alert" className={errorClass}>
      {message}
    </span>
  ) : null;
}

export function PreRegistrationForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    submitPreRegistration,
    initialPreRegistrationFormState,
  );

  useEffect(() => {
    if (state.ok) router.replace("/tesekkurler");
  }, [state.ok, router]);

  const guardianError = state.fieldErrors.guardianName?.[0];
  const phoneError = state.fieldErrors.phoneE164?.[0];
  const studentError = state.fieldErrors.studentName?.[0];
  const birthYearError = state.fieldErrors.birthYear?.[0];
  const noteError = state.fieldErrors.note?.[0];
  const consentError = state.fieldErrors.consent?.[0];

  return (
    <form
      action={formAction}
      className="club-soft-panel overflow-hidden bg-white"
      aria-busy={pending}
    >
      <div className="border-b border-border-subtle bg-surface-base px-6 py-5 sm:px-8">
        <h2 className="type-heading-md text-text-primary">Ön kayıt formu</h2>
        <p className="type-body mt-1">
          <span className="text-red-700" aria-hidden>*</span> işaretli alanlar zorunludur.
        </p>
      </div>

      <div className="relative px-6 py-7 sm:px-8 sm:py-8">
        <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden>
          <label htmlFor="website">Web sitesi</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <fieldset className="m-0 border-0 p-0">
          <legend className={groupTitleClass}>Veli bilgileri</legend>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <label className={labelClass} htmlFor="guardian_name">
              <span>Veli adı <RequiredMark /></span>
              <input
                id="guardian_name"
                className={fieldClass}
                name="guardian_name"
                placeholder="Ad soyad"
                autoComplete="name"
                minLength={2}
                maxLength={100}
                required
                aria-invalid={Boolean(guardianError)}
                aria-describedby={guardianError ? "guardian_name-error" : undefined}
              />
              <FieldError id="guardian_name-error" message={guardianError} />
            </label>

            <label className={labelClass} htmlFor="phone">
              <span>Telefon <RequiredMark /></span>
              <input
                id="phone"
                className={fieldClass}
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="05XX XXX XX XX"
                maxLength={20}
                required
                aria-invalid={Boolean(phoneError)}
                aria-describedby={phoneError ? "phone-error" : "phone-hint"}
              />
              <span id="phone-hint" className="text-xs font-normal normal-case tracking-normal">
                Türkiye cep telefonu numaranızı girin.
              </span>
              <FieldError id="phone-error" message={phoneError} />
            </label>
          </div>
        </fieldset>

        <fieldset className="m-0 mt-7 border-0 p-0">
          <legend className={groupTitleClass}>Oyuncu bilgileri</legend>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <label className={labelClass} htmlFor="student_name">
              <span>Oyuncu adı <RequiredMark /></span>
              <input
                id="student_name"
                className={fieldClass}
                name="student_name"
                placeholder="Ad soyad"
                autoComplete="off"
                minLength={2}
                maxLength={100}
                required
                aria-invalid={Boolean(studentError)}
                aria-describedby={studentError ? "student_name-error" : undefined}
              />
              <FieldError id="student_name-error" message={studentError} />
            </label>

            <label className={labelClass} htmlFor="birth_year">
              <span>Doğum yılı <RequiredMark /></span>
              <input
                id="birth_year"
                className={fieldClass}
                name="birth_year"
                type="text"
                inputMode="numeric"
                autoComplete="bday-year"
                placeholder="2014"
                pattern="[0-9]{4}"
                minLength={4}
                maxLength={4}
                required
                aria-invalid={Boolean(birthYearError)}
                aria-describedby={birthYearError ? "birth_year-error" : "birth_year-hint"}
              />
              <span id="birth_year-hint" className="text-xs font-normal normal-case tracking-normal">
                Dört haneli yıl olarak yazın.
              </span>
              <FieldError id="birth_year-error" message={birthYearError} />
            </label>
          </div>
        </fieldset>

        <label className={`${labelClass} mt-7`} htmlFor="note">
          <span>Not <span className="font-normal normal-case tracking-normal">(isteğe bağlı)</span></span>
          <textarea
            id="note"
            className={fieldClass}
            name="note"
            rows={4}
            maxLength={PRE_REGISTRATION_NOTE_MAX_LENGTH}
            placeholder="Oyuncunun mevcut deneyimi, mevki bilgisi veya sormak istediğiniz konu"
            aria-invalid={Boolean(noteError)}
            aria-describedby={noteError ? "note-error" : "note-hint"}
          />
          <span id="note-hint" className="text-xs font-normal normal-case tracking-normal">
            En fazla {PRE_REGISTRATION_NOTE_MAX_LENGTH} karakter.
          </span>
          <FieldError id="note-error" message={noteError} />
        </label>

        <div className="mt-7 rounded-xl border border-border-subtle bg-surface-base p-4">
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-text-primary" htmlFor="privacy_consent">
            <input
              id="privacy_consent"
              name="privacy_consent"
              type="checkbox"
              required
              className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-accent)]"
              aria-invalid={Boolean(consentError)}
              aria-describedby={consentError ? "privacy_consent-error" : undefined}
            />
            <span>
              <Link href="/kvkk-aydinlatma-metni" className="font-semibold text-accent underline underline-offset-2">
                KVKK Aydınlatma Metni
              </Link>
              &apos;ni okudum ve kişisel verilerimin başvurumun değerlendirilmesi amacıyla işlenmesi hakkında bilgi sahibi oldum. <RequiredMark />
            </span>
          </label>
          <FieldError id="privacy_consent-error" message={consentError} />
        </div>

        {turnstileSiteKey ? (
          <div className="mt-6">
            <TurnstileWidget siteKey={turnstileSiteKey} resetKey={state.ok ? "" : state.message} />
          </div>
        ) : null}

        {state.message ? (
          <p
            role={state.ok ? "status" : "alert"}
            aria-live={state.ok ? "polite" : "assertive"}
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
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-accent px-7 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_-14px_rgba(194,65,12,0.55)] transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 sm:flex-1"
          >
            {pending ? "Gönderiliyor..." : "Başvuruyu gönder"}
          </button>
          <Button
            href={siteConfig.whatsAppHref}
            target="_blank"
            rel="noreferrer noopener"
            variant="outline"
            className="min-h-11 border-accent/35 bg-transparent"
          >
            WhatsApp ile yaz
          </Button>
        </div>
      </div>
    </form>
  );
}

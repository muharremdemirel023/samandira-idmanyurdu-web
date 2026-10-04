"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";

import { submitPreRegistration } from "@/app/(site)/on-kayit/actions";
import { initialPreRegistrationFormState } from "@/app/(site)/on-kayit/form-state";
import { TurnstileWidget } from "@/app/(site)/on-kayit/TurnstileWidget";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import {
  PRE_REGISTRATION_EMAIL_MAX_LENGTH,
  PRE_REGISTRATION_NOTE_MAX_LENGTH,
  type PreRegistrationCampaignType,
} from "@/lib/pre-registration/constants";

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

const campaignOptions: Array<{
  type: PreRegistrationCampaignType;
  badge: string;
  title: string;
  description: string;
}> = [
  {
    type: "online_15",
    badge: "%15 İndirim",
    title: "Online Kayıt İndirimi",
    description: "Online ön kayıt işlemini tamamlayarak %15 indirim fırsatından yararlanın.",
  },
  {
    type: "friend_20",
    badge: "%20 İndirim",
    title: "Arkadaşını Getir Kampanyası",
    description: "İki öğrencinin birlikte kayıt olması durumunda %20 indirim fırsatından yararlanın.",
  },
];

function CampaignSelector({ onSelect }: { onSelect: (campaign: PreRegistrationCampaignType) => void }) {
  return (
    <div className="club-soft-panel overflow-hidden bg-white">
      <div className="border-b border-border-subtle bg-surface-base px-6 py-5 sm:px-8">
        <h2 className="type-heading-md text-text-primary">Hangi kampanyadan yararlanmak istiyorsunuz?</h2>
        <p className="type-body mt-1">Devam etmek için aşağıdaki kampanyalardan birini seçin.</p>
      </div>

      <div className="grid gap-5 px-6 py-7 sm:px-8 sm:py-8 md:grid-cols-2">
        {campaignOptions.map((option) => (
          <button
            key={option.type}
            type="button"
            onClick={() => onSelect(option.type)}
            className="group flex flex-col items-start gap-3 rounded-2xl border border-border-subtle bg-surface-base p-6 text-left shadow-shell transition hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-[0_18px_34px_-20px_rgba(194,65,12,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
          >
            <span className="inline-flex rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold text-white">
              {option.badge}
            </span>
            <h3 className="type-card-title text-[var(--maroon-deep)]">{option.title}</h3>
            <p className="type-body text-sm leading-6">{option.description}</p>
            <span className="type-label-caps-accent mt-1 text-accent transition group-hover:underline">
              Bu kampanyayı seç →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

const SUCCESS_VISIBLE_MS = 6000;
const SUCCESS_FADE_MS = 500;

function SuccessMessage({ leaving }: { leaving: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pre-reg-success mt-6 rounded-2xl border border-accent/25 bg-white px-5 py-7 text-center shadow-[0_18px_40px_-24px_rgba(109,31,46,0.35)] sm:px-8 ${leaving ? "pre-reg-success--leaving" : ""}`}
    >
      <svg
        className="pre-reg-success__mark mx-auto"
        width="72"
        height="72"
        viewBox="0 0 72 72"
        fill="none"
        aria-hidden
      >
        <circle
          className="pre-reg-success__ring"
          cx="36"
          cy="36"
          r="32"
          stroke="var(--accent)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          className="pre-reg-success__check"
          d="M23 37.5 32.5 47 50 27"
          stroke="var(--maroon)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h3 className="mt-5 text-lg font-bold tracking-tight text-[var(--maroon-deep)] sm:text-xl">
        Ön Kaydınız Başarıyla Alındı
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-primary sm:text-base sm:leading-7">
        Başvurunuz tarafımıza ulaştı. Akademi ekibimiz, verdiğiniz iletişim bilgileri üzerinden en
        kısa sürede sizinle iletişime geçecektir. İlginiz için teşekkür ederiz.
      </p>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        Samandıra İdman Yurdu S.K. Akademi
      </p>

      <style>{`
        .pre-reg-success {
          animation: preRegSuccessIn 0.4s ease-out both;
        }
        .pre-reg-success--leaving {
          animation: preRegSuccessOut ${SUCCESS_FADE_MS}ms ease-in both;
        }
        .pre-reg-success__ring {
          stroke-dasharray: 202;
          stroke-dashoffset: 202;
          transform-origin: 36px 36px;
          transform: rotate(-90deg);
          animation: preRegDraw 0.6s ease-out 0.15s forwards;
        }
        .pre-reg-success__check {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          animation: preRegDraw 0.35s ease-out 0.75s forwards;
        }
        .pre-reg-success__mark {
          animation: preRegPulse 0.5s ease-in-out 1.15s 1;
        }
        @keyframes preRegSuccessIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes preRegSuccessOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.98); }
        }
        @keyframes preRegDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes preRegPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pre-reg-success,
          .pre-reg-success__mark {
            animation: none;
          }
          .pre-reg-success--leaving {
            animation: preRegSuccessOut ${SUCCESS_FADE_MS}ms linear both;
          }
          .pre-reg-success__ring,
          .pre-reg-success__check {
            animation: none;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}

export function PreRegistrationForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    submitPreRegistration,
    initialPreRegistrationFormState,
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [successLeaving, setSuccessLeaving] = useState(false);
  const [campaign, setCampaign] = useState<PreRegistrationCampaignType | null>(null);

  // GEÇİCİ TEŞHİS LOGLARI — sorun çözülünce kaldırılacak. Kişisel veri loglanmaz.
  useEffect(() => {
    console.log("[on-kayit-debug] action state değişti:", {
      ok: state.ok,
      hasMessage: Boolean(state.message),
      fieldErrorKeys: Object.keys(state.fieldErrors ?? {}),
    });
  }, [state]);

  useEffect(() => {
    console.log("[on-kayit-debug] showSuccess:", showSuccess, "leaving:", successLeaving);
  }, [showSuccess, successLeaving]);

  useEffect(() => {
    if (!state.ok || !state.message) return;
    console.log("[on-kayit-debug] başarı effect tetiklendi, mesaj gösteriliyor.");

    setShowSuccess(true);
    setSuccessLeaving(false);
    formRef.current?.reset();

    const fadeTimer = window.setTimeout(
      () => setSuccessLeaving(true),
      SUCCESS_VISIBLE_MS - SUCCESS_FADE_MS,
    );
    const hideTimer = window.setTimeout(() => {
      setShowSuccess(false);
      setSuccessLeaving(false);
      router.push("/tesekkurler");
    }, SUCCESS_VISIBLE_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [state, router]);

  const guardianError = state.fieldErrors.guardianName?.[0];
  const phoneError = state.fieldErrors.phoneE164?.[0];
  const emailError = state.fieldErrors.email?.[0];
  const studentError = state.fieldErrors.studentName?.[0];
  const birthYearError = state.fieldErrors.birthYear?.[0];
  const student2Error = state.fieldErrors.student2Name?.[0];
  const student2BirthYearError = state.fieldErrors.student2BirthYear?.[0];
  const noteError = state.fieldErrors.note?.[0];
  const consentError = state.fieldErrors.consent?.[0];

  if (!campaign) {
    return <CampaignSelector onSelect={setCampaign} />;
  }

  const isFriendCampaign = campaign === "friend_20";
  const campaignLabel = campaignOptions.find((option) => option.type === campaign)?.title ?? "";

  return (
    <form
      ref={formRef}
      action={formAction}
      className="club-soft-panel overflow-hidden bg-white"
      aria-busy={pending}
    >
      <input type="hidden" name="campaign_type" value={campaign} />

      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border-subtle bg-surface-base px-6 py-5 sm:px-8">
        <div>
          <p className="type-label-caps-accent text-accent">{campaignLabel}</p>
          <h2 className="type-heading-md mt-1 text-text-primary">Ön kayıt formu</h2>
          <p className="type-body mt-1">
            <span className="text-red-700" aria-hidden>*</span> işaretli alanlar zorunludur.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCampaign(null)}
          className="type-label-caps-accent shrink-0 rounded-full border border-accent/35 px-3.5 py-2 text-accent transition hover:bg-accent/10"
        >
          Kampanyayı Değiştir
        </button>
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

            <label className={`${labelClass} md:col-span-2`} htmlFor="email">
              <span>E-posta Adresi <RequiredMark /></span>
              <input
                id="email"
                className={fieldClass}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="ornek@email.com"
                maxLength={PRE_REGISTRATION_EMAIL_MAX_LENGTH}
                required
                aria-invalid={Boolean(emailError)}
                aria-describedby={emailError ? "email-error" : "email-hint"}
              />
              <span id="email-hint" className="text-xs font-normal normal-case tracking-normal">
                Başvurunuzla ilgili bilgilendirme ve geri dönüş için kullanılacaktır.
              </span>
              <FieldError id="email-error" message={emailError} />
            </label>
          </div>
        </fieldset>

        <fieldset className="m-0 mt-7 border-0 p-0">
          <legend className={groupTitleClass}>{isFriendCampaign ? "Öğrenci 1 bilgileri" : "Oyuncu bilgileri"}</legend>
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

        {isFriendCampaign ? (
          <fieldset className="m-0 mt-7 border-0 p-0">
            <legend className={groupTitleClass}>Öğrenci 2 bilgileri</legend>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <label className={labelClass} htmlFor="student2_name">
                <span>Oyuncu adı <RequiredMark /></span>
                <input
                  id="student2_name"
                  className={fieldClass}
                  name="student2_name"
                  placeholder="Ad soyad"
                  autoComplete="off"
                  minLength={2}
                  maxLength={100}
                  required
                  aria-invalid={Boolean(student2Error)}
                  aria-describedby={student2Error ? "student2_name-error" : undefined}
                />
                <FieldError id="student2_name-error" message={student2Error} />
              </label>

              <label className={labelClass} htmlFor="student2_birth_year">
                <span>Doğum yılı <RequiredMark /></span>
                <input
                  id="student2_birth_year"
                  className={fieldClass}
                  name="student2_birth_year"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="2015"
                  pattern="[0-9]{4}"
                  minLength={4}
                  maxLength={4}
                  required
                  aria-invalid={Boolean(student2BirthYearError)}
                  aria-describedby={student2BirthYearError ? "student2_birth_year-error" : "student2_birth_year-hint"}
                />
                <span id="student2_birth_year-hint" className="text-xs font-normal normal-case tracking-normal">
                  Dört haneli yıl olarak yazın.
                </span>
                <FieldError id="student2_birth_year-error" message={student2BirthYearError} />
              </label>
            </div>
          </fieldset>
        ) : null}

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
          <p className="mt-3 text-xs leading-5 text-text-muted">
            E-posta adresiniz yalnızca başvurunuzla ilgili iletişim ve bilgilendirme amacıyla
            kullanılır; üçüncü kişilerle paylaşılmaz.
          </p>
          <FieldError id="privacy_consent-error" message={consentError} />
        </div>

        {turnstileSiteKey ? (
          <div className="mt-6">
            <TurnstileWidget siteKey={turnstileSiteKey} resetKey={state.message} />
          </div>
        ) : null}

        {showSuccess ? <SuccessMessage leaving={successLeaving} /> : null}

        {!state.ok && state.message ? (
          <p
            role="alert"
            aria-live="assertive"
            className="mt-6 rounded-xl border border-red-200 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700"
          >
            {state.message}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={pending || showSuccess}
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

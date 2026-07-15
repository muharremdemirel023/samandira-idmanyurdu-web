"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { onboardingHref } from "@/components/navigation/nav-config";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * Akademi Asistanı — yalnızca siteConfig içindeki akademi bilgileri ve SSS
 * cevaplarıyla çalışan kural tabanlı chatbot. Harici servis kullanmaz.
 */

type Message = {
  id: number;
  from: "bot" | "user";
  text: string;
  /** Cevap bulunamadığında WhatsApp + Ön Kayıt butonları gösterilir */
  fallback?: boolean;
};

type Topic = {
  key: string;
  label: string;
  keywords: string[];
  answer: () => string;
};

const { akademiPage } = siteConfig;

const topics: Topic[] = [
  {
    key: "age-groups",
    label: "Yaş Grupları",
    keywords: ["yas", "yaş", "grup", "kaç yaş", "age"],
    answer: () =>
      "Akademimizde şu yaş grupları bulunur:\n\n" +
      akademiPage.ageDetail.groups.map((g) => `• ${g.range} yaş: ${g.focus}`).join("\n\n"),
  },
  {
    key: "training",
    label: "Antrenman Programı",
    keywords: ["antrenman", "program", "gün", "saat", "idman"],
    answer: () =>
      `${akademiPage.training.subtitle}\n\n` +
      akademiPage.training.pillars.map((p) => `• ${p.title}: ${p.body}`).join("\n") +
      "\n\nHaftalık program yaş grubuna ve saha planına göre belirlenir; velilere düzenli paylaşılır.",
  },
  {
    key: "fee",
    label: "Ücret Bilgisi",
    keywords: ["ücret", "ucret", "fiyat", "aidat", "ödeme", "para", "kaç tl", "kac tl"],
    answer: () =>
      "Ücret ve ödeme planı yaş grubuna ve döneme göre değişebilir. Güncel ücret bilgisi için WhatsApp hattımızdan bize yazabilir veya ön kayıt formunu doldurabilirsiniz; ekibimiz size dönüş yapar.",
  },
  {
    key: "trial",
    label: "Deneme Antrenmanı",
    keywords: ["deneme", "trial", "seçme", "secme", "test"],
    answer: () =>
      akademiPage.faq.items.find((i) => i.q.includes("Deneme"))?.a ??
      "Deneme antrenmanı için ön kayıt oluşturmanız yeterli; ekibimiz sizinle planlama yapar.",
  },
  {
    key: "address",
    label: "Adres",
    keywords: ["adres", "nerede", "konum", "lokasyon", "tesis", "saha"],
    answer: () => `Tesisimiz:\n${siteConfig.addressLines.join("\n")}`,
  },
  {
    key: "contact",
    label: "İletişim",
    keywords: ["iletişim", "iletisim", "telefon", "numara", "mail", "e-posta", "whatsapp", "ulaş"],
    answer: () =>
      `Bize şu kanallardan ulaşabilirsiniz:\n• Telefon: ${siteConfig.phoneDisplay}\n• E-posta: ${siteConfig.email}\n• WhatsApp üzerinden hızlı mesaj gönderebilirsiniz.`,
  },
  {
    key: "pre-registration",
    label: "Ön Kayıt",
    keywords: ["kayıt", "kayit", "başvuru", "basvuru", "form", "katıl", "katil", "üye"],
    answer: () =>
      akademiPage.faq.items.find((i) => i.q.includes("Kayıt"))?.a ??
      "Ön kayıt formunu doldurarak başvurabilirsiniz; ekibimiz size dönüş yapar.",
  },
];

function normalize(text: string) {
  return text.toLocaleLowerCase("tr-TR").trim();
}

/** Önce hızlı konular, sonra SSS soruları içinde anahtar kelime eşleşmesi arar. */
function resolveAnswer(input: string): { text: string; fallback: boolean } {
  const q = normalize(input);
  if (!q) return { text: "", fallback: false };

  const topic = topics.find((t) => t.keywords.some((k) => q.includes(normalize(k))));
  if (topic) return { text: topic.answer(), fallback: false };

  const faqHit = akademiPage.faq.items.find((item) => {
    const words = normalize(item.q)
      .split(/\s+/)
      .filter((w) => w.length > 3);
    return words.some((w) => q.includes(w));
  });
  if (faqHit) return { text: faqHit.a, fallback: false };

  return {
    text: "Bu konuda tanımlı bir bilgim yok. Size en doğru cevabı ekibimiz verebilir — WhatsApp üzerinden yazabilir veya ön kayıt formunu doldurabilirsiniz.",
    fallback: true,
  };
}

const greeting: Message = {
  id: 0,
  from: "bot",
  text: "Merhaba! Ben Akademi Asistanı. Yaş grupları, antrenman programı, ücret, deneme antrenmanı, adres, iletişim ve ön kayıt hakkında sorularınızı yanıtlayabilirim. Aşağıdaki hızlı seçenekleri de kullanabilirsiniz.",
};

export function AcademyAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([greeting]);
  const [input, setInput] = useState("");
  const idRef = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  const push = (msgs: Omit<Message, "id">[]) => {
    setMessages((prev) => [...prev, ...msgs.map((m) => ({ ...m, id: idRef.current++ }))]);
  };

  const askTopic = (topic: Topic) => {
    push([
      { from: "user", text: topic.label },
      { from: "bot", text: topic.answer() },
    ]);
  };

  const submit = () => {
    const value = input.trim();
    if (!value) return;
    const { text, fallback } = resolveAnswer(value);
    push([
      { from: "user", text: value },
      { from: "bot", text, fallback },
    ]);
    setInput("");
  };

  return (
    <>
      {/* Sabit WhatsApp butonu — sol altta, chatbot ile çakışmaz */}
      <a
        href={siteConfig.whatsAppHref}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="WhatsApp ile yazın"
        className="fab-animated fab-pulse-accent fixed bottom-4 left-4 z-[70] flex min-h-[2.75rem] items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-bold text-white shadow-shell transition-colors hover:bg-accent-strong sm:bottom-5 sm:left-5"
      >
        <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.11 3.22 5.1 4.51.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z" />
          <path d="M12.05 2a9.9 9.9 0 0 0-8.57 14.86L2 22l5.28-1.38A9.9 9.9 0 1 0 12.05 2zm0 18.1c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.13.82.84-3.05-.2-.31a8.2 8.2 0 1 1 7.04 3.88z" />
        </svg>
        <span className="hidden sm:inline">WhatsApp</span>
      </a>

      {/* Başlatıcı buton */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="academy-assistant-panel"
        className={cn(
          "fab-animated fab-delay fab-pulse-maroon fixed bottom-4 right-4 z-[70] flex min-h-[2.75rem] items-center gap-2 rounded-full bg-maroon-deep px-4 py-3 text-sm font-bold text-white shadow-shell transition-colors hover:bg-maroon sm:bottom-5 sm:right-5",
        )}
      >
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {open ? (
            <>
              <path d="M6 18L18 6" />
              <path d="M6 6l12 12" />
            </>
          ) : (
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          )}
        </svg>
        <span className="hidden sm:inline">Akademi Asistanı</span>
      </button>

      {/* Panel: mobilde alttan açılan sayfa genişliğinde panel, masaüstünde küçük pencere */}
      {open ? (
        <div
          id="academy-assistant-panel"
          role="dialog"
          aria-label="Akademi Asistanı"
          className={cn(
            "fixed z-[69] flex flex-col overflow-hidden border border-border-subtle bg-surface-elevated shadow-shell",
            "inset-x-0 bottom-0 max-h-[78dvh] rounded-t-2xl",
            "sm:inset-x-auto sm:bottom-[4.75rem] sm:right-5 sm:w-[22rem] sm:max-h-[30rem] sm:rounded-2xl",
          )}
        >
          <div className="flex items-center justify-between border-b border-border-subtle bg-surface-muted px-4 py-3">
            <div>
              <p className="text-sm font-bold text-text-primary">Akademi Asistanı</p>
              <p className="text-[0.7rem] text-text-muted">
                {siteConfig.shortName} • akademi bilgileri ve SSS
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Asistanı kapat"
              className="flex size-8 items-center justify-center rounded-full text-text-muted hover:bg-surface-base hover:text-text-primary"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M6 18L18 6" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex", message.from === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[0.8125rem] leading-relaxed",
                    message.from === "user"
                      ? "rounded-br-sm bg-accent text-white"
                      : "rounded-bl-sm bg-surface-muted text-text-muted",
                  )}
                >
                  {message.text}
                  {message.fallback ? (
                    <span className="mt-3 flex flex-wrap gap-2">
                      <a
                        href={siteConfig.whatsAppHref}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold text-white hover:bg-accent-strong"
                      >
                        WhatsApp
                      </a>
                      <Link
                        href={onboardingHref}
                        onClick={() => setOpen(false)}
                        className="inline-flex rounded-full border border-accent px-3.5 py-1.5 text-xs font-bold text-accent hover:bg-accent hover:text-white"
                      >
                        Ön Kayıt
                      </Link>
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 border-t border-border-subtle px-4 py-2.5">
            {topics.map((topic) => (
              <button
                key={topic.key}
                type="button"
                onClick={() => askTopic(topic)}
                className="rounded-full border border-border-subtle bg-surface-muted/60 px-3 py-1.5 text-[0.7rem] font-semibold text-text-muted transition-colors hover:border-accent/60 hover:text-text-primary"
              >
                {topic.label}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="flex items-center gap-2 border-t border-border-subtle px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Sorunuzu yazın…"
              aria-label="Asistana soru yazın"
              className="min-w-0 flex-1 rounded-full border border-border-subtle bg-surface-base px-4 py-2 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Gönder"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-strong"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}

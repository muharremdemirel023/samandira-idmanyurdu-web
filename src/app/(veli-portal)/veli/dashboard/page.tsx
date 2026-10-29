import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { parentLogout } from "@/app/(site)/veli/actions";
import { clubLogoPublicPath } from "@/components/navigation/nav-config";
import {
  ActivityIcon,
  AlertCircleIcon,
  CalendarCheckIcon,
  CalendarXIcon,
  CheckCircleIcon,
  ClipboardListIcon,
  ClockIcon,
  FileSearchIcon,
  HomeIcon,
  LayoutGridIcon,
  LinkIcon,
  LogOutIcon,
  ReceiptIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  WalletIcon,
} from "@/components/veli/icons";
import { PerformanceTrendChart, type TrendPoint } from "@/components/veli/PerformanceTrendChart";
import { siteConfig } from "@/config/site";
import {
  fetchParentStudents,
  fetchStudentRecords,
  type ParentAttendanceRow,
  type ParentPaymentRow,
  type ParentPerformanceRow,
  type ParentStudentRecordsResult,
} from "@/lib/akademi-pro/parent-students";
import { requireParentSession } from "@/lib/auth/parent-session";
import { cn } from "@/lib/cn";
import { createPageMetadata } from "@/lib/seo";

// Veli paneli: Akademi Pro veli portalının (src/pages/veli/ParentDashboard.tsx)
// görsel dilinin sunucu bileşeni karşılığı. Öğrenci ve bölüm seçimi URL ile
// yapılır (?ogrenci=, ?bolum=); öğrenci id'si yalnızca RLS + organizasyon
// filtresiyle dönen listeden kabul edilir. Özet göstergeler ek sorgu yapmaz,
// çekilen yoklama/performans/ödeme kayıtlarından hesaplanır.
//
// Renkler Akademi Pro veli paletidir:
//   lacivert #0B1F4D · koyu #191E39 · kırmızı #CB1B24 · gri #CED2DB · mavi/gri #3C4C71

export const metadata: Metadata = createPageMetadata({
  title: "Veli Paneli | Samandıra İY Akademi",
  description: "Samandıra İdman Yurdu Akademi veli paneli.",
  path: "/veli/dashboard",
  noIndex: true,
});

export const dynamic = "force-dynamic";

const ACADEMY_NAME = `${siteConfig.name} Akademi`;

type Section = "devam" | "gelisim" | "odemeler";

const NAV_ITEMS: { key: Section; label: string; icon: (className: string) => ReactNode }[] = [
  { key: "devam", label: "Devam", icon: (className) => <CalendarCheckIcon className={className} /> },
  { key: "gelisim", label: "Gelişim", icon: (className) => <TrendingUpIcon className={className} /> },
  { key: "odemeler", label: "Ödemeler", icon: (className) => <WalletIcon className={className} /> },
];

function isSection(value: unknown): value is Section {
  return value === "devam" || value === "gelisim" || value === "odemeler";
}

function dashboardHref(studentId: string | null, section: Section) {
  const params = new URLSearchParams();
  if (studentId) params.set("ogrenci", studentId);
  if (section !== "devam") params.set("bolum", section);
  const query = params.toString();
  return query ? `/veli/dashboard?${query}` : "/veli/dashboard";
}

// --- Durum sözlükleri -------------------------------------------------------
//   attendance.status : present | absent | excused
//   payments.status   : approved | pending | under_review | link_sent

type Tone = "positive" | "warning" | "negative" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  positive: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  negative: "border-[#CB1B24]/25 bg-[#CB1B24]/10 text-[#CB1B24]",
  neutral: "border-[#CED2DB] bg-[#E9ECF3] text-[#3C4C71]",
};

type StatusMeta = { text: string; tone: Tone; icon: ReactNode };

const chipIcon = "size-3.5";

function attendanceStatus(status: string | null): StatusMeta {
  switch ((status ?? "").toLowerCase()) {
    case "present":
      return { text: "Katıldı", tone: "positive", icon: <CheckCircleIcon className={chipIcon} /> };
    case "absent":
      return { text: "Katılmadı", tone: "negative", icon: <CalendarXIcon className={chipIcon} /> };
    case "excused":
      return { text: "İzinli", tone: "warning", icon: <ClockIcon className={chipIcon} /> };
    default:
      return {
        text: status ?? "Bilinmiyor",
        tone: "neutral",
        icon: <ClipboardListIcon className={chipIcon} />,
      };
  }
}

function paymentStatus(status: string | null): StatusMeta {
  switch ((status ?? "").toLowerCase()) {
    case "approved":
      return { text: "Ödendi", tone: "positive", icon: <CheckCircleIcon className={chipIcon} /> };
    case "pending":
      return { text: "Bekliyor", tone: "warning", icon: <ClockIcon className={chipIcon} /> };
    case "under_review":
      return { text: "İncelemede", tone: "neutral", icon: <FileSearchIcon className={chipIcon} /> };
    case "link_sent":
      return {
        text: "Ödeme Linki Gönderildi",
        tone: "neutral",
        icon: <LinkIcon className={chipIcon} />,
      };
    default:
      return {
        text: status ?? "Bilinmiyor",
        tone: "neutral",
        icon: <ReceiptIcon className={chipIcon} />,
      };
  }
}

/** Ödendi sayılan tek durum: approved. */
const isSettled = (status: string | null) => (status ?? "").toLowerCase() === "approved";

// --- Biçimlendirme ----------------------------------------------------------

const MONTHS_TR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function formatDate(value: string | null, withYear = true): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "Europe/Istanbul",
  });
}

function formatFeeMonth(value: string | null): string {
  if (!value) return "-";
  const [year, month] = value.split("-");
  const monthName = MONTHS_TR[Number(month) - 1];
  return monthName ? `${monthName} ${year}` : value;
}

function formatAmount(value: number | null): string {
  if (value === null) return "-";
  return value.toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  });
}

function initialsOf(name: string | null): string {
  if (!name) return "–";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase("tr-TR"))
    .join("");
}

// --- Özet -------------------------------------------------------------------

function summarize(
  attendance: ParentAttendanceRow[],
  performance: ParentPerformanceRow[],
  payments: ParentPaymentRow[],
) {
  const present = attendance.filter((row) => row.status === "present").length;
  const absent = attendance.filter((row) => row.status === "absent").length;
  const excused = attendance.filter((row) => row.status === "excused").length;
  // İzinli günler oranı düşürmesin: payda katıldı + katılmadı.
  const rated = present + absent;

  const scored = performance.filter((row) => row.averageScore !== null);
  const outstanding = payments.filter((row) => !isSettled(row.status));
  const amountOf = (row: ParentPaymentRow) => row.amount ?? row.expectedAmount ?? 0;

  // Grafik kronolojik ilerlesin: kayıtlar en yeniden eskiye geliyor.
  const trend: TrendPoint[] = scored
    .slice(0, 10)
    .reverse()
    .map((row) => ({
      label: formatDate(row.evaluationDate, false),
      score: row.averageScore as number,
    }));

  return {
    present,
    absent,
    excused,
    rated,
    attendanceRate: rated > 0 ? Math.round((present / rated) * 100) : null,
    latest: scored[0] ?? null,
    trend,
    outstandingCount: outstanding.length,
    outstandingTotal: outstanding.reduce((total, row) => total + amountOf(row), 0),
    settledCount: payments.length - outstanding.length,
    settledTotal: payments
      .filter((row) => isSettled(row.status))
      .reduce((total, row) => total + amountOf(row), 0),
  };
}

// --- Yüzeyler ---------------------------------------------------------------

function Surface({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-3xl border border-white bg-white shadow-[0_18px_40px_-24px_rgba(11,31,77,0.35)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function StatusChip({ text, tone, icon }: StatusMeta) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none",
        TONE_CLASSES[tone],
      )}
    >
      {icon}
      {text}
    </span>
  );
}

function SectionHeading({ title, caption }: { title: string; caption?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="text-sm font-semibold tracking-tight text-[#0B1F4D]">{title}</h2>
      {caption ? <span className="text-xs text-[#8891A6]">{caption}</span> : null}
    </div>
  );
}

function StateBlock({
  icon,
  title,
  description,
  tone = "muted",
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  tone?: "muted" | "destructive";
  action?: ReactNode;
}) {
  const destructive = tone === "destructive";
  return (
    <Surface className="px-6 py-12">
      <div role={destructive ? "alert" : undefined} className="flex flex-col items-center text-center">
        <div
          className={cn(
            "mb-3 flex size-14 items-center justify-center rounded-2xl",
            destructive ? "bg-[#CB1B24]/10 text-[#CB1B24]" : "bg-[#E9ECF3] text-[#3C4C71]",
          )}
        >
          {icon}
        </div>
        <p className={cn("text-sm font-semibold", destructive ? "text-[#CB1B24]" : "text-[#0B1F4D]")}>
          {title}
        </p>
        {description ? (
          <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-[#8891A6]">{description}</p>
        ) : null}
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </Surface>
  );
}

const primaryButtonClass =
  "inline-flex h-12 cursor-pointer items-center justify-center rounded-2xl bg-[#0B1F4D] px-6 text-sm font-semibold text-white transition hover:bg-[#132A57]";

// --- Hero bileşenleri -------------------------------------------------------

function OverviewCard({
  trend,
  attendanceRate,
  latestScore,
  sessionCount,
}: {
  trend: TrendPoint[];
  attendanceRate: number | null;
  latestScore: number | null;
  sessionCount: number | null;
}) {
  return (
    <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0B1F4D] via-[#132A57] to-[#191E39] p-5 text-white shadow-[0_28px_60px_-30px_rgba(11,31,77,0.85)] sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-24 size-56 rounded-full bg-white/10 blur-2xl" />

      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/60">
            Genel Görünüm
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">Performans Gelişimi</h2>
        </div>
        <span className="rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
          Son {trend.length} değerlendirme
        </span>
      </div>

      <div className="relative mt-5 h-40">
        {trend.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-2xl bg-white/5 text-xs text-white/60">
            Grafik için henüz yeterli değerlendirme yok
          </div>
        ) : (
          <PerformanceTrendChart points={trend} />
        )}
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-white/10 p-3 backdrop-blur sm:gap-4 sm:p-4">
        {[
          { label: "Devam Oranı", value: attendanceRate === null ? "–" : `%${attendanceRate}` },
          { label: "Son Ortalama", value: latestScore === null ? "–" : latestScore.toFixed(1) },
          { label: "Antrenman", value: sessionCount === null ? "–" : String(sessionCount) },
        ].map((stat) => (
          <div key={stat.label} className="min-w-0 text-center">
            <p className="truncate text-xl font-semibold tabular-nums tracking-tight sm:text-2xl">
              {stat.value}
            </p>
            <p className="mt-1 truncate text-[11px] text-white/65">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccentCard({
  variant,
  icon,
  title,
  value,
  hint,
}: {
  variant: "navy" | "red";
  icon: ReactNode;
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] p-5 text-white shadow-[0_24px_50px_-28px_rgba(11,31,77,0.8)]",
        variant === "navy"
          ? "bg-gradient-to-br from-[#3C4C71] to-[#0B1F4D]"
          : "bg-gradient-to-br from-[#CB1B24] to-[#8E1017]",
      )}
    >
      <div className="pointer-events-none absolute -bottom-14 -right-10 size-40 rounded-full bg-white/10" />
      <div className="relative flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
          {icon}
        </span>
        <p className="text-base font-semibold tracking-tight">{title}</p>
      </div>
      <div className="relative mt-5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/65">{hint}</p>
        <p className="mt-1 truncate text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
      </div>
    </div>
  );
}

/** Alt şeritteki ilerleme kartı (0-10 metrik). */
function ProgressCard({ icon, label, value }: { icon: ReactNode; label: string; value: number | null }) {
  const ratio = value === null ? 0 : Math.max(0, Math.min(1, value / 10));

  return (
    <Surface className="relative px-4 pb-4 pt-9">
      <span className="absolute -top-5 left-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3C4C71] to-[#0B1F4D] text-white shadow-[0_14px_28px_-14px_rgba(11,31,77,0.9)]">
        {icon}
      </span>
      <p className="mt-1 text-sm font-semibold tracking-tight text-[#0B1F4D]">{label}</p>
      <div className="mt-3 flex items-baseline justify-between gap-2 text-xs">
        <span className="text-[#8891A6]">İlerleme</span>
        <span className="font-semibold tabular-nums text-[#3C4C71]">
          {value === null ? "–" : `${Math.round(ratio * 100)}%`}
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#E1E5EC]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#0B1F4D] to-[#CB1B24]"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-[#8891A6]">
        {value === null ? "Değerlendirilmedi" : `${value.toFixed(1)} / 10`}
      </p>
    </Surface>
  );
}

/** 0-10 aralığındaki performans metriği (detay kartı içinde). */
function MetricBar({ label, value }: { label: string; value: number | null }) {
  if (value === null) return null;
  const ratio = Math.max(0, Math.min(1, value / 10));

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="truncate text-[#8891A6]">{label}</span>
        <span className="shrink-0 font-semibold tabular-nums text-[#3C4C71]">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#E1E5EC]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#0B1F4D] to-[#CB1B24]"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}

// --- Bölümler ---------------------------------------------------------------

type Summary = ReturnType<typeof summarize>;

function AttendanceSection({ rows, summary }: { rows: ParentAttendanceRow[]; summary: Summary }) {
  if (rows.length === 0) {
    return (
      <StateBlock
        icon={<CalendarCheckIcon className="size-6" />}
        title="Henüz yoklama kaydı yok"
        description="Antrenman katılımları işlendikçe bu bölümde görünecek."
      />
    );
  }

  return (
    <div className="space-y-4">
      <Surface className="p-4">
        <SectionHeading title="Katılım Dağılımı" caption={`${rows.length} kayıt`} />
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Katıldı", value: summary.present, tone: "positive" as Tone },
            { label: "Katılmadı", value: summary.absent, tone: "negative" as Tone },
            { label: "İzinli", value: summary.excused, tone: "warning" as Tone },
          ].map((item) => (
            <div key={item.label} className={cn("rounded-2xl border px-3 py-3", TONE_CLASSES[item.tone])}>
              <p className="text-xl font-semibold leading-none tabular-nums">{item.value}</p>
              <p className="mt-1.5 text-[11px] font-medium">{item.label}</p>
            </div>
          ))}
        </div>
      </Surface>

      <div className="space-y-3">
        <SectionHeading title="Yoklama Geçmişi" caption="En yeniden eskiye" />
        {rows.map((row) => (
          <Surface key={row.id} className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium tracking-tight tabular-nums text-[#0B1F4D]">
                  {formatDate(row.attendanceDate)}
                </p>
                {row.note ? (
                  <p className="mt-0.5 break-words text-xs leading-relaxed text-[#8891A6]">{row.note}</p>
                ) : null}
              </div>
              <StatusChip {...attendanceStatus(row.status)} />
            </div>
          </Surface>
        ))}
      </div>
    </div>
  );
}

function PerformanceSection({ rows }: { rows: ParentPerformanceRow[] }) {
  if (rows.length === 0) {
    return (
      <StateBlock
        icon={<TrendingUpIcon className="size-6" />}
        title="Henüz performans değerlendirmesi yok"
        description="Antrenör değerlendirmeleri tamamlandıkça burada listelenecek."
      />
    );
  }

  return (
    <div className="space-y-4">
      {rows.map((row, index) => (
        <Surface key={row.id} className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#E9ECF3] px-5 py-4">
            <div className="min-w-0">
              <p className="text-sm font-medium tracking-tight text-[#0B1F4D]">
                {formatDate(row.evaluationDate)}
              </p>
              <p className="text-xs text-[#8891A6]">
                {row.evaluationPeriod ?? "Değerlendirme"}
                {index === 0 ? " · En güncel" : ""}
              </p>
            </div>
            {row.averageScore !== null ? (
              <div className="shrink-0 text-right">
                <p className="text-[11px] font-medium uppercase tracking-wider text-[#8891A6]">
                  Genel Ortalama
                </p>
                <p className="text-2xl font-semibold leading-none tabular-nums text-[#0B1F4D]">
                  {row.averageScore.toFixed(1)}
                  <span className="text-sm font-normal text-[#8891A6]">/10</span>
                </p>
              </div>
            ) : null}
          </div>

          <div className="grid gap-x-8 gap-y-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
            <MetricBar label="Top Kontrolü" value={row.ballControl} />
            <MetricBar label="Dribling" value={row.dribbling} />
            <MetricBar label="Pas" value={row.passing} />
            <MetricBar label="Şut" value={row.shooting} />
            <MetricBar label="Fiziksel" value={row.physical} />
            <MetricBar label="Disiplin" value={row.discipline} />
          </div>

          {row.evaluationNote ? (
            <p className="break-words bg-[#F1F3F7] px-5 py-4 text-xs leading-relaxed text-[#3C4C71]">
              {row.evaluationNote}
            </p>
          ) : null}
        </Surface>
      ))}
    </div>
  );
}

function PaymentsSection({ rows, summary }: { rows: ParentPaymentRow[]; summary: Summary }) {
  if (rows.length === 0) {
    return (
      <StateBlock
        icon={<WalletIcon className="size-6" />}
        title="Henüz ödeme kaydı yok"
        description="Aidat ve ödeme hareketleri oluştukça bu bölümde görünecek."
      />
    );
  }

  return (
    <div className="space-y-4">
      <Surface className="p-4">
        <SectionHeading title="Hesap Özeti" caption={`${rows.length} kayıt`} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#E9ECF3] px-4 py-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#3C4C71]">Ödenen</p>
            <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums text-[#0B1F4D]">
              {formatAmount(summary.settledTotal)}
            </p>
            <p className="mt-0.5 text-xs text-[#8891A6]">{summary.settledCount} kayıt</p>
          </div>
          <div
            className={cn(
              "rounded-2xl px-4 py-3.5",
              summary.outstandingCount > 0 ? "bg-[#CB1B24]/10 text-[#CB1B24]" : "bg-[#E9ECF3]",
            )}
          >
            <p className="text-[11px] font-medium uppercase tracking-wider opacity-70">Bekleyen</p>
            <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">
              {formatAmount(summary.outstandingTotal)}
            </p>
            <p className="mt-0.5 text-xs opacity-70">{summary.outstandingCount} kayıt</p>
          </div>
        </div>
      </Surface>

      <div className="space-y-3">
        <SectionHeading title="Ödeme Hareketleri" caption="En yeniden eskiye" />
        {rows.map((row) => (
          <Surface key={row.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-[#8891A6]">
                  {formatFeeMonth(row.feeMonth)}
                </p>
                <p className="mt-0.5 text-xl font-semibold tracking-tight tabular-nums text-[#0B1F4D]">
                  {formatAmount(row.amount ?? row.expectedAmount)}
                </p>
              </div>
              <StatusChip {...paymentStatus(row.status)} />
            </div>

            {row.dueDate || row.paymentDate || row.receiptNo ? (
              <dl className="mt-4 grid gap-x-8 gap-y-1.5 border-t border-[#E1E5EC] pt-4 text-xs sm:grid-cols-3">
                {[
                  { label: "Son ödeme", value: row.dueDate ? formatDate(row.dueDate) : null },
                  { label: "Ödeme tarihi", value: row.paymentDate ? formatDate(row.paymentDate) : null },
                  { label: "Makbuz no", value: row.receiptNo },
                ]
                  .filter((item) => item.value)
                  .map((item) => (
                    <div key={item.label} className="flex justify-between gap-3 sm:block">
                      <dt className="shrink-0 text-[#8891A6]">{item.label}</dt>
                      <dd className="break-all text-right font-medium tabular-nums text-[#3C4C71] sm:mt-0.5 sm:text-left">
                        {item.value}
                      </dd>
                    </div>
                  ))}
              </dl>
            ) : null}
          </Surface>
        ))}
      </div>
    </div>
  );
}

// --- Sayfa ------------------------------------------------------------------

export default async function VeliDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ ogrenci?: string | string[]; bolum?: string | string[] }>;
}) {
  const { accessToken, meta } = await requireParentSession();
  const parentName = meta.parentName?.trim() || null;

  const [result, params] = await Promise.all([fetchParentStudents(accessToken), searchParams]);

  const section: Section = isSection(params.bolum) ? params.bolum : "devam";
  // Seçim yalnızca RLS + organizasyon filtresiyle dönen liste içinden yapılır;
  // URL'deki id listede yoksa ilk öğrenci gösterilir.
  const requestedId = typeof params.ogrenci === "string" ? params.ogrenci : null;
  const students = result.ok ? result.students : [];
  const selected = students.find((student) => student.id === requestedId) ?? students[0] ?? null;

  const records: ParentStudentRecordsResult | null = selected
    ? await fetchStudentRecords(accessToken, selected.id)
    : null;
  const recordsOk = records?.ok ? records : null;
  const summary = summarize(
    recordsOk?.attendance ?? [],
    recordsOk?.performance ?? [],
    recordsOk?.payments ?? [],
  );
  const recordsFailure = records && !records.ok ? records : null;
  const studentId = selected?.id ?? null;

  const logoutRailButton = (
    <form action={parentLogout}>
      <button
        type="submit"
        aria-label="Çıkış"
        className="flex size-11 cursor-pointer items-center justify-center rounded-2xl text-white/65 transition-colors hover:bg-white/15 hover:text-white"
      >
        <LogOutIcon />
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-[#F1F3F7] pb-24 lg:pb-0">
      {/* Üst bant: sticky, kendi scroll kabını yaratmaz. */}
      <header className="sticky top-0 z-30 border-b border-white/60 bg-[#F1F3F7]/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <Link href="/" title="Siteye dön" className="flex min-w-0 items-center gap-3">
            <span className="relative size-10 shrink-0 overflow-hidden rounded-2xl bg-white p-1.5 shadow-[0_10px_24px_-14px_rgba(11,31,77,0.7)]">
              <Image
                src={clubLogoPublicPath}
                alt={ACADEMY_NAME}
                width={28}
                height={28}
                unoptimized
                className="size-full object-contain"
              />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[11px] font-medium uppercase tracking-[0.18em] text-[#3C4C71]">
                Veli Portalı
              </span>
              <span className="block truncate text-base font-semibold tracking-tight text-[#0B1F4D]">
                {ACADEMY_NAME}
              </span>
            </span>
          </Link>

          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden min-w-0 text-right leading-tight sm:block">
              <p className="truncate text-sm font-medium tracking-tight text-[#3C4C71]">
                {parentName ?? "Veli"}
              </p>
              <p className="truncate text-[11px] text-[#8891A6]">Hesabınız</p>
            </div>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3C4C71] to-[#0B1F4D] text-sm font-semibold text-white">
              {initialsOf(parentName ?? selected?.fullName ?? null)}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl gap-5 px-4 py-5 sm:px-6 sm:py-6">
        {/* Masaüstü ikon rayı. */}
        <nav
          aria-label="Veli paneli"
          className="sticky top-24 hidden h-[calc(100vh-8rem)] w-[76px] shrink-0 flex-col items-center justify-between rounded-[28px] bg-gradient-to-b from-[#0B1F4D] to-[#191E39] py-5 shadow-[0_28px_60px_-30px_rgba(11,31,77,0.9)] lg:flex"
        >
          <div className="flex flex-col items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-white/15 text-white">
              <LayoutGridIcon />
            </span>
            <div className="my-1 h-px w-8 bg-white/20" />
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={dashboardHref(studentId, item.key)}
                scroll={false}
                aria-label={item.label}
                title={item.label}
                aria-current={section === item.key ? "page" : undefined}
                className={cn(
                  "flex size-11 items-center justify-center rounded-2xl transition-colors",
                  section === item.key
                    ? "bg-white text-[#0B1F4D] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)]"
                    : "text-white/65 hover:bg-white/15 hover:text-white",
                )}
              >
                {item.icon("size-5")}
              </Link>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3">
            <Link
              href="/"
              aria-label="Siteye dön"
              title="Siteye dön"
              className="flex size-11 items-center justify-center rounded-2xl text-white/65 transition-colors hover:bg-white/15 hover:text-white"
            >
              <HomeIcon />
            </Link>
            {logoutRailButton}
          </div>
        </nav>

        <main className="min-w-0 flex-1">
          {!result.ok ? (
            <StateBlock
              icon={<AlertCircleIcon className="size-6" />}
              title={
                result.reason === "session"
                  ? "Oturumunuzu yenilemeniz gerekiyor"
                  : "Öğrenci bilgileri yüklenemedi"
              }
              description={result.message}
              tone="destructive"
              action={
                result.reason === "session" ? (
                  <form action={parentLogout}>
                    <button type="submit" className={primaryButtonClass}>
                      Tekrar giriş yap
                    </button>
                  </form>
                ) : (
                  <Link href={dashboardHref(requestedId, section)} className={primaryButtonClass}>
                    Tekrar dene
                  </Link>
                )
              }
            />
          ) : !selected ? (
            <StateBlock
              icon={<ShieldCheckIcon className="size-6" />}
              title="Hesabınıza bağlı öğrenci bulunamadı"
              description={`Hesabınıza bağlı bir ${ACADEMY_NAME} öğrencisi yok. Öğrenci kaydındaki veli adı ve telefonunun hesabınızla aynı olduğundan emin olmak için akademi ile iletişime geçin.`}
            />
          ) : (
            <div className="space-y-5">
              {/* Öğrenci şeridi: profil + birden fazla çocukta seçici. */}
              <Surface className="p-4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3C4C71] to-[#0B1F4D] text-sm font-semibold tracking-tight text-white">
                    {initialsOf(selected.fullName)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h1 className="truncate text-base font-semibold tracking-tight text-[#0B1F4D]">
                      {selected.fullName}
                    </h1>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#8891A6]">
                      {selected.ageGroup ? (
                        <span className="rounded-full bg-[#E9ECF3] px-2 py-0.5 font-medium text-[#3C4C71]">
                          {selected.ageGroup}
                        </span>
                      ) : null}
                      {parentName ? <span className="truncate">Veli: {parentName}</span> : null}
                    </div>
                  </div>

                  {students.length > 1 ? (
                    <nav
                      aria-label="Öğrenci seçimi"
                      className="-mx-1 flex w-full gap-2 overflow-x-auto px-1 pb-1 sm:w-auto"
                    >
                      {students.map((student) => (
                        <Link
                          key={student.id}
                          href={dashboardHref(student.id, section)}
                          scroll={false}
                          aria-current={student.id === selected.id ? "page" : undefined}
                          className={cn(
                            "inline-flex h-9 max-w-[55vw] shrink-0 items-center truncate rounded-full px-4 text-xs font-medium transition-colors sm:max-w-none",
                            student.id === selected.id
                              ? "bg-gradient-to-r from-[#3C4C71] to-[#0B1F4D] text-white"
                              : "bg-[#E9ECF3] text-[#3C4C71] hover:bg-[#CED2DB]",
                          )}
                        >
                          {student.fullName}
                        </Link>
                      ))}
                    </nav>
                  ) : null}
                </div>
              </Surface>

              {/* Hero: gradient özet + iki vurgu kartı. */}
              <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
                <OverviewCard
                  trend={summary.trend}
                  attendanceRate={summary.attendanceRate}
                  latestScore={summary.latest?.averageScore ?? null}
                  sessionCount={recordsOk ? recordsOk.attendance.length : null}
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <AccentCard
                    variant="navy"
                    icon={<CalendarCheckIcon />}
                    title="Devam Durumu"
                    value={summary.attendanceRate === null ? "–" : `%${summary.attendanceRate}`}
                    hint={
                      !recordsOk
                        ? "Kayıtlar alınamadı"
                        : summary.rated > 0
                          ? `${summary.present} katıldı · ${summary.absent} katılmadı`
                          : "Yoklama kaydı bulunmuyor"
                    }
                  />
                  <AccentCard
                    variant="red"
                    icon={<WalletIcon />}
                    title="Bekleyen Ödeme"
                    value={recordsOk ? formatAmount(summary.outstandingTotal) : "–"}
                    hint={
                      !recordsOk
                        ? "Kayıtlar alınamadı"
                        : summary.outstandingCount === 0
                          ? "Bekleyen ödemeniz yok"
                          : `${summary.outstandingCount} kayıt bekliyor`
                    }
                  />
                </div>
              </div>

              {/* Son değerlendirmenin metrikleri: ilerleme kartları. */}
              {summary.latest ? (
                <div className="grid gap-4 pt-5 sm:grid-cols-2 lg:grid-cols-3">
                  <ProgressCard icon={<ActivityIcon />} label="Top Kontrolü" value={summary.latest.ballControl} />
                  <ProgressCard icon={<TrendingUpIcon />} label="Pas" value={summary.latest.passing} />
                  <ProgressCard icon={<ShieldCheckIcon />} label="Disiplin" value={summary.latest.discipline} />
                </div>
              ) : null}

              {/* Bölüm seçici: mobil ve tablette rayın yerini tutar. */}
              <div className="flex gap-2 overflow-x-auto rounded-full bg-white p-1.5 shadow-[0_18px_40px_-28px_rgba(11,31,77,0.5)] lg:hidden">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.key}
                    href={dashboardHref(studentId, item.key)}
                    scroll={false}
                    aria-current={section === item.key ? "page" : undefined}
                    className={cn(
                      "flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors",
                      section === item.key
                        ? "bg-gradient-to-r from-[#3C4C71] to-[#0B1F4D] text-white"
                        : "text-[#3C4C71]",
                    )}
                  >
                    {item.icon("size-5")}
                    {item.label}
                  </Link>
                ))}
              </div>

              {recordsFailure ? (
                <StateBlock
                  icon={<AlertCircleIcon className="size-6" />}
                  title={
                    recordsFailure.reason === "session"
                      ? "Oturumunuzu yenilemeniz gerekiyor"
                      : "Kayıtlar yüklenemedi"
                  }
                  description={recordsFailure.message}
                  tone="destructive"
                  action={
                    recordsFailure.reason === "session" ? (
                      <form action={parentLogout}>
                        <button type="submit" className={primaryButtonClass}>
                          Tekrar giriş yap
                        </button>
                      </form>
                    ) : (
                      <Link href={dashboardHref(studentId, section)} className={primaryButtonClass}>
                        Tekrar dene
                      </Link>
                    )
                  }
                />
              ) : recordsOk ? (
                section === "devam" ? (
                  <AttendanceSection rows={recordsOk.attendance} summary={summary} />
                ) : section === "gelisim" ? (
                  <PerformanceSection rows={recordsOk.performance} />
                ) : (
                  <PaymentsSection rows={recordsOk.payments} summary={summary} />
                )
              ) : null}
            </div>
          )}
        </main>
      </div>

      {/* Mobil alt bar: rayın karşılığı + çıkış. */}
      <nav
        aria-label="Veli paneli"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white bg-white/95 px-3 py-2 backdrop-blur lg:hidden"
      >
        <div className="mx-auto flex max-w-md items-center justify-between gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={dashboardHref(studentId, item.key)}
              scroll={false}
              aria-current={section === item.key ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5 text-[11px] font-medium transition-colors",
                section === item.key ? "text-[#0B1F4D]" : "text-[#8891A6]",
              )}
            >
              {item.icon("size-5")}
              {item.label}
            </Link>
          ))}
          <Link
            href="/"
            className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5 text-[11px] font-medium text-[#8891A6]"
          >
            <HomeIcon />
            Site
          </Link>
          <form action={parentLogout} className="flex flex-1">
            <button
              type="submit"
              className="flex flex-1 cursor-pointer flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5 text-[11px] font-medium text-[#8891A6]"
            >
              <LogOutIcon />
              Çıkış
            </button>
          </form>
        </div>
      </nav>
    </div>
  );
}

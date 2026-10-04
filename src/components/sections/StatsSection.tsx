"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";

type StatIcon = "student" | "team" | "trophy" | "calendar";

type Stat = {
  value: number;
  suffix?: string;
  label: string;
  icon: StatIcon;
  duration: number;
};

const stats: Stat[] = [
  { value: 80, suffix: "+", label: "Aktif Öğrenci", icon: "student", duration: 1.4 },
  { value: 6, label: "Uzman Teknik Ekip", icon: "team", duration: 1.5 },
  { value: 4, label: "Turnuva Şampiyonluğu", icon: "trophy", duration: 1.6 },
  { value: 1990, label: "Kuruluş Yılı", icon: "calendar", duration: 1.7 },
];

function StatIcon({ icon }: { icon: StatIcon }) {
  const paths: Record<StatIcon, React.ReactNode> = {
    student: (
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M6.5 19c.6-3 2.4-4.5 5.5-4.5s4.9 1.5 5.5 4.5" />
        <path d="m5 6 7-3 7 3-7 3-7-3Z" />
      </>
    ),
    team: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19c.5-3.1 2.3-4.7 5.5-4.7s5 1.6 5.5 4.7" />
        <path d="M15.5 6.2a3 3 0 0 1 0 5.6M16 14.5c2.6.4 4 1.9 4.5 4.5" />
      </>
    ),
    trophy: (
      <>
        <path d="M8 4h8v4.5a4 4 0 0 1-8 0V4Z" />
        <path d="M8 6H4v1.5A3.5 3.5 0 0 0 7.5 11M16 6h4v1.5a3.5 3.5 0 0 1-3.5 3.5M12 12.5V17M8.5 20h7M10 17h4" />
      </>
    ),
    calendar: (
      <>
        <rect x="4" y="5.5" width="16" height="14" rx="2" />
        <path d="M8 3v5M16 3v5M4 10h16M8 14h2M14 14h2" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      {paths[icon]}
    </svg>
  );
}

function CountUp({
  value,
  suffix = "",
  duration,
  active,
  reduceMotion,
}: Pick<Stat, "value" | "suffix" | "duration"> & {
  active: boolean;
  reduceMotion: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!active || hasAnimated.current) return;

    let frameId = 0;
    let startTime: number | null = null;

    const update = (time: number) => {
      if (startTime === null) {
        startTime = time;
        hasAnimated.current = true;
      }

      if (reduceMotion) {
        setDisplayValue(value);
        return;
      }

      const progress = Math.min((time - startTime) / (duration * 1000), 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * easedProgress));

      if (progress < 1) frameId = window.requestAnimationFrame(update);
    };

    frameId = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(frameId);
  }, [active, duration, reduceMotion, value]);

  return (
    <span aria-label={`${value}${suffix}`} className="tabular-nums">
      <span aria-hidden="true">
        {displayValue}
        {suffix}
      </span>
    </span>
  );
}

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.25 });
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <section
      ref={sectionRef}
      aria-label="Kulüp istatistikleri"
      className="club-section section-edge-top bg-surface-base py-7 sm:py-9"
    >
      <Container variant="hero">
        <ul className="grid list-none grid-cols-2 overflow-hidden rounded-2xl border border-border-subtle bg-surface-card shadow-shell lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.li
              key={stat.label}
              initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 18 }}
              animate={isInView ? { opacity: 1, y: 0 } : undefined}
              transition={{
                duration: reduceMotion ? 0 : 0.48,
                delay: reduceMotion ? 0 : index * 0.09,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={cn(
                "group relative flex min-h-40 flex-col items-center justify-center px-3 py-6 text-center transition-colors duration-200 hover:bg-surface-muted/60 motion-reduce:transition-none sm:min-h-44 sm:px-6 sm:py-8",
                index < 2 && "border-b border-border-subtle lg:border-b-0",
                index % 2 === 0 && "border-r border-border-subtle",
                index < 3 ? "lg:border-r lg:border-border-subtle" : "lg:border-r-0",
              )}
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-200 group-hover:scale-x-100 motion-reduce:transition-none"
              />

              <motion.span
                initial={{ opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : 0.88 }}
                animate={isInView ? { opacity: 1, scale: 1 } : undefined}
                transition={{
                  duration: reduceMotion ? 0 : 0.35,
                  delay: reduceMotion ? 0 : 0.12 + index * 0.09,
                }}
                className="mb-3 inline-flex size-9 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent transition-colors duration-200 group-hover:border-accent/45 group-hover:bg-accent group-hover:text-white motion-reduce:transition-none sm:size-10"
              >
                <StatIcon icon={stat.icon} />
              </motion.span>

              <strong className="font-mono text-3xl font-bold leading-none tracking-[-0.05em] text-maroon-deep sm:text-4xl xl:text-[2.75rem]">
                <CountUp
                  value={stat.value}
                  suffix={stat.suffix}
                  duration={stat.duration}
                  active={isInView}
                  reduceMotion={reduceMotion}
                />
              </strong>
              <span className="mt-2.5 text-[0.68rem] font-semibold uppercase leading-snug tracking-[0.13em] text-text-muted sm:text-xs">
                {stat.label}
              </span>
            </motion.li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

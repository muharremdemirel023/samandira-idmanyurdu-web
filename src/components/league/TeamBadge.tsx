import Image from "next/image";

import { clubLogoPublicPath } from "@/components/navigation/nav-config";
import { cn } from "@/lib/cn";

// Kısaltmada atlanan genel kulüp ekleri.
const GENERIC_WORDS = new Set(["SPOR", "KULÜBÜ", "KULÜP", "S.K.", "SK", "FUTBOL", "GENÇLİK"]);

function initialsOf(name: string) {
  const words = name.toLocaleUpperCase("tr-TR").split(/\s+/).filter(Boolean);
  const significant = words.filter((word) => !GENERIC_WORDS.has(word));
  const source = significant.length > 0 ? significant : words;
  if (source.length === 1) return source[0].slice(0, 2);
  return source
    .slice(0, 2)
    .map((word) => word[0])
    .join("");
}

/**
 * Takım rozeti. Kulübümüz için yerel logo kullanılır; rakip logoları TFF
 * sunucusundan yüklenmediği için (ziyaretçi tarayıcısı TFF'ye istek atmaz)
 * takım adının baş harflerinden oluşan nötr bir rozet gösterilir.
 */
export function TeamBadge({
  name,
  isClub,
  size = "md",
  tone = "light",
}: {
  name: string;
  isClub: boolean;
  size?: "md" | "lg";
  tone?: "light" | "dark";
}) {
  const sizeClass = size === "lg" ? "size-14 sm:size-16" : "size-10";

  if (isClub) {
    return (
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-2",
          tone === "dark" ? "ring-white/40" : "ring-maroon/25",
          sizeClass,
        )}
      >
        <Image src={clubLogoPublicPath} alt="" width={64} height={64} className="size-full object-contain p-0.5" />
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold tracking-wide",
        tone === "dark"
          ? "bg-white/12 text-white ring-1 ring-white/25"
          : "bg-surface-muted text-maroon-deep ring-1 ring-border-subtle",
        size === "lg" ? "text-base" : "text-xs",
        sizeClass,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}

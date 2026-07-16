export type NavItem = {
  label: string;
  href: `/${string}` | "/";
  cta?: boolean;
  children?: { label: string; href: `/${string}` | "/" }[];
};

/** `public/` altı — ASCII dosya adı (URL güvenli) */
export const clubLogoPublicPath = "/Samandiralogo.png" as const;

export const clubMonogram = "SİY" as const;

/** Header marka bloğu — ana marka + meta satır */
export const headerBrand = {
  primaryLine: "Samandıra İdman Yurdu S.K." as const,
  metaLine: "Akademi" as const,
} as const;

export const mainNavigation: NavItem[] = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Akademi", href: "/akademi" },
  { label: "Yaş Grupları", href: "/akademi/yas-gruplari" },
  { label: "Antrenörler", href: "/akademi/teknik-kadro" },
  { label: "Program", href: "/akademi/antrenman-modeli" },
  {
    label: "Galeri",
    href: "/galeri/fotograflar",
    children: [
      { label: "Fotoğraflar", href: "/galeri/fotograflar" },
      { label: "Videolar", href: "/galeri/videolar" },
    ],
  },
  { label: "SSS", href: "/akademi/sik-sorulan-sorular" },
  { label: "İletişim", href: "/iletisim" },
  { label: "Ön Kayıt", href: "/on-kayit", cta: true },
];

export const onboardingHref = "/on-kayit" as const;

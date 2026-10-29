import type { ReactNode } from "react";

// Veli portalı kabuğu: /veli/dashboard sitenin header/footer'ı olmadan, Akademi
// Pro veli portalıyla aynı görsel dilde kendi üst bandı ve ikon rayıyla açılır.
// Giriş sayfası (/veli/login) site kabuğunda (app/(site)) kalır.
export default function VeliPortalLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <div className="flex min-h-full flex-1 flex-col bg-[#F1F3F7]">{children}</div>;
}

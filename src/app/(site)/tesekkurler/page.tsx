import { cookies } from "next/headers";
import Link from "next/link";

import { LeadConversion } from "@/components/analytics/LeadConversion";
import { Container } from "@/components/ui/Container";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Başvurunuz Alındı | Samandıra İY Akademi",
  description: "Akademi ön kayıt başvurunuz başarıyla alındı.",
  path: "/tesekkurler",
  noIndex: true,
});

export default async function Page() {
  const conversionKey = (await cookies()).get("pre_registration_conversion")?.value;

  return (
    <section className="flex flex-1 items-center bg-surface-base py-24">
      {conversionKey ? <LeadConversion eventKey={conversionKey} /> : null}
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="type-display">Başvurunuz başarıyla alındı</h1>
          <p className="type-lead mt-5">Ekibimiz en geç bir iş günü içinde sizinle iletişime geçecek.</p>
          <Link href="/" className="mt-8 inline-flex rounded-full bg-accent px-7 py-3 font-bold text-white">
            Ana sayfaya dön
          </Link>
        </div>
      </Container>
    </section>
  );
}

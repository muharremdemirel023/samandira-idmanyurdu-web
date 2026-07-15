import Image from "next/image";

import { Container } from "@/components/ui/Container";

const sponsors = [
  { src: "/images/sponsors/sponsor-1.png", alt: "Sponsor 1" },
  { src: "/images/sponsors/sponsor-2.png", alt: "Sponsor 2" },
  { src: "/images/sponsors/sponsor-3.png", alt: "Sponsor 3" },
];

export function SponsorsSlider() {
  return (
    <section className="bg-surface-base py-12 md:py-16" aria-label="Sponsorlarımız">
      <Container>
        <div className="text-center">
          <p className="type-overline text-accent">Destekçilerimiz</p>
          <h2 className="type-heading-lg mt-2 text-maroon-deep">Sponsorlarımız</h2>
        </div>
      </Container>

      <div className="sponsor-marquee mt-8 md:mt-10" aria-hidden={false}>
        <div className="sponsor-marquee-track">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="flex shrink-0 items-center gap-4 pr-4 sm:gap-6 sm:pr-6"
              aria-hidden={copy === 1}
            >
              {sponsors.map((sponsor) => (
                <div
                  key={`${copy}-${sponsor.src}`}
                  className="flex h-24 w-40 shrink-0 items-center justify-center rounded-xl border border-maroon/12 bg-surface-card px-5 py-4 sm:h-28 sm:w-52"
                >
                  <Image
                    src={sponsor.src}
                    alt={copy === 0 ? sponsor.alt : ""}
                    width={200}
                    height={96}
                    className="h-full w-full object-contain"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";

import { Carousel } from "@/components/site/carousel";
import { Container } from "@/components/site/section";
import { fleet } from "@/lib/fleet";

export function FleetShowcase() {
  return (
    <section
      id="fleet"
      className="relative overflow-hidden bg-night-900 bg-linear-to-b from-night-900 via-night-800 to-night-900 py-14 lg:py-20"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-20 top-1/3 h-140 w-1/2 rounded-full bg-gold-400/10 blur-[140px]"
      />

      <Container className="relative">
        <Carousel
          tone="dark"
          label="Our cars"
          gap={32}
          slideClassName="md:basis-[calc((100%-32px)/2)]"
        >
          {fleet.map((car) => (
            <div
              key={car.id}
              className="group relative aspect-video w-full overflow-hidden rounded-2xl transition duration-500 hover:-translate-y-1"
            >
              <Image
                src={car.src}
                alt={car.alt}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover object-center transition duration-700 group-hover:scale-105"
              />
            </div>
          ))}
        </Carousel>
      </Container>
    </section>
  );
}

import Image from "next/image";
import { IconArrowRight, IconChevronRight, IconCrown } from "@tabler/icons-react";

import { BookingSearch } from "@/components/site/booking-search";
import { Container } from "@/components/site/section";
import { buttonClass } from "@/components/ui/button";

export function Hero() {
  return (
    <section id="home" className="relative bg-white">
      {/* Dark hero fill; the light band below is this section's own background. */}
      <div className="relative overflow-hidden bg-night-900 bg-linear-to-br from-night-900 via-night-800 to-night-700">
        {/* Gold glow bleeding out from behind the image towards the copy. */}
        <span
          aria-hidden
          className="pointer-events-none absolute right-0 top-1/2 h-140 w-[75%] -translate-y-1/2 rounded-full bg-gold-400/20 blur-[140px]"
        />

        <Container className="relative grid items-center gap-10 pt-12 lg:grid-cols-2 lg:gap-12 lg:pt-16">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-2 pr-4 text-xs text-white">
              <span className="grid size-6 place-items-center rounded-full bg-gold-300/15 text-gold-300">
                <IconCrown size={14} />
              </span>
              <span className="font-semibold text-gold-300">100%</span>
              Trusted Car rental platform in the UK
            </span>

            <h1 className="mt-6 text-3xl font-extrabold uppercase leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
              Fast and easy way to
              <span className="mt-1 block text-gold-300">Rent a car</span>
            </h1>

            <p className="mt-5 max-w-md text-sm leading-relaxed text-night-muted">
              Our Car Rental online booking system designed to meet the specific needs of car rental
              business owners. This easy-to-use car rental software will let you manage.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <a href="#booking" className={buttonClass("gold", "md", "h-11 px-6 font-semibold")}>
                Booking Now
                <IconArrowRight size={16} />
              </a>
              <a
                href="#cars"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white hover:text-gold-300"
              >
                See all cars
                <IconChevronRight size={16} />
              </a>
            </div>
          </div>

          <div className="relative aspect-4/3 w-full overflow-hidden rounded-t-3xl bg-night-800 sm:rounded-t-4xl md:rounded-t-10 lg:aspect-5/4 lg:rounded-t-16">
            <Image
              src="/client-side/BestCar_Hero.jpeg"
              alt="Sports car parked outside a modern villa at sunset"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </Container>
      </div>

      {/* The panel straddles the dark fill and the light section below. */}
      <Container className="relative z-20 -mt-10 pb-16 sm:-mt-12 lg:-mt-16 lg:pb-24">
        <BookingSearch />
      </Container>
    </section>
  );
}

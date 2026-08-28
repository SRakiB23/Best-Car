import Image from "next/image";
import { IconHeadphones, IconMapPin, IconTag } from "@tabler/icons-react";

import { IconTile } from "@/components/site/icon-tile";
import { Reveal } from "@/components/site/reveal";
import { Container, SectionHeading, sectionGap, sectionPadding } from "@/components/site/section";
import { cn } from "@/lib/cn";

const reasons = [
  {
    icon: IconHeadphones,
    title: "Customer Support",
    body: "Extremely responsive customer support provided by the team at best car rental Bangladesh.",
  },
  {
    icon: IconTag,
    title: "Best Price Guarantted",
    body: "Extremely best prices for all category people offered at the best car rental Bangladesh.",
  },
  {
    icon: IconMapPin,
    title: "Many Location",
    body: "Extremely the best location and available near the big cities. Just visit best car rental Bangladesh.",
  },
];

export function WhyChooseUs() {
  return (
    <section id="why-choose-us" className={cn("bg-white", sectionPadding)}>
      <Container>
        <SectionHeading
          title="Why choose us"
          subtitle="A high-performing web-based car rental system for any rent-a-car company and website"
        />

        <div className={cn(sectionGap, "grid items-center gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-16")}>
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl bg-mist lg:aspect-square">
            <Image
              src="/client-side/cars/aston-martin.webp"
              alt="Silver sports car overlooking the Dhaka skyline at dusk"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <ul className="flex flex-col gap-7 sm:gap-8">
            {reasons.map((reason, index) => (
              <Reveal as="li" key={reason.title} delay={index * 120} className="flex gap-4 sm:gap-5">
                <IconTile
                  icon={reason.icon}
                  className="size-12 rounded-2xl"
                  glyphClassName="size-6"
                />

                <div>
                  <h3 className="text-xl font-bold text-ink-900">{reason.title}</h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-500">{reason.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

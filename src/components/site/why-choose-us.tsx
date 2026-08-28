import Image from "next/image";
import { IconHeadphones, IconMapPin, IconTag } from "@tabler/icons-react";

import { IconTile } from "@/components/site/icon-tile";
import { Reveal } from "@/components/site/reveal";
import { Container, SectionHeading } from "@/components/site/section";

const reasons = [
  {
    icon: IconHeadphones,
    title: "Customer Support",
    body: "Extremely responsive customer support provided by the team at best car rental UK.",
  },
  {
    icon: IconTag,
    title: "Best Price Guarantted",
    body: "Extremely best prices for all category people offered at the best car rental UK.",
  },
  {
    icon: IconMapPin,
    title: "Many Location",
    body: "Extremely the best location and available near the big cities. Just visit best car rental UK.",
  },
];

export function WhyChooseUs() {
  return (
    <section id="why-choose-us" className="bg-white py-16 lg:py-24">
      <Container>
        <SectionHeading
          title="Why choose us"
          subtitle="A high-performing web-based car rental system for any rent-a-car company and website"
        />

        <div className="mt-12 grid items-center gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl bg-mist lg:aspect-square">
            <Image
              src="/client-side/cars/aston-martin.webp"
              alt="Silver sports car overlooking the Dhaka skyline at dusk"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <ul className="flex flex-col gap-8">
            {reasons.map((reason, index) => (
              <Reveal as="li" key={reason.title} delay={index * 120} className="flex gap-5">
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

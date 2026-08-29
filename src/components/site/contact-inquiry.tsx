import { IconClockHour4, IconMailFast, IconRoute } from "@tabler/icons-react";

import { InquiryForm } from "@/components/site/inquiry-form";
import { Reveal } from "@/components/site/reveal";
import { Container, SectionHeading, sectionGap, sectionPadding } from "@/components/site/section";
import { cn } from "@/lib/cn";

const points = [
  {
    icon: IconMailFast,
    title: "A real reply, not a form letter",
    body: "Every inquiry is read by our rental team before anyone gets back to you.",
  },
  {
    icon: IconClockHour4,
    title: "Usually within a few hours",
    body: "Send us your dates and we will confirm what is free and what it costs.",
  },
  {
    icon: IconRoute,
    title: "Long trips and company accounts",
    body: "Tell us about multi-month or multi-car needs and we will price them properly.",
  },
];

export function ContactInquiry() {
  return (
    <section id="contact" className={cn("bg-mist", sectionPadding)}>
      <Container>
        <SectionHeading
          title="Talk to us first"
          subtitle="Not ready to book? Tell us what you need and our team will come back to you with options."
        />

        <div className={cn(sectionGap, "grid gap-8 lg:grid-cols-5 lg:gap-14")}>
          <ul className="flex flex-col gap-7 lg:col-span-2">
            {points.map((point, index) => (
              <Reveal as="li" key={point.title} delay={index * 120} className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-gold-400 shadow-card">
                  <point.icon size={22} stroke={1.7} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-ink-900">{point.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{point.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>

          <div className="lg:col-span-3">
            <InquiryForm />
          </div>
        </div>
      </Container>
    </section>
  );
}

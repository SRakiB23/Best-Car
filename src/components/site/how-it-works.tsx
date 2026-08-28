import { IconTile } from "@/components/site/icon-tile";
import { Reveal } from "@/components/site/reveal";
import { Container, SectionHeading, sectionGap, sectionPadding } from "@/components/site/section";
import { cn } from "@/lib/cn";

const steps = [
  {
    icon: "/client-side/how-it-works/location.svg",
    title: "Choose Location",
    body: "Tell us where you want to collect the car. We have pick-up points in Dhaka, Chattogram, Sylhet and Khulna.",
  },
  {
    icon: "/client-side/how-it-works/calendar.svg",
    title: "Pick-up Date",
    body: "Set your pick-up and drop-off dates and times. We only show cars that are free for your whole trip.",
  },
  {
    icon: "/client-side/how-it-works/book.svg",
    title: "Book your car",
    body: "Confirm in a few clicks and get your booking reference by email. Insurance and servicing are included.",
  },
];

/** Floats between two step columns, centred on the gap so tile spacing stays even. */
function StepConnector({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 354 83"
      fill="none"
      aria-hidden
      preserveAspectRatio="none"
      className={cn(
        "pointer-events-none absolute top-3 hidden h-20.75 w-[min(230px,22vw)] -translate-x-1/2 text-gold-400 lg:block",
        className,
      )}
    >
      <path
        d="M0 74C168 74 186 9 354 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function Step({ icon, title, body }: (typeof steps)[number]) {
  return (
    <div className="flex w-full max-w-xs shrink-0 flex-col items-center text-center">
      <IconTile src={icon} className="sm:size-26.5" />
      <h3 className="mt-6 text-xl font-semibold text-ink-900 sm:text-2xl">{title}</h3>
      <p className="mt-3 text-sm font-normal leading-relaxed text-ink-500">{body}</p>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className={cn("bg-white lg:flex lg:min-h-115.5 lg:items-center", sectionPadding)}
    >
      <Container>
        <SectionHeading
          title="How it works"
          subtitle="A high-performing web-based car rental system for any rent-a-car company and website"
        />

        {/* Steps sit on an even 3-up grid; the curves float over the gaps so they never affect spacing. */}
        <div
          className={cn(
            sectionGap,
            "relative grid justify-items-center gap-10 sm:gap-12 lg:grid-cols-3 lg:gap-0",
          )}
        >
          <StepConnector className="left-1/3" />
          <StepConnector className="left-2/3" />

          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 120} className="flex w-full justify-center">
              <Step {...step} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

import { DealsBrowser } from "@/components/site/deals-browser";
import { Container, SectionHeading, sectionPadding } from "@/components/site/section";
import { cn } from "@/lib/cn";
import { listVehicles } from "@/lib/vehicles";

export async function PopularDeals() {
  const vehicles = await listVehicles();

  return (
    <section id="rental-details" className={cn("bg-mist", sectionPadding)}>
      <Container>
        <SectionHeading
          title="Most popular car rental deals"
          subtitle="A high-performing web-based car rental system for any rent-a-car company and website"
        />

        <DealsBrowser vehicles={vehicles} />
      </Container>
    </section>
  );
}

import { FleetShowcase } from "@/components/site/fleet-showcase";
import { Hero } from "@/components/site/hero";
import { HowItWorks } from "@/components/site/how-it-works";
import { PopularDeals } from "@/components/site/popular-deals";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeaderBar } from "@/components/site/site-header-bar";
import { Testimonials } from "@/components/site/testimonials";
import { WhyChooseUs } from "@/components/site/why-choose-us";

export default function StorefrontPage() {
  return (
    <div className="relative min-h-dvh bg-white">
      <SiteHeaderBar />
      <main>
        <Hero />
        <HowItWorks />
        <PopularDeals />
        <WhyChooseUs />
        <FleetShowcase />
        <Testimonials />
      </main>
      <SiteFooter />
    </div>
  );
}

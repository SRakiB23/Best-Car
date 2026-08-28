import { Carousel } from "@/components/site/carousel";
import { Container, SectionHeading } from "@/components/site/section";
import { TestimonialCard } from "@/components/site/testimonial-card";
import { testimonials } from "@/lib/testimonials";

export function Testimonials() {
  return (
    <section id="testimonial" className="bg-mist py-16 lg:py-24">
      <Container>
        <SectionHeading
          title="Trusted by Thousands of Happy Customers"
          subtitle="A high-performing web-based car rental system for any rent-a-car company and website"
          titleClassName="max-w-105.5 sm:text-[28px] lg:text-[35px]"
        />

        <Carousel
          label="Customer testimonials"
          controls="labels"
          gap={32}
          className="mt-12 lg:mt-16"
          slideClassName="sm:basis-[calc((100%-32px)/2)] lg:basis-[calc((100%-64px)/3)]"
        >
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </Carousel>
      </Container>
    </section>
  );
}

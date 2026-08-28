import { Container } from "@/components/site/section";

export default function CarsLoading() {
  return (
    <div className="bg-mist py-12 sm:py-14 lg:py-16">
      <Container>
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-2xl bg-white/70" />
          ))}
        </div>
      </Container>
    </div>
  );
}

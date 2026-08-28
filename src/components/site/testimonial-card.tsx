import Image from "next/image";
import { IconStarFilled } from "@tabler/icons-react";

import type { Testimonial } from "@/lib/testimonials";
import { cn } from "@/lib/cn";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="flex items-center gap-4 bg-night-800 px-5 py-4">
        <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10 text-sm font-semibold text-white">
          {testimonial.avatar ? (
            <Image
              src={testimonial.avatar}
              alt={testimonial.name}
              width={44}
              height={44}
              className="size-11 object-cover object-top"
            />
          ) : (
            initials(testimonial.name)
          )}
        </span>

        <figcaption className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-gold-300">{testimonial.name}</p>
          <p className="truncate text-xs text-white/70">{testimonial.location}</p>
        </figcaption>

        <div className="flex shrink-0 items-center gap-0.5" aria-label={`${testimonial.rating} out of 5`}>
          {Array.from({ length: 5 }).map((_, index) => (
            <IconStarFilled
              key={index}
              size={12}
              className={cn(index < testimonial.rating ? "text-gold-300" : "text-white/20")}
            />
          ))}
        </div>
      </div>

      <blockquote className="flex-1 px-5 py-6 text-sm leading-relaxed text-ink-700">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
    </figure>
  );
}

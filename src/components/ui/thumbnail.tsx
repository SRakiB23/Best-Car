import Image from "next/image";
import { IconCar } from "@tabler/icons-react";

import { cn } from "@/lib/cn";

type ThumbnailProps = {
  src?: string;
  alt: string;
  className?: string;
};

export function Thumbnail({ src, alt, className }: ThumbnailProps) {
  return (
    <span
      className={cn(
        "grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-canvas",
        className,
      )}
    >
      {src ? (
        <Image src={src} alt={alt} width={40} height={40} className="size-full object-cover" />
      ) : (
        <IconCar size={20} stroke={1.5} className="text-ink-400" />
      )}
    </span>
  );
}

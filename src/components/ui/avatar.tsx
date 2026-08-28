import Image from "next/image";

import { cn } from "@/lib/cn";
import { initialsFrom } from "@/lib/account";

export function Avatar({
  name,
  src,
  size = 36,
  className,
}: {
  name: string;
  src?: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-full bg-brand-100 font-semibold text-brand-700",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width={size}
          height={size}
          unoptimized
          className="size-full object-cover"
        />
      ) : (
        initialsFrom(name)
      )}
    </span>
  );
}

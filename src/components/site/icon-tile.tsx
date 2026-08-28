import type { Icon } from "@tabler/icons-react";

import { cn } from "@/lib/cn";

type IconTileProps = {
  src?: string;
  icon?: Icon;
  className?: string;
  glyphClassName?: string;
};

export function IconTile({ src, icon: TileIcon, className, glyphClassName }: IconTileProps) {
  return (
    <span
      className={cn(
        "grid size-20 shrink-0 place-items-center rounded-3xl bg-gold-100 text-gold-600",
        className,
      )}
    >
      {src ? (
        <span
          aria-hidden
          style={{ maskImage: `url(${src})`, WebkitMaskImage: `url(${src})` }}
          className={cn("size-9 bg-current mask-contain mask-center mask-no-repeat", glyphClassName)}
        />
      ) : TileIcon ? (
        <TileIcon className={cn("size-9", glyphClassName)} stroke={1.75} />
      ) : null}
    </span>
  );
}

"use client";

import { useEffect, useState } from "react";
import { IconMaximize, IconMinimize } from "@tabler/icons-react";

import { Tooltip } from "@/components/ui/tooltip";

export function FullscreenToggle({ className }: { className?: string }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    function sync() {
      setActive(Boolean(document.fullscreenElement));
    }

    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  async function toggle() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  }

  const label = active ? "Exit fullscreen" : "Enter fullscreen";
  const Glyph = active ? IconMinimize : IconMaximize;

  return (
    <Tooltip label={label}>
      <button type="button" aria-label={label} onClick={toggle} className={className}>
        <Glyph size={18} stroke={1.8} />
      </button>
    </Tooltip>
  );
}

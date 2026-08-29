/** Clearance for the sticky header. Mirrors `scroll-padding-top` in globals.css. */
export const headerOffset = 88;

/** How long after the click a late layout shift may still be corrected for. */
const correctionWindowMs = 2_500;

/**
 * Scrolls a section into view and keeps it there.
 *
 * A plain hash jump is aimed once, at the positions the page happens to have
 * at that moment — and on a phone the page is rarely finished moving. The
 * webfont swaps in and every block of text re-wraps, images finish decoding,
 * client components hydrate. All of it lands above the target and drags it
 * upwards, so a scroll aimed at a section heading ends up well past it.
 *
 * So: aim, then re-aim while the page settles, and stop the moment the visitor
 * takes over.
 */
export function scrollToId(id: string) {
  const element = document.getElementById(id);
  if (!element) return;

  const targetTop = () =>
    Math.max(0, element.getBoundingClientRect().top + window.scrollY - headerOffset);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  window.scrollTo({ top: targetTop(), behavior: reduced ? "auto" : "smooth" });

  const expiresAt = performance.now() + correctionWindowMs;
  let takenOver = false;

  const release = () => {
    takenOver = true;
    window.removeEventListener("wheel", release);
    window.removeEventListener("touchstart", release);
    window.removeEventListener("keydown", release);
  };

  // Any deliberate input wins; nothing below should ever yank the page back
  // from under someone who has already started reading.
  window.addEventListener("wheel", release, { passive: true, once: true });
  window.addEventListener("touchstart", release, { passive: true, once: true });
  window.addEventListener("keydown", release, { once: true });

  const correct = () => {
    if (takenOver || performance.now() > expiresAt) return;

    const top = targetTop();
    // A correction is a jump, not a second animation: by now the visitor is
    // looking at the section and only the offset is wrong.
    if (Math.abs(top - window.scrollY) > 2) window.scrollTo({ top, behavior: "auto" });
  };

  // Correcting mid-flight would cancel the smooth scroll, so wait for it to end.
  let settled = false;
  const afterSettle = () => {
    if (settled) return;
    settled = true;
    correct();
    window.setTimeout(correct, 350);
    window.setTimeout(release, correctionWindowMs);
  };

  // Safari has no scrollend, so the timeout is the fallback rather than a race.
  if ("onscrollend" in window) window.addEventListener("scrollend", afterSettle, { once: true });
  window.setTimeout(afterSettle, 800);

  // The font swap is the largest single shift on this page and can land well
  // after the scroll has finished.
  document.fonts?.ready.then(correct);
}

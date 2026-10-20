"use client";

import { useEffect } from "react";

/**
 * Feeds the cursor position (relative to the hovered card) into --mx / --my so
 * `.card` and `.plan-card` can render a soft spotlight that follows the pointer.
 * One delegated listener for the whole app; no-ops for touch and reduced-motion users.
 */
export function PointerGlow() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      const target = e.target as Element | null;
      const card = target?.closest<HTMLElement>(".card, .plan-card");
      if (!card) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        card.style.setProperty("--my", `${e.clientY - rect.top}px`);
      });
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}

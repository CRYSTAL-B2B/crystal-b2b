"use client";

import { useEffect } from "react";

const STABLE_FRAMES_REQUIRED = 6;
const MAX_FRAMES = 300;

export function ScrollToHashOnLoad() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const target = document.querySelector(hash);
    if (!target) return;

    let lastHeight = -1;
    let stableFrames = 0;
    let framesElapsed = 0;
    let rafId: number;

    const check = () => {
      const height = document.body.scrollHeight;
      stableFrames = height === lastHeight ? stableFrames + 1 : 0;
      lastHeight = height;
      framesElapsed += 1;

      if (stableFrames >= STABLE_FRAMES_REQUIRED || framesElapsed >= MAX_FRAMES) {
        target.scrollIntoView({ block: "start" });
        return;
      }
      rafId = requestAnimationFrame(check);
    };

    rafId = requestAnimationFrame(check);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return null;
}

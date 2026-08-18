"use client";

import { useEffect } from "react";

const DESKTOP_MEDIA = "(min-width: 961px)";
const REDUCED_MOTION_MEDIA = "(prefers-reduced-motion: reduce)";
const EASING = 0.12;

function normaliseWheelDelta(event: WheelEvent) {
  if (event.deltaMode === 1) return event.deltaY * 16;
  if (event.deltaMode === 2) return event.deltaY * window.innerHeight;
  return event.deltaY;
}

function keepsItsOwnScroll(target: EventTarget | null, deltaY: number) {
  if (!(target instanceof Element)) return false;

  if (target.closest("input, textarea, select, [contenteditable='true'], [data-native-scroll]")) {
    return true;
  }

  for (let element: Element | null = target; element && element !== document.body; element = element.parentElement) {
    const style = window.getComputedStyle(element);
    const canOverflow = /auto|scroll|overlay/.test(style.overflowY);
    const hasOverflow = element.scrollHeight > element.clientHeight;

    if (!canOverflow || !hasOverflow) continue;

    const canScrollUp = deltaY < 0 && element.scrollTop > 0;
    const canScrollDown = deltaY > 0 && element.scrollTop + element.clientHeight < element.scrollHeight;
    if (canScrollUp || canScrollDown) return true;
  }

  return false;
}

export function DesktopSmoothScroll() {
  useEffect(() => {
    const desktopQuery = window.matchMedia(DESKTOP_MEDIA);
    const reducedMotionQuery = window.matchMedia(REDUCED_MOTION_MEDIA);
    let animationFrame: number | null = null;
    let targetScroll = window.scrollY;
    let enabled = false;

    const cancelAnimation = () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      targetScroll = window.scrollY;
    };

    const maxScroll = () => Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);

    const render = () => {
      const currentScroll = window.scrollY;
      const distance = targetScroll - currentScroll;

      if (Math.abs(distance) < 0.5) {
        window.scrollTo({ top: targetScroll, behavior: "instant" });
        animationFrame = null;
        return;
      }

      window.scrollTo({ top: currentScroll + distance * EASING, behavior: "instant" });
      animationFrame = window.requestAnimationFrame(render);
    };

    const onWheel = (event: WheelEvent) => {
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.deltaY === 0 ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
        document.body.dataset.navigationOpen === "true"
      ) {
        return;
      }

      const deltaY = normaliseWheelDelta(event);
      if (keepsItsOwnScroll(event.target, deltaY)) return;

      event.preventDefault();

      if (animationFrame === null) targetScroll = window.scrollY;
      targetScroll = Math.min(Math.max(targetScroll + deltaY, 0), maxScroll());

      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    const enable = () => {
      document.documentElement.dataset.smoothScroll = "inertial";
      window.addEventListener("wheel", onWheel, { passive: false });
      window.addEventListener("pointerdown", cancelAnimation, { passive: true });
      window.addEventListener("keydown", cancelAnimation);
      window.addEventListener("resize", cancelAnimation, { passive: true });
      window.addEventListener("hashchange", cancelAnimation);
      document.addEventListener("visibilitychange", cancelAnimation);
    };

    const disable = () => {
      cancelAnimation();
      delete document.documentElement.dataset.smoothScroll;
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointerdown", cancelAnimation);
      window.removeEventListener("keydown", cancelAnimation);
      window.removeEventListener("resize", cancelAnimation);
      window.removeEventListener("hashchange", cancelAnimation);
      document.removeEventListener("visibilitychange", cancelAnimation);
    };

    const updateCapability = () => {
      const shouldEnable = desktopQuery.matches && !reducedMotionQuery.matches;
      if (shouldEnable === enabled) return;

      enabled = shouldEnable;
      if (enabled) enable();
      else disable();
    };

    updateCapability();
    desktopQuery.addEventListener("change", updateCapability);
    reducedMotionQuery.addEventListener("change", updateCapability);

    return () => {
      desktopQuery.removeEventListener("change", updateCapability);
      reducedMotionQuery.removeEventListener("change", updateCapability);
      if (enabled) disable();
    };
  }, []);

  return null;
}

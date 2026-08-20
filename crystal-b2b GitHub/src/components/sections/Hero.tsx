"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ViewportVideo } from "@/components/motion/ViewportVideo";
import { Arrow } from "@/components/ui/Arrow";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function Hero() {
  const mediaRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const media = mediaRef.current;
    if (!media || reducedMotion) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animationFrame = 0;

    const render = () => {
      currentX += (targetX - currentX) * 0.075;
      currentY += (targetY - currentY) * 0.075;
      media.style.setProperty("--media-x", `${currentX * -7}px`);
      media.style.setProperty("--media-y", `${currentY * -5}px`);

      if (Math.abs(targetX - currentX) > 0.002 || Math.abs(targetY - currentY) > 0.002) {
        animationFrame = requestAnimationFrame(render);
      }
    };

    const update = (event: PointerEvent) => {
      const bounds = media.getBoundingClientRect();
      targetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      targetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(render);
    };

    const reset = () => {
      targetX = 0;
      targetY = 0;
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(render);
    };

    media.addEventListener("pointermove", update);
    media.addEventListener("pointerleave", reset);
    return () => {
      media.removeEventListener("pointermove", update);
      media.removeEventListener("pointerleave", reset);
      cancelAnimationFrame(animationFrame);
    };
  }, [reducedMotion]);

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-media" ref={mediaRef} aria-hidden="true">
        <Image
          className="hero-image"
          src="/media/first-frames/01-hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
        />
        <ViewportVideo
          className="hero-image hero-video"
          src="/media/video/01-hero.mp4"
        />
        <div className="hero-scrim" />
      </div>
      <div className="hero-copy">
        <h1 id="hero-title">
          <span>Строю B2B-маркетинг</span>{" "}
          <span>от спроса до <em>выручки.</em></span>
        </h1>
        <p className="hero-lede">
          Стратегия, лидогенерация, CRM, аналитика и автоматизация - в одной
          измеримой системе.
        </p>
        <div className="hero-actions">
          <TrackedLink className="button button-primary" href="#contact" event="hero_cta_click">
            Обсудить задачу <Arrow />
          </TrackedLink>
          <TrackedLink className="text-link" href="#results" event="results_click">
            Смотреть результаты <Arrow />
          </TrackedLink>
        </div>
      </div>

      <p className="scroll-cue" aria-hidden="true"><span /> Прокрутите, чтобы продолжить</p>
    </section>
  );
}

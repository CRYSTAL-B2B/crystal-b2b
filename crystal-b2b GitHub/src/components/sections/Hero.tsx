"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ViewportVideo } from "@/components/motion/ViewportVideo";
import { Arrow } from "@/components/ui/Arrow";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { LeadButton } from "@/components/contact/LeadButton";
import { leadCopy } from "@/data/lead";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function Hero() {
  const mediaRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const hero = heroRef.current, copy = copyRef.current;
    if (!hero || !copy) return;
    const header = document.querySelector<HTMLElement>('.site-header');
    const avatar = document.querySelector<HTMLElement>('.system-avatar');
    const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
    const pointerPreference = matchMedia('(hover: hover) and (pointer: fine)');
    // Тот же запрос, по которому dockController выбирает мобильный док.
    const mobileDock = matchMedia('(max-width: 768px), (pointer: coarse)');
    let frame = 0, disposed = false;
    const fit = () => {
      frame = 0;
      const height = window.visualViewport?.height ?? innerHeight;
      const media = mediaRef.current;
      if (media) {
        const parallax = !motionPreference.matches && pointerPreference.matches;
        const offset = parseFloat(getComputedStyle(media).getPropertyValue('--hero-media-offset-x')) || 0;
        const cover = 1 + Math.max(2 * (Math.abs(offset) + (parallax ? 7 : 0) + 1) / media.clientWidth, 2 * (parallax ? 6 : 1) / media.clientHeight);
        media.style.setProperty('--hero-cover-scale', String(cover));
      }
      const headerHeight = header?.getBoundingClientRect().height ?? 72;
      // Аватар ушёл к правому краю и текст больше не перекрывает, поэтому
      // копия начинается сразу под шапкой, а не под аватаром.
      const top = headerHeight + 32;
      // На мобильном аватар стоит в правом нижнем углу - держим под него полосу,
      // иначе на невысоких экранах (375x667 и ниже) он накрывает кнопки.
      const reserved = mobileDock.matches ? (avatar?.getBoundingClientRect().height ?? 196) + 14 : 0;
      const available = Math.max(1, height - top - 24 - reserved);
      hero.style.setProperty('--hero-content-top', `${top}px`);
      // Keep the available line width while scaling, rather than shrinking text into a narrow column.
      const fits = (scale: number) => { copy.style.width = `${100 / scale}%`; return copy.offsetHeight * scale <= available; };
      let scale = 1;
      if (!fits(1)) {
        let low = .1, high = 1;
        for (let i = 0; i < 9; i++) { const mid = (low + high) / 2; if (fits(mid)) low = mid; else high = mid; }
        scale = low; fits(scale);
      }
      hero.style.setProperty('--hero-copy-scale', String(scale));
      hero.dataset.fitted = 'true';
      // Bubble caches real heading geometry; transforms do not notify ResizeObserver.
      window.dispatchEvent(new Event('hero:layout'));
    };
    const schedule = () => { if (!disposed && !frame) frame = requestAnimationFrame(fit); };
    const observer = new ResizeObserver(schedule);
    observer.observe(copy); if (header) observer.observe(header); if (avatar) observer.observe(avatar);
    window.addEventListener('resize', schedule);
    motionPreference.addEventListener('change', schedule);
    pointerPreference.addEventListener('change', schedule);
    mobileDock.addEventListener('change', schedule);
    window.visualViewport?.addEventListener('resize', schedule);
    void document.fonts.ready.then(schedule); schedule();
    return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('resize', schedule); motionPreference.removeEventListener('change', schedule); pointerPreference.removeEventListener('change', schedule); mobileDock.removeEventListener('change', schedule); window.visualViewport?.removeEventListener('resize', schedule); };
  }, []);

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
      if (event.pointerType !== 'mouse' || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
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
    <section ref={heroRef} className="hero" id="top" aria-labelledby="hero-title">
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
      </div>
      <div ref={copyRef} className="hero-copy">
        <h1 id="hero-title">
          Маркетинг – это управляемая инвестиция в{" "}
          <span className="hero-profit">системный рост прибыли</span>
        </h1>
        <p className="hero-supporting">Строю B2B-маркетинг от спроса до выручки.</p>
        <p className="hero-lede">
          Стратегия, лидогенерация, CRM, аналитика и автоматизация в одной системе.
        </p>
        <div className="hero-actions">
          <LeadButton
            className="button button-primary"
            placement="hero"
            event="hero_cta_click"
          >
            {leadCopy.action} <Arrow />
          </LeadButton>
          <TrackedLink className="text-link" href="#results" event="results_click">
            Смотреть результаты <Arrow />
          </TrackedLink>
        </div>
      </div>

      <p className="scroll-cue" aria-hidden="true"><span /> Прокрутите, чтобы продолжить</p>
    </section>
  );
}

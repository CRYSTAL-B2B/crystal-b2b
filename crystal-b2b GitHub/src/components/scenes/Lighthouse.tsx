"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getGsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function Lighthouse() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion) return;

    let cancelled = false;
    let cleanupMotion: (() => void) | undefined;

    void getGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      section.dataset.motionReady = "true";

      const context = gsap.context(() => {
        const copy = gsap.utils.toArray<HTMLElement>(".beacon-copy");
        let lighthouseState = "weather";
        const setLighthouseState = (next: string) => {
          if (next === lighthouseState) return;
          lighthouseState = next;
          section.dataset.lighthouseState = next;
        };
        gsap.set(copy, { autoAlpha: 0, y: 24 });
        gsap.set(copy[0], { autoAlpha: 1, y: 0 });
        gsap.set(".beacon-visual-frame", { scale: 1.055, yPercent: 0 });

        const timeline = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.58,
            invalidateOnRefresh: true,
            onUpdate: (trigger) => {
              const nextState = trigger.progress < 0.24
                ? "weather"
                : trigger.progress < 0.5
                  ? "signal"
                  : trigger.progress < 0.76
                    ? "course"
                    : "decision";
              setLighthouseState(nextState);
            },
          },
        });

        timeline.to({}, { duration: 0.52 });

        copy.slice(1).forEach((item, index) => {
          timeline
            .to(copy[index], { autoAlpha: 0, y: -10, duration: 0.18 })
            .to(item, { autoAlpha: 1, y: 0, duration: 0.18 }, "<")
            .to(".beacon-visual-frame", {
              scale: 1.047 - index * 0.008,
              yPercent: index * -0.45,
              duration: 0.86,
            }, "<")
            .to({}, { duration: 0.58 });
        });

        requestAnimationFrame(() => ScrollTrigger.refresh());
      }, section);

      cleanupMotion = () => {
        delete section.dataset.motionReady;
        section.dataset.lighthouseState = "weather";
        context.revert();
      };
    });

    return () => {
      cancelled = true;
      cleanupMotion?.();
    };
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} className="scroll-scene lighthouse-scene" data-lighthouse-state="weather" aria-labelledby="lighthouse-title">
      <div className="scroll-stage lighthouse-stage">
        <div className="scene-chrome">
          <SectionLabel index="05">Сигнал / курс</SectionLabel>
        </div>

        <div className="beacon-visual" aria-hidden="true">
          <Image
            className="beacon-visual-frame"
            src="/media/first-frames/05-lighthouse.webp"
            alt=""
            fill
            sizes="100vw"
          />
          <div className="beacon-image-shade" />
          <div className="beacon-course-map">
            <svg viewBox="0 0 1200 700" preserveAspectRatio="none">
              <path className="beacon-noise beacon-noise-a" d="M24 158 C208 72 324 256 498 174 S728 94 892 202 1056 270 1190 138" />
              <path className="beacon-noise beacon-noise-b" d="M0 474 C164 368 298 546 466 456 S734 344 922 488 1086 518 1200 410" />
              <path className="beacon-noise beacon-noise-c" d="M54 620 C220 512 370 622 548 542 S756 458 960 572 1114 602 1190 532" />
              <path className="beacon-signal-line" pathLength="1" d="M824 512 L824 126" />
              <path className="beacon-course-line" pathLength="1" d="M86 572 C248 548 336 468 480 486 S650 530 748 410 770 238 824 126" />
              <circle className="beacon-course-end" cx="824" cy="126" r="9" />
            </svg>
            <span className="beacon-map-label beacon-map-label-signal">СТАБИЛЬНЫЙ СИГНАЛ</span>
            <span className="beacon-map-label beacon-map-label-course">УПРАВЛЯЕМЫЙ КУРС</span>
          </div>
        </div>

        <div className="beacon-copy-stack">
          <div className="beacon-copy"><p>01 / РЫНОЧНЫЙ ШУМ</p><h2 id="lighthouse-title">Подготовьтесь к шторму.</h2></div>
          <div className="beacon-copy"><p>02 / СИГНАЛ</p><h2>Когда рынок шумит, ориентируйтесь на сигнал.</h2></div>
          <div className="beacon-copy"><p>03 / КУРС</p><h2>Следуйте за маяком, а не за шумом.</h2></div>
          <div className="beacon-copy"><p>04 / СИСТЕМА</p><h2>У курса должна быть система.</h2></div>
          <div className="beacon-copy"><p>05 / РЕШЕНИЕ</p><h2>Если нужен курс - давайте обсудим задачу.</h2></div>
        </div>

        <div className="beacon-static-summary">
          <p>СИГНАЛ - КУРС - РЕШЕНИЕ</p>
          <h2>У курса должна быть система.</h2>
        </div>
      </div>
    </section>
  );
}

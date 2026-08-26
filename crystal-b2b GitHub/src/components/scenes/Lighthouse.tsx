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
        const crawl = section.querySelector<HTMLElement>(".beacon-crawl");
        if (!crawl) return;

        gsap.set(crawl, { yPercent: 0 });
        gsap.set(".beacon-visual-frame", { scale: 1.055, yPercent: 0 });

        let lighthouseState = "weather";
        const setLighthouseState = (next: string) => {
          if (next === lighthouseState) return;
          lighthouseState = next;
          section.dataset.lighthouseState = next;
        };

        const timeline = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
            onEnter: () => {
              section.dataset.beaconPinned = "true";
            },
            onLeaveBack: () => {
              delete section.dataset.beaconPinned;
            },
            onUpdate: (trigger) => {
              const nextState = trigger.progress < 0.17
                ? "weather"
                : trigger.progress < 0.45
                  ? "signal"
                  : trigger.progress < 0.74
                    ? "course"
                    : "decision";
              setLighthouseState(nextState);
            },
          },
        });

        timeline.to(crawl, { yPercent: -68, duration: 1, ease: "none" });
        // Кадр подъезжает на всю длину сцены, а не рывками между репликами.
        timeline.to(".beacon-visual-frame", { scale: 1.015, yPercent: -1.8, duration: 1, ease: "none" }, 0);

        requestAnimationFrame(() => ScrollTrigger.refresh());
      }, section);

      cleanupMotion = () => {
        delete section.dataset.motionReady;
        delete section.dataset.beaconPinned;
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

        <div className="beacon-copy-stack" aria-live="off">
          <div className="beacon-crawl">
            <div className="beacon-copy"><p>01 / РЫНОЧНЫЙ ШУМ</p><h2 id="lighthouse-title">Подготовьтесь к шторму.</h2></div>
            <div className="beacon-copy"><p>02 / СИГНАЛ</p><div className="scene-statement-heading">Когда рынок шумит, ориентируйтесь на сигнал.</div></div>
            <div className="beacon-copy"><p>03 / КУРС</p><div className="scene-statement-heading">Следуйте за маяком, а не за шумом.</div></div>
            <div className="beacon-copy"><p>04 / СИСТЕМА</p><div className="scene-statement-heading">У курса должна быть система.</div></div>
            <div className="beacon-copy"><p>05 / РЕШЕНИЕ</p><div className="scene-statement-heading">Если нужен курс - давайте обсудим задачу.</div></div>
          </div>
        </div>

        <div className="beacon-static-summary">
          <p>СИГНАЛ - КУРС - РЕШЕНИЕ</p>
          <div className="scene-statement-heading">У курса должна быть система.</div>
        </div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import { ViewportVideo } from "@/components/motion/ViewportVideo";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getGsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const traces = [
  { id: "content", label: "Путь контента", route: "КОНТЕНТ - СПРОС - ПОСАДОЧНАЯ СТРАНИЦА - ЛИД - CRM - ПРОДАЖИ" },
  { id: "response", label: "Скорость реакции", route: "CRM - ПРОДАЖИ / 24 ч - 1 ч" },
  { id: "data", label: "Обратная связь", route: "ВЫРУЧКА - ДАННЫЕ - СТРАТЕГИЯ" },
] as const;

export function ConnectedSystem() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeTrace, setActiveTrace] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const activeTraceInfo = traces.find((trace) => trace.id === activeTrace);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion) return;

    let cancelled = false;
    let cleanupMotion: (() => void) | undefined;

    void getGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      section.dataset.motionReady = "true";

      const context = gsap.context(() => {
        gsap.set(".architecture-visual-frame", { scale: 1.055, xPercent: 0, yPercent: 0 });
        gsap.set(".architecture-copy", { autoAlpha: 0, y: 26 });

        gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.64,
            invalidateOnRefresh: true,
          },
        })
          .to(".architecture-copy", { autoAlpha: 1, y: 0, duration: 0.43 }, 0.07)
          .to(".architecture-visual-frame", { scale: 1.025, xPercent: -1.8, yPercent: -0.6, duration: 0.5 }, 0);

        requestAnimationFrame(() => ScrollTrigger.refresh());
      }, section);

      cleanupMotion = () => {
        delete section.dataset.motionReady;
        context.revert();
      };
    });

    return () => {
      cancelled = true;
      cleanupMotion?.();
    };
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} className="scroll-scene architecture-scene" aria-labelledby="architecture-title">
      <div className="scroll-stage architecture-stage">
        <div className="scene-chrome">
          <SectionLabel index="04">Связанная система</SectionLabel>
        </div>

        <div className="architecture-layout">
          <div className="architecture-camera" data-trace={activeTrace ?? "all"} aria-hidden="true">
            <div className="architecture-world">
              <Image
                className="architecture-visual-frame architecture-video-poster"
                src="/media/first-frames/04-connected-system.webp"
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 68vw"
              />
              <ViewportVideo
                className="architecture-visual-frame architecture-video"
                src="/media/video/04-connected-system.mp4"
              />
              <div className="architecture-image-shade" />
              <svg className="architecture-trace-map" viewBox="0 0 1000 700" preserveAspectRatio="none">
                <path className="architecture-trace" data-route="content" pathLength="1" d="M102 138 C220 102 294 194 392 210 S524 260 610 318 724 420 898 484" />
                <path className="architecture-trace" data-route="response" pathLength="1" d="M728 476 C668 420 624 362 596 286 568 210 626 158 742 122" />
                <path className="architecture-trace" data-route="data" pathLength="1" d="M844 538 C708 604 516 598 404 520 S280 400 224 278" />
                <circle className="architecture-trace-node" data-route="content" cx="102" cy="138" r="10" />
                <circle className="architecture-trace-node" data-route="content" cx="610" cy="318" r="10" />
                <circle className="architecture-trace-node" data-route="content" cx="898" cy="484" r="10" />
                <circle className="architecture-trace-node" data-route="response" cx="728" cy="476" r="10" />
                <circle className="architecture-trace-node" data-route="response" cx="742" cy="122" r="10" />
                <circle className="architecture-trace-node" data-route="data" cx="844" cy="538" r="10" />
                <circle className="architecture-trace-node" data-route="data" cx="224" cy="278" r="10" />
              </svg>
              <p className="architecture-frame-caption">ШЕСТЬ УРОВНЕЙ / ОДНА СВЯЗАННАЯ СИСТЕМА</p>
            </div>
            <p className="trace-status" role="status" aria-live="polite">
              {activeTraceInfo ? activeTraceInfo.route : "Выберите маршрут, чтобы увидеть связь между слоями."}
            </p>
          </div>

          <div className="architecture-side">
            <p className="architecture-kicker">АРХИТЕКТУРА B2B-МАРКЕТИНГА</p>
            <h2 id="architecture-title">Система становится управляемой, когда видны связи.</h2>
            <p>Данные работают как нервная система: связывают спрос, CRM, продажи и решения.</p>
            <div className="trace-controls" aria-label="Показать путь через систему">
              {traces.map((trace) => (
                <button
                  key={trace.id}
                  type="button"
                  aria-pressed={activeTrace === trace.id}
                  onMouseEnter={() => setActiveTrace(trace.id)}
                  onMouseLeave={() => setActiveTrace(null)}
                  onFocus={() => setActiveTrace(trace.id)}
                  onBlur={() => setActiveTrace(null)}
                  onClick={() => setActiveTrace(trace.id)}
                >
                  <span>{trace.label}</span>
                  <small>{trace.route}</small>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="architecture-copy">
          <p>Ценность - не только в элементах.</p>
          <h2>Ценность - в связях между ними.</h2>
        </div>
      </div>
    </section>
  );
}

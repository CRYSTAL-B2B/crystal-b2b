"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { ViewportVideo } from "@/components/motion/ViewportVideo";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getGsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function ControlFlow() {
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
        const crawl = section.querySelector<HTMLElement>(".flow-crawl");
        if (!crawl) return;

        gsap.set(crawl, { yPercent: 0 });

        let flowState = "loss";
        const setFlowState = (next: string) => {
          if (next === flowState) return;
          flowState = next;
          section.dataset.flowState = next;
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
              section.dataset.flowPinned = "true";
            },
            onLeaveBack: () => {
              delete section.dataset.flowPinned;
            },
            onUpdate: (trigger) => {
              const nextState = trigger.progress < 0.2
                ? "loss"
                : trigger.progress < 0.46
                  ? "control"
                  : trigger.progress < 0.72
                    ? "output"
                    : "feedback";
              setFlowState(nextState);
            },
          },
        });

        timeline.to(crawl, { yPercent: -68, duration: 1, ease: "none" });

        requestAnimationFrame(() => ScrollTrigger.refresh());
      }, section);

      cleanupMotion = () => {
        delete section.dataset.motionReady;
        delete section.dataset.flowPinned;
        section.dataset.flowState = "loss";
        context.revert();
      };
    });

    return () => {
      cancelled = true;
      cleanupMotion?.();
    };
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} className="scroll-scene flow-scene" data-flow-state="loss" aria-labelledby="flow-title">
      <div className="scroll-stage flow-stage">
        <div className="scene-chrome">
          <SectionLabel index="03">Управление потоком</SectionLabel>
        </div>

        <div className="flow-visual" aria-hidden="true">
          <Image
            className="flow-visual-frame"
            src="/media/first-frames/03-control-flow.webp"
            alt=""
            fill
            sizes="100vw"
          />
          <div className="flow-frame-scrim" />
          <div className="flow-diagram">
            <svg viewBox="0 0 1200 700" preserveAspectRatio="none">
              <path className="flow-route flow-route-input" pathLength="1" d="M42 372 C186 318 302 430 444 364 S698 215 856 318 S1008 352 1160 266" />
              <path className="flow-route flow-route-control" pathLength="1" d="M444 364 C570 430 682 462 856 318" />
              <path className="flow-route flow-route-output" pathLength="1" d="M856 318 C968 262 1072 222 1160 266" />
              <path className="flow-route flow-route-feedback" pathLength="1" d="M1110 488 C888 620 610 620 476 456 C404 368 380 296 444 216" />
              <path className="flow-loss-line flow-loss-line-a" d="M286 410 L360 516" />
              <path className="flow-loss-line flow-loss-line-b" d="M506 380 L570 500" />
              <path className="flow-loss-line flow-loss-line-c" d="M702 300 L746 418" />
            </svg>
            <span className="flow-node flow-node-input">ВХОД</span>
            <span className="flow-node flow-node-control">КОНТРОЛЬ</span>
            <span className="flow-node flow-node-output">РЕЗУЛЬТАТ</span>
            <span className="flow-node flow-node-feedback">ОБРАТНАЯ СВЯЗЬ</span>
            <span className="flow-loss flow-loss-a">ПОТЕРЯ</span>
            <span className="flow-loss flow-loss-b">ЗАДЕРЖКА</span>
            <span className="flow-loss flow-loss-c">НЕТ СИГНАЛА</span>
            <span className="flow-proof">ТЕ ЖЕ ДАННЫЕ / БОЛЬШЕ ПОЛЕЗНОГО СИГНАЛА</span>
          </div>
          <p className="flow-frame-caption">ВХОД - КОНТРОЛЬ - ПОЛЕЗНЫЙ РЕЗУЛЬТАТ - ОБРАТНАЯ СВЯЗЬ</p>
        </div>

        <div className="flow-video-media" aria-hidden="true">
          <Image
            className="flow-video-poster"
            src="/media/first-frames/03-control-flow.webp"
            alt=""
            fill
            sizes="100vw"
          />
          <ViewportVideo
            className="flow-video"
            src="/media/video/03-control-flow.mp4"
          />
          <div className="flow-frame-scrim" />
          <p className="flow-frame-caption">ВХОД - КОНТРОЛЬ - ПОЛЕЗНЫЙ РЕЗУЛЬТАТ - ОБРАТНАЯ СВЯЗЬ</p>
        </div>

        <div className="flow-copy-stack" aria-live="off">
          <div className="flow-crawl">
            <div className="flow-statement">
              <p>НЕКОНТРОЛИРУЕМЫЙ ПОТОК</p>
              <h2 id="flow-title">Данные есть. Часть сигнала теряется.</h2>
            </div>
            <div className="flow-statement">
              <p>ПОЛЕ КОНТРОЛЯ</p>
              <h2>Те же данные. <em>Меньше потерь.</em></h2>
            </div>
            <div className="flow-statement">
              <p>ПОЛЕЗНЫЙ РЕЗУЛЬТАТ</p>
              <h2>Те же лиды. <em>Больше результата.</em></h2>
            </div>
            <div className="flow-statement">
              <p>ОБРАТНАЯ СВЯЗЬ</p>
              <h2>Дополнительная прибыль - результат управления.</h2>
            </div>
            <div className="flow-statement">
              <p>ПРЕИМУЩЕСТВО АДАПТАЦИИ</p>
              <h2>Канал можно скопировать. Систему решений - значительно сложнее.</h2>
            </div>
          </div>
        </div>

        <div className="flow-static-summary">
          <p>ДАННЫЕ - КОНТРОЛЬ - МЕНЬШЕ ПОТЕРЬ - ЦЕННОСТЬ - ОБРАТНАЯ СВЯЗЬ</p>
          <h2>Те же лиды. <em>Больше результата.</em></h2>
        </div>
      </div>
    </section>
  );
}

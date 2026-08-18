"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { processes } from "@/data/site";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const mapPositions = [
  { x: "18%", y: "28%" },
  { x: "37%", y: "18%" },
  { x: "58%", y: "24%" },
  { x: "78%", y: "38%" },
  { x: "73%", y: "65%" },
  { x: "52%", y: "77%" },
  { x: "29%", y: "69%" },
  { x: "14%", y: "50%" },
] as const;

export function SystemProcesses() {
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [activeProcess, setActiveProcess] = useState(-1);
  const reducedMotion = useReducedMotion();
  const systemState = activeProcess < 0 ? "system" : activeProcess === processes.length - 1 ? "connected" : "processes";

  useEffect(() => {
    const items = itemRefs.current.filter((item): item is HTMLLIElement => item !== null);
    if (reducedMotion || !items.length) return;

    let frame: number | null = null;
    const updateActiveProcess = () => {
      frame = null;
      const viewportCenter = window.innerHeight * 0.48;
      const visible = items.filter((item) => {
        const rect = item.getBoundingClientRect();
        return rect.bottom > window.innerHeight * 0.16 && rect.top < window.innerHeight * 0.84;
      });
      const closest = visible.sort((a, b) => {
        const aDistance = Math.abs(a.getBoundingClientRect().top + a.clientHeight / 2 - viewportCenter);
        const bDistance = Math.abs(b.getBoundingClientRect().top + b.clientHeight / 2 - viewportCenter);
        return aDistance - bDistance;
      })[0];
      const next = closest?.getAttribute("data-process-index");
      if (next !== null && next !== undefined) setActiveProcess(Number(next));
    };
    const scheduleUpdate = () => {
      if (frame === null) frame = window.requestAnimationFrame(updateActiveProcess);
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    scheduleUpdate();
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [reducedMotion]);

  return (
    <section
      className="system-processes-section process-scene"
      data-active-process={activeProcess >= 0 ? activeProcess : undefined}
      data-system-state={systemState}
      aria-labelledby="process-title"
    >
      <div className="container">
        <div className="system-processes-chrome">
          <SectionLabel index="02">Система - процессы</SectionLabel>
          <p>Одна системная линия / восемь взаимозависимых процессов</p>
        </div>

        <div className="system-processes-layout">
          <div className="system-processes-sticky">
            <div className="system-processes-visual" aria-hidden="true">
              <Image
                className="system-processes-image"
                src="/media/first-frames/02-processes-system-cross-v2.webp"
                alt=""
                fill
                sizes="(max-width: 768px) calc(100vw - 4rem), 46vw"
              />
              <div className="system-processes-map">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                  {processes.map((process, index) => {
                    const current = mapPositions[index];
                    const next = mapPositions[(index + 1) % processes.length];
                    return (
                      <path
                        data-complete={index <= activeProcess}
                        data-process-index={index}
                        d={`M ${current.x.replace("%", "")} ${current.y.replace("%", "")} L ${next.x.replace("%", "")} ${next.y.replace("%", "")}`}
                        key={process.id}
                      />
                    );
                  })}
                </svg>
                <span className="system-processes-core">СИСТЕМА</span>
                {processes.map((process, index) => (
                  <span
                    className="system-processes-node"
                    data-active={index === activeProcess}
                    data-complete={index <= activeProcess}
                    key={process.id}
                    style={{ "--node-x": mapPositions[index].x, "--node-y": mapPositions[index].y } as CSSProperties}
                  >
                    0{index + 1}
                  </span>
                ))}
              </div>
              <span className="system-processes-frame-caption">
                {systemState === "system" ? "СИСТЕМА / ГОТОВА К РАЗВЁРТЫВАНИЮ" : systemState === "connected" ? "СВЯЗАННАЯ РАБОТА / ЦИКЛ ОБРАТНОЙ СВЯЗИ" : `ПРОЦЕСС 0${activeProcess + 1} / СИГНАЛ В ДВИЖЕНИИ`}
              </span>
            </div>

            <div className="system-processes-thesis">
              <p>Не набор инструментов.</p>
              <h2 id="process-title">Одна работающая система:</h2>
            </div>
          </div>

          <ol className="system-processes-list">
            {processes.map((process, index) => (
              <li
                className="system-processes-item"
                data-active={index === activeProcess}
                data-featured={process.featured === true}
                data-process-index={index}
                key={process.id}
                ref={(element) => { itemRefs.current[index] = element; }}
              >
                <span className="system-processes-index">0{index + 1}</span>
                <div className="system-processes-content">
                  <h3>{process.name}</h3>
                  <p>{process.purpose}</p>
                  <div
                    className="system-processes-mechanics"
                    aria-label={`Механика: ${process.mechanics.join(", ")}`}
                  >
                    {process.mechanics.map((item) => <span key={item}>{item}</span>)}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

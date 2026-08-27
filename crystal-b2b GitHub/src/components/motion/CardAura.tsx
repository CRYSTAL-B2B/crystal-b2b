"use client";

import { useEffect } from "react";

/** Обычные карточки: прогресс считается по их собственному проходу через экран. */
const CARD_SELECTOR = [
  ".metric",
  ".case-row",
  ".competency-grid article",
  ".principles-grid article",
  ".contact-form",
].join(", ");

/** Закреплённые карточки. Сами они через экран не проходят - стоят на месте,
 *  пока мимо прокручивается соседняя колонка. Поэтому прогресс берётся
 *  по родительскому контейнеру: аура разгорается, пока идёт весь блок. */
const STICKY_SELECTOR = [".experience-sticky", ".system-processes-sticky"].join(", ");

const DESKTOP_MEDIA = "(min-width: 961px)";
const REDUCED_MOTION_MEDIA = "(prefers-reduced-motion: reduce)";

/** Доли прогресса, на которых аура разгорается и гаснет. Между ними - плато. */
const FADE_IN_UNTIL = 0.35;
const FADE_OUT_FROM = 0.65;

/** Насколько далеко свечение уезжает вдоль грани на пике волны, в пикселях. */
const WAVE_AMPLITUDE = 46;
/** Пикселей прокрутки на полный оборот волны. Меньше - волна чаще. */
const WAVE_WAVELENGTH = 520;
/** Сдвиг фазы между соседними карточками: волна бежит по ряду, а не бьётся в такт. */
const WAVE_STAGGER = 0.7;
/** Прокрутка за кадр, при которой волна выходит на полную амплитуду. */
const FULL_SPEED = 26;
/** Доля, на которую активность затухает за кадр после остановки прокрутки. */
const DECAY = 0.086;

/**
 * Прогресс прохода карточки через экран.
 *
 * 0 - нижний край карточки только отрывается от нижнего края экрана,
 * 1 - верхний край карточки коснулся верхнего края экрана.
 *
 * Формула работает и для карточек выше экрана: там знаменатель отрицательный,
 * но отношение остаётся тем же.
 */
function travelProgress(top: number, height: number, viewport: number) {
  const span = viewport - height;
  if (Math.abs(span) < 1) return 0;
  return (span - top) / span;
}

/** Трапеция: разгорается, держится на плато, гаснет. */
function intensity(progress: number) {
  if (progress <= 0 || progress >= 1) return 0;
  if (progress < FADE_IN_UNTIL) return progress / FADE_IN_UNTIL;
  if (progress > FADE_OUT_FROM) return (1 - progress) / (1 - FADE_OUT_FROM);
  return 1;
}

export function CardAura() {
  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_MEDIA);
    const reduced = window.matchMedia(REDUCED_MOTION_MEDIA);

    let observer: IntersectionObserver | undefined;
    let frame = 0;
    const onScreen = new Set<HTMLElement>();

    // Фаза копится от пройденного пути прокрутки, а не от времени: волна
    // привязана к движению, стоит прокрутке замереть - волна замирает тоже.
    let phase = 0;
    let lastScroll = window.scrollY;
    let activity = 0;

    const clear = (element: HTMLElement) => {
      element.style.removeProperty("--aura");
      element.style.removeProperty("--aura-y1");
      element.style.removeProperty("--aura-y2");
      delete element.dataset.aura;
      delete element.dataset.auraSticky;
    };

    const render = () => {
      const viewport = window.innerHeight;

      const scroll = window.scrollY;
      const delta = scroll - lastScroll;
      lastScroll = scroll;

      phase += delta / WAVE_WAVELENGTH;

      // Активность тянется к текущей скорости и плавно опадает на остановке.
      const speed = Math.min(1, Math.abs(delta) / FULL_SPEED);
      activity += (speed - activity) * (speed > activity ? 0.34 : DECAY);
      if (activity < 0.004) activity = 0;

      let index = 0;
      onScreen.forEach((element) => {
        // Для закреплённой карточки меряем не её саму, а контейнер, вдоль
        // которого она едет: сама-то она стоит на месте.
        const source = element.dataset.auraSticky === "on" ? element.parentElement : element;
        if (!source) return;
        const rect = source.getBoundingClientRect();
        const envelope = intensity(travelProgress(rect.top, rect.height, viewport));

        // Свечение скользит вдоль грани: две стороны идут в противофазе,
        // соседние карточки - со сдвигом, поэтому волна бежит по ряду.
        const angle = (phase + index * WAVE_STAGGER) * Math.PI * 2;
        const swing = WAVE_AMPLITUDE * activity * envelope;

        // Квантуем: пересчёт стилей на каждый кадр для двадцати карточек
        // не нужен, глазу разницы между соседними сотыми нет.
        element.style.setProperty("--aura", envelope.toFixed(2));
        element.style.setProperty("--aura-y1", `${(Math.sin(angle) * swing).toFixed(1)}px`);
        element.style.setProperty("--aura-y2", `${(Math.sin(angle + Math.PI) * swing).toFixed(1)}px`);
        index += 1;
      });

      // Волна улеглась и прокрутка стоит - засыпаем: крутить rAF ради
      // неизменной картинки незачем. Разбудит слушатель прокрутки.
      const settled = delta === 0 && activity === 0;
      frame = onScreen.size > 0 && !settled ? window.requestAnimationFrame(render) : 0;
    };

    const wake = () => {
      if (!frame && onScreen.size > 0) frame = window.requestAnimationFrame(render);
    };

    const start = () => {
      const cards = Array.from(document.querySelectorAll<HTMLElement>(CARD_SELECTOR));
      const sticky = Array.from(document.querySelectorAll<HTMLElement>(STICKY_SELECTOR));
      if (cards.length === 0 && sticky.length === 0) return;

      const stickySet = new Set(sticky);

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const element = entry.target as HTMLElement;
            if (entry.isIntersecting) {
              element.dataset.aura = "on";
              if (stickySet.has(element)) element.dataset.auraSticky = "on";
              onScreen.add(element);
            } else {
              onScreen.delete(element);
              clear(element);
            }
          });
          wake();
        },
        // Запас, чтобы карточка успела получить значение до появления в кадре.
        { rootMargin: "20% 0px 20% 0px" },
      );

      [...cards, ...sticky].forEach((card) => observer?.observe(card));
      window.addEventListener("scroll", wake, { passive: true });
    };

    const stop = () => {
      window.removeEventListener("scroll", wake);
      observer?.disconnect();
      observer = undefined;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      onScreen.forEach(clear);
      onScreen.clear();
    };

    const sync = () => {
      stop();
      if (desktop.matches && !reduced.matches) start();
    };

    sync();
    desktop.addEventListener("change", sync);
    reduced.addEventListener("change", sync);

    return () => {
      desktop.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return null;
}

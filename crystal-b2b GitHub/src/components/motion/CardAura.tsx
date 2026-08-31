"use client";

import { useEffect } from "react";

/** Карточки, у которых подсвечивается грань со стороны указателя. */
const CARD_SELECTOR = [
  ".metric",
  ".case-row",
  ".competency-grid article",
  ".principles-grid article",
  ".contact-section .contact-form",
  ".experience-sticky",
  ".system-processes-sticky",
].join(", ");

const REDUCED_MOTION_MEDIA = "(prefers-reduced-motion: reduce)";

/** На сколько пикселей вокруг карточки свет ещё дотягивается до указателя.
 *  На узком экране карточки идут во всю ширину столбиком, и широкий радиус
 *  зажигал бы сразу несколько соседей - лишние перерисовки без выигрыша. */
const REACH_DESKTOP = 280;
const REACH_NARROW = 110;
const NARROW_WIDTH = 960;
/** Резкость перехода между сторонами: больше - уже зона, где горят обе грани. */
const SIDE_SHARPNESS = 1.2;
/** Доля, на которую свечение подтягивается к цели за кадр. Меньше - мягче шлейф. */
const EASING = 0.16;
/** Ниже этого значения считаем, что свет погас, и останавливаем цикл. */
const EPSILON = 0.004;

function clamp01(value: number) {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/** Насколько должно измениться значение, чтобы его стоило записывать в стиль.
 *  Без этого порога каждая карточка на экране получала бы три записи в кадр
 *  даже стоя погашенной - на мобильном это утраивало пересчёт стилей. */
const WRITE_STEP = 0.015;
/** Замеры показали, что шаг записи на стоимость не влияет - она в перерисовке
 *  самих градиентов. Поэтому держим мелкий: движение пятна остаётся плавным. */
const WRITE_STEP_Y = 1.5;

type State = {
  glow: number;
  left: number;
  right: number;
  /** Последние записанные значения - чтобы не трогать стили впустую. */
  wg: number;
  wl: number;
  wr: number;
  wx: number;
  wy: number;
};

export function CardAura() {
  useEffect(() => {
    const reduced = window.matchMedia(REDUCED_MOTION_MEDIA);

    let observer: IntersectionObserver | undefined;
    let frame = 0;
    const onScreen = new Set<HTMLElement>();
    const state = new WeakMap<HTMLElement, State>();

    // Позиция указателя в координатах окна. Пока её нет - свет не горит нигде.
    let pointerX = 0;
    let pointerY = 0;
    let pointerActive = false;

    const clear = (element: HTMLElement) => {
      element.style.removeProperty("--aura");
      element.style.removeProperty("--aura-l");
      element.style.removeProperty("--aura-r");
      element.style.removeProperty("--px");
      element.style.removeProperty("--py");
      state.delete(element);
      delete element.dataset.aura;
    };

    const render = () => {
      let alive = false;
      const narrow = window.innerWidth < NARROW_WIDTH;
      const reach = narrow ? REACH_NARROW : REACH_DESKTOP;

      onScreen.forEach((element) => {
        const rect = element.getBoundingClientRect();
        let targetGlow = 0;
        let targetLeft = 0;
        let targetRight = 0;

        if (pointerActive) {
          // Расстояние от указателя до прямоугольника карточки: внутри - ноль.
          const gapX = Math.max(rect.left - pointerX, pointerX - rect.right, 0);
          const gapY = Math.max(rect.top - pointerY, pointerY - rect.bottom, 0);
          targetGlow = clamp01(1 - Math.hypot(gapX, gapY) / reach);

          if (targetGlow > 0) {
            // -1 - указатель у левой грани, +1 - у правой. Нужно только для
            // слабого наружного оттенка: кольцо само идёт за курсором.
            const side = ((pointerX - (rect.left + rect.width / 2)) / (rect.width / 2)) * SIDE_SHARPNESS;
            targetLeft = targetGlow * clamp01(0.5 - side / 2);
            targetRight = targetGlow * clamp01(0.5 + side / 2);
          }
        }

        // Записанные значения стартуют заведомо «неподходящими», чтобы первая
        // запись прошла в любом случае: сравнение с NaN всегда ложно и молча
        // отменило бы её навсегда.
        const current = state.get(element) ?? {
          glow: 0,
          left: 0,
          right: 0,
          wg: -1,
          wl: -1,
          wr: -1,
          wx: Number.POSITIVE_INFINITY,
          wy: Number.POSITIVE_INFINITY,
        };
        current.glow += (targetGlow - current.glow) * EASING;
        current.left += (targetLeft - current.left) * EASING;
        current.right += (targetRight - current.right) * EASING;
        if (current.glow < EPSILON) current.glow = 0;
        if (current.left < EPSILON) current.left = 0;
        if (current.right < EPSILON) current.right = 0;

        // Пишем только то, что заметно изменилось. Погашенная карточка
        // не трогает стили вовсе, пока указатель к ней не подойдёт.
        if (Math.abs(current.glow - current.wg) >= WRITE_STEP || (current.glow === 0) !== (current.wg === 0)) {
          current.wg = current.glow;
          element.style.setProperty("--aura", current.glow.toFixed(2));
        }
        if (Math.abs(current.left - current.wl) >= WRITE_STEP || (current.left === 0) !== (current.wl === 0)) {
          current.wl = current.left;
          element.style.setProperty("--aura-l", current.left.toFixed(2));
        }
        if (Math.abs(current.right - current.wr) >= WRITE_STEP || (current.right === 0) !== (current.wr === 0)) {
          current.wr = current.right;
          element.style.setProperty("--aura-r", current.right.toFixed(2));
        }

        // Точку пятна двигаем, только пока карточка вообще светится.
        if (current.glow > 0) {
          let localX = pointerX - rect.left;
          let localY = pointerY - rect.top;
          // На телефоне палец накрывает место касания, и свечение под ним
          // не видно. Поэтому пятно уходит на противоположную грань той же
          // карточки - зеркально относительно её центра.
          if (narrow) {
            localX = rect.width - localX;
            localY = rect.height - localY;
          }
          if (Math.abs(localX - current.wx) >= WRITE_STEP_Y) {
            current.wx = localX;
            element.style.setProperty("--px", `${localX.toFixed(0)}px`);
          }
          if (Math.abs(localY - current.wy) >= WRITE_STEP_Y) {
            current.wy = localY;
            element.style.setProperty("--py", `${localY.toFixed(0)}px`);
          }
        }
        state.set(element, current);

        if (current.glow > 0) alive = true;
      });

      // Свет везде погас и указателя рядом нет - засыпаем до следующего движения.
      frame = alive && onScreen.size > 0 ? window.requestAnimationFrame(render) : 0;
    };

    const wake = () => {
      if (!frame && onScreen.size > 0) frame = window.requestAnimationFrame(render);
    };

    const onPointer = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      pointerActive = true;
      wake();
    };

    const onTouch = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      pointerX = touch.clientX;
      pointerY = touch.clientY;
      pointerActive = true;
      wake();
    };

    const onPointerGone = () => {
      pointerActive = false;
      wake();
    };

    const start = () => {
      const cards = Array.from(document.querySelectorAll<HTMLElement>(CARD_SELECTOR));
      if (cards.length === 0) return;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const element = entry.target as HTMLElement;
            if (entry.isIntersecting) {
              element.dataset.aura = "on";
              onScreen.add(element);
            } else {
              onScreen.delete(element);
              clear(element);
            }
          });
          wake();
        },
        { rootMargin: "15% 0px 15% 0px" },
      );

      cards.forEach((card) => observer?.observe(card));

      window.addEventListener("pointermove", onPointer, { passive: true });
      // Палец на мобильных: во время прокрутки браузер обрывает pointermove,
      // а touchmove продолжает приходить - поэтому слушаем оба.
      window.addEventListener("touchmove", onTouch, { passive: true });
      window.addEventListener("pointerleave", onPointerGone, { passive: true });
      window.addEventListener("touchend", onPointerGone, { passive: true });
      window.addEventListener("touchcancel", onPointerGone, { passive: true });
    };

    const stop = () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("pointerleave", onPointerGone);
      window.removeEventListener("touchend", onPointerGone);
      window.removeEventListener("touchcancel", onPointerGone);
      observer?.disconnect();
      observer = undefined;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      onScreen.forEach(clear);
      onScreen.clear();
    };

    const sync = () => {
      stop();
      if (!reduced.matches) start();
    };

    sync();
    reduced.addEventListener("change", sync);

    return () => {
      reduced.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return null;
}

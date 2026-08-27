"use client";

import { useEffect } from "react";

/** Карточки, у которых подсвечивается грань со стороны указателя. */
const CARD_SELECTOR = [
  ".metric",
  ".case-row",
  ".competency-grid article",
  ".principles-grid article",
  ".contact-form",
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
const WRITE_STEP = 0.012;
const WRITE_STEP_Y = 0.8;

type State = { left: number; right: number; y: number; wl: number; wr: number; wy: number };

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
      element.style.removeProperty("--aura-l");
      element.style.removeProperty("--aura-r");
      element.style.removeProperty("--aura-y");
      state.delete(element);
      delete element.dataset.aura;
    };

    const render = () => {
      let alive = false;
      const reach = window.innerWidth < NARROW_WIDTH ? REACH_NARROW : REACH_DESKTOP;

      onScreen.forEach((element) => {
        const rect = element.getBoundingClientRect();
        let targetLeft = 0;
        let targetRight = 0;
        let targetY = 0;

        if (pointerActive) {
          // Расстояние от указателя до прямоугольника карточки: внутри - ноль.
          const gapX = Math.max(rect.left - pointerX, pointerX - rect.right, 0);
          const gapY = Math.max(rect.top - pointerY, pointerY - rect.bottom, 0);
          const proximity = clamp01(1 - Math.hypot(gapX, gapY) / reach);

          if (proximity > 0) {
            // -1 - указатель у левой грани, +1 - у правой.
            const side = ((pointerX - (rect.left + rect.width / 2)) / (rect.width / 2)) * SIDE_SHARPNESS;
            targetLeft = proximity * clamp01(0.5 - side / 2);
            targetRight = proximity * clamp01(0.5 + side / 2);
            // Свет держится на высоте указателя, но не убегает за пределы грани.
            const half = rect.height / 2;
            const offset = pointerY - (rect.top + half);
            targetY = Math.max(-half, Math.min(half, offset));
          }
        }

        // Записанные значения стартуют заведомо «неподходящими», чтобы первая
        // запись прошла в любом случае: сравнение с NaN всегда ложно и молча
        // отменило бы её навсегда.
        const current = state.get(element)
          ?? { left: 0, right: 0, y: 0, wl: -1, wr: -1, wy: Number.POSITIVE_INFINITY };
        current.left += (targetLeft - current.left) * EASING;
        current.right += (targetRight - current.right) * EASING;
        current.y += (targetY - current.y) * EASING;
        if (current.left < EPSILON) current.left = 0;
        if (current.right < EPSILON) current.right = 0;

        // Пишем только то, что заметно изменилось. Погашенная карточка
        // не трогает стили вовсе, пока указатель к ней не подойдёт.
        if (Math.abs(current.left - current.wl) >= WRITE_STEP || (current.left === 0) !== (current.wl === 0)) {
          current.wl = current.left;
          element.style.setProperty("--aura-l", current.left.toFixed(2));
        }
        if (Math.abs(current.right - current.wr) >= WRITE_STEP || (current.right === 0) !== (current.wr === 0)) {
          current.wr = current.right;
          element.style.setProperty("--aura-r", current.right.toFixed(2));
        }
        // Высоту двигаем, только пока с этой карточки вообще идёт свет.
        if ((current.left > 0 || current.right > 0) && Math.abs(current.y - current.wy) >= WRITE_STEP_Y) {
          current.wy = current.y;
          element.style.setProperty("--aura-y", `${current.y.toFixed(0)}px`);
        }
        state.set(element, current);

        if (current.left > 0 || current.right > 0) alive = true;
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

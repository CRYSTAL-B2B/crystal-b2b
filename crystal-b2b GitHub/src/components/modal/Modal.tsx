"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/** Сколько окон открыто сейчас: прокрутку страницы возвращаем на последнем. */
let openCount = 0;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Основа для идентификаторов заголовка и подписи - они уникальны на странице. */
  id: string;
  title: string;
  subtitle?: string;
  closeLabel: string;
  /** Календарю нужна вся ширина, форме - колонка поуже. */
  size?: "wide" | "narrow";
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Оболочка модального окна: рамка, заголовок, крестик и всё поведение -
 * Escape, клик по фону, блокировка прокрутки, ловушка фокуса и возврат фокуса.
 *
 * Выводится порталом в body: секции страницы создают свои контексты наложения
 * и обрезают содержимое, внутри них фиксированное окно вело бы себя неверно.
 */
export function Modal({
  open,
  onClose,
  id,
  title,
  subtitle,
  closeLabel,
  size = "wide",
  children,
  footer,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Куда вернуть фокус после закрытия - запоминаем то, что было активно.
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    returnFocusRef.current = document.activeElement as HTMLElement | null;
    openCount += 1;
    document.body.dataset.modalOpen = "true";

    const frame = window.requestAnimationFrame(() => closeRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      // Фокус не должен уходить за пределы окна, пока оно открыто.
      const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !dialogRef.current?.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      window.cancelAnimationFrame(frame);
      openCount = Math.max(0, openCount - 1);
      if (openCount === 0) delete document.body.dataset.modalOpen;
      returnFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  const titleId = `${id}-title`;
  const subtitleId = `${id}-subtitle`;

  return createPortal(
    <div
      className="modal-overlay"
      data-open={open ? "true" : undefined}
      hidden={!open}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="modal-dialog"
        data-size={size}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? subtitleId : undefined}
        ref={dialogRef}
      >
        <header className="modal-head">
          <div>
            <h2 id={titleId}>{title}</h2>
            {subtitle ? <p id={subtitleId}>{subtitle}</p> : null}
          </div>
          <button
            className="modal-close"
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            ref={closeRef}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </header>

        {children}

        {footer ? <footer className="modal-foot">{footer}</footer> : null}
      </div>
    </div>,
    document.body,
  );
}

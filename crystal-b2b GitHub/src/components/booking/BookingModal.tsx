"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { bookingCopy, type BookingUrls } from "@/data/booking";
import { trackEvent } from "@/lib/analytics";
import { BookingCalendar } from "@/components/booking/BookingCalendar";

interface BookingModalProps {
  open: boolean;
  urls: BookingUrls;
  onClose: () => void;
}

const FOCUSABLE = 'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

/**
 * Окно записи. Google живёт внутри, но рамка, заголовок и поведение - свои.
 *
 * Выводится порталом в body: секция контактов создаёт свой контекст наложения
 * и обрезает содержимое, внутри неё фиксированное окно вело бы себя неверно.
 */
export function BookingModal({ open, urls, onClose }: BookingModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Куда вернуть фокус после закрытия - запоминаем то, что было активно.
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    returnFocusRef.current = document.activeElement as HTMLElement | null;
    document.body.dataset.bookingOpen = "true";

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
      delete document.body.dataset.bookingOpen;
      returnFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="booking-overlay"
      data-open={open ? "true" : undefined}
      hidden={!open}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="booking-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        aria-describedby="booking-subtitle"
        ref={dialogRef}
      >
        <header className="booking-dialog-head">
          <div>
            <h2 id="booking-title">{bookingCopy.modalTitle}</h2>
            <p id="booking-subtitle">{bookingCopy.modalSubtitle}</p>
          </div>
          <button
            className="booking-close"
            type="button"
            onClick={onClose}
            aria-label={bookingCopy.close}
            ref={closeRef}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </header>

        <BookingCalendar embedUrl={urls.embed} />

        <footer className="booking-dialog-foot">
          <a
            href={urls.external}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("booking_external_open")}
          >
            {bookingCopy.external} <span aria-hidden="true">→</span>
          </a>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

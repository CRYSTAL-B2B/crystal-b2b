"use client";

import { useCallback, useState } from "react";
import { Arrow } from "@/components/ui/Arrow";
import { BookingModal } from "@/components/booking/BookingModal";
import { bookingCopy, getBookingUrls, type BookingPlacement } from "@/data/booking";
import { trackEvent } from "@/lib/analytics";

interface BookingTriggerProps {
  placement: BookingPlacement;
}

/**
 * Блок «быстрый следующий шаг»: кнопка записи и окно с календарём.
 *
 * Пока адрес расписания не задан, блок не отрисовывается - на сайте не должно
 * появляться кнопки, ведущей в никуда.
 */
export function BookingTrigger({ placement }: BookingTriggerProps) {
  const urls = getBookingUrls();
  const [open, setOpen] = useState(false);
  // Окно и iframe появляются в разметке только после первого открытия,
  // а дальше остаются - повторное открытие уже без загрузки.
  const [mounted, setMounted] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    trackEvent("booking_modal_close", { placement });
  }, [placement]);

  if (!urls) return null;

  return (
    <>
      <div className="booking-block">
        <p className="booking-eyebrow">{bookingCopy.eyebrow}</p>
        <button
          className="booking-action"
          type="button"
          onClick={() => {
            trackEvent("booking_cta_click", { placement });
            setMounted(true);
            setOpen(true);
            trackEvent("booking_modal_open", { placement });
          }}
        >
          <span className="booking-action-title">
            {bookingCopy.action} <Arrow />
          </span>
          <span className="booking-action-lead">{bookingCopy.lead}</span>
        </button>
        <p className="booking-meta">{bookingCopy.meta}</p>
      </div>

      {mounted ? <BookingModal open={open} urls={urls} onClose={close} /> : null}
    </>
  );
}

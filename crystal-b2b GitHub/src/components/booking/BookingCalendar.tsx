"use client";

import { useState } from "react";
import { bookingCopy } from "@/data/booking";
import { trackEvent } from "@/lib/analytics";

interface BookingCalendarProps {
  embedUrl: string;
}

/**
 * Календарь Google внутри окна записи.
 *
 * Монтируется только когда окно открыли впервые - на первичной загрузке
 * страницы iframe не создаётся вовсе. Дальше остаётся в разметке, чтобы
 * повторное открытие было мгновенным.
 */
export function BookingCalendar({ embedUrl }: BookingCalendarProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="booking-calendar" data-native-scroll="true">
      {loaded ? null : (
        <p className="booking-calendar-loading" role="status">
          {bookingCopy.loading}
        </p>
      )}
      <iframe
        className="booking-calendar-frame"
        src={embedUrl}
        title={bookingCopy.modalTitle}
        loading="lazy"
        onLoad={() => {
          setLoaded(true);
          trackEvent("booking_calendar_loaded");
        }}
      />
    </div>
  );
}

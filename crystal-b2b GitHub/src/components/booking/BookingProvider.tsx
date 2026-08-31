"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { BookingModal } from "@/components/booking/BookingModal";
import { getBookingUrls, type BookingPlacement } from "@/data/booking";
import { trackEvent } from "@/lib/analytics";

// Адрес расписания вшивается при сборке, поэтому считаем его один раз.
const bookingUrls = getBookingUrls();

interface BookingContextValue {
  /** Адрес расписания задан - кнопки записи можно показывать. */
  available: boolean;
  open: (placement: BookingPlacement) => void;
}

const BookingContext = createContext<BookingContextValue>({
  available: false,
  open: () => {},
});

export function useBooking() {
  return useContext(BookingContext);
}

/**
 * Одно окно записи на всю страницу: кнопок несколько, календарь - один.
 * Иначе каждая кнопка тянула бы собственный iframe Google.
 */
export function BookingProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  // Окно и iframe появляются в разметке только после первого открытия,
  // а дальше остаются - повторное открытие уже без загрузки.
  const [mounted, setMounted] = useState(false);
  const [placement, setPlacement] = useState<BookingPlacement>("contact");

  const openModal = useCallback((next: BookingPlacement) => {
    setPlacement(next);
    setMounted(true);
    setOpen(true);
    trackEvent("booking_cta_click", { placement: next });
    trackEvent("booking_modal_open", { placement: next });
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    trackEvent("booking_modal_close", { placement });
  }, [placement]);

  const value = useMemo(
    () => ({ available: Boolean(bookingUrls), open: openModal }),
    [openModal],
  );

  return (
    <BookingContext.Provider value={value}>
      {children}
      {mounted && bookingUrls ? (
        <BookingModal open={open} urls={bookingUrls} onClose={close} />
      ) : null}
    </BookingContext.Provider>
  );
}

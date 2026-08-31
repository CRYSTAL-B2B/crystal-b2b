"use client";

import type { ReactNode } from "react";
import { useBooking } from "@/components/booking/BookingProvider";
import { bookingCopy, type BookingPlacement } from "@/data/booking";

interface BookingButtonProps {
  placement: BookingPlacement;
  className: string;
  children?: ReactNode;
}

/**
 * Кнопка записи на созвон. Пока адрес расписания не задан, не отрисовывается:
 * кнопка, ведущая в никуда, хуже её отсутствия.
 */
export function BookingButton({ placement, className, children }: BookingButtonProps) {
  const { available, open } = useBooking();

  if (!available) return null;

  return (
    <button
      className={className}
      type="button"
      aria-haspopup="dialog"
      onClick={() => open(placement)}
    >
      {children ?? bookingCopy.action}
    </button>
  );
}

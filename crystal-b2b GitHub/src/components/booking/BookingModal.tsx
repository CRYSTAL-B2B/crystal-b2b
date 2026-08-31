"use client";

import { Modal } from "@/components/modal/Modal";
import { bookingCopy, type BookingUrls } from "@/data/booking";
import { trackEvent } from "@/lib/analytics";
import { BookingCalendar } from "@/components/booking/BookingCalendar";

interface BookingModalProps {
  open: boolean;
  urls: BookingUrls;
  onClose: () => void;
}

/** Окно записи: Google живёт внутри, но рамка и поведение - общие для сайта. */
export function BookingModal({ open, urls, onClose }: BookingModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      id="booking"
      title={bookingCopy.modalTitle}
      subtitle={bookingCopy.modalSubtitle}
      closeLabel={bookingCopy.close}
      footer={
        <a
          href={urls.external}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("booking_external_open")}
        >
          {bookingCopy.external} <span aria-hidden="true">→</span>
        </a>
      }
    >
      <BookingCalendar embedUrl={urls.embed} />
    </Modal>
  );
}

"use client";

import { ContactForm } from "@/components/sections/ContactForm";
import { BookingButton } from "@/components/booking/BookingButton";
import { useBooking } from "@/components/booking/BookingProvider";
import { bookingCopy } from "@/data/booking";
import { Arrow } from "@/components/ui/Arrow";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function Contact() {
  const { available: bookingAvailable } = useBooking();

  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <div className="container">
        <SectionLabel index="11">Контакт</SectionLabel>
        <div className="contact-layout">
          <div className="contact-copy">
            <h2 id="contact-title">Давайте определим курс.</h2>
            <p>Расскажите, где сейчас находится узкое место: спрос, лиды, CRM, продажи, аналитика или масштабирование.</p>
          </div>
          <ContactForm
            note={bookingAvailable ? bookingCopy.note : undefined}
            secondaryAction={
              <BookingButton placement="contact" className="button button-outline">
                {bookingCopy.action} <Arrow />
              </BookingButton>
            }
          />
        </div>
      </div>
    </section>
  );
}

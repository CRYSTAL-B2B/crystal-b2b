"use client";

import { useState } from "react";
import { ContactForm } from "@/components/sections/ContactForm";
import { QualifierPicker } from "@/components/contact/QualifierPicker";
import { BookingButton } from "@/components/booking/BookingButton";
import { useBooking } from "@/components/booking/BookingProvider";
import { bookingCopy } from "@/data/booking";
import { Arrow } from "@/components/ui/Arrow";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function Contact() {
  const [qualifiers, setQualifiers] = useState<string[]>([]);
  const { available: bookingAvailable } = useBooking();

  const toggleQualifier = (label: string) => {
    setQualifiers((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label],
    );
  };

  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <div className="container">
        <SectionLabel index="11">Контакт</SectionLabel>
        <div className="contact-layout">
          <div className="contact-copy">
            <h2 id="contact-title">Давайте определим курс.</h2>
            <p>Расскажите, где сейчас находится узкое место: спрос, лиды, CRM, продажи, аналитика или масштабирование.</p>
            <QualifierPicker selected={qualifiers} onToggle={toggleQualifier} />
          </div>
          <ContactForm
            qualifiers={qualifiers}
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

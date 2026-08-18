"use client";

import { useState } from "react";
import { ContactForm } from "@/components/sections/ContactForm";
import { SectionLabel } from "@/components/ui/SectionLabel";

const QUALIFIER_OPTIONS = [
  { id: "business-task", index: "01", label: "РЕШИТЬ БИЗНЕС-ЗАДАЧУ" },
  { id: "system", index: "02", label: "ПОСТРОИТЬ СИСТЕМУ" },
  { id: "result", index: "03", label: "ИЗМЕРИТЬ РЕЗУЛЬТАТ" },
] as const;

export function Contact() {
  const [qualifiers, setQualifiers] = useState<string[]>([]);

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
            <div
              className="contact-system-note"
              role="group"
              aria-label="Что важно в первую очередь - необязательно, можно выбрать несколько"
            >
              {QUALIFIER_OPTIONS.map((option) => (
                <label key={option.id} className="contact-system-note-item">
                  <input
                    type="checkbox"
                    checked={qualifiers.includes(option.label)}
                    onChange={() => toggleQualifier(option.label)}
                  />
                  <span>{option.index} / {option.label}</span>
                </label>
              ))}
            </div>
          </div>
          <ContactForm qualifiers={qualifiers} />
        </div>
      </div>
    </section>
  );
}

"use client";

import { QUALIFIER_GROUP_LABEL, QUALIFIER_OPTIONS } from "@/data/lead";

interface QualifierPickerProps {
  selected: string[];
  onToggle: (label: string) => void;
}

/**
 * Уточняющие галочки к заявке. Подпись обёрнута вокруг поля, а не связана
 * через идентификатор - поэтому две копии на странице друг другу не мешают.
 */
export function QualifierPicker({ selected, onToggle }: QualifierPickerProps) {
  return (
    <div className="contact-system-note" role="group" aria-label={QUALIFIER_GROUP_LABEL}>
      {QUALIFIER_OPTIONS.map((option) => (
        <label key={option.id} className="contact-system-note-item">
          <input
            type="checkbox"
            checked={selected.includes(option.label)}
            onChange={() => onToggle(option.label)}
          />
          <span>{option.index} / {option.label}</span>
        </label>
      ))}
    </div>
  );
}

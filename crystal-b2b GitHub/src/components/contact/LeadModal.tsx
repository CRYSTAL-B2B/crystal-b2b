"use client";

import { useState } from "react";
import { Modal } from "@/components/modal/Modal";
import { ContactForm } from "@/components/sections/ContactForm";
import { QualifierPicker } from "@/components/contact/QualifierPicker";
import { leadCopy, type LeadPlacement } from "@/data/lead";

interface LeadModalProps {
  open: boolean;
  placement: LeadPlacement;
  onClose: () => void;
}

/**
 * Заявка в окне - для кнопок, которые стоят далеко от секции контактов.
 * Форма та же, что внизу страницы, с теми же уточняющими галочками.
 */
export function LeadModal({ open, placement, onClose }: LeadModalProps) {
  const [qualifiers, setQualifiers] = useState<string[]>([]);

  const toggleQualifier = (label: string) => {
    setQualifiers((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label],
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      id="lead"
      title={leadCopy.modalTitle}
      closeLabel={leadCopy.close}
      size="narrow"
    >
      <div className="modal-body" data-native-scroll="true">
        <p className="modal-lead">{leadCopy.modalLead}</p>
        <QualifierPicker selected={qualifiers} onToggle={toggleQualifier} />
        <ContactForm qualifiers={qualifiers} formId="lead" placement={placement} />
      </div>
    </Modal>
  );
}

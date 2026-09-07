"use client";

import { Modal } from "@/components/modal/Modal";
import { ContactForm } from "@/components/sections/ContactForm";
import { leadCopy, type LeadPlacement } from "@/data/lead";

interface LeadModalProps {
  open: boolean;
  placement: LeadPlacement;
  onClose: () => void;
}

/** Заявка в окне - для кнопок, которые стоят далеко от секции контактов. */
export function LeadModal({ open, placement, onClose }: LeadModalProps) {
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
        <ContactForm formId="lead" placement={placement} />
      </div>
    </Modal>
  );
}

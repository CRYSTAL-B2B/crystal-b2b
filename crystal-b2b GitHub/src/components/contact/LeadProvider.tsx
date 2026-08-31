"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { LeadModal } from "@/components/contact/LeadModal";
import type { LeadPlacement } from "@/data/lead";
import { trackEvent } from "@/lib/analytics";

interface LeadContextValue {
  open: (placement: LeadPlacement) => void;
}

const LeadContext = createContext<LeadContextValue>({ open: () => {} });

export function useLead() {
  return useContext(LeadContext);
}

/**
 * Одна форма в окне на всю страницу. Копий быть не должно: у полей формы есть
 * идентификаторы, и вторая копия перехватывала бы подписи первой.
 */
export function LeadProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  // Окно появляется в разметке только после первого открытия и дальше остаётся:
  // введённый текст не должен пропадать при закрытии.
  const [mounted, setMounted] = useState(false);
  const [placement, setPlacement] = useState<LeadPlacement>("header");

  const openModal = useCallback((next: LeadPlacement) => {
    setPlacement(next);
    setMounted(true);
    setOpen(true);
    trackEvent("lead_modal_open", { placement: next });
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    trackEvent("lead_modal_close", { placement });
  }, [placement]);

  const value = useMemo(() => ({ open: openModal }), [openModal]);

  return (
    <LeadContext.Provider value={value}>
      {children}
      {mounted ? <LeadModal open={open} placement={placement} onClose={close} /> : null}
    </LeadContext.Provider>
  );
}

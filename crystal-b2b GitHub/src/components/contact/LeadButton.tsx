"use client";

import type { ReactNode } from "react";
import { useLead } from "@/components/contact/LeadProvider";
import { leadCopy, type LeadPlacement } from "@/data/lead";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";

interface LeadButtonProps {
  placement: LeadPlacement;
  className: string;
  /** Событие места, где стоит кнопка - в дополнение к событию открытия окна. */
  event?: AnalyticsEvent;
  /** Из какого кейса пришли - уходит в аналитику вместе с открытием. */
  caseId?: string;
  /** Что сделать перед открытием: например, закрыть окно, из которого нажали. */
  onSelect?: () => void;
  children?: ReactNode;
}

/** Кнопка «Обсудить задачу»: открывает форму в окне, не уводя со страницы. */
export function LeadButton({
  placement,
  className,
  event,
  caseId,
  onSelect,
  children,
}: LeadButtonProps) {
  const { open } = useLead();

  return (
    <button
      className={className}
      type="button"
      aria-haspopup="dialog"
      onClick={() => {
        if (event) trackEvent(event);
        onSelect?.();
        open(placement, caseId);
      }}
    >
      {children ?? leadCopy.action}
    </button>
  );
}

export type AnalyticsEvent =
  | "hero_cta_click"
  | "results_click"
  | "case_view"
  | "case_artifact_open"
  | "contact_start"
  | "contact_submit"
  | "contact_success"
  | "contact_error"
  | "navigation_contact"
  | "booking_cta_click"
  | "booking_modal_open"
  | "booking_modal_close"
  | "booking_calendar_loaded"
  | "booking_external_open"
  | "lead_modal_open"
  | "lead_modal_close"
  | "avatar_drag_start"
  | "avatar_drag_end"
  | "avatar_snap"
  | "avatar_bubble_view"
  | "avatar_bubble_complete"
  | "avatar_state_change";

type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    /** Метрика объявляет ym очередью сразу, до загрузки своего скрипта. */
    ym?: (id: number, action: string, ...args: unknown[]) => void;
  }
}

// Пусто на локальной машине - там счётчика нет, и цели никуда не уходят.
const metrikaId = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID);

export function trackEvent(event: AnalyticsEvent, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;

  const detail = { event, ...payload };
  window.dataLayer?.push(detail);
  window.dispatchEvent(new CustomEvent("site:analytics", { detail }));

  // Цели в Метрике заведены с теми же идентификаторами, что имена событий.
  // Шлём все события, а не только те, под которые заведены цели: незнакомый
  // идентификатор Метрика молча игнорирует, зато новую цель можно завести
  // в панели, не трогая код.
  if (metrikaId) window.ym?.(metrikaId, "reachGoal", event, payload);
}

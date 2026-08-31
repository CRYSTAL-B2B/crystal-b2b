export type AnalyticsEvent =
  | "hero_cta_click"
  | "results_click"
  | "case_view"
  | "case_expand"
  | "contact_start"
  | "contact_submit"
  | "contact_success"
  | "contact_error"
  | "resume_download"
  | "navigation_contact"
  | "booking_cta_click"
  | "booking_modal_open"
  | "booking_modal_close"
  | "booking_calendar_loaded"
  | "booking_external_open";

type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackEvent(event: AnalyticsEvent, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;

  const detail = { event, ...payload };
  window.dataLayer?.push(detail);
  window.dispatchEvent(new CustomEvent("site:analytics", { detail }));
}

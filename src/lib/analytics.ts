export type AnalyticsEvent =
  | "system_avatar_seen"
  | "system_avatar_target_hover"
  | "system_avatar_lock"
  | "system_avatar_scan"
  | "system_avatar_reveal"
  | "system_avatar_confirm"
  | "system_avatar_perf_degraded"
  | "hero_cta_click"
  | "results_click"
  | "case_view"
  | "case_expand"
  | "contact_start"
  | "contact_submit"
  | "contact_success"
  | "contact_error"
  | "resume_download"
  | "navigation_contact";

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

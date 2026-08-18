"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import type { AnalyticsEvent } from "@/lib/analytics";
import { trackEvent } from "@/lib/analytics";

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  event: AnalyticsEvent;
  eventPayload?: Record<string, string | number | boolean>;
  children: ReactNode;
};

export function TrackedLink({ event, eventPayload, children, onClick, ...props }: TrackedLinkProps) {
  return (
    <a
      {...props}
      onClick={(clickEvent) => {
        trackEvent(event, eventPayload);
        onClick?.(clickEvent);
      }}
    >
      {children}
    </a>
  );
}

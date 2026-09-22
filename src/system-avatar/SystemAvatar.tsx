"use client";

import { useEffect, useRef } from "react";
import "./styles/system-avatar.css";

export function SystemAvatar() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const abort = new AbortController();
    let cleanup: (() => void) | undefined;
    void import("./interactionController").then(async ({ mountSystemAvatar }) => {
      if (!abort.signal.aborted && root.current && canvas.current) {
        cleanup = await mountSystemAvatar(root.current, canvas.current, abort.signal);
        if (abort.signal.aborted) cleanup?.();
      }
    }).catch(() => { if (root.current) root.current.dataset.state = "DISABLED"; });
    return () => { abort.abort(); cleanup?.(); };
  }, []);
  return (
    <>
      <div ref={root} className="system-avatar" data-state="BOOT" data-mode="DISABLED" aria-hidden="true">
        <div className="system-avatar-portrait">
          <div className="system-avatar-base" />
          <div className="system-avatar-expression" />
          <div className="system-avatar-eye" data-eye-anchor>
            <i className="system-eye-glow" />
            <i className="system-eye-iris" />
            <i className="system-eye-reticle" />
          </div>
        </div>
        <div className="system-avatar-status"><i /><i /><i /></div>
      </div>
      <canvas ref={canvas} className="system-fx-canvas" aria-hidden="true" />
    </>
  );
}

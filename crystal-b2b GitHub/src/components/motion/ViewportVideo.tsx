"use client";

import { useEffect, useRef, useState } from "react";

type ViewportVideoProps = {
  className: string;
  src: string;
};

export function ViewportVideo({
  className,
  src,
}: ViewportVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canEnhance, setCanEnhance] = useState(false);
  const [inViewport, setInViewport] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateCapability = () => {
      const enabled = !motionQuery.matches;
      setCanEnhance(enabled);
      if (!enabled) {
        video.pause();
        setInViewport(false);
        setReady(false);
      }
    };

    updateCapability();
    motionQuery.addEventListener("change", updateCapability);

    return () => {
      motionQuery.removeEventListener("change", updateCapability);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !canEnhance || failed) return;

    if (!("IntersectionObserver" in window)) {
      const frame = requestAnimationFrame(() => {
        setInViewport(true);
        setShouldLoad(true);
      });
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInViewport(entry.isIntersecting);
        if (entry.isIntersecting) setShouldLoad(true);
      },
      { rootMargin: "700px 0px" },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [canEnhance, failed]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updatePlaybackForVisibility = () => {
      if (document.hidden) {
        video.pause();
      } else if (canEnhance && inViewport && shouldLoad && !failed) {
        void video.play().catch(() => undefined);
      }
    };

    document.addEventListener("visibilitychange", updatePlaybackForVisibility);
    return () => document.removeEventListener("visibilitychange", updatePlaybackForVisibility);
  }, [canEnhance, failed, inViewport, shouldLoad]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!canEnhance || !inViewport || !shouldLoad || failed || document.hidden) {
      video.pause();
      return;
    }

    const play = () => {
      void video.play().catch(() => undefined);
    };

    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      play();
      return;
    }

    video.addEventListener("canplay", play, { once: true });
    video.load();
    return () => video.removeEventListener("canplay", play);
  }, [canEnhance, failed, inViewport, shouldLoad]);

  return (
    <video
      ref={videoRef}
      aria-hidden="true"
      className={className}
      data-ready={ready && canEnhance ? "true" : "false"}
      disablePictureInPicture
      loop
      muted
      onError={() => {
        setFailed(true);
        setReady(false);
      }}
      onLoadedData={() => setReady(true)}
      playsInline
      preload="none"
      src={shouldLoad && canEnhance && !failed ? src : undefined}
      tabIndex={-1}
    />
  );
}

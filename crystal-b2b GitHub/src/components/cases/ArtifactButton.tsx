"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "@/components/modal/Modal";
import { Arrow } from "@/components/ui/Arrow";
import { trackEvent } from "@/lib/analytics";
import type { CaseArtifact } from "@/data/site";

interface ArtifactButtonProps {
  artifact: CaseArtifact;
  company: string;
  caseId: string;
}

/**
 * Кнопка «Посмотреть интерфейс» и окно с артефактом кейса.
 *
 * Артефакт бывает двух видов: живая страница продукта или набор экранов.
 * Оболочка окна и кнопка общие, различается только содержимое.
 */
export function ArtifactButton({ artifact, company, caseId }: ArtifactButtonProps) {
  const [open, setOpen] = useState(false);
  // Содержимое появляется в разметке только после первого открытия -
  // до него ни страница, ни снимки не грузятся вовсе.
  const [mounted, setMounted] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        className="button button-outline case-artifact-button"
        type="button"
        aria-haspopup="dialog"
        onClick={() => {
          trackEvent("case_artifact_open", { case_id: caseId });
          setMounted(true);
          setOpen(true);
        }}
      >
        Посмотреть интерфейс <Arrow />
      </button>

      {mounted ? (
        <Modal
          open={open}
          onClose={close}
          id={`artifact-${caseId}`}
          title={company}
          subtitle={artifact.caption}
          closeLabel="Закрыть"
        >
          {artifact.kind === "page" ? (
            <ArtifactPage artifact={artifact} title={`Интерфейс: ${company}`} />
          ) : (
            <ArtifactGallery artifact={artifact} />
          )}
        </Modal>
      ) : null}
    </>
  );
}

type PageArtifact = Extract<CaseArtifact, { kind: "page" }>;
type GalleryArtifact = Extract<CaseArtifact, { kind: "gallery" }>;

/**
 * Страница продукта свёрстана под широкий экран, а окно бывает любой ширины.
 * Показываем целиком в масштабе: уменьшается, но не ломается.
 *
 * Пустой sandbox - максимальный запрет: страница не выполняет код, никуда не
 * уводит по ссылкам и не скачивает скрипты. Некликабельность получается
 * устройством рамки, а не договорённостью.
 */
function ArtifactPage({ artifact, title }: { artifact: PageArtifact; title: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry.contentRect.width / artifact.width));
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, [artifact.width]);

  return (
    <div className="artifact-body" data-native-scroll="true">
      <div
        className="artifact-frame"
        ref={boxRef}
        style={scale ? { height: `${Math.round(artifact.height * scale)}px` } : undefined}
      >
        <iframe
          className="artifact-page"
          src={artifact.src}
          sandbox=""
          title={title}
          loading="lazy"
          style={{
            width: `${artifact.width}px`,
            height: `${artifact.height}px`,
            transform: `scale(${scale || 1})`,
          }}
        />
      </div>
    </div>
  );
}

/** Набор экранов: вертикальные идут парами, широкие - во всю ширину окна. */
function ArtifactGallery({ artifact }: { artifact: GalleryArtifact }) {
  return (
    <div className="artifact-body" data-native-scroll="true">
      <div className="artifact-gallery">
        {artifact.shots.map((shot) => (
          <figure
            key={shot.src}
            data-shape={shot.height > shot.width ? "portrait" : "landscape"}
          >
            <Image
              src={shot.src}
              alt={shot.label}
              width={shot.width}
              height={shot.height}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 45rem"
            />
            <figcaption>{shot.label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

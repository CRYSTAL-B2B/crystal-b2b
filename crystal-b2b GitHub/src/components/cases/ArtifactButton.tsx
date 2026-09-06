"use client";

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
 * Страница открывается в рамке с полным запретом скриптов: она не выполняет
 * код, не ходит в сеть и никуда не уводит по ссылкам. Это одновременно и
 * изоляция, и обещанная нерабочесть - и заодно экономия, скрипты вообще
 * не скачиваются.
 */
export function ArtifactButton({ artifact, company, caseId }: ArtifactButtonProps) {
  const [open, setOpen] = useState(false);
  // Рамка появляется в разметке только после первого открытия - до него
  // страница артефакта не грузится вовсе.
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
          <ArtifactFrame artifact={artifact} title={`Интерфейс: ${company}`} />
        </Modal>
      ) : null}
    </>
  );
}

interface ArtifactFrameProps {
  artifact: CaseArtifact;
  title: string;
}

/**
 * Артефакт свёрстан под широкий экран, а окно бывает любой ширины. Поэтому
 * страница показывается целиком в масштабе: уменьшается, но не ломается.
 */
function ArtifactFrame({ artifact, title }: ArtifactFrameProps) {
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
        {/* Пустой sandbox - максимальный запрет: ни скриптов, ни переходов. */}
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

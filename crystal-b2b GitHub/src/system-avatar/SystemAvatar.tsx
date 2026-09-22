"use client";
import Image from 'next/image';
import { useEffect, useRef, type CSSProperties } from 'react';
import { AVATAR_CONFIG as config } from './config';
import { AVATAR_QUESTION, AVATAR_TASKS } from './content';
import { useLead } from '@/components/contact/LeadProvider';
import './styles/system-avatar.css';
export function SystemAvatar() {
  const { open } = useLead();
  const root = useRef<HTMLDivElement>(null);
  const bubble = useRef<HTMLElement>(null);
  useEffect(() => {
    const abort = new AbortController(); let cleanup: (() => void) | undefined;
    void import('./floatingController').then(async ({mountFloatingAvatar}) => {
      if (!abort.signal.aborted && root.current && bubble.current) { cleanup = await mountFloatingAvatar(root.current, bubble.current, abort.signal, task => open('avatar', undefined, task)); if (abort.signal.aborted) cleanup(); }
    }).catch(() => { if (root.current) root.current.dataset.failed = 'true'; });
    return () => { abort.abort(); cleanup?.(); };
  }, [open]);
  return <><div ref={root} className="system-avatar" data-state="idle" data-interaction="idle" style={{'--avatar-desktop-size':`${config.avatar.desktopSize}px`,'--avatar-mobile-size':`${config.avatar.mobileSize}px`,'--avatar-z':config.avatar.zIndex,'--video-fade':`${config.video.crossfadeMs}ms`} as CSSProperties}>
    <span className="avatar-safe-probe" aria-hidden="true" />
    <button type="button" disabled className="avatar-handle" aria-label="Выбрать задачу" aria-describedby="avatar-keyboard-help" aria-controls="avatar-bubble" aria-expanded="false">
      <span className="avatar-portrait" aria-hidden="true">
        <Image className="avatar-poster" src={config.video.poster} alt="" width={720} height={720} draggable={false} onError={event => {
          const img=event.currentTarget;
          if(root.current?.dataset.imageFallback==='true'){img.style.visibility='hidden';return;}
          if(root.current)root.current.dataset.imageFallback='true';
          img.src=config.video.imageFallback;
        }} />
        <video className="avatar-video" muted playsInline preload="none" aria-hidden="true" tabIndex={-1} />
        <video className="avatar-video" muted playsInline preload="none" aria-hidden="true" tabIndex={-1} />
        <span className="avatar-frame" />
      </span>
    </button>
    <span className="sr-only" id="avatar-keyboard-help">Перетащите аватар. Стрелки прикрепляют его к краю экрана. Enter или пробел открывает выбор задачи; Escape закрывает.</span>
  </div>
  <aside ref={bubble} className="avatar-bubble" id="avatar-bubble" aria-labelledby="avatar-bubble-title" aria-hidden="true" inert style={{'--bubble-z':config.bubble.zIndex,'--bubble-scale-from':config.bubble.scaleFrom,'--bubble-blur':`${config.bubble.blurFrom}px`,'--bubble-translate':`${config.bubble.translateFrom}px`} as CSSProperties}>
    <div className="avatar-bubble-surface" data-native-scroll="true">
      <button className="avatar-bubble-close" type="button" aria-label="Закрыть описание">×</button>
      <p className="avatar-bubble-primary" id="avatar-bubble-title">{AVATAR_QUESTION}</p>
      <p className="avatar-bubble-secondary">Выберите задачу — откроется форма для обсуждения.</p>
      <ol className="avatar-question-options" hidden>
        {AVATAR_TASKS.map((task, index) => <li key={task}>
          <button type="button" className="avatar-task-option" data-avatar-task={index}>
            <span className="avatar-task-number" aria-hidden="true">{index + 1}.</span><span>{task}</span>
          </button>
        </li>)}
      </ol>
      <button type="button" className="avatar-context-cta" hidden>Обсудить задачу <span aria-hidden="true">↗</span></button>
    </div>
  </aside></>;
}

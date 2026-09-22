import { AVATAR_CONFIG as config } from './config';
import { AVATAR_QUESTION, AVATAR_TASKS, type AvatarContext } from './content';
import { placeBubble } from './bubblePlacement';
import type { createDockController } from './dockController';
import type { gsap as Gsap } from 'gsap';
import { trackEvent } from '@/lib/analytics';

export function createBubbleController(root: HTMLElement, bubble: HTMLElement, dock: ReturnType<typeof createDockController>, onVisibility: (visible: boolean) => void, onLead: (task?: string) => void) {
  const handle = root.querySelector<HTMLButtonElement>('.avatar-handle')!;
  const close = bubble.querySelector<HTMLButtonElement>('.avatar-bubble-close')!;
  const surface = bubble.querySelector<HTMLElement>('.avatar-bubble-surface')!;
  const primary = bubble.querySelector<HTMLElement>('.avatar-bubble-primary')!;
  const secondary = bubble.querySelector<HTMLElement>('.avatar-bubble-secondary')!;
  const choices = bubble.querySelector<HTMLElement>('.avatar-question-options')!;
  const cta = bubble.querySelector<HTMLButtonElement>('.avatar-context-cta')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let gsap: typeof Gsap | undefined, frame = 0, destroyed = false, blocked = false, visible = false;
  let mode: 'closed' | 'section' | 'question' = 'closed';
  let context: AvatarContext | null = null, dismissed: string | null = null;
  function place() {
    const b = dock.bounds, scale = dock.scale, availableHeight = b.bottom - b.top;
    const compact = dock.mobile || availableHeight / scale < config.avatar.shortViewportHeight;
    bubble.dataset.compact = String(compact);
    bubble.style.width = `${Math.min((compact ? config.bubble.mobileWidth : config.bubble.maxWidth) * scale, b.right - b.left) / scale}px`;
    surface.style.maxHeight = `${Math.min(availableHeight, Math.max(120 * scale, availableHeight - dock.size.height - config.bubble.gap * scale)) / scale}px`;
    const rect = bubble.getBoundingClientRect();
    const placement = placeBubble({ ...dock.position, ...dock.size }, { width: rect.width, height: rect.height }, b, dock.dock.edge, config.bubble.gap * scale);
    bubble.style.transform = `translate3d(${placement.x / scale}px,${placement.y / scale}px,0)`;
    bubble.dataset.placement = placement.side;
    bubble.style.setProperty('--tail-x', `${placement.tailX / scale}px`);
    bubble.style.setProperty('--tail-y', `${placement.tailY / scale}px`);
  }
  function render() {
    frame = 0; if (destroyed) return;
    const question = mode === 'question';
    // В режиме секции заголовок не показываем - он и так перед глазами на
    // экране. Плашка несёт только комментарий к нему и кнопку, поэтому
    // комментарий занимает место основного текста.
    primary.textContent = question ? AVATAR_QUESTION : context?.section.description ?? '';
    secondary.textContent = question ? 'Выберите задачу — откроется форма для обсуждения.' : '';
    secondary.hidden = !question;
    choices.hidden = !question; cta.hidden = mode !== 'section'; bubble.dataset.mode = mode;
    if (mode === 'section' && context) bubble.dataset.section = context.section.id;
    else delete bubble.dataset.section;
    const next = mode !== 'closed' && !blocked && !dock.moving;
    if (next) place();
    bubble.dataset.progress = next ? '1' : '0';
    bubble.inert = !next; bubble.setAttribute('aria-hidden', String(!next)); handle.setAttribute('aria-expanded', String(next));
    if (!next && bubble.contains(document.activeElement) && !blocked) handle.focus({ preventScroll: true });
    bubble.style.visibility = 'visible';
    if (next !== visible) {
      visible = next; onVisibility(next);
      if (gsap) gsap.to(bubble, { '--bubble-progress': next ? 1 : 0, duration: reduced.matches ? .12 : .2, ease: 'power2.out', overwrite: true });
      else bubble.style.setProperty('--bubble-progress', next ? '1' : '0');
      if (next) { trackEvent('avatar_bubble_view'); trackEvent('avatar_bubble_complete'); }
    }
  }
  function flush() { cancelAnimationFrame(frame); frame = 0; render(); }
  function schedule() { if (!frame && !destroyed) frame = requestAnimationFrame(render); }
  function closeBubble() { dismissed = context?.section.id ?? null; mode = 'closed'; flush(); }
  function escape(event: KeyboardEvent) { if (event.key === 'Escape' && visible) closeBubble(); }
  function choose(event: MouseEvent) {
    const button = event.target instanceof Element ? event.target.closest('button') : null;
    if (!button || !visible) return;
    const index = button.dataset.avatarTask;
    const task = index === undefined ? undefined : AVATAR_TASKS[Number(index)];
    if (button !== cta && (mode !== 'question' || !task)) return;
    closeBubble(); handle.focus({ preventScroll: true }); onLead(task);
  }
  const resize = new ResizeObserver(schedule); resize.observe(surface);
  document.addEventListener('keydown', escape); close.addEventListener('click', closeBubble); bubble.addEventListener('click', choose);
  reduced.addEventListener('change', schedule);
  void document.fonts.ready.then(() => { if (!destroyed) schedule(); });
  bubble.dataset.progress = '0';
  return {
    setSection(next: AvatarContext | null) {
      context = next;
      if (!next) dismissed = null;
      if (mode === 'question') return;
      mode = next && !blocked && dismissed !== next.section.id ? 'section' : 'closed';
      surface.scrollTop = 0; flush();
    },
    toggle() { if (mode === 'question' && visible) closeBubble(); else { mode = 'question'; surface.scrollTop = 0; flush(); } },
    layout: schedule, update: schedule,
    block(value: boolean) { blocked = value; if (value) { mode = 'closed'; dismissed = context?.section.id ?? null; } flush(); },
    setAnimator(animation: typeof Gsap) { gsap = animation; },
    destroy() {
      destroyed = true; cancelAnimationFrame(frame); gsap?.killTweensOf(bubble); resize.disconnect();
      document.removeEventListener('keydown', escape); close.removeEventListener('click', closeBubble); bubble.removeEventListener('click', choose); reduced.removeEventListener('change', schedule);
    },
  };
}

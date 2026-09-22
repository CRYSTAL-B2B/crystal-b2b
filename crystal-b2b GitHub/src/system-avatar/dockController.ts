import { AVATAR_CONFIG as config } from './config';
import { constrain, dockPosition, parseDock, snapDock, type Bounds, type Dock, type Edge, type Point } from './geometry';
import { trackEvent } from '@/lib/analytics';
import type { gsap as Gsap } from 'gsap';
export type Interaction = 'idle' | 'dragging' | 'snapping';
export function createDockController(root: HTMLElement, handle: HTMLButtonElement, callbacks: {
  layout(): void; interaction(state: Interaction): void; click(): void;
}) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia(`(max-width: ${config.avatar.mobileBreakpoint}px), (pointer: coarse)`);
  const probe = root.querySelector<HTMLElement>('.avatar-safe-probe')!;
  const header = document.querySelector<HTMLElement>('.site-header');
  // По умолчанию аватар держится правого края: на десктопе - вверху, на
  // мобильном - внизу. Слева в первом экране идёт текст, и с прежним левым
  // верхом аватар вставал прямо над ним.
  let dock: Dock = mobile.matches ? { edge: 'right', offset: 1 } : { edge: 'right', offset: 0 };
  try { dock = parseDock(localStorage.getItem(config.avatar.storageKey)) ?? dock; } catch { /* storage is optional */ }
  const position: Point = { x: 0, y: 0 };
  let target = { ...position }, size = { width: 0, height: 0 };
  let bounds: Bounds = { left: 0, top: 0, right: 0, bottom: 0 };
  let scale = 1, frame = 0, layoutFrame = 0, gsap: typeof Gsap | undefined;
  let interaction: Interaction = 'idle', destroyed = false, suppressClick = false;
  let gesture: { id: number; start: Point; origin: Point; dragged: boolean } | null = null;
  function render() {
    root.style.transform = `translate3d(${position.x / scale}px, ${position.y / scale}px, 0)`;
  }
  function state(next: Interaction) { interaction = next; root.dataset.interaction = next; callbacks.interaction(next); }
  function persist() { try { localStorage.setItem(config.avatar.storageKey, JSON.stringify(dock)); } catch { /* memory-only */ } }
  function stopTween() { gsap?.killTweensOf(position); }
  function measure() {
    layoutFrame = 0;
    scale = root.offsetWidth ? root.getBoundingClientRect().width / root.offsetWidth : 1;
    scale = Number.isFinite(scale) && scale > 0 ? scale : 1;
    const safe = getComputedStyle(probe), view = window.visualViewport;
    const left = view?.offsetLeft ?? 0, top = view?.offsetTop ?? 0;
    const width = view?.width ?? innerWidth, height = view?.height ?? innerHeight;
    const margin = (mobile.matches ? config.avatar.mobileMargin : config.avatar.desktopMargin) * scale;
    bounds = {
      left: left + margin + parseFloat(safe.paddingLeft) * scale,
      top: Math.max(top + parseFloat(safe.paddingTop) * scale, header?.getBoundingClientRect().bottom ?? 0) + margin,
      right: left + width - margin - parseFloat(safe.paddingRight) * scale,
      bottom: top + height - margin - parseFloat(safe.paddingBottom) * scale,
    };
    const availableHeight = Math.max(1, bounds.bottom - bounds.top);
    const preferred = (mobile.matches ? config.avatar.mobileSize : config.avatar.desktopSize) * scale;
    const limit = availableHeight / scale < config.avatar.shortViewportHeight ? availableHeight * config.avatar.shortViewportRatio : availableHeight;
    const side = Math.max(1, Math.min(preferred, bounds.right - bounds.left, limit));
    size = { width: side, height: side };
    root.style.setProperty('--avatar-size', `${side / scale}px`);
    root.dataset.mobile = String(mobile.matches);
    stopTween();
    Object.assign(position, gesture ? constrain(position, size, bounds) : dockPosition(dock, size, bounds));
    target = constrain(target, size, bounds);
    if (interaction === 'snapping') state('idle');
    render(); root.dataset.edge = dock.edge; root.dataset.ready = 'true'; handle.disabled = false;
    callbacks.layout();
  }
  function scheduleLayout() { if (!destroyed && !layoutFrame) layoutFrame = requestAnimationFrame(measure); }
  function completeSnap() {
    render(); state('idle'); persist(); callbacks.layout();
    trackEvent('avatar_snap', { edge: dock.edge });
  }
  function snap(edge?: Edge) {
    stopTween();
    dock = snapDock(position, size, bounds, edge); root.dataset.edge = dock.edge;
    const destination = dockPosition(dock, size, bounds);
    state('snapping');
    if (reduced.matches || !gsap) { Object.assign(position, destination); completeSnap(); }
    else gsap.to(position, { ...destination, duration: config.avatar.snapDuration, ease: 'power3.out', onUpdate: render, onComplete: completeSnap });
  }
  function move() {
    frame = 0;
    if (!gesture?.dragged) return;
    position.x += (target.x - position.x) * config.avatar.dragSmoothing;
    position.y += (target.y - position.y) * config.avatar.dragSmoothing;
    Object.assign(position, constrain(position, size, bounds)); render();
    if (Math.abs(target.x-position.x) + Math.abs(target.y-position.y) > .1) frame = requestAnimationFrame(move);
  }
  function pointerDown(event: PointerEvent) {
    if (gesture || !event.isPrimary || event.button !== 0 || root.inert) return;
    stopTween(); if (interaction === 'snapping') state('idle');
    gesture = { id: event.pointerId, start: { x: event.clientX, y: event.clientY }, origin: { ...position }, dragged: false };
    handle.setPointerCapture(event.pointerId);
  }
  function pointerMove(event: PointerEvent) {
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx = event.clientX - gesture.start.x, dy = event.clientY - gesture.start.y;
    if (!gesture.dragged && Math.hypot(dx,dy) >= config.avatar.dragThreshold) {
      gesture.dragged = true; state('dragging'); document.body.dataset.avatarDragging = 'true';
      trackEvent('avatar_drag_start');
    }
    if (!gesture.dragged) return;
    target = constrain({ x: gesture.origin.x + dx, y: gesture.origin.y + dy }, size, bounds);
    if (!frame) frame = requestAnimationFrame(move);
  }
  function release(event?: PointerEvent) {
    if (!gesture || (event && gesture.id !== event.pointerId)) return;
    const previous = gesture; gesture = null;
    cancelAnimationFrame(frame); frame = 0; delete document.body.dataset.avatarDragging;
    if (handle.hasPointerCapture(previous.id)) handle.releasePointerCapture(previous.id);
    if (previous.dragged) {
      suppressClick = true; Object.assign(position, target); render();
      trackEvent('avatar_drag_end'); snap();
    } else if (event?.type === 'pointercancel') suppressClick = true;
  }
  function click(event: MouseEvent) {
    if (suppressClick && event.detail !== 0) { suppressClick = false; return; }
    suppressClick = false; callbacks.click();
  }
  function key(event: KeyboardEvent) {
    const edges: Record<string, Edge> = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'top', ArrowDown: 'bottom' };
    if (edges[event.key]) { event.preventDefault(); release(); snap(edges[event.key]); }
  }
  const resize = new ResizeObserver(scheduleLayout); if (header) resize.observe(header);
  window.addEventListener('resize', scheduleLayout); window.visualViewport?.addEventListener('resize', scheduleLayout); window.visualViewport?.addEventListener('scroll', scheduleLayout);
  mobile.addEventListener('change', scheduleLayout);
  handle.addEventListener('pointerdown',pointerDown); handle.addEventListener('pointermove',pointerMove);
  handle.addEventListener('pointerup',release); handle.addEventListener('pointercancel',release); handle.addEventListener('lostpointercapture',release);
  handle.addEventListener('click',click); handle.addEventListener('keydown',key);
  measure();
  return {
    get position() { return { ...position }; }, get bounds() { return { ...bounds }; }, get size() { return { ...size }; },
    get suppressingClick() { return suppressClick; }, get dock() { return dock; }, get scale() { return scale; }, get moving() { return interaction !== 'idle'; }, get mobile() { return mobile.matches; },
    setAnimator(animation: typeof Gsap) { gsap = animation; }, remeasure: scheduleLayout,
    cancel() { release(); stopTween(); Object.assign(position,dockPosition(dock,size,bounds)); render(); state('idle'); },
    destroy() {
      destroyed = true;
      const captured=gesture?.id;gesture=null;
      if(captured!==undefined && handle.hasPointerCapture(captured))handle.releasePointerCapture(captured);
      stopTween(); cancelAnimationFrame(frame); cancelAnimationFrame(layoutFrame); delete document.body.dataset.avatarDragging;
      resize.disconnect(); window.removeEventListener('resize',scheduleLayout);
      window.visualViewport?.removeEventListener('resize',scheduleLayout); window.visualViewport?.removeEventListener('scroll',scheduleLayout); mobile.removeEventListener('change',scheduleLayout);
      handle.removeEventListener('pointerdown',pointerDown); handle.removeEventListener('pointermove',pointerMove); handle.removeEventListener('pointerup',release); handle.removeEventListener('pointercancel',release); handle.removeEventListener('lostpointercapture',release);
      handle.removeEventListener('click',click); handle.removeEventListener('keydown',key);
    },
  };
}

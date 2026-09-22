import { AvatarAssets } from "./avatarManifest";
import { SYSTEM_AVATAR_CONFIG as config, type PerformanceMode } from "./config";
import { AvatarStateMachine, VISUALS, type AvatarState } from "./stateMachine";
import { HeroTargetRegistry, type Point } from "./targetRegistry";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";
import type { BeamScene } from "./fx/BeamScene";
import type { gsap as Gsap } from "gsap";

export async function mountSystemAvatar(root: HTMLElement, canvas: HTMLCanvasElement, signal: AbortSignal) {
  const element = document.querySelector<HTMLElement>('[data-system-id="hero-profit"]');
  const anchor = root.querySelector<HTMLElement>('[data-eye-anchor]')!;
  const base = root.querySelector<HTMLElement>('.system-avatar-base')!;
  const expression = root.querySelector<HTMLElement>('.system-avatar-expression')!;
  if (!element) return () => {};
  const assets = new AvatarAssets(signal);
  const registry = new HeroTargetRegistry(element, anchor);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine) and (min-width: 769px)');
  let mode: PerformanceMode = !config.enabled ? 'DISABLED' : reduced.matches ? 'REDUCED' : fine.matches ? 'FULL' : 'LITE';
  let direction: 'track-left' | 'track-right' = 'track-right';
  let spriteRequest = 0;
  let destroyed = false;
  let beam: BeamScene | undefined;
  let runtime: Promise<void> | undefined;
  let runtimeGeneration = 0;
  let gsap: typeof Gsap | undefined;
  let timeline: gsap.core.Timeline | undefined;
  let dwell: ReturnType<typeof setTimeout> | undefined;
  let cooldown: ReturnType<typeof setTimeout> | undefined;
  let sleep: ReturnType<typeof setTimeout> | undefined;
  let pending = false;
  let epoch = 0;
  let eyeFrame = 0;
  let layoutFrame = 0;
  let near = false;
  let point: Point = { x: 0, y: 0 };
  let eyeX = 0, eyeY = 0;
  let fullScans = 0;
  try { fullScans = Number(sessionStorage.getItem('system-avatar:scans')) || 0; } catch { /* memory fallback */ }
  const event = (name: AnalyticsEvent) => trackEvent(name, { target: registry.id, mode });
  const resting = (): AvatarState => mode === 'REDUCED' ? 'REDUCED_MOTION' : mode === 'DISABLED' ? 'DISABLED' : mode === 'LITE' ? 'MOBILE_LITE' : 'IDLE';
  const stateEvents: Partial<Record<AvatarState, AnalyticsEvent>> = { LOCK: 'system_avatar_lock', SCAN: 'system_avatar_scan', REVEAL: 'system_avatar_reveal', CONFIRM: 'system_avatar_confirm' };
  const machine = new AvatarStateMachine(state => {
    root.dataset.state = state;
    const visual = VISUALS[state];
    root.style.setProperty('--eye-intensity', String(visual.intensity));
    root.style.setProperty('--eye-reticle', String(visual.reticle));
    const sprite = state === 'TRACK' ? direction : visual.sprite;
    root.dataset.sprite = sprite;
    const request = ++spriteRequest;
    if (!assets.masterOnly && mode !== 'DISABLED' && mode !== 'REDUCED') void assets.sprite(sprite).then(style => {
      if (style && request === spriteRequest && !destroyed && !signal.aborted) Object.assign(expression.style, style);
    });
    if (stateEvents[state]) event(stateEvents[state]!);
  });
  const header = document.querySelector<HTMLElement>('.site-header');
  function measure() {
    registry.dirty = true;
    if (header) root.style.setProperty('--system-header-bottom', `${header.getBoundingClientRect().bottom}px`);
    registry.measure();
  }
  function cancel() {
    epoch++;
    pending = false;
    clearTimeout(dwell); clearTimeout(cooldown);
    dwell = undefined;
    timeline?.kill(); timeline = undefined;
    beam?.clear();
    canvas.dataset.active = 'false';
    element!.style.setProperty('--system-reveal', '0');
    cancelAnimationFrame(eyeFrame); eyeFrame = 0;
    anchor.style.translate = '0px 0px'; eyeX = eyeY = 0;
    registry.dirty = true;
    machine.set(resting());
  }
  function disabled() {
    runtimeGeneration++;
    mode = 'DISABLED'; root.dataset.mode = mode;
    cancel(); beam?.dispose(); beam = undefined;
    expression.style.backgroundImage = 'none';
  }
  function degrade() {
    if (mode === 'FULL') { mode = 'LITE'; root.dataset.mode = mode; beam?.setMode(mode); event('system_avatar_perf_degraded'); }
    else { event('system_avatar_perf_degraded'); if (machine.busy) { reveal(); event('system_avatar_reveal'); } disabled(); }
  }
  async function prepare() {
    if (!runtime) {
      const generation = runtimeGeneration;
      runtime = Promise.all([import('./fx/BeamScene'), import('@/lib/gsap')]).then(async ([fx, animation]) => {
        const loaded = await animation.getGsap();
        if (destroyed || signal.aborted || generation !== runtimeGeneration || mode === 'DISABLED' || mode === 'REDUCED') return;
        gsap = loaded.gsap;
        beam = new fx.BeamScene(canvas, mode, disabled, degrade);
        root.dataset.renderer = 'ready';
      }).catch(() => { if (!destroyed && generation === runtimeGeneration) disabled(); });
    }
    await runtime;
  }
  const blocked = () => destroyed || signal.aborted || document.hidden || document.body.dataset.navigationOpen === 'true' || !!document.querySelector('dialog[open], [aria-modal="true"]') || !registry.visible;
  function reveal() {
    element!.dataset.systemScanned = 'true';
    element!.style.setProperty('--system-reveal', '1');
    registry.markScanned();
  }
  async function scan() {
    if (blocked() || pending || machine.busy || registry.scanned || fullScans >= config.maxFullScansPerSession || mode === 'DISABLED') return;
    if (mode === 'REDUCED') { reveal(); event('system_avatar_reveal'); return; }
    const attempt = epoch;
    pending = true;
    await prepare();
    if (attempt !== epoch || blocked() || !beam || !gsap || (mode === 'FULL' && !near)) { pending = false; return; }
    pending = false;
    cancelAnimationFrame(eyeFrame); eyeFrame = 0;
    // Freeze the damped pupil, then cache its true viewport center once.
    registry.dirty = true; registry.measure();
    beam.setPoints(registry.origin, registry.target);
    const values = { progress: 0, intensity: 0, opacity: 0, contact: 0, afterglow: 0 };
    const draw = () => { if (!blocked()) beam?.draw(values); else cancel(); };
    fullScans++;
    try { sessionStorage.setItem('system-avatar:scans', String(fullScans)); } catch { /* memory fallback */ }
    const t = config.timings;
    canvas.dataset.active = 'true';
    machine.set('LOCK');
    timeline = gsap.timeline({ onComplete: () => {
      beam?.clear(); canvas.dataset.active = 'false'; machine.set('COOLDOWN');
      cooldown = setTimeout(() => { machine.set(resting()); armSleep(); }, config.scanCooldownMs);
    } });
    timeline.to({}, { duration: t.lock })
      .call(() => machine.set('CHARGE'))
      .to(values, { duration: t.charge, intensity: .32, opacity: .5, onUpdate: draw })
      .call(() => machine.set('SCAN'))
      .to(values, { duration: t.scan, progress: 1, intensity: 1, opacity: .82, ease: 'power2.inOut', onUpdate: draw })
      .call(() => { machine.set('REVEAL'); reveal(); })
      .to(values, { duration: t.reveal, contact: 1, intensity: .6, afterglow: .4, onUpdate: draw })
      .call(() => machine.set('CONFIRM'))
      .to(values, { duration: t.confirm, opacity: 0, intensity: 0, contact: 0, afterglow: 0, onUpdate: draw })
      .to(element, { '--system-reveal': 0, duration: t.confirm, ease: 'power2.out' }, '<');
  }
  function armSleep() {
    clearTimeout(sleep);
    if (mode === 'FULL' || mode === 'LITE') sleep = setTimeout(() => { if (!machine.busy && !pending) machine.set('SLEEP'); }, config.sleepMs);
  }
  function moveEye() {
    eyeFrame = 0;
    if (mode !== 'FULL' || machine.busy || blocked()) return;
    const targetX = Math.max(-1, Math.min(1, (point.x - registry.origin.x) / innerWidth)) * 1.1;
    const targetY = Math.max(-1, Math.min(1, (point.y - registry.origin.y) / innerHeight)) * .8;
    eyeX += (targetX - eyeX) * .16; eyeY += (targetY - eyeY) * .16;
    anchor.style.translate = `${eyeX}px ${eyeY}px`;
    if (Math.abs(eyeX - targetX) + Math.abs(eyeY - targetY) > .02) eyeFrame = requestAnimationFrame(moveEye);
  }
  function pointer(event: PointerEvent) {
    if (mode !== 'FULL' || event.pointerType === 'touch' || blocked()) return;
    point = { x: event.clientX, y: event.clientY };
    armSleep();
    const wasNear = near; near = registry.nearby(point);
    if (machine.busy || pending) return;
    const nextDirection = point.x < registry.origin.x ? 'track-left' : 'track-right';
    if (direction !== nextDirection) { direction = nextDirection; if (machine.state === 'TRACK') machine.set('IDLE'); }
    machine.set('TRACK');
    if (!eyeFrame) eyeFrame = requestAnimationFrame(moveEye);
    if (near && !wasNear && !registry.scanned) {
      eventHover();
      dwell = setTimeout(() => { dwell = undefined; if (near && !blocked()) { machine.set('ALERT'); void scan(); } }, config.hoverDwellMs);
    } else if (!near) { clearTimeout(dwell); dwell = undefined; }
  }
  function eventHover() { event('system_avatar_target_hover'); }
  function leave() { if (mode !== 'FULL') return; near = false; clearTimeout(dwell); if (!machine.busy) { pending = false; epoch++; machine.set(resting()); } }
  function tap(event: PointerEvent) {
    armSleep();
    if (mode === 'LITE' && !blocked() && registry.nearby({ x: event.clientX, y: event.clientY })) { eventHover(); void scan(); }
    if (mode === 'REDUCED' && registry.nearby({ x: event.clientX, y: event.clientY })) { reveal(); }
  }
  function onLayout() {
    registry.dirty = true;
    if (!layoutFrame) layoutFrame = requestAnimationFrame(() => {
      layoutFrame = 0; measure();
      if (!registry.visible) { near = false; cancel(); }
      else if (machine.busy) beam?.setPoints(registry.origin, registry.target);
      beam?.resize();
    });
  }
  function onVisibility() { if (document.hidden) { cancel(); clearTimeout(sleep); machine.set(mode === 'DISABLED' ? 'DISABLED' : 'SLEEP'); } else { measure(); machine.set(resting()); armSleep(); } }
  function onMode() {
    runtimeGeneration++;
    cancel(); beam?.dispose(); beam = undefined; runtime = undefined;
    mode = !config.enabled || assets.masterOnly ? 'DISABLED' : reduced.matches ? 'REDUCED' : fine.matches ? 'FULL' : 'LITE';
    root.dataset.mode = mode; machine.set(resting()); near = false;
    expression.style.backgroundImage = 'none';
    if (mode === 'REDUCED') { element!.dataset.systemScanned = 'true'; }
    onLayout(); armSleep();
  }
  const style = await assets.initialize();
  if (signal.aborted) return () => {};
  if (style) Object.assign(base.style, style);
  root.dataset.master = String(assets.masterOnly);
  const eye = assets.masterOnly ? { x: .56, y: .428 } : assets.manifest.anchors.eye;
  root.style.setProperty('--eye-x', `${eye.x * 100}%`); root.style.setProperty('--eye-y', `${eye.y * 100}%`);
  mode = !config.enabled || assets.masterOnly ? 'DISABLED' : reduced.matches ? 'REDUCED' : fine.matches ? 'FULL' : 'LITE';
  root.dataset.mode = mode; root.dataset.assets = 'ready'; machine.set(resting());
  if (registry.scanned || mode === 'REDUCED') element.dataset.systemScanned = 'true';
  measure();
  const resize = new ResizeObserver(onLayout); resize.observe(element); resize.observe(root); if (header) resize.observe(header);
  const intersection = new IntersectionObserver(entries => { if (!entries[0].isIntersecting) { near = false; cancel(); } }, { threshold: 0 }); intersection.observe(element);
  const navigation = new MutationObserver(() => { if (document.body.dataset.navigationOpen === 'true' || document.querySelector('dialog[open], [aria-modal="true"]')) cancel(); });
  navigation.observe(document.body, { attributes: true, attributeFilter: ['data-navigation-open'] });
  const typography = new MutationObserver(onLayout); typography.observe(document.documentElement, { attributes: true, attributeFilter: ['data-typography'] });
  window.addEventListener('pointermove', pointer, { passive: true });
  window.addEventListener('pointerdown', tap, { passive: true });
  document.documentElement.addEventListener('pointerleave', leave);
  window.addEventListener('scroll', onLayout, { passive: true }); window.addEventListener('resize', onLayout);
  window.visualViewport?.addEventListener('resize', onLayout); window.visualViewport?.addEventListener('scroll', onLayout);
  document.addEventListener('visibilitychange', onVisibility);
  reduced.addEventListener('change', onMode); fine.addEventListener('change', onMode);
  void document.fonts.ready.then(() => { if (!destroyed) onLayout(); });
  const idleLoad = setTimeout(() => { if (!destroyed && config.atlasEnabled && mode !== 'DISABLED' && mode !== 'REDUCED') void assets.preloadAtlas(); }, 1200);
  event('system_avatar_seen'); armSleep();
  return () => {
    destroyed = true; cancel(); ++spriteRequest;
    clearTimeout(sleep); clearTimeout(idleLoad); cancelAnimationFrame(layoutFrame);
    beam?.dispose(); resize.disconnect(); intersection.disconnect(); navigation.disconnect(); typography.disconnect();
    window.removeEventListener('pointermove', pointer); window.removeEventListener('pointerdown', tap); document.documentElement.removeEventListener('pointerleave', leave);
    window.removeEventListener('scroll', onLayout); window.removeEventListener('resize', onLayout);
    window.visualViewport?.removeEventListener('resize', onLayout); window.visualViewport?.removeEventListener('scroll', onLayout);
    document.removeEventListener('visibilitychange', onVisibility); reduced.removeEventListener('change', onMode); fine.removeEventListener('change', onMode);
  };
}

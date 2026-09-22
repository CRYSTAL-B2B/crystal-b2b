import { AVATAR_CONFIG as config } from './config';
import { AVATAR_SECTIONS, type AvatarContext } from './content';

/** Only the six explicitly supported screens can open contextual cards. */
export function observeHeadings(root: HTMLElement, onContext: (context: AvatarContext | null) => void) {
  const sections = AVATAR_SECTIONS.flatMap(section => {
    const element = document.querySelector<HTMLElement>(`main ${section.selector}`);
    return element ? [{ section, element }] : [];
  });
  const candidates = new Set<HTMLElement>();
  let active: HTMLElement | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let destroyed = false;
  let observer: IntersectionObserver;
  function update() {
    const center = innerHeight * .4;
    const target = sections.find(({ element }) => {
      if (!candidates.has(element)) return false;
      const rect = element.getBoundingClientRect();
      return rect.top <= center + 1 && rect.bottom > center;
    });
    if ((target?.element ?? null) === active) return;
    clearTimeout(timer);
    active = target?.element ?? null;
    onContext(null);
    if (target) timer = setTimeout(() => {
      if (destroyed || active !== target.element || root.inert || document.hidden) return;
      onContext({ section: target.section });
    }, config.headings.dwellMs);
  }
  function observe() {
    observer?.disconnect(); candidates.clear(); active = null; clearTimeout(timer); onContext(null);
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        if (entry.isIntersecting) candidates.add(element); else candidates.delete(element);
      }
      update();
    }, { rootMargin: `-${innerHeight * .4}px 0px -${innerHeight * .6 - 1}px 0px`, threshold: 0 });
    sections.forEach(({ element }) => observer.observe(element));
  }
  observe(); window.addEventListener('resize', observe);
  return () => { destroyed = true; clearTimeout(timer); observer.disconnect(); window.removeEventListener('resize', observe); };
}

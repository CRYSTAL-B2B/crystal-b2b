export const AVATAR_CONFIG = {
  avatar: {
    desktopSize: 282, mobileSize: 147, mobileBreakpoint: 768,
    desktopMargin: 20, mobileMargin: 14, dragThreshold: 5,
    dragSmoothing: .72, snapDuration: .48, minStateDuration: 350,
    // v2: дефолтный угол сменился с левого верхнего на правый - старые
    // сохранённые позиции сбрасываем, иначе новый дефолт не увидит никто,
    // кто уже открывал страницу.
    storageKey: 'b2b:avatar:dock:v2', zIndex: 40,
    shortViewportHeight: 420, shortViewportRatio: .38,
  },
  bubble: {
    maxWidth: 430, mobileWidth: 310, gap: 18, zIndex: 41,
    scaleFrom: .97, blurFrom: 10, translateFrom: 18,
    revealStart: .60, revealEnd: .40, exitStart: .55, exitEnd: .15,
    dismissReset: .02, interactiveAt: .12, seenAt: .2, completeAt: .95,
  },
  headings: { dwellMs: 250, cooldownMs: 3500, bubbleDurationMs: 3200 },
  video: {
    base: '/system-avatar/motion/', manifest: 'avatar-calm-motion-manifest.json',
    poster: '/system-avatar/motion/posters/avatar-idle.webp',
    imageFallback: '/system-avatar/source/avatar-master.png',
    minQuality: 8, minMouth: 9, minStability: 8,
    crossfadeMs: 160, loadTimeoutMs: 5000, preloadDelayMs: 1200,
    hoverDwellMs: 400, reactionCooldownMs: 3500, droppedFrameLimit: .35,
    qualitySampleFrames: 120, qualityBadSamples: 2,
  },
} as const;
export const AVATAR_COPY = {
  primary: 'Маркетинг – это управляемая инвестиция в рост прибыли',
  secondary: 'Строю B2B-маркетинг от спроса до выручки.',
  supporting: 'Стратегия, лидогенерация, CRM, аналитика и автоматизация в одной системе.',
};

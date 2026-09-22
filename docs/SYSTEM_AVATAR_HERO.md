# System Avatar v2 — Hero vertical slice

> Исторический отчёт первой интеграции в устаревшее VPS-приложение.
> Актуальная интеграция и QA: [отчёт релиза](../crystal-b2b%20GitHub/docs/SYSTEM_AVATAR_HERO.md).
> На 3011 раздаётся `crystal-b2b GitHub/out`, а не `.next-avatar`. Переключение
> на старое приложение было ошибкой и исправлено 2026-09-20.

## Аудит до изменений — 2026-09-16

Прочитаны 00–18 v2, MANIFEST, README ассетов, project AGENTS, production pack,
Hero scene-spec, PLANS и workspace wiki. Граф MCP пуст; discovery выполнен по файлам.

- Next.js 16.3.1 App Router / React 19 / strict TypeScript / Turbopack.
- Custom global CSS, typography A/B/C, breakpoints 1180/960/768/390.
- GSAP/ScrollTrigger lazy singleton, Hero CSS breath + pointer parallax, ViewportVideo.
- DesktopSmoothScroll: wheel inertia через native window.scrollTo от 961px;
  native mobile/reduced motion. Координаты viewport, без transform scroll wrapper.
- Hero: section#top, SSR h1, supporting copy, два CTA, video/poster, micro proof.
- Остальные секции: bridges, processes, flow, economics, connected system, proof,
  expertise/experience/principles, lighthouse, contact. Не регистрируются как targets.
- Z: scene-local 0–10, header/menu 50, typography 90, skip link 1000.
- Reduced: CSS + hook + static scene summaries, video без src.
- Analytics: provider-agnostic trackEvent / dataLayer / site:analytics; optional Metrika.
- Assets: next/image priority poster, viewport videos; avatar pack ещё не подключён.
- Git baseline: untracked SEOGEO, assets, spec pack, nested repo CRO doc. Сохранены.

## Архитектурный план и риски

Hero.tsx: новый H1, supporting headline/copy и единственный semantic target.
page.tsx: sibling SystemAvatar вне isolated Hero stacking context.
src/system-avatar: manifest/atlas loader, единая state machine, geometry registry,
interaction lifecycle, lazy Three.js shader и локальные CSS.
public/system-avatar: предоставленный pack, без перегенерации исходников.
analytics, package/lock, tests, PLANS и wiki: integration/QA.

Риски: длинный H1, наложение header, устаревшие rect при inertia/zoom,
asset decode races, WebGL/context loss, лишние RAF, production .next conflict.
Сборка и preview используют отдельный distDir через CRYSTAL_BUILD_DIR.

## Asset audit

Реальные states — 512×512, atlas 2560×1024 (5×2). PNG около 2.5 MiB.
Master имеет другую рамку/crop. State scan содержит запечённую горизонтальную
линию, charge — reticle. Полная замена кадров нарушила бы запрет baked FX и
стабильность головы. Поэтому runtime сохраняет idle как identity plate и
композитит только локальную мимику из atlas, исключая киберглаз/луч. Eye/reticle
рендерятся отдельно. Master — последний статичный fallback, без state patches.
Калибровка state eye: x=.631, y=.465; master: x=.56, y=.428.

## Проверка статического этапа

До реализации шейдера проверены desktop 1440×900 и mobile 390×844:
idle plate, manifest, реальный eye anchor и target rect. Снимки этапа в /tmp.
Затем временный BeamScene заменён GLSL/Three renderer.

## Реализация

Один lazy Three.js 0.186 WebGL2 renderer, orthographic screen-space quad.
SSR DOM не растеризуется. GSAP управляет dwell/choreography/reveal; ScrollTrigger
существующих сцен не меняется. Базовый портрет и локальные expression patches
используют готовый atlas; отдельный глаз имеет iris/glow/reticle. Static frame
никогда не меняет размеры. Из-за opaque портрета FX находится на z=41 над
аватаром z=40, ниже header/menu=50: начало луча видно прямо в глазу.

Только hero-profit (hover/proximity desktop, tap lite). Dwell 220ms,
LOCK 160ms, CHARGE 260ms, SCAN 480ms, REVEAL 280ms, CONFIRM 400ms,
COOLDOWN 4500ms. Одна завершённая активация Hero за sessionStorage session;
общий budget 6 full-scan attempts, fallback на память при запрете storage.
Без звука; audio optional phase пропущена.

State map: BOOT/IDLE→idle; TRACK→track-left/right; ALERT→alert; LOCK→lock;
CHARGE→charge; SCAN/REVEAL→scan; CONFIRM→confirm; COOLDOWN→cooldown;
SLEEP→sleep; MOBILE_LITE/REDUCED_MOTION/DISABLED→idle.

Uniforms: uResolution, uOrigin, uTarget, uTime, uIntensity, uProgress, uWidth,
uNoiseScale, uNoiseSpeed, uFlicker, uOpacity, uContactIntensity, uChromaticShift,
uAfterglow, uLite. Selective bloom реализован аналитическими Gaussian-профилями
только emissive beam; DOM и фон не захватываются и не размываются.

FULL: DPR≤1.75, noise/wedge/fringe/bloom. LITE: DPR≤1.25, упрощённый луч и
contact, без tracking. REDUCED: статичный accent, без инициализации WebGL.
DISABLED: статичный портрет и исходный читаемый DOM. Renderer рисует только
GSAP-sequence, idle RAF отсутствует. Tracking RAF заканчивается после damping.
Rect cache инвалидируется ResizeObserver/scroll/visualViewport/fonts/typography.
При выходе цели из viewport, hidden tab или menu scan отменяется; ресурсы,
listeners, observers и timers освобождаются при unmount.

Asset fallback: atlas→PNG, missing state→idle→master; invalid manifest→local
safe manifest. Если idle отсутствует, master становится стабильным статичным
портретом, чтобы fallback не менял crop/identity при следующем состоянии.
Исходный supplied pack не изменён; калибровка хранится в public manifest.

Tuning: config.ts (тайминги/DPR/dwell/budget), VISUALS (eye/reticle),
beamShader.ts (optical kernels), system-avatar.css (size/placement/patch masks).
Рекомендация для будущего asset pass: подготовить identity-locked чистые
state faces без baked eye FX. Текущий Hero компенсирует эти дефекты композитингом.

## Acceptance gate — область проверки

Hero-only implementation соответствует группам `12_ACCEPTANCE_CRITERIA.md`:
- Hero: H1/supporting headline/copy и один semantic span.
- Asset system: master/manifest/atlas/state fallback и фиксированная геометрия.
- Avatar: все состояния mapped; локальные expression patches сохраняют голову.
- Eye: отдельные iris/glow/reticle, DOM anchor, damped desktop tracking.
- FX: transparent WebGL2 canvas, optical layers, traveling beam, contact/afterglow.
- Reveal: существующий HTML, SSR и no-JS контент, CTA/keyboard не блокируются.
- Performance: bounded DPR, cached rects, idle/no-hidden rendering,
  FULL→LITE→DISABLED при sustained slow frames; LITE сохраняет static reveal.
- UX: один Hero scan за session, cooldown, общий budget≤6, звук отсутствует.

У acceptance есть две границы: программные/локальные визуальные проверки и
проверка на реальном устройстве. Headless WebKit не выдаётся за Safari на iPhone,
а Chromium — за установленный Edge. Следующие targets остаются закрытыми до
проверки пользователем Hero в целевых браузерах/на устройствах.

## Файлы и воспроизведение

Изменены Hero.tsx, page.tsx, lib/analytics.ts; добавлен src/system-avatar/ и
public/system-avatar/. Интеграционные файлы: package.json/lock, next.config.ts,
.gitignore, tsconfig.json, eslint.config.mjs. QA: avatarManifest.test.ts,
system-avatar.spec.ts, актуализированные Hero/reduced assertions site.spec.ts,
playwright.avatar.config.ts, scripts/verify-avatar-visuals.mjs.

```sh
CRYSTAL_BUILD_DIR=.next-avatar npm run build
CRYSTAL_BUILD_DIR=.next-avatar npm run start -- --hostname 127.0.0.1 -p 3016
npx playwright test --config playwright.avatar.config.ts --project chromium
npx playwright test --config playwright.avatar.config.ts --project webkit
node scripts/verify-avatar-visuals.mjs
```

Asset copies совпадают с supplied PNG побайтно (10 состояний); atlas 10 cells,
2560×1024, 2 535 974 bytes. Public manifest содержит только поправку anchor.
Snapshot/report directory: `output/avatar-qa/` (ignored QA artifacts).

## Локальная приёмка — 2026-09-20

- Production build `.next-avatar`: PASS (финальный lifecycle fix включён).
- TypeScript: PASS. ESLint: 0 errors; прежний warning Metrika `<img>` в layout.
- Vitest: 15/15, включая manifest validation/atlas bounds/state contract/frame budget.
- Regression site suite: 28/28 (27 прошли общим прогоном; устаревшая строка
  reduced-motion assertion исправлена, затем отдельный сценарий прошёл).
- Девять viewport от 360 до 1920, desktop/mobile WCAG: без новых нарушений.
- Исходная проверка формы с внешним CAPTCHA/delivery не запускалась. UI сохранения
  полей после 503 проверен с mock response, реальная заявка не отправлялась.
- Layout zoom 125%/150%: без overflow; это CSS-layout проверка, не физическое
  управление browser zoom на отдельной ОС.
- Firefox Linux: подтверждён DISABLED fallback без runtime ошибок; WebGL2 в
  используемом headless Firefox не предоставляется.
- Safari macOS, Edge, физические iOS/Android и hardware FPS пока не проверены.
  Chrome/Android и Safari/iOS покрыты здесь Chromium/WebKit + touch emulation,
  что не заменяет проверку на реальных устройствах.

Все картинки исходного pack сохранены, новые изображения не генерировались.
Production deployment не выполнялся. Local preview: http://127.0.0.1:3016.

### Hero browser matrix

Полный прогон 2026-09-20: **43/43 PASS** — Chromium 22, WebKit 21.
Покрыты choreography/geometry/dwell/cooldown/session memory, atlas/no-layout-shift,
missing/corrupt/slow assets, late decode race, preference change during manifest
loading, unavailable WebGL, shader failure, context loss, visibility, resize,
backscroll, live reduced motion, mobile tap/menu/focus и no-JS.
Shader compile failure инъекция выполняется в Chromium; остальные сценарии —
в обоих движках.

Последний polish убирает временный text glow/underline за CONFIRM (400ms).
После него остаётся только спокойный светлый цвет HTML-фразы, без постоянного
неонового ореола. Повторная проверка полного цикла/затухания: **2/2 PASS** (Chromium/WebKit),
после последней production-сборки.

Снимки: [desktop](../output/avatar-qa/desktop-idle.png),
[scan](../output/avatar-qa/desktop-scan.png),
[reveal](../output/avatar-qa/desktop-reveal.png),
[mobile](../output/avatar-qa/mobile.png).

## Публичный preview — 2026-09-20

По запросу пользователя сборка запущена на http://185.161.70.46:3011/.
`crystal-b2b.service` использует `.next-avatar` через systemd drop-in
`/etc/systemd/system/crystal-b2b.service.d/hero-avatar.conf`; автозапуск включён.
Прежняя конфигурация сохранена. GitHub Pages и nginx не изменялись.
Проверены HTTP 200, новый H1, одна scan target, отсутствие page errors и
горизонтального overflow в Chromium. Снимок: `output/avatar-qa/public-3011-desktop.png`.

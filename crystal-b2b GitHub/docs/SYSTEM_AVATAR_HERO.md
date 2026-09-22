> **Исторический отчёт.** С 2026-09-21 laser/scan заменены draggable widget + info bubble. Текущая реализация и QA: [FLOATING_AVATAR.md](FLOATING_AVATAR.md).

# System Avatar — Hero на актуальном релизе

Дата: 2026-09-20. Preview: http://185.161.70.46:3011/.

## Исправление базы и аудит

Актуальная версия сайта — **`crystal-b2b GitHub/`**, статический Next.js export,
который публикуется на b2b-system.pro. Первая интеграция ошибочно выполнялась
в устаревшем VPS-приложении корня. Она заменена переносом модуля в актуальный
релиз; VPS-приложение больше не обслуживает 3011.

Перед переносом сравнены публичный релиз, локальный `out/index.html`, Hero,
порядок секций, стили, Header, LeadButton, Modal, GSAP, аналитика и deployment.
Текущий релиз использует Next.js 16.3.1, React 19, Turbopack, strict TypeScript,
GSAP/ScrollTrigger, native-scroll inertia, ViewportVideo и единый globals.css.
Типографика фиксирована, технические подписи — JetBrains Mono, переключателя
шкалы нет. Навигация, FAQ, форматы работы, отзывы и модальные CTA сохранены.
Z-index: avatar 40, FX 41, header/menu 50, modal 500, skip-link 1000.

## Файлы и границы изменения

- `src/system-avatar/`: компонент, loader, state machine, target registry,
  interaction controller, performance budget, Three.js shader и стили.
- `public/system-avatar/`: готовые ассеты из пользовательского пакета.
- `src/components/sections/Hero.tsx`: только новая иерархия текста и semantic target.
- `src/app/page.tsx`: один sibling-компонент SystemAvatar перед main.
- `src/lib/analytics.ts`: типы событий аватара, существующий helper сохранён.
- `package.json`, lockfile: Three.js и типы.
- `tests/e2e/system-avatar.spec.ts`, `playwright.avatar.config.ts`: Hero QA.
- Существующие tests обновлены под новый H1 и уже существующее поле `site`;
  reduced-motion assertion приведён к фактическому заголовку текущего релиза.

HTML всего содержимого main **после Hero побайтово совпадает** с сохранённым
релизом до интеграции. Контент, порядок блоков и форма не переписывались.

## Ассеты и состояние лица

Источник: `../b2b-system-cinematic-avatar-spec-v2/system-avatar/`.
Все **18 PNG побайтово совпадают** с источником: master, десять состояний,
atlas, четыре eye assets и два reference assets. Ничего не генерировалось.
JSON atlas скопирован без изменений. В runtime manifest откалиброван только
центр глаза: x=0.631, y=0.465; исходный manifest пакета не изменён.

В supplied scan есть запечённый луч, между state-картинками есть смещение
лица. Чтобы не переключать голову и не показывать второй луч, idle служит
неподвижной основой; из state/atlas берутся мягкие области естественного
глаза/брови и рта. Киберглаз — отдельный DOM/CSS overlay с supplied iris/glow.
Состояния берутся из atlas после preload; до него — отдельные PNG.

State mapping: BOOT/IDLE → idle; TRACK → track-left/track-right; ALERT → alert;
LOCK → lock; CHARGE → charge; SCAN/REVEAL → scan; CONFIRM → confirm;
COOLDOWN → cooldown; SLEEP → sleep. MOBILE_LITE/REDUCED_MOTION/DISABLED → idle.

## Архитектура и target map

SSR/DOM содержит весь текст и CTA; одно прозрачное fixed canvas содержит FX.
Lazy Three.js WebGL2 и GSAP timeline синхронизируются общей state machine.
Единственная цель — `hero-profit`, фраза «рост прибыли». Других targets нет.

Dwell 220 ms → LOCK 160 ms → CHARGE 260 ms → SCAN 480 ms → REVEAL 280 ms →
CONFIRM 400 ms → cooldown 4500 ms. После confirm свечение затухает, остаётся
светлый текст. Завершённый Hero не сканируется повторно в текущей сессии;
общий лимит — 6 попыток. Звук не подключён.

Начало луча измеряется из data-eye-anchor, конец — из реального DOM target.
Rect cache инвалидируется при scroll/resize/fonts/visualViewport, без чтения
layout каждый кадр. Отдельный generation guard отменяет устаревшие lazy imports.

## Shader и настройка

Uniforms: uTime, uIntensity, uProgress, uOrigin, uTarget, uWidth, uNoiseScale,
uNoiseSpeed, uFlicker, uOpacity, uContactIntensity, uChromaticShift, uAfterglow,
uLite. Слои: hot core, glow, tapered wedge, procedural density, contact flare,
horizontal streak, слабая chromatic fringe и afterglow. Selective bloom —
аналитический Gaussian только от emissive beam, без rasterization DOM.

Настройка: config.ts (тайминги/DPR/budget), manifest (eye anchor),
styles/system-avatar.css (352/256 px portrait, отступ от header), beamShader.ts
(цвет/ширина/интенсивность). Менять состояния и FX следует синхронно.

## Производительность, mobile и доступность

FULL desktop DPR≤1.75; LITE touch DPR≤1.25 и упрощённый shader.
Sustained slow frames: FULL→LITE→DISABLED. Рендер идёт только во время FX.
Mobile запускает скан касанием цели. Reduced-motion оставляет статичное
выделение без WebGL и слежения. Canvas aria-hidden, pointer-events:none;
весь контент читается без JavaScript/FX.

При открытом меню или модальном окне FX отменяются, аватар скрывается.
Используются реальные data-navigation-open/data-modal-open текущего релиза;
скрытые portal-диалоги не блокируют скан. Escape и возврат фокуса сохраняются.
Hidden tab/offscreen останавливают FX; backscroll восстанавливает готовность.

Fallback: invalid manifest→local defaults; atlas→state PNG→idle→master.
Master-only, WebGL unavailable, shader failure и context loss дают статичную
версию. Асинхронный decode старого состояния не перезаписывает новое.

## Проверки актуального релиза

- Production static build, typecheck — PASS.
- Lint — 0 errors; прежнее предупреждение о Metrika img в layout.
- Unit — 15/15.
- Hero E2E — 45/45: Chromium 23, WebKit 22, включая modal-during-lock.
- Регрессии сайта — 31/31: 9 ширин 360–1920, сцены, backscroll, FAQ-навигация,
  mobile menu/focus, fixed typography, reduced-motion, desktop/mobile WCAG.
- Внешняя отправка заявки не вызывалась; тест реальной доставки исключён.
- Публичный smoke: HTTP 200, X-Robots-Tag noindex/nofollow, новый H1,
  одна цель, без page errors и mobile overflow.
- PNG integrity — 18/18; HTML main ниже Hero идентичен прежнему релизу.

Снимки: [desktop](../qa-artifacts/avatar/release-desktop.png),
[reveal](../qa-artifacts/avatar/release-reveal.png),
[mobile](../qa-artifacts/avatar/release-mobile.png),
[modal](../qa-artifacts/avatar/release-modal.png).

Реальные Edge, macOS Safari, iOS/Android и hardware FPS ещё не проверены.
WebKit automation не заменяет физические устройства. В нагруженном headless
окружении допустимо срабатывание adaptive static fallback. Следующий polish —
проверка на этих устройствах; новые scan-targets до неё не подключать.

## Запуск и откат

3011 снова обслуживает исходный `crystal-b2b.service`, раздающий `out/` именно
из этой папки. Ошибочный Next.js drop-in снят и сохранён отдельно в
`/root/hero-avatar-preview-obsolete-20260920.conf`. Исходный unit не изменён,
сервис active/enabled. GitHub Pages и nginx не менялись.

Сборка: `NEXT_PUBLIC_SITE_URL=https://b2b-system.pro npm run build` в этой папке.
Тесты Hero: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3011 npx playwright test --config playwright.avatar.config.ts`.
Резерв прежнего static export: `/tmp/crystal-release-before-avatar-20260920`.

## Размер аватара — 2026-09-20

По запросу пользователя увеличен **на 300%** (в 4 раза): desktop 88→352 px,
mobile 64→256 px. Масштабируются также отдельный глаз и status LEDs.
В Hero зарезервировано место под увеличенный портрет, чтобы он не закрывал H1.
Настройка — `--avatar-scale: 4` в system-avatar.css.

Размеры подтверждены в браузере на ширинах 1440/390/360: 352/256/256 px;
H1 начинается ниже аватара, overflow и page errors отсутствуют. Build, TypeScript
в build, lint и 15 unit пройдены. Снимки: `qa-artifacts/avatar/enlarged-*.png`.

## Рамка и прозрачность — 2026-09-20

После сверки `source/avatar-master.png` и `frame/frame-reference.png` добавлен
отдельный `.system-avatar-frame`. Border-image использует настоящую металлическую
окантовку master (без center fill): фаски, прорези и синие световые вставки.
Чёрные pillarbox-поля supplied sprites убраны CSS clip-path; контейнер и область
под рамкой прозрачны. PNG не перерисованы и не изменены. При master-only fallback
дополнительная рамка скрыта, чтобы не дублировать уже встроенную в master.
Размеры 352/256 px сохранены; положение глаза и target registry не менялись.

Визуально проверены desktop/mobile и тестовый magenta backdrop: 6/6 exterior
pixel samples совпали с подложкой. Снимки: `qa-artifacts/avatar/frame-1440.png`,
`frame-390.png`, `frame-transparency.png`. Build с TypeScript, lint и 15 unit прошли.

## Уточнение размера — 2026-09-20

По запросу пользователя установлен точный размер контейнера аватара:
**282 px desktop / 196 px mobile**. Eye/status масштабированы пропорционально,
верхний отступ Hero уменьшен до 25.5rem/20rem. Металлическая рамка и прозрачное
внешнее поле сохранены. Настройка: `--avatar-size` и `--avatar-scale` в CSS.

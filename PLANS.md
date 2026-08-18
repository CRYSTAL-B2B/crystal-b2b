# План реализации CRYSTAL CUBE

Последнее обновление: 2026-08-17.

## Фаза 0 — аудит и решения

- [x] Прочитаны production pack, все документы и scene-spec.
- [x] Reference media изучены только как visual/motion references.
- [x] Репозиторий приложения отсутствовал; выбран новый production foundation.
- [x] Выбран стек: Next.js App Router, React, strict TypeScript, custom CSS,
  GSAP/ScrollTrigger, SVG и CSS 2.5D.
- [x] Real WebGL отложен: пространственные смыслы текущей версии можно выразить
  легче и надёжнее без отдельного renderer.

## Фаза 1 — foundation

- [x] App shell, metadata, design tokens, grid и typography.
- [x] Header/mobile navigation, buttons, section primitives.
- [x] Централизованный content layer и analytics interface.
- [x] Accessibility base, reduced-motion и scene fallbacks.
- [x] Acceptance: статическая страница полностью читается без JavaScript motion.

## Фаза 2 — полный статический narrative

- [x] Hero, bridges, proof, cases, competencies, experience, philosophy, contact.
- [x] Только подтверждённые данные из `02_CONTENT_ARCHITECTURE.md`.
- [x] Acceptance: CEO понимает ценность за 10–15 секунд, HR находит proof и опыт.

## Фаза 3 — пять motion-сцен

- [x] Hero: оригинальный orchestration artifact, ambient и pointer response.
- [x] System → Processes: обратимая mutation-map на DOM/SVG.
- [x] Control the Flow: input/loss/control/output/feedback через SVG field.
- [x] Connected System: spatial layers, connections и доступный trace.
- [x] Lighthouse: turbulence → beacon → course → contact handoff.
- [x] Acceptance: backscroll, mobile composition и reduced-motion для каждой сцены.

## Фаза 4 — production integration

- [x] Lead API: client/server validation, honeypot, rate guard, honest missing-config.
- [x] Robots, sitemap, OG, Person structured data без выдуманного домена.
- [x] Security headers и provider-agnostic analytics hooks.
- [x] Responsive/a11y/performance hardening.

## Фаза 5 — verification

- [x] Lint, typecheck, unit tests, production build.
- [x] Browser smoke: 360, 375, 390, 430, 768, 1024, 1280, 1440 и 1920 px.
- [x] Keyboard, focus, mobile menu, contact validation, reduced-motion.
- [x] Console/network errors, horizontal overflow и scene backscroll.
- [x] Axe: нет серьёзных/критических WCAG-нарушений на desktop и mobile.
- [x] Initial JS измерен и уменьшен с 224,4 до 181,8 KB gzip dynamic import’ом GSAP.
- [x] Финальный проход `07_PRODUCTION_CHECKLIST.md`.

## Фаза 6 — visual reboot v2

- [x] Повторно изучены пять motion-референсов покадрово; зафиксированы
  композиция, физика материала, масштаб и эмоциональная функция каждой сцены.
- [x] Основной кириллический display/text шрифт заменён на open-source
  `Inter Tight`; `IBM Plex Mono` оставлен только для технических микролейблов.
- [x] Семь изображений из `glass_background/` классифицированы как статические
  фоновые пластины, оптимизированы в WebP и исключены из image-to-video pipeline.
- [x] Для пяти сцен подготовлены отдельные reference frames и production-промпты
  с сохранением визуальной логики референсов без копирования чужого UI, текста
  и брендинга.
- [x] Через встроенную генерацию Codex по активной подписке созданы и визуально
  отобраны начальные first frames; позднее пользователь заменил/уточнил masters
  Hero, Flow, Connected System и Lighthouse по новой арт-дирекшн композиции.
- [x] PNG-мастера сохранены в `assets/generated/first-frames/masters/`, а
  оптимизированные WebP 64–144 КБ — в `public/media/first-frames/`.
- [ ] Сгенерировать оставшиеся image-to-video сцены через Empirio Labs /
  Seedance и сохранить master-файлы локально до истечения URL. Hero, Control
  Flow и Connected System уже утверждены и встроены; Processes остаётся на hold,
  а Lighthouse не запускался по текущему решению пользователя.
  Для Seedance 2.5 подготовлен отдельный director's prompt profile: five
  six-second I2V beat sheets, source-decision manifest и profile-aware runner.
  Для EmpirioLabs подтверждён model ID `seedance-2-5`: I2V-ролики используют
  `adaptive` aspect ratio и максимальные 720p. Блокер — локальный
  `EMPIRIOLABS_API_KEY`, подготовка текущих WebP inputs и режиссёрский выбор
  draft-рендеров.
  После обновления masters runner дополнительно проверяет свежесть WebP source:
  сначала требуется экспортировать новые poster-файлы. Для 4:3 Hero создан
  отдельный 16:9 crop `01-hero-16x9`; полученный Seedance review render ждёт
  user sign-off до замены website MP4. Lighthouse A и B — обязательные start/end
  кадры одного `i2v_both` ролика; для B подготовлен отдельный 16:9 master
  `05-lighthouse_b-16x9.png` и matching WebP. Сцена 02 (`System to Processes`)
  поставлена пользователем на hold и исключена из generation runner до отдельного
  решения; Lighthouse не запускался по текущему решению.
- [x] Утверждённые ролики Hero, Control the Flow и Connected System
  транскодированы в web-версии H.264 без аудио и подключены из
  `public/media/video/`. Рендер начинается на любом viewport после попадания
  сцены в viewport; статичный WebP остаётся LCP/fallback при
  `prefers-reduced-motion` и неудачной загрузке. В Control the Flow scroll
  меняет copy-state, но не положение видео.
- [x] Для review-регенерации Hero подготовлен отдельный центрированный
  1440×810 input `01-hero-16x9` без перезаписи исходного 4:3 master. Seedance
  выдал 1280×720 H.264 render; он ожидает user sign-off до замены website asset.
- [x] Первые кадры, фоновые пластины и restrained GSAP-motion интегрированы в
  новую композицию; HTML-текст и reduced-motion fallback сохранены.
- [x] Проведены desktop/mobile/reduced-motion/performance QA; текущий локальный
  Playwright suite - 28/28, включая video lifecycle, inertia и Hero framing.
- [x] Visual reboot v2 опубликован на `https://crystal-b2b.duckdns.org`.

## Фаза 7 — Apple-style typography review

- [x] Устранён экстремальный разрыв между technical microcopy и display type:
  вместо разрозненных размеров введены общие semantic typography tokens.
- [x] Реализованы три переключаемые шкалы: `A / Тихая` (default),
  `B / Баланс`, `C / Акцент`; выбор сохраняется в `localStorage`.
- [x] Белые и сплошные синие секционные фоны удалены. Все narrative-блоки
  переведены на единую тёмную систему с пользовательскими background plates.
- [x] Метрики, кейсы, компетенции, опыт, принципы и форма получили restrained
  glass surfaces, blur, тонкие границы и Apple-подобную геометрию.
- [x] По итогам ревью floating-card оболочка header отменена: возвращена
  прежняя плоская навигация во всю ширину, закреплённая у верхней границы;
  primary CTA сохранена как спокойная светлая pill-кнопка. На mobile кнопка
  меню и burger закреплены у правого края двухколоночного header.
- [x] Desktop/mobile visual QA выполнен; A/B/C не создают horizontal overflow,
  выбор восстанавливается после reload.
- [x] Добавлен Playwright-тест типографического переключателя; полный suite —
  17/17, включая WCAG desktop/mobile.
- [x] Review-версия опубликована; production suite на HTTPS-домене — 17/17.

## Фаза 8 — System → Processes sticky narrative

- [x] Прежний pinned GSAP-sequence на 680vh заменён естественной двухколоночной
  прокруткой по принципу секции `09 Experience`.
- [x] На desktop визуальная карточка закрепляется под фиксированным header, пока
  справа последовательно проходят восемь процессов; на mobile sticky отключён.
- [x] По пользовательскому референсу встроенной генерацией создан новый
  cross-module first frame в синей палитре сайта; master и production WebP
  сохранены отдельно, прежний кадр оставлен в архиве.
- [x] Добавлен E2E-контроль sticky-позиции; local suite — 17/17.

## Фаза 9 — desktop inertial scroll

- [x] На viewport от 961 px wheel-прокрутка получает лёгкую инерцию через
  `requestAnimationFrame`, без дополнительной зависимости и без изменения
  document flow.
- [x] Keyboard, якорные ссылки, interactive/native scroll areas и открытая
  mobile-навигация не перехватываются; mobile и `prefers-reduced-motion`
  сохраняют нативную прокрутку.
- [x] Добавлены E2E-проверки инерционного продолжения scroll на desktop и
  отсутствия этого слоя на mobile; полный browser suite — 28/28.
- [x] Hero poster и video на desktop синхронно смещены вправо на 8 px: край
  исходного 4:3 кадра не попадает в viewport, pointer-параллакс сохранён.

## Внешние данные, которые не блокируют разработку

- [x] Production domain / `NEXT_PUBLIC_SITE_URL`: `https://crystal-b2b.duckdns.org`.
- Реальные контактные данные.
- `LEAD_WEBHOOK_URL` или иной канал доставки.
- Analytics provider и ID.
- Публичная PDF-версия резюме.

## Фаза 10 — documentation handoff

- [x] README, deployment, video generation runbook, asset READMEs и оба
  code-review документа синхронизированы с current production/media state.
- [x] Добавлен `docs/CURRENT_STATE.md` как оперативный источник правды:
  release gate, live media, user-paused generation и safe release routine.
- [x] Создан переносимый skill `skills/motion-site-production`: единый workflow
  для discovery, смысловых scroll-сцен, image-to-video, QA и production handoff.

## Фаза 11 — русификация и титровый Flow

- [x] Размер шрифта desktop-навигации, mobile-menu и кнопки mobile-menu
  увеличен на 2 px без изменения геометрии header.
- [x] Все пользовательские тексты в `<p>` и section labels переведены на
  русский; затронуты также связанные визуальные labels и динамические значения
  data-layer, чтобы английские подписи не возвращались через UI.
- [x] В `Control the Flow` обычная смена карточек заменена на обратимый
  перспективный scroll-crawl: текст уходит к верхнему горизонту, а video-layer
  остаётся неподвижным. Reduced-motion продолжает показывать полный статичный
  summary.
- [x] Crawl сцены 03 сокращён с длинного scroll-range до 165svh на desktop и
  180svh на mobile: первый тезис появляется при входе в сцену, а вся
  последовательность проходит за один короткий экранный scroll-range.
- [x] Видимое текстовое поле crawl на desktop расширено в 1,6 раза (с 43rem /
  54vw до 68.8rem / 86.4vw). На mobile оно уже занимает всю доступную ширину
  viewport и остаётся адаптивно ограниченным.
- [x] В economic thesis первый тезис заменён на «Не обязательно закупать больше
  трафика.»
- [x] Заголовок «Принципы работы» уточнён: маркетинг отвечает на вопрос о
  бизнес-изменениях, которые приносят дополнительную прибыль.
- [x] Проверки: lint, strict typecheck, 4 unit-теста, production build и
  целевые Playwright-сценарии 3/3 после финальной настройки crawl. До неё
  полный suite проходил 29/29; повторные full-run в этой среде нестабильно
  теряли временный localhost webServer на несвязанных проверках.

## Фаза 12 — recovery production static manifest

- [x] Подтверждён production incident: HTML ссылался на отсутствующий CSS-chunk,
  который возвращал `500`, поэтому браузер показывал SSR-разметку без стилей.
- [x] Выполнены `npm run build` и restart только `crystal-b2b.service`; nginx и
  TLS-конфигурация не менялись.
- [x] После recovery публичные `/`, CSS-chunk, `/robots.txt`, `/sitemap.xml` и
  `/opengraph-image` отвечают `200` с корректными MIME type. Headless browser
  smoke на HTTPS подтвердил корректный Hero и отсутствие console/page errors.

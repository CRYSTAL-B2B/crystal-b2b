# План реализации CRYSTAL CUBE

Последнее обновление: 2026-09-20.

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

## Фаза 13 — System Avatar v2 / только Hero

- [x] Аудит без изменений, прочитан полный v2 pack; актуальный отчёт `crystal-b2b GitHub/docs/SYSTEM_AVATAR_HERO.md`.
- [x] Hero copy: H1 → supporting headline → supporting copy, hero-profit target.
- [x] Manifest/atlas/fallback → static avatar → state machine → tracking/eye.
- [x] WebGL beam → DOM reveal → cinematic shader → state polish.
- [x] Mobile/reduced/failure/performance и production atlas; локальная QA.
- Аппаратная проверка Edge/Safari/iOS/Android остаётся вне возможностей текущей среды;
  локальные browser evidence и границы acceptance перечислены в отчёте.
- Следующие targets (v2 phase 13) и optional audio (phase 14) вне текущей задачи.

- [x] 2026-09-20 исправлен выбор базы: модуль перенесён в актуальный Pages-релиз
  `crystal-b2b GitHub`, его статический export снова обслуживает 3011.
  Все 18 PNG взяты из v2 pack без изменений. HTML ниже Hero сохранён побайтово.
  Проверки этой версии: 45 Hero E2E, 31 site regression, 15 unit, build/typecheck/lint.

## Avatar motion handoff — 2026-09-20

- [x] Прочитан новый UX: draggable floating widget, snap-to-edge, info bubble.
- [x] Анализ всех 192 кадров master-video; 4 лучших one-shot сегмента и постеры.
- [x] Постоянный square crop, timeline/JSON manifest/отчёт/архив; слабые состояния не экспортированы.
- Естественный loop не получен; использовать partial video + static fallback.
- Реализация нового draggable/bubble UI не входила в задачу экспорта.
- Отчёт: `crystal-b2b GitHub/docs/AVATAR_VIDEO_SEGMENTS.md`.


## Floating Avatar — 2026-09-21 (заменяет laser-концепцию)

- [x] 1: аудит актуального `crystal-b2b GitHub` без изменений.
- [x] 2: удалены WebGL beam, targeting registry, scan choreography.
- [x] 3–6: Pointer Events drag, безопасные bounds, четыре edge, normalized persistence.
- [x] 7–9: DOM bubble, responsive auto-placement и обратимый Hero scroll reveal.
- [x] 10–11: четыре approved one-shot из manifest, два video-слоя, crossfade, static fallback.
- [x] 12: mobile 196 px / desktop 282 px, keyboard и reduced motion.
- [x] 13: production build, typecheck/lint, unit и browser QA; результаты и физические ограничения — в отчёте.
- Preview 3011 раздаёт новую static-сборку актуального релиза; GitHub Pages не публиковался.
- Отчёт: `crystal-b2b GitHub/docs/FLOATING_AVATAR.md`.


## Hero fit / living avatar — 2026-09-21

- [x] Hero укладывается в viewport через уменьшенную типографику и adaptive copy scale.
- [x] Создан воспроизводимый 2.5 s idle-loop из approved closed-mouth frames; исходники сохранены.
- [x] Добавлены continuous playback, редкое моргание, click и H2 reactions по всем секциям.
- [x] Поддержаны backscroll, sticky headings, reduced motion и pause/resume.
- Проверки и новый runtime manifest: `crystal-b2b GitHub/docs/FLOATING_AVATAR.md`.


## 2026-09-21 — Полный видеопортрет и реакции нового UX

- Новый H1: «Системный маркетинг – это управляемая инвестиция в рост прибыли».
- Вместо editorial palindrome — полный исходный master 8 s / 192 frames.
- Speak 5.166667–6.416667 s пока видна bubble; glint 3.5–4.5 s при click,
  затем возврат в speak/idle. Новая явная runtime policy supersedes calm-only.
- Уменьшение background overscan по доступному запасу и ходу параллакса.
- Исходные assets/сегментация сохранены; только актуальная вложенная версия
  `crystal-b2b GitHub`, preview 3011. Отчёт: `docs/FLOATING_AVATAR.md` в ней.

Итог QA full-master: 18 unit, build/typecheck/lint без ошибок (одно прежнее
lint warning). Финальный прогон 22/22 Chromium/WebKit; суммарно 69 уникальных
avatar E2E и 31 site regression подтверждены с целевыми повторами. Исправлены
WebKit blob/seek/EOS, устаревшая остановка reused player и RAF-зависимый toggle.
HTTP 200, screenshots: `output/full-avatar-qa/`. Аппаратные FPS/iPhone не измерены.

## 2026-09-21 — Отмена артикуляции по плашке

Плашки Hero/H2 больше не вызывают смену видеосостояния: непрерывный master-loop
192 кадра / 8 s продолжается. Click запускает исходную вспышку 3.5–4.5 s,
затем полный idle. Speak удалён из runtime, preload, manifest и разрешённых
состояний; прежний файл сохранён как исторический экспорт. Все кадры master,
включая естественные движения рта внутри самого ролика, сохранены.
Подробности и QA: `crystal-b2b GitHub/docs/FLOATING_AVATAR.md`.

QA последнего уточнения: 18 unit, build/typecheck/lint без ошибок; 16 целевых
Chromium/WebKit сценариев подтверждены с финальным повтором 8/8. Добавлена
страховка выхода из короткого glint при пропущенном ended. Preview HTTP 200.

## 2026-09-21 — Calm idle и полный onset вспышки

По последнему уточнению full-master idle заменён `avatar-calm-loop.mp4`:
source [0,63)+[152,192), два dissolve по 6 кадров, 91 кадр / 3.791667 s.
Рот закрыт, яркого eye flare нет; сохранены взгляды и моргание. Click играет
`avatar-glint-onset.mp4`, source [62,104) / 2.583333–4.333333 s, от нейтрального
кадра перед первым разгоранием и до открывания рта, затем возвращает calm loop.
Новый manifest `avatar-calm-motion-manifest.json`, сборка
`scripts/build-avatar-calm-motion.py`. One-shot начинает play после открытия
слоя с frame zero. Bubble не влияет на видео. Все 133 output-кадра просмотрены;
contact sheets: `output/calm-avatar-qa/`. Старые exports сохранены.

QA calm/onset завершена 2026-09-22: 18/18 Chromium/WebKit, 19 unit,
build/typecheck/lint без ошибок. В обоих браузерах подтверждён play с time=0
после показа слоя и возврат к idle; `output/calm-avatar-qa/onset-playback.json`.

## 2026-09-22 — Тексты Hero/Results и масштаб фона

H1 Hero и primary bubble: «Маркетинг – это управляемая инвестиция в системный
рост прибыли». Подзаголовок остаётся «Строю B2B-маркетинг от спроса до выручки.».
H2 блока 03: «Точные данные превращают маркетинг в инструмент управления ростом
бизнеса.». Hero media уменьшен до 88%, с мягким краем маски; poster/video
масштабируются вместе. Mobile font H1: 8vw вместо 8.3vw, прежние min/max.
19 unit, build/typecheck/lint без ошибок; 22 browser checks прошли.
Снимки: `output/hero-copy-scale-qa/`. Актуальный preview — порт 3011.

Финальная проверка после коррекции mobile font: 8/8 Chromium/WebKit;
Hero/Results screenshots просмотрены, точные тексты и scale=.88 подтверждены.

## 2026-09-22 — Плашки шести разделов и выбор задачи

В актуальном `crystal-b2b GitHub` автоматические плашки ограничены секциями
`#system`, `#results`, `#offer`, `.flow-scene`, `#cases`, `#contact`.
Каждая показывает H2, пояснение и CTA «Обсудить задачу». Hero и остальные
экраны больше не вызывают автоматические плашки. Подсказка скрывается при
выходе из секции и возвращается при обратной прокрутке.

Клик/тап по аватару открывает «Какие у вас задачи:» с четырьмя вариантами:
стратегия, лидогенерация, система привлечения, автоматизация бизнеса.
Выбор открывает существующую форму «Обсудить задачу», `placement=avatar`;
задача подставляется в textarea. Контакты и собственный комментарий сохраняются
при смене выбора. После закрытия фокус возвращается к аватару. Ручной вопрос
не заменяется подсказкой при прокрутке; drag, Escape, меню/modal, reduced motion
и спокойный видеорежим с отдельной вспышкой сохранены.

Подложка плашки уплотнена для читаемости. На коротких экранах содержимое
прокручивается. Контент вынесен в `src/system-avatar/content.ts`.
Build/typecheck и 19 unit прошли; lint без ошибок (прежнее предупреждение
`layout.tsx`). Визуальные проверки Chromium/WebKit: 1440, 390, 320 px;
передача задачи подтверждена, runtime errors отсутствуют, axe для вопроса и
формы на трёх размерах Chromium не нашёл нарушений.
Артефакты: `output/avatar-task-picker-qa/`. Preview 3011 отвечает HTTP 200.
GitHub Pages не публиковался. Новый сценарий заменяет исторические Hero reveal
и реакции на все H2. Подробнее: `crystal-b2b GitHub/docs/FLOATING_AVATAR.md`.

Целевая браузерная QA этого обновления: 12/12 Chromium/WebKit сценариев прошли.
Новая плашка сбрасывает внутреннюю прокрутку, чтобы заголовок не оставался скрытым
после выбора четвёртой задачи на коротком экране.

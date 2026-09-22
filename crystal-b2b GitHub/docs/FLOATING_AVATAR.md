# Floating Avatar — реализация 2026-09-21

Актуальная база: `crystal-b2b GitHub/`, Next.js static export. Preview: http://185.161.70.46:3011/.
Спецификация: `/root/.codex/attachments/2e19b814-5b39-43c6-885c-bf99e918d83b/pasted-text.txt`.
Этот документ заменяет laser-часть прежнего `SYSTEM_AVATAR_HERO.md`. Исторический отчёт сохранён.

## Актуальные плашки и выбор задачи — 2026-09-22

Автоматические плашки работают только на шести экранах: «Что такое система» (`#system`), «Подтверждённые результаты» (`#results`), «Форматы работы» (`#offer`), «Управление потоком» (`.flow-scene`), «Кейсы» (`#cases`), «Контакт» (`#contact`). Плашка содержит текущий H2, пояснение и кнопку «Обсудить задачу». Экран определяется по пересечению секции с линией 40% высоты viewport, dwell 250 ms. На выходе плашка скрывается; при обратной прокрутке появляется снова. Закрытие действует до выхода из раздела. Произвольные H2, hover и Hero больше не открывают плашки.

Клик/тап по аватару, Enter или Space открывает вопрос «Какие у вас задачи:» и четыре кнопки: «Сформировать стратегию.», «Настроить лидогенерацию.», «Построить систему привлечения.», «Автоматизация бизнеса.». Ручной вопрос имеет приоритет над автоматической подсказкой и сохраняется при прокрутке. Повторное нажатие на аватар или Escape закрывает вопрос. Drag не считается выбором и временно скрывает плашку.

Выбор задачи открывает существующий `LeadModal` «Обсудить задачу», `placement=avatar`; задача подставляется в textarea существующей формы. При смене выбора заменяется только предыдущая подстановка: контакты и собственный комментарий посетителя сохраняются. Отправка остаётся штатной — только после явного заполнения/submit формы. Фокус после закрытия возвращается к аватару после снятия inert. На малых экранах содержимое плашки прокручивается, кнопки не меньше 44 px.

Контент: `src/system-avatar/content.ts`; наблюдение шести секций: `headingController.ts`; режимы closed/section/question: `bubbleController.ts`. Два видеослоя, calm loop и вспышка с первого кадра сохранены. Появление текста не вызывает артикуляцию. Проверки и визуальные артефакты: `tests/e2e/system-avatar.spec.ts`, `scripts/review-avatar-task-picker.mjs`, `output/avatar-task-picker-qa/` в корне проекта.

QA: 12/12 целевых Chromium/WebKit сценариев прошли — шесть экранов и исключённые H2, backscroll, ручной вопрос при scroll/drag, CTA, все четыре задачи на 1440/320 px с сохранением черновика, touch + reduced motion. Build/typecheck, lint (0 errors) и 19 unit прошли. Визуальные снимки 1440/390/320 px проверены в обоих движках; axe вопроса и формы в Chromium на трёх размерах: violations=[]; runtime errors отсутствуют. Общий длинный прогон был прерван средой после Chromium; целевые проверки завершены отдельно. Реальные заявки при QA не отправлялись.

**Приоритет:** этот раздел заменяет нижеописанные исторические Hero reveal и реакции на все H2.

## Обновление Hero и блока 03 — 2026-09-22

H1 на момент обновления (Hero bubble впоследствии отключён): «Маркетинг – это управляемая инвестиция в системный рост прибыли». Подзаголовок: «Строю B2B-маркетинг от спроса до выручки.». H2 блока 03 «Подтверждённые результаты»: «Точные данные превращают маркетинг в инструмент управления ростом бизнеса.».

Весь media-контейнер Hero уменьшен до 88% прежнего размера, одинаково для poster/video на desktop/mobile. Две линейные маски плавно смешивают края с тёмной подложкой. Внутренний запас для параллакса и общая композиция первого экрана сохранены. Mobile H1: clamp(28px,8vw,38px), чтобы новый текст переносился аккуратнее.

Typecheck/build и 19 unit прошли, lint без ошибок (одно прежнее предупреждение layout). Основной целевой прогон: 22/22 Chromium/WebKit, включая семь размеров Hero, H2/backscroll, reveal, параллакс и reduced motion. Финальный повтор после коррекции mobile font: 8/8 Chromium/WebKit для 320, 375, 390 px и landscape. Снимки обоих блоков просмотрены: перенос одиночного «в» исправлен. Снимки и точные тексты/scale: `output/hero-copy-scale-qa/`; page errors не зарегистрированы.

## Текущее поведение: спокойный цикл и вспышка от начала — 2026-09-21

Последний запрос заменяет full-master idle. Обычный режим содержит только закрытый рот и отсутствие яркой вспышки. По click воспроизводится разгорание глаза от его настоящего начала; затем целиком повторяется спокойный цикл. Bubble/H2 не меняют видеорежим.

| Режим | Файл | Сборка | Длительность |
|---|---|---|---|
| idle | `avatar-calm-loop.mp4` | source [0,63) + [152,192), 6-frame dissolves на двух стыках, старт с нейтрального source frame 44 | 91 кадр / 3.791667 s |
| glint | `avatar-glint-onset.mp4` | source [62,104), 2.583333–4.333333 s: один нейтральный кадр до первого разгорания, конец до открывания рта | 42 кадра / 1.75 s |

Из idle исключены source frames 63–151: полный flare, артикуляция и закрывание рта. Сохранены естественные взгляды и моргание. Все кадры идут вперёд, без reverse или генерации лица. Два перехода по 250 ms смешивают только спокойные кадры с закрытым ртом. Crop прежний: x=0,y=420,1080×1080 → 720×720, 24 fps, H.264, mute. Это редакционно собранный loop, а не исходные восемь секунд целиком.

Сборка: `python3 scripts/build-avatar-calm-motion.py` (OpenCV/ffmpeg). Manifest: `avatar-calm-motion-manifest.json`, policy `calm-loop-with-glint-v1`. Старые full/speech/peak assets не изменены; активная политика не принимает их вместо calm/onset файлов. В новом manifest записаны исходные диапазоны, frame count и SHA-256.

Однократный клип подготавливается на frame zero в паузе и начинает play только после открытия видеослоя. Его начало больше не проигрывается скрыто за подготовкой/crossfade. Сохранены два player, защита от гонок, выход по ended и страховка по длительности +160 ms. После любой вспышки возвращается calm loop; reduced motion и static fallback сохранены.

Все 91 idle и 42 glint кадра просмотрены на контактных листах: `output/calm-avatar-qa/`. В спокойном цикле нет открытого рта и яркого eye flare; в реакции виден исходный рост свечения. QA завершена 2026-09-22: 18/18 целевых Chromium/WebKit сценариев прошли (`test-results/avatar-calm-onset/.last-run.json`: passed, failedTests=[]). Проверены цикл через границу, возврат после вспышки, быстрые клики, H2/backscroll, mobile/zoom, reduced motion и ошибки загрузки. Отдельное инструментированное наблюдение в обоих браузерах подтвердило вызов play при currentTime=0 и уже показанном слое (inline opacity=1), затем возврат к idle; данные — `output/calm-avatar-qa/onset-playback.json`. 19 unit, typecheck/build — PASS; lint без ошибок, одно прежнее предупреждение layout. ffprobe: idle 91 кадр / 3.791667 s, glint 42 кадра / 1.75 s, оба 720×720 / 24 fps.

## Историческое поведение: полный цикл без артикуляции по плашке — 2026-09-21

Последний запрос отменяет отдельное открывание рта при показе текста. Плашки Hero/H2 и их закрытие больше не переключают и не перезапускают видео. Runtime использует только `idle` (весь master, 192 кадра / 8 s) и `glint` (3.5–4.5 s исходника, один раз при click), после glint всегда возвращается полный idle-loop.

Удалены speak-состояние из контроллера, его preload и разрешение в manifest parser. Runtime manifest и воспроизводимая сборка содержат только два нужных клипа. Прежний `avatar-speak.mp4` сохранён на диске как исторический экспорт, но не запрашивается приложением. Существующие full-loop/glint файлы не перекодированы и не изменены.

Для короткой вспышки добавлен резервный выход по длительности клипа + 160 ms: пропущенный браузером `ended` не оставляет glint зависшим. Таймер проверяет актуальность запроса; скрытие документа, drag и новые реакции его безопасно отменяют логически.

Все исходные кадры сохранены, включая естественные движения рта в самом master. Отдельной артикуляции в ответ на плашку больше нет. Размеры, crop, drag/snap, H2/bubble, click glint, static/reduced-motion fallback и Hero сохранены.

Проверки завершены: typecheck/build, 18 unit — PASS; lint без ошибок (одно прежнее предупреждение layout). Подтверждены 16 уникальных целевых Chromium/WebKit сценариев с финальным повтором 8/8 на окончательной сборке. Проверены отсутствие speech-запросов и перезагрузки видео при scroll bubble, полный loop, возврат после click, искусственно пропущенный ended, быстрые клики, H2/backscroll, mobile/zoom и reduced motion. Первый прогон выявил пропущенный EOS WebKit; резервный выход исправил сценарий. Публичный preview HTTP 200 отдаёт только idle/glint; SHA-256 обоих исходных экспортов совпадают с прежними.

## Историческое обновление: полный master, артикуляция и вспышка — 2026-09-21

Последний запрос владельца явно заменяет прежнее ограничение «только закрытый рот» и редакционную palindrome-петлю. Теперь основа — **все 192 кадра исходного 8-секундного master** в исходном порядке и темпе 24 fps. Исходник и прежняя сегментация сохранены.

Hero H1 и основная строка bubble: «Системный маркетинг – это управляемая инвестиция в рост прибыли» (без точки). Автоматическое вписывание copy в первый экран сохранено. Масштаб фонового poster/video вычисляется из размеров контейнера, desktop offset 8 px и реального хода параллакса ±7/5 px: на 1440×900 base ≈1.0222 вместо 1.035, дополнительное дыхание +.008. На touch запас меньше; reduced motion отключает движение. Размеры аватара остаются 282/196 px.

| Runtime | Файл | Исходные кадры / время | Поведение |
|---|---|---|---|
| idle | `clips/avatar-full-loop.mp4` | 0–191 / 0–8 s | Постоянное воспроизведение всех кадров, native loop |
| speak | `clips/avatar-speak.mp4` | 124–153 / 5.166667–6.416667 s | Реальное открывание рта, повторяется пока видна bubble |
| glint | `clips/avatar-glint.mp4` | 84–107 / 3.5–4.5 s | Яркий исходный глаз около 4 s, один раз при click |

Все клипы: одинаковый crop x=0,y=420,1080×1080 → 720×720, H.264/yuv420p, faststart, без звука. Объёмы: 2,844,599 / 529,213 / 325,473 bytes. Сборка: `python3 scripts/build-avatar-full-motion.py`. Manifest: `public/system-avatar/motion/avatar-full-motion-manifest.json`, явная политика `full-master-with-reactions-v1`; разрешены только эти локальные имена файлов. Старый строгий parser сохранён для прежних manifests.

Открытие bubble любым способом (Hero scroll, H2, click/клавиатура) включает speak. Click слушается на document capture, включая обычный текст и кнопки; не отменяет исходное действие. Glint имеет приоритет на одну секунду, затем возвращается в speak при открытой bubble, иначе в полный idle. Быстрые клики ограничены интервалом 350 ms; завершение drag не считается click. Поведение всех H2, drag/snap/storage и accessibility сохранено.

Два постоянных player слоя, crossfade 160 ms, cache/preload и poster fallback сохранены. При запросе клипа preload переключается с none на auto, чтобы WebKit декодировал первый кадр до play(). Отложенная остановка старого слоя проверяет владельца запроса: быстрые повторные клики не останавливают переиспользованный player. Видеоплееры используют прямые HTTP URL с поддержкой byte-range вместо blob URL; предварительная загрузка прогревает HTTP cache. Переключение bubble фиксирует состояние сразу, независимо от задержки RAF, чтобы серия кликов не теряла toggle. Menu/modal/hidden/drag приостанавливают видео, reduced motion оставляет статичный портрет. Отдельный искусственный blink-таймер удалён: моргание уже есть в полном master.

Это зацикленное исходное видео с настоящей артикуляцией, **не lip-sync** к тексту плашки. Native loop сохраняет все кадры, но не исправляет монтажный стык последнего и первого кадра исходника; математически бесшовная петля не заявляется. Приоритет glint временно прерывает speak, затем автоматически возвращает его.

Проверки этого обновления завершены:

- Typecheck, production build, 18 unit tests — PASS. Lint: 0 ошибок, прежнее предупреждение `no-img-element` в layout.
- Финальный целевой прогон на окончательной сборке: **22/22 Chromium/WebKit**, включая быстрые переключения, видео-loop через границу, speak/glint, missing/failed media, reduced motion, H2/backscroll, keyboard и покрытие фоном при переключении настроек движения.
- Всего подтверждены **69 уникальных avatar E2E** суммарно основным и целевыми прогонами; CDP touch case в WebKit явно skipped. Семь размеров Hero и сохранение 282/196 px проверены.
- Основной прогон выявил проблемы WebKit с blob video, переиспользованием слоя при crossfade и отложенным toggle bubble; исправлены и повторно проверены. Проверка loop теперь ждёт завершения seek, а не предполагает фиксированные 450 ms.
- Site regression: **31/31** подтверждён с отдельным повтором проверки нового текста H1; реальная отправка формы не выполнялась. Остальные 30 сценариев прошли в основном прогоне, включая WCAG на главной/FAQ и desktop/mobile.
- Публичный preview — HTTP 200; сервер MP4 поддерживает `Accept-Ranges: bytes`. ffprobe подтверждает 720×720, 24 fps, 8 s, 192 кадра полного loop.
- Визуально проверены desktop/mobile Hero, speak и glint: `output/full-avatar-qa/` в корне workspace проекта. В наблюдении нет page errors, base scale 1.022222 desktop / 1.005128 mobile. Снимки сделаны с детерминированным playback-quality API; отдельный тест проверяет настоящий механизм fallback.

Проверка WebKit выполнена в headless-браузере; аппаратные FPS и физический iPhone не измерялись.

## Историческое обновление: Hero на один экран и живой аватар — 2026-09-21

По новому запросу пользователя прежний static default заменён непрерывным idle-loop.

- **Hero:** уменьшены H1 и отступы, высота 100svh. `Hero.tsx` измеряет доступное место ниже навигации и аватара; при необходимости уменьшает весь copy-блок, сохраняя доступную ширину строк. Заголовок, оба абзаца и обе CTA остаются на первом экране. Перерасчёт — resize, fonts, header/avatar size, без постоянного RAF.
- **Scroll reveal компактного Hero:** начало = min(60% высоты viewport, исходный центр H1); полный reveal через следующие 20% высоты прокрутки. Это сохраняет плавный вход вместо скачка после первого движения scroll.
- **Петля:** `avatar-idle-loop.mp4`, 720×720, 24 fps, 60 кадров, 2.5 s, 586835 bytes. Смонтирована из 16 утверждённых idle-кадров вперёд и назад без дублирования крайних кадров, в половинном темпе. Это редакционный цикл, не найденный естественный loop исходника. Лицо не генерировалось. Проверены все кадры контактным листом, рот закрыт, чёрных кадров нет; средняя разница на стыке 0.682/255 (gray 90×90).
- **Моргание:** исходный approved cooldown примерно раз в 11 s, когда аватар свободен, затем возврат в loop. Alert при клике, track-right при hover сохранены. Два постоянных видео и crossfade остаются.
- **H2:** автоматически наблюдаются все 13 `main h2`, включая sticky-сцены. При входе в зону 20–55% высоты viewport после dwell 250 ms аватар реагирует и показывает текст заголовка в bubble на 3200 ms. Интервал между автоматическими реакциями ≥3500 ms. Работают обратная прокрутка, hover и click; обычный click по main также вызывает короткую реакцию. События CTA не отменяются. FAQ не содержит H2 и не изменён.
- **Защиты:** reduced motion — статичный портрет. Меню, modal, hidden document и drag приостанавливают видео; после возврата idle-loop продолжается. Контроль dropped frames теперь требует двух плохих выборок по 120 кадров, порог 35%, чтобы короткая реакция не отключала motion из-за единичной задержки.
- **Manifest:** исходный `avatar-motion-manifest.json` и original clips сохранены. Runtime читает `avatar-widget-manifest.json` с явным `construction: palindrome-approved-idle`. Воспроизводимая сборка: `python3 scripts/build-avatar-loop.py`.
- **Новые параметры:** `headings.dwellMs/cooldownMs/bubbleDurationMs`; `video.blinkIntervalMs/qualitySampleFrames/qualityBadSamples`; остальные — `src/system-avatar/config.ts`.

Проверки текущего обновления: 17 unit; build/typecheck/lint (0 ошибок). Подтверждены 65 уникальных avatar E2E (Chromium 33 / WebKit 32; CDP touch case в WebKit skipped) суммарно основным и целевыми прогонами. После адаптации scroll ramp финальный повтор reveal прошёл 2/2; остальные целевые проверки no-JS, 320 px и H2/backscroll также прошли. Семь размеров Hero проверены в обоих браузерах. Site regression: 31 сценарий подтверждён, Flow/Lighthouse потребовал отдельного успешного повтора после сбоя под параллельной нагрузкой. Публичный preview — HTTP 200; снимки в `output/living-avatar-qa/`.

Ниже сохранён исходный отчёт о первом внедрении; его положения о static default и отсутствии runtime-loop заменены этим обновлением.

## 1. Аудит перед изменениями

До редактирования прочитаны спецификация и текущие avatar/Hero/header/modal/scroll/media/analytics модули. Сохранена копия `/tmp/crystal-avatar-before-widget/` с исходным HTML релиза.

- Компонент `SystemAvatar` и `floatingController` существовали, но аватар был неподвижным, без pointer interaction.
- Three/WebGL, eye-to-DOM targeting, state machine и atlas-choreography обслуживали длинный луч.
- GSAP и ScrollTrigger уже используются сайтом; добавлять новую animation library не требуется.
- Header имеет высоту 72→64 px desktop при scroll и 68 px на mobile ≤960 px. Новый controller измеряет фактический нижний край header.
- Navigation/header: z=50, модальные окна z=500. Виджет z=40, панель z=41; при открытом меню/модальном окне скрываются и становятся inert.
- Размеры пользователя: 282 px desktop, 196 px mobile. Отдельный avatar breakpoint 768 px / coarse pointer сохранён.
- Hero содержит реальный H1, supporting headline и copy. Имеются analytics `trackEvent`, native/inertial scroll и reduced-motion режим.
- Motion-handoff содержит только четыре утверждённых one-shot MP4 и manifest. Чистого loop нет.

Последовательность выполнения: аудит → убрать beam → pointer drag → bounds → snap → persistence → статичная bubble → placement → scroll → approved video → crossfade → mobile/reduced → QA. Геометрия была проверена в браузере до добавления motion-полировки.

## 2. Файлы

В `src/system-avatar/`: `SystemAvatar.tsx`, `floatingController.ts`, `config.ts`, `geometry.ts`, `dockController.ts`, `bubblePlacement.ts`, `bubbleController.ts`, `videoManifest.ts`, `videoController.ts`, `styles/system-avatar.css`; unit-проверки `geometry.test.ts`, `videoManifest.test.ts`.

Интеграция: `src/components/sections/Hero.tsx` — удалены targeting-атрибуты; `src/lib/analytics.ts` — новые события. `tests/e2e/system-avatar.spec.ts` и `playwright.avatar.config.ts` — проверки нового UX в Chromium/WebKit.

`public/system-avatar/motion/` содержит неизменённые четыре clips, четыре posters и исходный `avatar-motion-manifest.json` из `output/avatar-motion-v1/`. Новый artwork не генерировался. Металлическая border-image рамка берётся из предоставленного `system-avatar/source/avatar-master.png`; внешняя область прозрачна. Синий фон/кольцо внутри портрета запечены в видео.

## 3. Удалённая laser-логика

Из актуального приложения убраны `interactionController.ts`, `targetRegistry.ts`, `stateMachine.ts`, `avatarManifest.ts`, `avatarManifest.test.ts`, `performanceMode.ts`, `fx/BeamScene.ts`, `fx/beamShader.ts`. Активных Three-импортов, target registry, beam canvas и target-атрибутов Hero больше нет. Исходный предоставленный asset pack не удалялся.

## 4–7. Drag, snap, persistence, bounds

Pointer Events с `setPointerCapture`: primary pointer, мышь/touch, threshold 5 px. Координаты хранятся вне React; pointermove записывает target, RAF интерполирует с коэффициентом .72 и пишет только translate3d. Смещение точки захвата сохраняется. HTML5 drag-and-drop не используется. Text selection отключается только на время drag.

После release ближайший safe edge выбирается по расстоянию от центра аватара. Поперечная координата сохраняется и ограничивается bounds. GSAP power3.out, .48 s; reduced-motion и отсутствие GSAP дают мгновенную привязку. Клавиши-стрелки позволяют выбрать край без мыши.

localStorage `b2b:avatar:dock:v1`:

```json
{"edge":"right","offset":0.42}
```

Offset — нормализованная позиция вдоль края. При reload, resize и смене ориентации координаты вычисляются заново. Невалидные edge/JSON/NaN игнорируются, конечный offset ограничивается 0…1. Ошибки Storage не ломают работу в памяти.

Bounds учитывают visualViewport, его offsets, фактический header, safe-area-inset и margin 20 px desktop / 14 px mobile. CSS zoom учитывается отношением DOMRect/offsetWidth. При доступной высоте <420 CSS px аватар уменьшается максимум до 38% доступной высоты, чтобы оставить место панели. В обычном viewport размеры строго 282/196 px.

## 8–9. Bubble и scroll

Панель — DOM `<aside>` с абзацами. Единственный H1 остаётся в Hero. Тексты:

- Маркетинг — это управляемая инвестиция в рост прибыли.
- Строю B2B-маркетинг от спроса до выручки.
- Стратегия, лидогенерация, CRM, аналитика и автоматизация в одной системе.

Dock left предпочитает right; right — left; top — below; bottom — above. Затем оцениваются альтернативы с минимальным перекрытием аватара и clamp в safe bounds. Маленький connector ориентируется на аватар. Layout измеряется при открытии, docking, resize, изменении размеров текста/шрифта; не на каждом pointermove.

При загрузке popup отсутствует. После начала scroll reveal считается по реальному центру Hero H1: начало на 60% viewport, полное состояние на 40%. Выход: нижний край Hero проходит от 55% до 15% viewport. На обратной прокрутке reveal восстанавливается. Используются существующий ScrollTrigger и native scroll fallback.

Opacity 0→1, scale .97→1, blur 10→0 px, translation 18→0 px. Закрытие доступно кнопкой и Escape. Click/Enter/Space открывает панель вручную; при выходе из Hero и продолжении scroll ручная панель закрывается. Drag/snap временно скрывает панель, после docking placement пересчитывается.

## 10–12. Media и fallback

Manifest — единственный источник разрешённых видео. Runtime дополнительно проверяет label, локальные пути, finite duration, quality≥8, mouth≥9, stability≥8.

| Состояние | Исходный интервал, с | Использование |
|---|---:|---|
| idle | 7.333333–8.000000 | После реакции один раз, затем удержание последнего кадра |
| track-right | 1.000000–1.541667 | Hover ≥400 ms, только left dock; минимум 5 s между hover-реакциями |
| alert | 2.625000–3.000000 | Открытие bubble действием пользователя |
| cooldown | 6.333333–7.333333 | Закрытие bubble, затем idle |

По умолчанию static idle poster, без autoplay и звука. Нет постоянного видео-loop. Во время drag — спокойный static idle. Min state interval 350 ms, движения pointer не переключают видео.

Два постоянных video элемента: следующий показывается после loadeddata/play/первого декодированного кадра; crossfade 160 ms, старый слой остаётся до готовности следующего. Под ними всегда poster. Blob cache не загружает один clip повторно для двух слоёв. Idle/alert/track-right preload через 1200 ms; cooldown по запросу. При reduced motion preload MP4 отключён.

Fallback: requested state → idle clip → approved static poster → исходный master portrait при ошибке poster. Timeout загрузки 5 s. Если после короткого клипа доля dropped frames >25% при ≥8 frames, motion отключается до remount. При document.hidden или открытом меню/modal видео останавливается.

Track-left и sleep не существуют как хорошие самостоятельные фрагменты. Lock/charge/scan/confirm не подключены: исходная центральная часть содержит сильные FX, артикуляцию и/или не даёт отдельного качественного перехода. Track-right не зеркалится. Полная покадровая аргументация — в `docs/AVATAR_VIDEO_SEGMENTS.md` и исходном `output/avatar-motion-v1/REPORT.md`.

## 13–14. Mobile и accessibility

Mobile/coarse pointer: 196 px, panel ≤310 px, secondary 16 px, optional supporting line скрыта. При нехватке места выбирается верх/низ, на очень низком экране поверхность имеет ограниченную высоту и native scroll. Четыре edge доступны на всех размерах.

Декоративные portrait/video скрыты от screen reader. Интерактивная кнопка имеет имя, описание управления, aria-controls/expanded. Скрытая bubble inert и aria-hidden; Escape/закрытие возвращает focus на кнопку, если он находился в панели. Нет focus trap. Reduced-motion: без video, без scale/blur/translate у bubble, snap мгновенный, короткий opacity transition. Без JavaScript остаются настоящий Hero и статичный портрет; неработающая кнопка disabled.

## 15. Производительность

Нет WebGL context/постоянного avatar render loop. RAF используется только при gesture/scroll event; React не перерисовывается на pointermove. Геометрия bubble не читается в drag loop. ResizeObserver, matchMedia listeners, ScrollTrigger, таймеры, object URLs и видео очищаются при unmount. Analytics передаёт только начало/конец drag, выбранный edge, bubble view/complete и label состояния, без mouse paths.

HTML `<main>` после Hero совпал с исходным релизом побайтово (43 723 символа). Существующие сцены, формы, навигация и FAQ не переделывались.

## 16. Настройка

Единая точка: `src/system-avatar/config.ts`.

| Группа | Параметры |
|---|---|
| avatar | desktopSize=282, mobileSize=196, mobileBreakpoint=768, desktopMargin=20, mobileMargin=14, dragThreshold=5, dragSmoothing=.72, snapDuration=.48, minStateDuration=350, storageKey, zIndex=40, shortViewportHeight=420, shortViewportRatio=.38 |
| bubble | maxWidth=430, mobileWidth=310, gap=18, zIndex=41, scaleFrom=.97, blurFrom=10, translateFrom=18, revealStart=.60, revealEnd=.40, exitStart=.55, exitEnd=.15, dismissReset=.02, interactiveAt=.12, seenAt=.2, completeAt=.95 |
| video | base, manifest, poster, imageFallback, minQuality=8, minMouth=9, minStability=8, crossfadeMs=160, loadTimeoutMs=5000, preloadDelayMs=1200, hoverDwellMs=400, reactionCooldownMs=5000, droppedFrameLimit=.25 |

## 17. Проверки и ограничения

Проверки завершены:

- Production static build и TypeScript — PASS; lint — 0 ошибок, одно прежнее предупреждение `no-img-element` в `src/app/layout.tsx`.
- Unit: 16/16 (geometry, manifest validation, существующая validation).
- Avatar E2E: 47 уникальных сценариев подтверждены суммарно основными и целевыми прогонами: Chromium 24, WebKit 23. CDP touch/pinch — только Chromium; соответствующий WebKit case явно skipped.
- Site regression: 31/31, включая WCAG на главной/FAQ и desktop/mobile. Реальная доставка формы не вызывалась.
- Chromium основной прогон: 20/20. WebKit первоначально 19/20: точный assert `1.000` упирался в округление scroll до `0.995`; проверка изменена на допуск <1%, целевой повтор прошёл.
- Media-проверки дожидаются завершения crossfade и idle one-shot. Порядок быстрых переключений проверен с детерминированным playback-quality API; отдельный тест проверяет fallback при 50% dropped frames. Первоначальные прогоны показали естественное срабатывание этой защиты под нагрузкой headless Chromium.
- Проверены все четыре края/угла, быстрый pointer, cancel/capture, click threshold, resize/reload/storage errors, mobile 320 px, landscape, CSS zoom 125/150%, touch/pinch, backscroll, drag/scroll с bubble, меню/modal, missing manifest/state/video/poster, hidden document, reduced motion, no-JS.
- Публичный HTTP 200, screenshots и page-error наблюдение: `output/floating-avatar-qa/` в корне workspace проекта. Девять файлов motion (manifest + clips + posters) совпадают SHA-256 с handoff.

При инструментированном drag на серверном headless Chromium зарегистрировано 67 RAF samples и 0 main-thread long tasks >50 ms. RAF median 133.3 ms / p95 249.9 ms в этом прогоне под параллельной browser-нагрузкой **не подтверждают 60 FPS** и не являются сравнением с прежней версией. Raw observation сохранён в `runtime-observation.json`. Аппаратная плавность требует проверки на целевых устройствах.

Видео являются короткими one-shot, seamless loop отсутствует. Проверка в headless WebKit не заменяет проверку на физическом iPhone/Safari. CSS zoom 125/150% и visualViewport эмуляция покрывают геометрию, но не равнозначны ручному browser chrome zoom на всех устройствах. Аппаратные FPS/энергопотребление на слабом телефоне в этой среде не измеряются.

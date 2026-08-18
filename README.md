# CRYSTAL CUBE

Production motion-сайт Даниила Чекулаева: B2B-маркетинг от спроса до выручки.

Оперативный статус, состояние motion/video и открытые release decisions - в
[`docs/CURRENT_STATE.md`](docs/CURRENT_STATE.md). Production pack в
`b2b_marketing_site_production_pack_v1/` - исходная спецификация; он не служит
журналом текущей реализации.

## Локальный запуск

```bash
npm install
npm run dev
```

Проверки:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

`npm run test:e2e` запускает уже собранную production-версию на
`127.0.0.1:3011`, поэтому перед ним обязателен `npm run build`. Suite проверяет
девять viewport’ов, desktop-inertia, Hero framing, video lifecycle, backscroll,
reduced motion, клавиатуру, форму и WCAG через axe.
Опубликованный сайт проверяется тем же suite:

```bash
PLAYWRIGHT_BASE_URL=https://crystal-b2b.duckdns.org npm run test:e2e
```

## Production и environment

Production: `https://crystal-b2b.duckdns.org`.

Production runtime использует ignored `.env.production.local`:

- `NEXT_PUBLIC_SITE_URL` - публичный HTTPS-origin для canonical, sitemap и OG;
- `LEAD_WEBHOOK_URL` - серверный HTTPS-endpoint доставки заявок.

Без `LEAD_WEBHOOK_URL` форма намеренно возвращает `503` и сохраняет введённые
данные: ложный success-state не показывается. Webhook получает JSON с полями
`name`, `contact`, `task` и `source`; секрет остаётся только на сервере.

`.env.example` предназначен **только** для offline Seedance pipeline. Скопируйте
его в ignored `.env.local`, если нужно генерировать видео. Runtime-аналитика не
ожидает environment variables: сайт вызывает `window.dataLayer?.push()` и
создаёт событие `site:analytics`; конкретный provider подключается отдельным
осознанным решением.

На production временно доступен design-review переключатель типографики:
`A / Тихая`, `B / Баланс`, `C / Акцент`. По умолчанию используется наиболее
спокойная Apple-подобная шкала A; выбор сохраняется только локально в браузере.
После финального выбора альтернативные шкалы и review UI можно удалить.

Для локального измерения стартового JavaScript после `npm run build` и
`npm run start -- -p 3011`:

```bash
node scripts/audit-bundle.mjs
```

## Motion и video delivery

Hero, Control the Flow и Connected System используют локальные H.264 MP4 из
`public/media/video/`. Общий `ViewportVideo` работает на desktop и mobile,
назначает source только около viewport, проигрывает muted loop без controls и
сохраняет WebP при `prefers-reduced-motion` или ошибке загрузки. В Flow scroll
не меняет положение video media layer.

Desktop от 961 px дополнительно получает wheel-inertia без внешней зависимости;
keyboard, anchors, zoom и native scrolling не перехватываются. Hero poster и
video на desktop синхронно сдвинуты вправо на 8 px. Полная таблица состояния
сцен - в [`docs/CURRENT_STATE.md`](docs/CURRENT_STATE.md).

## Offline video generation

Первые кадры пяти сцен лежат в `assets/generated/first-frames/masters/`, а
production WebP — в `public/media/first-frames/`. Seedance используется только
как offline asset pipeline: сайт не вызывает generative API в runtime.

После добавления `EMPIRIOLABS_API_KEY` в локальный `.env.local` запрос можно
сначала проверить без списания средств:

```bash
npm run generate:video -- --preflight --verify-sources
npm run generate:video -- --scene 01-hero --dry-run
```

Промпты и параметры находятся в `assets/generated/video-prompts/`. Каждый
реальный запуск сохраняет job metadata и MP4 в новый gitignored каталог
`assets/generated/video/<timestamp>/`, не перезаписывая предыдущие результаты.
Сначала прочитайте [`docs/VIDEO_GENERATION_RUNBOOK.md`](docs/VIDEO_GENERATION_RUNBOOK.md):
Scene 02 стоит на hold, а 16:9 Hero render ждёт отдельного sign-off и не
подменяет текущий website MP4.

## Документация и release

- [`docs/CURRENT_STATE.md`](docs/CURRENT_STATE.md) - состояние production,
  media и открытые решения;
- [`docs/deployment.md`](docs/deployment.md) - безопасный release runbook;
- [`docs/VIDEO_GENERATION_RUNBOOK.md`](docs/VIDEO_GENERATION_RUNBOOK.md) -
  offline Seedance pipeline;
- [`docs/CODE_REVIEW_REPORT.md`](docs/CODE_REVIEW_REPORT.md) - baseline-аудит и
  актуальный статус findings;
- [`docs/CODE_REVIEW_FIX_PLAN.md`](docs/CODE_REVIEW_FIX_PLAN.md) - оставшийся
  release gate и backlog.

Все продуктовые требования находятся в
`b2b_marketing_site_production_pack_v1/`. Reference media из этого каталога
используются только для анализа и не входят в production bundle.

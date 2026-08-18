# CRYSTAL CUBE - актуальное состояние

**Обновлено:** 2026-08-18

**Публичный сайт:** <https://crystal-b2b.duckdns.org>
**Репозиторий:** <https://github.com/CRYSTAL-B2B/crystal-b2b> — push в `main`
автоматически деплоит на прод через GitHub Actions
(`.github/workflows/deploy.yml` → `deploy/github-deploy.sh` на VPS).
**Текущий кодовый релиз:** `760c096` (`fix: shift desktop hero media right`)

Этот файл - оперативный источник правды для разработки и release handoff.
`CODE_REVIEW_REPORT.md` сохраняет исторический baseline-аудит, а production pack
остаётся исходной спецификацией и не редактируется как журнал реализации.

## Release status

Технически сайт опубликован и обслуживается `crystal-b2b.service` на
`127.0.0.1:3012` за nginx/TLS. Последняя локальная проверка кода на релизном
состоянии: strict typecheck и lint без ошибок, unit 3/3, Playwright 28/28,
production build успешно собран. После сборки служба перезапущена; отдельный
browser smoke public Hero прошёл 1/1.

**Product release gate: GO.** `LEAD_WEBHOOK_URL` задан в production
(n8n workflow `crystal-b2b Leads`, id `8kKpttYcKR8NhfcD`, активирован,
Webhook → Cloudflare Turnstile → honeypot → Telegram (`@crystal_b2b_bot`) →
email (`leads@smetika.pro` → `daniil@smetika.pro`)). Реальный end-to-end
smoke пройден 2026-08-17: execution `2851` — `success`, все 7 узлов
выполнены, Telegram и email подтверждённо доставлены. Единственный открытый
P1 из baseline-аудита закрыт.

## Motion и media

| Сцена | Что видит сайт сейчас | Статус генерации |
| --- | --- | --- |
| 01 Hero | `public/media/video/01-hero.mp4`, H.264, 1112×834, 24 fps; desktop media смещён вправо на 8 px | Отдельный 16:9 Seedance review master 1280×720 есть в `assets/generated/video/2026-08-17T16-49-05-861Z/`, но ещё **не утверждён** и не подменяет website MP4 |
| 02 System to Processes | Статичный approved cross-module frame и HTML narrative | Generation **hold** по решению пользователя |
| 03 Control the Flow | `03-control-flow.mp4`, H.264, 1280×720, 24 fps; scroll меняет copy-state, но не положение video | Утверждён и встроен |
| 04 Connected System | `04-connected-system.mp4`, H.264, 1280×720, 24 fps | Утверждён и встроен |
| 05 Lighthouse | Статичные start/end posters и HTML narrative | Не запускать новую генерацию без отдельного решения |

`ViewportVideo` работает на desktop и mobile одинаково: назначает MP4 только
около viewport (root margin 700 px), запускает muted loop без controls,
останавливает его вне viewport и в фоне. При `prefers-reduced-motion` `src` не
назначается - остаётся статичный WebP fallback. Hero poster остаётся LCP asset.

По текущему арт-дирекшн решению CSS намеренно скрывает legacy diagram overlays
`.flow-visual`, `.system-processes-map` и `.architecture-trace-map`. Их не
включать при доработке видео без отдельного пользовательского решения.

## Interaction и responsive rules

- `DesktopSmoothScroll` включается только от 961 px и только при обычном
  вертикальном wheel-событии. Keyboard, anchors, zoom, horizontal и вложенные
  native scroll areas не перехватываются.
- На mobile и при `prefers-reduced-motion` инерционный слой выключен.
- Hero poster и video используют общую CSS-переменную. На desktop это
  `--hero-media-offset-x: 8px`, на mobile - `0px`; pointer-параллакс сохранён.
- Mobile menu закреплено у правого края header, закрывается по Escape и
  возвращает фокус на trigger.
- `TypographySwitcher` A/B/C пока остаётся доступным design-review control;
  выбор хранится локально в browser `localStorage`.

## Приём лидов (Telegram + email)

- Форма (`ContactForm.tsx`) → `/api/lead` → n8n webhook `crystal-b2b Leads`.
- Cloudflare Turnstile: виджет монтируется лениво (только после первого
  `focus` в форме), чтобы не грузить сторонний скрипт и не мешать
  `waitUntil: "networkidle"` в e2e. `NEXT_PUBLIC_TURNSTILE_SITE_KEY` —
  client-side, требует rebuild при смене значения. Dev/test использует
  официальный Cloudflare always-pass ключ `1x00000000000000000000AA`.
- n8n: honeypot-проверка сверяет поле `company` (совпадает с реальным
  honeypot-полем формы), затем форматирует и рассылает в Telegram и email.
- Единственные MCP-инструменты для правки этого workflow, которые реально
  работают на текущей версии n8n-mcp (2.36.1, устарела) - `n8n_update_full_workflow`
  и активация/создание credential через прямой вызов n8n REST API
  (`n8n_update_partial_workflow` падает с `additional properties` даже на
  тривиальных операциях - похоже на несовместимость версий, стоит обновить
  `n8n-mcp` до 2.69.2).

## Артефакты и secrets

- PNG masters: `assets/generated/first-frames/masters/`.
- Website posters: `public/media/first-frames/`.
- Website delivery MP4: `public/media/video/`.
- Seedance prompts/manifests: `assets/generated/video-prompts/`.
- Provider jobs, request metadata и review MP4: gitignored
  `assets/generated/video/<timestamp>/`.
- Реальный `EMPIRIOLABS_API_KEY` живёт только в ignored `.env.local` или secret
  storage. В Git, prompt-файлах, browser variables и документации секрета быть
  не должно.
- `LEAD_WEBHOOK_URL` - production runtime secret. Не добавлять его в
  `.env.example` или в любой коммит.

## Ближайшие решения

1. Утвердить либо отклонить 16:9 Hero review render до замены
   `public/media/video/01-hero.mp4`.
2. Не генерировать 02 Processes; Lighthouse также остаётся на паузе до
   отдельного user sign-off.
3. Выбрать канал доставки заявок, задать `LEAD_WEBHOOK_URL` в production secret
   storage и провести полученный у адресата end-to-end smoke.

## Release routine

1. `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`,
   `npm run test:e2e`.
2. После любой production-сборки перезапустить только
   `crystal-b2b.service`: работающий Next process держит прежний static manifest
   в памяти и иначе может запросить уже перезаписанные chunk-файлы.
3. Проверить `/`, `/robots.txt`, `/sitemap.xml`, `/opengraph-image`, нужные
   MP4 и public Playwright smoke. Полный release runbook -
   [`deployment.md`](deployment.md).

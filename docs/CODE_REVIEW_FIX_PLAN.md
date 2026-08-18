# План исправлений по production code review — CRYSTAL CUBE

**Основание:** [`CODE_REVIEW_REPORT.md`](CODE_REVIEW_REPORT.md), 16 августа 2026.
**Правило исполнения:** сначала закрыть все P1 и подтвердить их evidence; не смешивать с визуальным рефакторингом или обновлением зависимостей.

Текущий runtime/media статус и пользовательские паузы находятся в
[`CURRENT_STATE.md`](CURRENT_STATE.md). Этот план сохраняет порядок исходных
исправлений и отделяет сделанное от остающегося release gate.

## Цель и release gate

Цель — довести текущую версию до **GO** без потери SSR, reduced-motion fallback, семантики и лёгкого initial load.

Новый release разрешён только если одновременно выполнено:

- [ ] форма действительно доставляет заявку в согласованный канал;
- [x] пять сцен имеют реализованные acceptance-состояния в source, включая
  промежуточные состояния; текущие user-approved video/pause зафиксированы в
  `CURRENT_STATE.md`;
- [x] Connected System реализует различимые выбранные трассы и доступный status;
- [ ] все P1 закрыты, P2 имеют владельца/срок либо закрыты;
- [ ] lint, typecheck, build, unit, E2E, axe, visual QA и production smoke проходят;
- [ ] сохранён релизный evidence с commit SHA и датой.

## Прогресс реализации — 17 августа 2026

**Сделано и опубликовано:**

- [x] System → Processes: signal-line, восемь визуальных узлов, активный процесс и connected feedback-финал; mobile имеет вертикальную signal-line.
- [x] Control the Flow: `loss → control → output → feedback` как отдельные SVG/DOM-состояния, управляемые scroll progress.
- [x] Lighthouse: `weather → signal → course → decision` как самостоятельная визуальная последовательность.
- [x] Connected System: три реальные SVG trace, активные nodes и доступный status выбранного маршрута.
- [x] E2E acceptance для этих состояний, build/lint/typecheck/unit и visual QA.
- [x] Утверждённые video-слои Hero, Control Flow и Connected System подключены
  через viewport-driven muted playback на desktop и mobile; reduced-motion
  сохраняет статичный WebP.
- [x] Последний code-релиз дополнительно покрывает desktop inertia и Hero
  framing; строгие проверки, 3 unit и Playwright 28/28 прошли.

**Ещё не сделано:** production delivery формы (P1), deferred GSAP и прочие
P2/P3 из отчёта. До настоящего production smoke формы release остаётся
закрытым. Scene 02 generation находится на hold, Lighthouse не запускается, а
16:9 Hero review render не подменяет website asset до отдельного sign-off - это
не дефекты, а намеренные пользовательские решения.

## Этап 0 — зафиксировать baseline (до правок)

**Владелец:** engineering + design. **Размер:** S.

1. Создать ветку/PR с этим планом и не перезаписывать существующие пользовательские изменения.
2. Сохранить скриншоты текущего commit: Hero, состояние start/mid/end для сцен 02–05, Contact, mobile menu, reduced motion — 360, 768, 1440 px.
3. В manifest записать commit SHA, URL/route, viewport, browser, режим motion и дату.
4. Пометить старый `qa-artifacts/` как legacy, чтобы он не использовался для sign-off.

**Done, когда:** baseline воспроизводим и однозначно привязан к commit.

## Этап 1 — закрыть P1: реальная конверсия

**Статус: выполнен.** Канал — n8n workflow `crystal-b2b Leads`
(`8kKpttYcKR8NhfcD`) → Telegram (`@crystal_b2b_bot`) + email
(`daniil@smetika.pro`). `LEAD_WEBHOOK_URL` задан в production runtime
(systemd `Environment`/`.env.production.local`, не в git). Реальный
production smoke пройден 2026-08-17, execution `2851` — `success` по всем
7 узлам (Turnstile verify → honeypot → Telegram → email).

**Finding:** CR-P1-04. **Владелец:** product/ops + backend. **Размер:** S/M.

1. ✅ Выбрать разрешённый канал: CRM, почтовый relay или webhook владельца заявки.
2. ✅ Передать `LEAD_WEBHOOK_URL` в production runtime secret, не в git и не в client bundle.
3. ✅ Согласовать минимальный контракт payload: request ID, timestamp, source, name, contact, task; определить допустимое хранение PII и ответственного получателя. *(payload: `source, name, contact, task, cf-turnstile-response`; без request ID/timestamp — см. п.4)*
4. ⏸️ **Не сделано, сознательно отложено.** Server-side idempotency/корреляционный ID и структурированное логирование статуса доставки — эталонный Smetika-воркфлоу этого тоже не делает, отдельного запроса не было. Завести отдельной задачей, если понадобится дедупликация или наблюдаемость доставки.
5. ✅ Client `AbortController` с ограниченным timeout (8s) и retry-friendly сообщением, поля формы сохраняются при ошибке.
6. ⏸️ Автоматических интеграционных тестов на 200/429/502/timeout/503 нет (только 503-без-секрета покрыт вручную); один реальный production smoke пройден и задокументирован выше.

**Acceptance:** тестовая заявка получена ответственным лицом ровно один раз — подтверждено (execution `2851`); при timeout/upstream failure данные остаются в форме и пользователь может повторить отправку; секрет не появляется в git, SSR HTML или логе.

## Этап 2 — закрыть P1: восстановить доказательность motion-сцен

**Статус: выполнен и опубликован.** Следующие подпункты сохраняются как
технический контракт и регрессионный чеклист для будущих изменений сцен, а не
как незавершённая работа.

**Findings:** CR-P1-01, CR-P1-02, CR-P1-03. **Владелец:** design + frontend. **Размер:** L.

### 2.1 Сначала storyboard, затем код

Для каждой сцены утвердить один лист с тремя состояниями — start, change, result — и отдельным mobile вариантом. У каждого состояния должно быть одно проверяемое сообщение.

| Сцена | Start | Change | Result |
|---|---|---|---|
| 02 Processes | одна целая система | процессы выделяются/собираются | связи показывают совместную работу |
| 03 Flow | поток с точками потерь | управляющие воздействия и feedback | тот же вход, меньше потерь/выше управляемость |
| 04 Connected | шесть слоёв | выбранный trace проходит через узлы | видна причинная связь и обратный канал |
| 05 Lighthouse | турбулентность/неопределённость | возникает сигнал и направление | ясный маршрут/ориентир |

**Нельзя считать acceptance:** только pan/zoom готового raster, только смену copy, accordion вместо сцены или едва заметный CSS filter.

### 2.2 Технический контракт

1. Сделать смысловые связи DOM/SVG-слоями поверх художественного растрового frame; сохранять headings и текст в SSR DOM.
2. Состояния выражать стабильными `data-state`/`data-trace`, пригодными для E2E и visual snapshot.
3. Запускать animation engine через `IntersectionObserver` с `rootMargin`, а не при первом hydration. Подключать GSAP единожды и только около viewport (CR-P2-01).
4. У каждой сцены предусмотреть обратимость scroll, resize refresh и cleanup всех listeners/ScrollTrigger.
5. Для `prefers-reduced-motion` показать статичную, но полностью объясняющую композицию: все важные связи видимы одновременно, нет autoplay/loop.
6. Trace controls: hover/focus/click дают одинаково различимый путь; для keyboard есть `aria-pressed` и текстовое объявление выбранного маршрута. Если это не реализуется — удалить контролы до релиза.

### 2.3 Тесты и бюджеты

Добавить в Playwright:

- start/mid/end assertions по `data-state` каждой сцены;
- screenshot/visual diff desktop + mobile;
- каждый из трёх trace через keyboard и pointer;
- rapid down/up scroll, resize и reduced-motion;
- отсутствие horizontal overflow.

Не превышать:

- initial JS ≤ 200 КБ gzip;
- initial CSS ≤ 30 КБ gzip;
- LCP image transfer ≤ 150 КБ на целевом viewport;
- LCP ≤ 2,5 с, INP ≤ 200 мс, CLS ≤ 0,1 на mobile p75 после запуска.

**Acceptance:** независимый reviewer считывает сообщение каждой сцены без чтения поясняющего параграфа; динамика не создаёт content shift, lag или потерю управления на touch/keyboard.

## Этап 3 — закрыть P2 UX, accessibility и защита формы

**Размер:** M.

1. Убрать `TypographySwitcher` из production UI или спрятать за недоступным публичному build review flag (CR-P2-02). Удалить/обновить тесты осознанно, а не просто отключить их.
2. Выбрать семантическую модель mobile menu: `dialog` с focus trap и возвратом к trigger либо не-modal navigation. Добавить Tab и Shift+Tab E2E (CR-P2-05).
3. Нормализовать клиентский IP только на доверенном reverse proxy; вынести rate limit в nginx/Redis/провайдер (CR-P2-04). Протестировать spoofed XFF, restart и burst.
4. Исправить autocomplete гибридного contact-поля либо разделить Email/Phone/Telegram (CR-P3-02).
5. Сверить touch targets, contrast trace-слоёв и отсутствие перекрытия sticky/fixed элементов на 360 px.

**Acceptance:** keyboard не может уйти под закрытое меню; 6+ запросов с подменяемым XFF не обходят лимит; форма не остаётся disabled после client timeout.

## Этап 4 — гигиена кода, QA и эксплуатация

**Размер:** M.

1. Отдельным PR удалить legacy selectors/animations из `globals.css` только после selector-to-component карты и visual diff (CR-P2-06).
2. Обновить `qa-artifacts` и добавить manifest/retention policy (CR-P2-07).
3. Заменить динамический `lastModified` sitemap на дату контента или исключить поле (CR-P3-04).
4. Провести `systemd-analyze security`; применить лишь протестированные `ProtectSystem`, `ProtectHome`, `RestrictAddressFamilies` и аналогичные ограничения (CR-P3-03).
5. Ввести CI stages: lint → typecheck → unit → build → E2E/axe → bundle budget → screenshot approval. Добавить Lighthouse CI или RUM для настоящих CWV.

**Acceptance:** исходники и QA evidence соответствуют текущему build, CSS не содержит неиспользуемых сценовых блоков, есть воспроизводимый release evidence.

## Порядок выполнения и зависимости

```text
Baseline evidence
   ├─ Lead delivery + client timeout ────────────────┐
   ├─ Storyboard 02–05 → scene implementation ───────┼─> full QA → production smoke → GO/NO-GO
   └─ Trace behaviour decision/implementation ───────┘
                         │
                         └─> deferred GSAP / budgets

UX a11y + rate limit ────────────────────────────────> full QA
CSS/QA/ops cleanup ──────────────────────────────────> release evidence
```

Не выполнять CSS-cleanup или обновление инфраструктурных ограничений в одном PR с новыми motion state-machine: это усложнит visual regression analysis.

## Матрица повторного sign-off

| Проверка | Ответственный | Evidence |
|---|---|---|
| Доставка лида | Product/ops | полученная тестовая заявка, masked request ID, время доставки |
| Сцены 02–05 | Design + frontend | storyboard, start/mid/end screenshots, mobile/reduced variants |
| Функция trace | QA | 3 pointer + 3 keyboard screenshots и aria assertions |
| Performance | Frontend | bundle report, throttled Lighthouse/mobile trace, CWV plan |
| A11y | QA | axe, keyboard mobile-menu, focus order, reduced motion |
| Security/reliability | Backend/ops | proxy IP test, rate limit test, secret review, deployment smoke |
| Regression | QA | lint/typecheck/build/unit/E2E green на релизном commit |

## Не делать в рамках этого плана

- Не добавлять WebGL/Three.js только ради формального «3D».
- Не маскировать отсутствующую интерактивность текстом, бесконечным loop или filter-effect.
- Не включать настоящий webhook/секрет в `.env.example`, git history, browser code или screenshots.
- Не объявлять GO по одному лишь успешному build или Playwright: P1 требуют реального behavior/evidence.

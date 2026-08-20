# Деплой (GitHub Pages)

Это статическая версия сайта `b2b-system.pro`, собранная через
`next build` с `output: "export"`. Никакого сервера — GitHub Pages отдаёт
файлы из `out/` напрямую.

## Чем отличается от основной (VPS) версии в корне репозитория

| | Корень репозитория (VPS) | Эта папка (GitHub Pages) |
|---|---|---|
| Хостинг | systemd + nginx на VPS | GitHub Pages |
| Форма заявок | `/api/lead` → n8n (сервер) | Прямой `fetch()` в n8n из браузера |
| Rate-limit по IP | Есть (in-memory на сервере) | **Нет** — только Turnstile + honeypot в самом n8n |
| Security-заголовки (CSP, HSTS, X-Frame-Options) | Есть, через `next.config.ts` `headers()` | **Нет** — платформа их не поддерживает |
| `next/image` оптимизация | Есть | Отключена (`unoptimized: true`) |

Оба варианта шлют заявки в один и тот же n8n-воркфлоу `crystal-b2b Leads`
(id `8kKpttYcKR8NhfcD`), с идентичным payload — менять что-либо в n8n не
потребовалось.

## Переменные окружения при сборке

Все три переменные — публичные (видны в исходнике страницы после сборки),
поэтому передаются как GitHub Actions **Variables** (не Secrets), в
Settings → Secrets and variables → Actions → Variables:

- `TURNSTILE_SITE_KEY` — ⚠️ после смены домена на `b2b-system.pro`
  проверить в Cloudflare Turnstile, что этот домен добавлен в список
  разрешённых hostname для виджета - иначе форма перестанет проходить
  проверку
- `LEAD_WEBHOOK_URL` — тот же n8n webhook
- `YANDEX_METRIKA_ID` — тот же счётчик

Локально `.env.local` намеренно не задаёт `NEXT_PUBLIC_LEAD_WEBHOOK_URL` —
это гарантирует, что `npm run build`/`npm run test:e2e` без явного
окружения не могут случайно отправить реальную заявку в Telegram/email.

## Первоначальная настройка (вручную, один раз)

1. **Settings → Pages** → Source: **GitHub Actions**.
2. Добавить три Variables выше.
3. **Settings → Pages → Custom domain**: `b2b-system.pro`
   (файл `public/CNAME` уже прописывает это при сборке, но поле в
   настройках GitHub тоже нужно заполнить — так GitHub начинает
   проверять DNS и выпускать сертификат).
4. **DNS в Cloudflare** (домен куплен на Porkbun, зона DNS — в
   Cloudflare): удалить парковочные ALIAS/CNAME на `pixie.porkbun.com`,
   добавить 4 A-записи на apex-домен:
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```
   и CNAME `www` → `crystal-b2b.github.io`. **Proxy status — обязательно
   "DNS only" (серое облако)**: проксирование через Cloudflare ломает
   выпуск сертификата GitHub Pages.
5. После того как DNS обновится и GitHub подтвердит домен — включить
   **Enforce HTTPS** в Settings → Pages (появится, когда сертификат
   будет готов, обычно в течение часа).

Домен сменился 2026-08-20 с `crystal-b2b.duckdns.org` на
`b2b-system.pro` — DuckDNS-домен GitHub Pages больше не обслуживает.

## Деплой

Публикация — только вручную: вкладка Actions → Deploy Pages → Run
workflow. Пуш в `main` больше не запускает деплой автоматически —
это осознанно отключено, чтобы изменения можно было проверить
локально перед тем, как они попадут на живой домен.

# crystal-b2b — GitHub Pages, актуальное состояние

**Обновлено:** 2026-08-20

Статическая версия основного сайта, заменившая VPS-хостинг —
теперь полностью на GitHub Pages, домен `b2b-system.pro` (ранее
`crystal-b2b.duckdns.org`, миграция 2026-08-20). Код и
разница с VPS-версией — см. [deployment.md](deployment.md).

## Что сделано

- `output: "export"` в `next.config.ts`, `/api/lead` удалён
- `ContactForm.tsx` шлёт заявку прямо в n8n (`fetch` из браузера), тот
  же payload, что раньше собирал `/api/lead`
- `public/CNAME` + `public/.nojekyll` для кастомного домена
- `.github/workflows/deploy-pages.yml` — публикация только вручную
  (Actions → Deploy Pages → Run workflow); автодеплой по пуше
  отключён осознанно
- Локальная сборка/тесты по умолчанию без `LEAD_WEBHOOK_URL` — заявки
  не улетают в реальный n8n при разработке
- Три Variables добавлены в GitHub Actions, Pages включён (Source:
  GitHub Actions), custom domain подтверждён, сертификат выпущен
- DNS на DuckDNS переключён на IP GitHub Pages
  (`185.199.108.153`), Enforce HTTPS включён (HTTP → HTTPS 301
  подтверждён)
- Домен проверен вживую: HTTP 200, все три baked-in значения
  (Turnstile key, webhook URL, Metrika ID) найдены в собранном JS
- Смок-тест реальной заявки на живом домене пройден — форма
  подтверждена рабочей

## VPS

VPS (`crystal-b2b.service`) больше не обслуживает этот домен — DNS
полностью на GitHub Pages. Сервис на VPS можно оставить как есть
(история/архив) или отключить отдельным решением — этот файл его
не описывает.

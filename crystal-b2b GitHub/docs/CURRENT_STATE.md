# crystal-b2b — GitHub Pages, актуальное состояние

**Обновлено:** 2026-08-18

Статическая версия основного сайта, подготовленная для полной замены
VPS-хостинга на `crystal-b2b.duckdns.org` через GitHub Pages. Код и
разница с VPS-версией — см. [deployment.md](deployment.md).

## Что сделано

- `output: "export"` в `next.config.ts`, `/api/lead` удалён
- `ContactForm.tsx` шлёт заявку прямо в n8n (`fetch` из браузера), тот
  же payload, что раньше собирал `/api/lead`
- `public/CNAME` + `public/.nojekyll` для кастомного домена
- `.github/workflows/deploy-pages.yml` — автосборка и публикация при
  пуше в `main` (только при изменениях в этой папке)
- Локальная сборка/тесты по умолчанию без `LEAD_WEBHOOK_URL` — заявки
  не улетают в реальный n8n при разработке

## Что ещё не сделано (ручные шаги, не автоматизируются кодом)

- [ ] Добавить три Variables в GitHub Actions (см. deployment.md)
- [ ] Включить Pages в Settings, указать custom domain
- [ ] Переключить DNS на DuckDNS на IP GitHub Pages
- [ ] Дождаться сертификата, включить Enforce HTTPS
- [ ] Финальный smoke-тест реальной заявки на живом домене

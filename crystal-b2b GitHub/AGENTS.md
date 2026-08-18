# crystal-b2b (GitHub Pages) — инструкции проекта

Статический (`output: "export"`) вариант crystal-b2b для GitHub Pages —
см. `docs/deployment.md` для того, чем он отличается от основной
VPS-версии в корне репозитория. Публичный текст сайта — на русском
языке. Нельзя выдумывать контакты, кейсы, метрики или успех отправки
формы.

После значимых изменений запускай lint, typecheck, tests и production
build (`npm run build` — не `next start`, сервера в этом варианте нет).
Для motion обязательно проверяй backscroll, mobile и
`prefers-reduced-motion`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

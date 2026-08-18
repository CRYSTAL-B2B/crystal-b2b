# CRYSTAL CUBE — инструкции проекта

Перед любыми изменениями полностью прочитай:

1. `b2b_marketing_site_production_pack_v1/AGENTS.md`
2. `b2b_marketing_site_production_pack_v1/docs/00_MASTER_SPEC.md`
3. остальные документы из `b2b_marketing_site_production_pack_v1/docs/`
4. нужные scene-spec из `b2b_marketing_site_production_pack_v1/docs/scenes/`
5. `PLANS.md`

Production pack является источником истины. Reference media используются только
для анализа и не импортируются в production bundle. Публичный текст сайта — на
русском языке. Нельзя выдумывать контакты, кейсы, метрики или успех отправки формы.

После значимых изменений поддерживай `PLANS.md`, запускай lint, typecheck, tests и
production build. Для motion обязательно проверяй backscroll, mobile и
`prefers-reduced-motion`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

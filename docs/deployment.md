# Deployment: crystal-b2b.duckdns.org

## Topology

`https://crystal-b2b.duckdns.org` → nginx 443 → `127.0.0.1:3012` →
`crystal-b2b.service` → Next.js production build.

The application port is loopback-only. Nginx terminates TLS, redirects HTTP,
sets HSTS and controls cache policy. Next.js provides CSP and the remaining
security headers.

## Server files

- systemd: `/etc/systemd/system/crystal-b2b.service`;
- nginx: `/etc/nginx/sites-available/crystal-b2b.duckdns.org`;
- certificate: `/etc/letsencrypt/live/crystal-b2b.duckdns.org/`;
- source templates: `deploy/`;
- production environment: `.env.production.local` (ignored by Git).

`NEXT_PUBLIC_SITE_URL` is the public HTTPS origin. `LEAD_WEBHOOK_URL` is a
server-only HTTPS secret; without it `/api/lead` intentionally returns `503`.
Do not put either a provider key or webhook URL in Git, browser variables,
screenshots or documentation.

## Application release

Use this path for application, asset and documentation changes. It does **not**
modify nginx configuration or TLS:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
sudo systemctl restart crystal-b2b.service
sudo systemctl is-active crystal-b2b.service
```

Always restart the service after `npm run build`. A running `next start` process
keeps its old static manifest in memory; if `.next/static` was overwritten by a
new build, omitting the restart can make the public HTML request missing CSS or
JS chunks. This is a known recovered incident, not an optional optimisation.

## Infrastructure change

Only if nginx files or TLS settings changed, additionally run:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Do not reload nginx for a normal Next.js release.

## Post-release verification

1. Check `https://crystal-b2b.duckdns.org/` and the service status.
2. Verify `/robots.txt`, `/sitemap.xml`, `/opengraph-image` and every newly
   released MP4 with an expected `200` and correct MIME type.
3. Run targeted production smoke, then the full suite when the release scope
   warrants it:

   ```bash
   PLAYWRIGHT_BASE_URL=https://crystal-b2b.duckdns.org npm run test:e2e
   ```

4. Verify no browser console/page errors and no horizontal overflow at desktop
   and mobile.
5. Until `LEAD_WEBHOOK_URL` is configured, confirm the valid lead path keeps
   the honest `503` configuration message rather than reporting success.

The current media, release gate and outstanding decisions are in
[`CURRENT_STATE.md`](CURRENT_STATE.md).

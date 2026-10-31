# Base44 dev environment notes

## Running the app

- `docker compose -f docker-compose.base44.yml up -d --build` — full stack (run from repo root).
- Web app (CloudTV): http://localhost:3000 (Vite dev server, source bind-mounted, live reload).
- API server: http://localhost:8000 (`/api/healthz`) — Express stub, no routes beyond health.
- Mockup sandbox (design harness): http://localhost:3001.
- Postgres: internal only (`db:5432`), dev credentials `cloudtv/cloudtv`, volume `pgdata`.

## Non-obvious setup facts

- Source is bind-mounted at `/workspace`; dependencies are NOT baked into the image. A one-shot
  `install` service runs `pnpm install --frozen-lockfile` after the mount, and every app service
  waits for it (`service_completed_successfully`). Re-run it after changing `pnpm-lock.yaml`:
  `docker compose -f docker-compose.base44.yml run --rm install`.
- Both Vite apps (`cloudtv`, `mockup-sandbox`) require `PORT` and `BASE_PATH` env vars at config load;
  the compose file sets them (3000 / 3001, base `/`).
- The API `dev` script builds with esbuild and then runs the bundle — there is no watcher, so restart
  the api service to pick up backend edits: `docker compose -f docker-compose.base44.yml restart api`.
- `lib/db` throws at import without `DATABASE_URL`; the API does not import it today, but the
  `db-push` service runs Drizzle push against the compose Postgres and the schema is currently empty.
- CloudTV has no backend dependency: providers (M3U / Xtream credentials) are entered in
  Settings → IPTV Servers and kept in browser localStorage/session for the web preview. No external
  API keys are required to boot.
- Playlist/stream fetching is subject to the provider's CORS policy in a browser; a CORS error in the
  preview is not evidence that the playlist URL is invalid.

## Verifying

- `curl -s http://localhost:3000/` returns the Vite HTML shell and `/src/main.tsx` returns transformed
  source (confirms the dev server, not a prebuilt bundle).
- `curl -s http://localhost:8000/api/healthz` → `{"status":"ok"}`.
- Typecheck (inside the container): `docker compose -f docker-compose.base44.yml exec -T web pnpm -w run typecheck`.

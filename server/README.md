# Falimy PocketBase Server

This folder contains the self-hosted PocketBase setup. It is meant to be shared as-is so families can run their own private backend.

## Quickstart (Docker)

1. Copy the example env file:

```bash
cp .env.example .env
```

2. Start PocketBase:

```bash
docker compose up -d
```

If PocketBase is already running, restart it after changing files:

```bash
docker compose down
docker compose up -d
```

3. Open PocketBase admin UI:

```
http://localhost:8090/_/
```

## Access URLs

- Admin UI: `http://localhost:8090/_/`
- API base: `http://localhost:8090/api/`
- Health check: `http://localhost:8090/api/health`

## Admin Credentials

- Set `PB_ADMIN_EMAIL` and `PB_ADMIN_PASSWORD` in `.env` before the first run.
- Use those values to sign in at the Admin UI.
- If you change them later, restart the container.

## Sharing for Self-Hosting

To share this setup with a family:

1. Send them this `server/` folder.
2. They run the same Docker commands above.
3. They can expose port 8090 via a reverse proxy with HTTPS.

## Files

- `docker-compose.yml` - PocketBase container
- `pb_migrations/` - PocketBase migrations (schema, rules)
- `pb_hooks/` - PocketBase hooks (optional)
- `.env.example` - environment template

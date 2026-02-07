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

3. Open PocketBase admin UI:

```
http://localhost:8090/_/
```

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

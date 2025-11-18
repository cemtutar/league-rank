# LoL Player Tracker

A minimal League of Legends player tracker with both Next.js App Router **and** Angular frontends backed by a Spring Boot service that handles Riot API calls and persistence.

## Features

- Resolve Riot IDs to persistent PUUIDs through the Spring Boot API
- Persist players and ranked match history to PostgreSQL via Spring Data JPA
- Enrich match summaries with champion artwork cached from Data Dragon
- Two UI options: the existing Tailwind-styled Next.js client or a new Angular experience built with standalone components

## Getting Started

### 1. Configure environment variables

Copy the sample file and fill in your credentials:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL for the Spring Boot API (defaults to `http://localhost:8080/api`). |
| `RIOT_API_KEY` | Developer key from the Riot Games portal. Required by the backend. |
| `SPRING_DATASOURCE_URL` | JDBC connection string to your Postgres instance (e.g. `jdbc:postgresql://localhost:5432/lol`). |
| `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD` | Database credentials used by Spring. |
| `CORS_ALLOW_ORIGIN` | Comma-separated list of allowed front-end origins (e.g. `http://localhost:3000,http://localhost:4200`). |

> The Spring Boot service automatically loads values from `.env` and `.env.local` (unless real environment variables override them), so you can keep all secrets in one place.

### 2. Install frontend dependencies

- Next.js client: `npm install`
- Angular client: `cd web && npm install`

### 3. Start the Spring Boot backend

In a new terminal:

```bash
cd server
mvn spring-boot:run
```

The service listens on `http://localhost:8080/api` and exposes the `/players/...` endpoints consumed by the UI.

### 4. Run a frontend

#### Next.js App (existing UI)

```bash
npm run dev
```

Visit `http://localhost:3000` and search for a summoner. The frontend forwards requests to the Spring Boot API using `NEXT_PUBLIC_API_BASE_URL`.

#### Angular App (new UI)

```bash
cd web
npm start
```

The Angular dev server proxies `/api` calls to `http://localhost:8080` (see `web/proxy.conf.json`), so the UI can talk to Spring without extra CORS tweaks. When you deploy, update `web/src/environments/environment.prod.ts` to point at the hosted backend URL.

## Notes

- Keep Riot API calls reasonable—development keys rotate every 24 hours and strict rate limits apply.
- DDragon champion metadata is cached in-memory for one hour to avoid excessive network requests.
- The backend stores and reuses match summaries; delete the `server/target` directory or clear the tables if you need a cold start.

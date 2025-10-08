# LoL Player Tracker

A minimal League of Legends player tracker built with Next.js App Router, Prisma, and the Riot Games API.

## Features

- Resolve Riot IDs to persistent PUUIDs
- Persist players and match history to a PostgreSQL database
- Enrich match summaries with champion details from Data Dragon
- Tailwind CSS styling with dark theme defaults

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Update `.env.local` with your credentials.

4. Apply the Prisma schema and generate the client:

   ```bash
   npx prisma migrate dev --name init
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

## Notes

- The Riot API enforces strict rate limits—avoid triggering them with frequent refreshes.
- Data Dragon champion assets are cached for an hour to reduce redundant requests.

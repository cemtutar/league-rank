# League Rank Analytics

A lightweight full-stack demo inspired by community League of Legends statistical dashboards. The
project demonstrates how to combine a Node.js/Express data API with a modern React/Vite front end to
surface champion, player, and meta insights.

## Features

- **Champion analytics** – Simulated win, pick, ban, and build data for a curated champion roster.
- **Player scouting** – Lightweight player overview cards including champion pools and recent form.
- **Meta tracking** – Highlight summaries per patch and emerging picks per role.
- **React dashboard** – Responsive cards, tables, and featured callouts styled for a data-product look.
- **Query caching** – React Query powers data fetching, loading states, and caching.

## Getting started

1. Install dependencies for both workspaces:

   ```bash
   npm install
   npm --prefix apps/server install
   npm --prefix apps/web install
   ```

2. Start the API server (defaults to port `4000`):

   ```bash
   npm run dev:server
   ```

3. In a separate terminal run the React dev server (defaults to port `5173`):

   ```bash
   npm run dev:web
   ```

4. Visit `http://localhost:5173` to explore the dashboard. The front end expects the API to be
   available at `http://localhost:4000`. You can override this by setting a `VITE_API_BASE_URL`
   environment variable before running the React dev server.

## Project structure

```
.
├── apps
│   ├── server         # Express API with mocked champion/player/meta data
│   └── web            # Vite + React dashboard UI
├── package.json       # Root workspace configuration
└── README.md
```

## Production build

To create an optimized front-end build, run:

```bash
npm run build
```

The compiled assets will be generated in `apps/web/dist`. Deploy the Express server separately or use
any hosting strategy that can serve both the API and static files.

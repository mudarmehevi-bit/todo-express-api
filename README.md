# Full-Stack To-Do App with Serverless Calculator & Portfolio Showcase

Built with React, TypeScript, Redux Toolkit, Workbox (PWA), Node.js/Express, SQLite (`better-sqlite3`), and Serverless Functions.

- Portfolio Showcase: `./portfolio/index.html`
- GitHub Repository: `https://github.com/mudarmehevi-bit/todo-express-api`

## Architecture Overview
- Frontend (`client/`): React + TypeScript SPA using Redux Toolkit (`userSlice`, `todosSlice`, `uiSlice`), `src/config.ts`, `ServerlessCalculator`, and Workbox (`sw.js`).
- Backend (`server.js`): Express REST API with `bcrypt` session auth, `/todos` CRUD, `/todos/stats`, `/me`, and `/api/calc` + `/calculate`.
- Portfolio (`portfolio/`): Static HTML/CSS showcase with About, Featured Project, Demo Video embed, and Skills.

## Environment Variables
- Root `.env`: `PORT` (default `5000`), `NODE_ENV`, `SESSION_SECRET` (required in production; temporary random secret generated in non-production if unset), `CLIENT_URL` (default `http://localhost:5173`), `DB_PATH` (default `./todos.db`).
- Client `client/.env`: `VITE_API_URL` (default `http://localhost:5000`).

## Local, Docker & Production Setup
1. Start API: `npm install` then `node server.js`
2. Build client: `cd client` then `npm install` then `npm run build` then `npx vite preview --port 5173`
3. Docker & Nginx: `docker compose up --build` (serves `client/dist` behind Nginx `nginx.conf` with API reverse proxy and SQLite volume storage).

# To-Do Express API & React Frontend

A full-stack To-Do list application built with Node.js, Express, SQLite (`better-sqlite3`), and React.

## Features
- **RESTful API** built with Express.js supporting full CRUD (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
- **SQLite Persistence** using `better-sqlite3` with automatic database (`todos.db`) and table initialization.
- **Parameterized SQL Queries** to prevent SQL injection and clean database connection closure on shutdown.
- **React Frontend** with dynamic state updates, loading states, error handling, and inline editing.

## Setup & Installation
1. **Backend:** Run `npm install` and `node server.js` in the root folder. The API runs on `http://localhost:5000` and stores tasks in `todos.db`.
2. **Frontend:** Run `cd client`, `npm install`, and `npm run dev`. The React app runs on `http://localhost:5173`.
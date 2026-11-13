# To-Do Express API & React Frontend

A full-stack To-Do list application with user registration, login, bcrypt password hashing, session authentication, SQLite (`better-sqlite3`) persistence, and a React frontend.

## Features
- **User Authentication**: Sign up and log in with `bcrypt` hashed passwords stored in SQLite (`users` table) and `express-session` cookies.
- **Protected To-Do API**: All `/todos` CRUD routes verify active user sessions and isolate tasks per user.
- **React Frontend**: Registration/login views and full task management (add, toggle, edit, delete).

## Setup & Installation
1. **Backend:** Run `npm install` and `node server.js` in the root folder (`http://localhost:5000`).
2. **Frontend:** Run `cd client`, `npm install`, and `npm run dev` (`http://localhost:5173`).
# Full-Stack To-Do Application

A full-stack to-do application featuring an Express RESTful API with local JSON file persistence and an interactive React client frontend.

## Architecture & Features
- **Backend**: Node.js & Express API with CORS support and JSON persistence.
- **Frontend**: React (Vite) client providing a responsive UI to create, edit, toggle, and delete tasks with automatic state refresh.
- **Data Store**: `todos.json`

## API Endpoints

- `GET /todos` - Fetch all to-do items
- `GET /todos/:id` - Fetch a single to-do item by ID
- `POST /todos` - Create a new to-do item (Body: `{"title": "Task name"}`)
- `PATCH /todos/:id` - Update an item's title or completed state (Body: `{"title": "...", "completed": true}`)
- `PUT /todos/:id` - Replace/fully update an existing to-do
- `DELETE /todos/:id` - Remove a to-do item by ID

## Running the Application Locally

### 1. Start Backend Server
```bash
npm install
node server.js
```

### 2. Start Frontend Client
```bash
cd client
npm install
npm run dev
```
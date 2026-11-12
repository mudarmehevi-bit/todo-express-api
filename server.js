const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Initialize SQLite database & create table on server start
const dbPath = path.join(__dirname, 'todos.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0
  )
`);

// Helper to convert SQLite integer (0/1) to boolean for React frontend compatibility
const formatTodo = (row) => ({
  id: row.id,
  title: row.title,
  completed: Boolean(row.completed),
});

// GET /todos - Fetch all to-dos
app.get('/todos', (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, title, completed FROM todos ORDER BY id ASC');
    const rows = stmt.all();
    res.json(rows.map(formatTodo));
  } catch (err) {
    console.error('Error fetching todos:', err);
    res.status(500).json({ error: 'Failed to retrieve todos' });
  }
});

// GET /todos/:id - Fetch a single to-do by ID
app.get('/todos/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const stmt = db.prepare('SELECT id, title, completed FROM todos WHERE id = ?');
    const row = stmt.get(id);

    if (!row) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(formatTodo(row));
  } catch (err) {
    console.error('Error fetching todo:', err);
    res.status(500).json({ error: 'Failed to retrieve todo' });
  }
});

// POST /todos - Create a new to-do
app.post('/todos', (req, res) => {
  try {
    const { title, completed = false } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const insertStmt = db.prepare('INSERT INTO todos (title, completed) VALUES (?, ?)');
    const info = insertStmt.run(title.trim(), completed ? 1 : 0);

    const newRow = db.prepare('SELECT id, title, completed FROM todos WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(formatTodo(newRow));
  } catch (err) {
    console.error('Error creating todo:', err);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// PUT /todos/:id - Full update of an existing to-do
app.put('/todos/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, completed } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const updateStmt = db.prepare('UPDATE todos SET title = ?, completed = ? WHERE id = ?');
    const info = updateStmt.run(title.trim(), completed ? 1 : 0, id);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const updatedRow = db.prepare('SELECT id, title, completed FROM todos WHERE id = ?').get(id);
    res.json(formatTodo(updatedRow));
  } catch (err) {
    console.error('Error updating todo:', err);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// PATCH /todos/:id - Partial update (title and/or completed status)
app.patch('/todos/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT id, title, completed FROM todos WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const updatedTitle =
      req.body.title !== undefined && typeof req.body.title === 'string' && req.body.title.trim()
        ? req.body.title.trim()
        : existing.title;

    const updatedCompleted =
      req.body.completed !== undefined ? (req.body.completed ? 1 : 0) : existing.completed;

    const patchStmt = db.prepare('UPDATE todos SET title = ?, completed = ? WHERE id = ?');
    patchStmt.run(updatedTitle, updatedCompleted, id);

    const updatedRow = db.prepare('SELECT id, title, completed FROM todos WHERE id = ?').get(id);
    res.json(formatTodo(updatedRow));
  } catch (err) {
    console.error('Error patching todo:', err);
    res.status(500).json({ error: 'Failed to patch todo' });
  }
});

// DELETE /todos/:id - Delete a to-do
app.delete('/todos/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const deleteStmt = db.prepare('DELETE FROM todos WHERE id = ?');
    const info = deleteStmt.run(id);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully', id });
  } catch (err) {
    console.error('Error deleting todo:', err);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} with SQLite storage`);
});

// Graceful shutdown and database connection closure
const shutdown = () => {
  console.log('\nClosing SQLite database connection...');
  try {
    db.close();
  } catch (err) {
    console.error('Error closing database:', err);
  }
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const db = new Database(path.join(__dirname, 'todos.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0
  )
`);

const formatTodo = (row) => ({
  id: row.id,
  title: row.title,
  completed: Boolean(row.completed),
});

app.get('/todos', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, title, completed FROM todos ORDER BY id ASC').all();
    res.json(rows.map(formatTodo));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

app.post('/todos', (req, res) => {
  try {
    const { title, completed = false } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });
    const info = db.prepare('INSERT INTO todos (title, completed) VALUES (?, ?)').run(title.trim(), completed ? 1 : 0);
    const created = db.prepare('SELECT id, title, completed FROM todos WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(formatTodo(created));
  } catch (err) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

app.put('/todos/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, completed } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });
    const info = db.prepare('UPDATE todos SET title = ?, completed = ? WHERE id = ?').run(title.trim(), completed ? 1 : 0, id);
    if (info.changes === 0) return res.status(404).json({ error: 'Todo not found' });
    const updated = db.prepare('SELECT id, title, completed FROM todos WHERE id = ?').get(id);
    res.json(formatTodo(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

app.patch('/todos/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT id, title, completed FROM todos WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Todo not found' });
    const title = req.body.title !== undefined && req.body.title.trim() ? req.body.title.trim() : existing.title;
    const completed = req.body.completed !== undefined ? (req.body.completed ? 1 : 0) : existing.completed;
    db.prepare('UPDATE todos SET title = ?, completed = ? WHERE id = ?').run(title, completed, id);
    const updated = db.prepare('SELECT id, title, completed FROM todos WHERE id = ?').get(id);
    res.json(formatTodo(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to patch todo' });
  }
});

app.delete('/todos/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const info = db.prepare('DELETE FROM todos WHERE id = ?').run(id);
    if (info.changes === 0) return res.status(404).json({ error: 'Todo not found' });
    res.json({ message: 'Todo deleted', id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const shutdown = () => {
  db.close();
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
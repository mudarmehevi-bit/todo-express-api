const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'todo-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' }
}));

const db = new Database(path.join(__dirname, 'todos.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

const formatTodo = (r) => ({ id: r.id, title: r.title, completed: Boolean(r.completed) });
const requireAuth = (req, res, next) => req.session.userId ? next() : res.status(401).json({ error: 'Unauthorized' });

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username?.trim() || !password) return res.status(400).json({ error: 'Username and password required' });
  if (db.prepare('SELECT id FROM users WHERE username = ?').get(username.trim())) {
    return res.status(409).json({ error: 'Username taken' });
  }
  const hash = await bcrypt.hash(password, 10);
  const info = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username.trim(), hash);
  req.session.userId = info.lastInsertRowid;
  req.session.username = username.trim();
  res.status(201).json({ id: info.lastInsertRowid, username: username.trim() });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username?.trim());
  if (!user || !(await bcrypt.compare(password || '', user.password_hash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  req.session.userId = user.id;
  req.session.username = user.username;
  res.json({ id: user.id, username: user.username });
});

app.post('/logout', (req, res) => req.session.destroy(() => res.json({ message: 'Logged out' })));
app.get('/me', (req, res) => req.session.userId ? res.json({ id: req.session.userId, username: req.session.username }) : res.status(401).json({ error: 'Not logged in' }));

app.get('/todos', requireAuth, (req, res) => {
  res.json(db.prepare('SELECT id, title, completed FROM todos WHERE user_id = ?').all(req.session.userId).map(formatTodo));
});

app.post('/todos', requireAuth, (req, res) => {
  if (!req.body.title?.trim()) return res.status(400).json({ error: 'Title required' });
  const info = db.prepare('INSERT INTO todos (user_id, title, completed) VALUES (?, ?, 0)').run(req.session.userId, req.body.title.trim());
  res.status(201).json(formatTodo(db.prepare('SELECT id, title, completed FROM todos WHERE id = ?').get(info.lastInsertRowid)));
});

app.patch('/todos/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT * FROM todos WHERE id = ? AND user_id = ?').get(id, req.session.userId);
  if (!row) return res.status(404).json({ error: 'Not found' });
  const title = req.body.title?.trim() || row.title;
  const completed = req.body.completed !== undefined ? (req.body.completed ? 1 : 0) : row.completed;
  db.prepare('UPDATE todos SET title = ?, completed = ? WHERE id = ? AND user_id = ?').run(title, completed, id, req.session.userId);
  res.json(formatTodo(db.prepare('SELECT id, title, completed FROM todos WHERE id = ?').get(id)));
});

app.delete('/todos/:id', requireAuth, (req, res) => {
  const info = db.prepare('DELETE FROM todos WHERE id = ? AND user_id = ?').run(Number(req.params.id), req.session.userId);
  info.changes ? res.json({ message: 'Deleted' }) : res.status(404).json({ error: 'Not found' });
});

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
process.on('SIGINT', () => { db.close(); server.close(() => process.exit(0)); });
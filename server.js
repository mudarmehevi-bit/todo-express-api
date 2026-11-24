require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

if (!process.env.SESSION_SECRET) {
  if (isProd) {
    console.error('SESSION_SECRET is required in production');
    process.exit(1);
  }
  console.warn('SESSION_SECRET not set - generating a temporary runtime secret');
  process.env.SESSION_SECRET = crypto.randomBytes(32).toString('hex');
}

const dbPath = process.env.DB_PATH || path.join(__dirname, 'todos.db');
const db = new Database(dbPath);

app.set('trust proxy', 1);

app.use(
  cors({
    origin: process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

function handleCalculation(req, res) {
  const { a, b, op, operation } = req.body || {};
  const selectedOp = operation || op || 'add';
  const numA = Number(a);
  const numB = Number(b);

  if (a === undefined || b === undefined || Number.isNaN(numA) || Number.isNaN(numB)) {
    return res.status(400).json({ error: 'Both a and b must be valid numbers' });
  }

  let result;
  switch (selectedOp) {
    case 'add':
      result = numA + numB;
      break;
    case 'sub':
    case 'subtract':
      result = numA - numB;
      break;
    case 'mul':
    case 'multiply':
      result = numA * numB;
      break;
    case 'div':
    case 'divide':
      if (numB === 0) {
        return res.status(400).json({ error: 'Cannot divide by zero' });
      }
      result = numA / numB;
      break;
    default:
      return res.status(400).json({ error: 'Invalid operation' });
  }

  return res.status(200).json({ result });
}

app.post('/api/calc', handleCalculation);
app.post('/calculate', handleCalculation);

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    const info = stmt.run(username, hashedPassword);
    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ error: 'Session error' });
      req.session.userId = info.lastInsertRowid;
      req.session.username = username;
      res.status(201).json({ id: info.lastInsertRowid, username });
    });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'Session error' });
    req.session.userId = user.id;
    req.session.username = user.username;
    res.json({ id: user.id, username: user.username });
  });
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

app.get('/me', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ id: req.session.userId, username: req.session.username });
});

app.get('/todos', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM todos WHERE user_id = ?').all(req.session.userId);
  const todos = rows.map((t) => ({ ...t, completed: Boolean(t.completed) }));
  res.json(todos);
});

app.get('/todos/stats', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT completed FROM todos WHERE user_id = ?').all(req.session.userId);
  const total = rows.length;
  const completed = rows.filter((r) => r.completed === 1).length;
  const pending = total - completed;
  res.json({ total, completed, pending });
});

app.post('/todos', requireAuth, (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const stmt = db.prepare('INSERT INTO todos (user_id, title, completed) VALUES (?, ?, 0)');
  const info = stmt.run(req.session.userId, title.trim());
  res.status(201).json({
    id: info.lastInsertRowid,
    user_id: req.session.userId,
    title: title.trim(),
    completed: false,
  });
});

app.patch('/todos/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  const existing = db
    .prepare('SELECT * FROM todos WHERE id = ? AND user_id = ?')
    .get(id, req.session.userId);

  if (!existing) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const updatedTitle = title !== undefined ? title.trim() : existing.title;
  const updatedCompleted = completed !== undefined ? (completed ? 1 : 0) : existing.completed;

  db.prepare('UPDATE todos SET title = ?, completed = ? WHERE id = ? AND user_id = ?').run(
    updatedTitle,
    updatedCompleted,
    id,
    req.session.userId
  );

  res.json({
    id: Number(id),
    user_id: req.session.userId,
    title: updatedTitle,
    completed: Boolean(updatedCompleted),
  });
});

app.delete('/todos/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const info = db
    .prepare('DELETE FROM todos WHERE id = ? AND user_id = ?')
    .run(id, req.session.userId);

  if (info.changes === 0) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  res.json({ message: 'Deleted successfully' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

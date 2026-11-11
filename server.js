const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'todos.json');

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to read todos
const readTodos = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, '[]', 'utf8');
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading todos:', err);
    return [];
  }
};

// Helper function to write todos
const writeTodos = (todos) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing todos:', err);
  }
};

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the RESTful To-Do API' });
});

// GET /todos - Fetch all todos
app.get('/todos', (req, res) => {
  const todos = readTodos();
  res.json(todos);
});

// GET /todos/:id - Fetch a single todo
app.get('/todos/:id', (req, res) => {
  const todos = readTodos();
  const todo = todos.find((t) => t.id === req.params.id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  res.json(todo);
});

// POST /todos - Create a new todo
app.post('/todos', (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const todos = readTodos();
  const newTodo = {
    id: Date.now().toString(),
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };

  todos.push(newTodo);
  writeTodos(todos);
  res.status(201).json(newTodo);
});

// PATCH /todos/:id - Partially update an existing todo (edit title or toggle completed)
app.patch('/todos/:id', (req, res) => {
  const todos = readTodos();
  const index = todos.findIndex((t) => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const { title, completed } = req.body;
  if (title !== undefined) todos[index].title = title.trim();
  if (completed !== undefined) todos[index].completed = Boolean(completed);

  writeTodos(todos);
  res.json(todos[index]);
});

// PUT /todos/:id - Replace or fully update a todo
app.put('/todos/:id', (req, res) => {
  const todos = readTodos();
  const index = todos.findIndex((t) => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const { title, completed } = req.body;
  todos[index] = {
    ...todos[index],
    title: title !== undefined ? title.trim() : todos[index].title,
    completed: completed !== undefined ? Boolean(completed) : todos[index].completed
  };

  writeTodos(todos);
  res.json(todos[index]);
});

// DELETE /todos/:id - Delete a todo
app.delete('/todos/:id', (req, res) => {
  const todos = readTodos();
  const exists = todos.some((t) => t.id === req.params.id);

  if (!exists) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const updatedTodos = todos.filter((t) => t.id !== req.params.id);
  writeTodos(updatedTodos);
  res.status(200).json({ message: `Todo with ID ${req.params.id} deleted successfully` });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
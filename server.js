const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'todos.json');

// Built-in middleware to parse JSON bodies
app.use(express.json());

// Helper function to read todos from todos.json
const readTodos = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, '[]');
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading data:', err);
    return [];
  }
};

// Helper function to write todos to todos.json
const writeTodos = (todos) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
  } catch (err) {
    console.error('Error writing data:', err);
  }
};

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the RESTful To-Do API' });
});

// 1. GET /todos - Read all todos
app.get('/todos', (req, res) => {
  const todos = readTodos();
  res.status(200).json(todos);
});

// 2. GET /todos/:id - Read a single todo by ID
app.get('/todos/:id', (req, res) => {
  const todos = readTodos();
  const todo = todos.find(t => t.id === parseInt(req.params.id));

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  res.status(200).json(todo);
});

// 3. POST /todos - Create a new todo
app.post('/todos', (req, res) => {
  const { title, completed } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const todos = readTodos();
  const newTodo = {
    id: todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1,
    title: title.trim(),
    completed: typeof completed === 'boolean' ? completed : false,
    createdAt: new Date().toISOString()
  };

  todos.push(newTodo);
  writeTodos(todos);

  res.status(201).json(newTodo);
});

// 4. PUT /todos/:id - Update an existing todo
app.put('/todos/:id', (req, res) => {
  const todos = readTodos();
  const index = todos.findIndex(t => t.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const { title, completed } = req.body;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }
    todos[index].title = title.trim();
  }

  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed must be a boolean' });
    }
    todos[index].completed = completed;
  }

  writeTodos(todos);
  res.status(200).json(todos[index]);
});

// 5. DELETE /todos/:id - Delete a todo
app.delete('/todos/:id', (req, res) => {
  const todos = readTodos();
  const idToDelete = parseInt(req.params.id);
  const exists = todos.some(t => t.id === idToDelete);

  if (!exists) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const updatedTodos = todos.filter(t => t.id !== idToDelete);
  writeTodos(updatedTodos);

  res.status(200).json({ message: `Todo with ID ${idToDelete} deleted successfully` });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
import { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost:5000/todos';

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [error, setError] = useState(null);

  // 1. Fetch todos (Read) & auto-refresh
  const fetchTodos = async () => {
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Failed to fetch todos');
      const data = await res.json();
      setTodos(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not connect to API server. Ensure server.js is running on port 5000.');
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // 2. Add todo (POST)
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error('Failed to create todo');
      setTitle('');
      await fetchTodos(); // Refresh list after operation
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // 3. Edit todo title or status (PATCH)
  const handleSaveEdit = async (id) => {
    if (!editingText.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingText }),
      });
      if (!res.ok) throw new Error('Failed to update todo');
      setEditingId(null);
      setEditingText('');
      await fetchTodos(); // Refresh list after operation
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleToggleComplete = async (todo) => {
    try {
      const res = await fetch(`${API_BASE}/${todo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (!res.ok) throw new Error('Failed to toggle status');
      await fetchTodos(); // Refresh list after operation
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // 4. Delete todo (DELETE)
  const handleDeleteTodo = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete todo');
      await fetchTodos(); // Refresh list after operation
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="todo-container">
      <h1>To-Do List App</h1>
      <p className="subtitle">React Frontend + Express RESTful API</p>

      {error && <div className="error-banner">{error}</div>}

      {/* Add Todo Form */}
      <form onSubmit={handleAddTodo} className="add-form">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Add Task</button>
      </form>

      {/* Todo Items List */}
      <ul className="todo-list">
        {todos.length === 0 ? (
          <li className="empty-state">No tasks available. Add one above!</li>
        ) : (
          todos.map((todo) => (
            <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={Boolean(todo.completed)}
                onChange={() => handleToggleComplete(todo)}
              />

              {editingId === todo.id ? (
                <div className="edit-box">
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                  />
                  <button className="btn-save" onClick={() => handleSaveEdit(todo.id)}>Save</button>
                  <button className="btn-cancel" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              ) : (
                <span
                  className="todo-title"
                  onClick={() => handleToggleComplete(todo)}
                >
                  {todo.title}
                </span>
              )}

              {editingId !== todo.id && (
                <div className="item-actions">
                  <button
                    className="btn-edit"
                    onClick={() => {
                      setEditingId(todo.id);
                      setEditingText(todo.title);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteTodo(todo.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default App;
import { useState, useEffect } from 'react';
import './App.css';

const API = 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    fetch(`${API}/me`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setUser(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch(`${API}/todos`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && setTodos(data))
      .catch(() => {});
  }, [user]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = authMode === 'register' ? '/register' : '/login';
    const res = await fetch(`${API}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) return setAuthError(data.error || 'Authentication failed');
    setUser(data);
    setUsername('');
    setPassword('');
  };

  const handleLogout = async () => {
    await fetch(`${API}/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
    setTodos([]);
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const res = await fetch(`${API}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title: newTitle }),
    });
    if (res.ok) {
      const created = await res.json();
      setTodos([...todos, created]);
      setNewTitle('');
    }
  };

  const toggleTodo = async (todo) => {
    const res = await fetch(`${API}/todos/${todo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ completed: !todo.completed }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTodos(todos.map((t) => (t.id === todo.id ? updated : t)));
    }
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) return;
    const res = await fetch(`${API}/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title: editTitle }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTodos(todos.map((t) => (t.id === id ? updated : t)));
      setEditingId(null);
    }
  };

  const deleteTodo = async (id) => {
    const res = await fetch(`${API}/todos/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) setTodos(todos.filter((t) => t.id !== id));
  };

  if (!user) {
    return (
      <div className="todo-container">
        <h1>{authMode === 'register' ? 'Create Account' : 'Sign In'}</h1>
        <form onSubmit={handleAuth} className="todo-form" style={{ flexDirection: 'column', gap: '10px' }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password (min 4 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {authError && <p style={{ color: '#ff6b6b', margin: 0 }}>{authError}</p>}
          <button type="submit">{authMode === 'register' ? 'Register' : 'Login'}</button>
        </form>
        <p style={{ marginTop: '12px', textAlign: 'center' }}>
          {authMode === 'register' ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            onClick={() => { setAuthMode(authMode === 'register' ? 'login' : 'register'); setAuthError(''); }}
            style={{ background: 'none', border: 'none', color: '#4dabf7', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {authMode === 'register' ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="todo-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>To-Do List</h1>
        <div>
          <span style={{ marginRight: '10px' }}>Hi, {user.username}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <form onSubmit={addTodo} className="todo-form">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button type="submit">Add Task</button>
      </form>

      <ul className="todo-list">
        {todos.length === 0 ? (
          <li className="empty-state">No tasks available. Add one above!</li>
        ) : (
          todos.map((todo) => (
            <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              {editingId === todo.id ? (
                <>
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                  <button onClick={() => saveEdit(todo.id)}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo)} />
                  <span>{todo.title}</span>
                  <button onClick={() => { setEditingId(todo.id); setEditTitle(todo.title); }}>Edit</button>
                  <button onClick={() => deleteTodo(todo.id)}>Delete</button>
                </>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default App;
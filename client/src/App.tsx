import { useState, useEffect, type FormEvent } from 'react';
import Dashboard from './Dashboard';
import type { Todo, User, AuthResponse } from './types';
import './App.css';

const API: string = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'tasks' | 'dashboard'>('tasks');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetch(`${API}/me`, { credentials: 'include' })
      .then((r) => (r.ok ? (r.json() as Promise<User>) : null))
      .then((data) => {
        if (data) setUser(data);
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    fetch(`${API}/todos`, { credentials: 'include' })
      .then((r) => r.json() as Promise<Todo[]>)
      .then((data) => {
        if (Array.isArray(data)) setTodos(data);
      })
      .finally(() => setIsLoading(false));
  }, [user]);

  const handleAuth = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const res = await fetch(`${API}/${authMode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
    const data: AuthResponse = await res.json();
    if (!res.ok) return setError(data.error || 'Auth failed');
    setUser({ id: data.id, username: data.username });
    setUsername('');
    setPassword('');
  };

  const handleLogout = async () => {
    await fetch(`${API}/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
    setTodos([]);
  };

  const addTodo = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const res = await fetch(`${API}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title: newTitle }),
    });
    if (res.ok) {
      const created: Todo = await res.json();
      setTodos([...todos, created]);
      setNewTitle('');
    }
  };

  const toggleTodo = async (todo: Todo) => {
    const res = await fetch(`${API}/todos/${todo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ completed: !todo.completed }),
    });
    if (res.ok) {
      const updated: Todo = await res.json();
      setTodos(todos.map((t) => (t.id === todo.id ? updated : t)));
    }
  };

  const deleteTodo = async (id: number) => {
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
        <form onSubmit={handleAuth} className="todo-form">
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{authMode === 'register' ? 'Register' : 'Login'}</button>
        </form>
        {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
        <button
          type="button"
          onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
        >
          {authMode === 'register' ? 'Switch to Login' : 'Switch to Register'}
        </button>
      </div>
    );
  }

  return (
    <div className="todo-container" style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>To-Do App</h1>
        <button onClick={handleLogout}>Logout ({user.username})</button>
      </div>

      <div className="nav-tabs">
        <button onClick={() => setView('tasks')}>Tasks</button>
        <button onClick={() => setView('dashboard')}>Statistics Dashboard</button>
      </div>

      {view === 'dashboard' ? (
        <Dashboard username={user.username} />
      ) : (
        <>
          <form onSubmit={addTodo} className="todo-form">
            <input
              placeholder="What needs to be done?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <button type="submit">Add Task</button>
          </form>
          {isLoading ? (
            <p>Loading tasks...</p>
          ) : (
            <ul className="todo-list">
              {todos.length === 0 ? (
                <li className="empty-state">No tasks available. Add one above!</li>
              ) : (
                todos.map((todo) => (
                  <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                    <input
                      type="checkbox"
                      checked={Boolean(todo.completed)}
                      onChange={() => toggleTodo(todo)}
                    />
                    <span>{todo.title}</span>
                    <button onClick={() => deleteTodo(todo.id)}>Delete</button>
                  </li>
                ))
              )}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default App;
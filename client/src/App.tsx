import { useState, useEffect, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Dashboard from './Dashboard';
import { fetchCurrentUser, loginUser, logoutUser, clearUserError } from './store/userSlice';
import {
  fetchTodos,
  addTodo as addTodoThunk,
  toggleTodo as toggleTodoThunk,
  deleteTodo as deleteTodoThunk,
  clearTodos,
} from './store/todosSlice';
import { setFilter } from './store/uiSlice';
import type { Todo, AuthResponse } from './types';
import './App.css';

const API: string = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const dispatch = useDispatch<any>();

  // Global state from Redux store
  const { currentUser: user, error: authError } = useSelector((state: any) => state.user);
  const { items: todos, loading: isLoading } = useSelector((state: any) => state.todos);
  const { filter } = useSelector((state: any) => state.ui);

  // Local form & navigation state
  const [view, setView] = useState<'tasks' | 'dashboard'>('tasks');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [localError, setLocalError] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');

  // Sync session with backend on initial load
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // Fetch todos whenever a user logs in; clear on logout
  useEffect(() => {
    if (user) {
      dispatch(fetchTodos());
    } else {
      dispatch(clearTodos());
    }
  }, [user, dispatch]);

  const handleAuth = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError('');
    dispatch(clearUserError());

    if (authMode === 'login') {
      const result = await dispatch(loginUser({ username, password }));
      if (loginUser.fulfilled.match(result)) {
        setUsername('');
        setPassword('');
      }
    } else {
      const res = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const data: AuthResponse = await res.json();
      if (!res.ok) return setLocalError(data.error || 'Registration failed');
      await dispatch(fetchCurrentUser());
      setUsername('');
      setPassword('');
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(clearTodos());
  };

  const handleAddTodo = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const result = await dispatch(addTodoThunk(newTitle));
    if (addTodoThunk.fulfilled.match(result)) {
      setNewTitle('');
    }
  };

  const handleToggleTodo = (todo: Todo) => {
    dispatch(toggleTodoThunk(todo));
  };

  const handleDeleteTodo = (id: number) => {
    dispatch(deleteTodoThunk(id));
  };

  const filteredTodos = (todos as Todo[]).filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return Boolean(todo.completed);
    return true;
  });

  const displayedError = localError || authError;

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
        {displayedError && <p style={{ color: '#ff6b6b' }}>{displayedError}</p>}
        <button
          type="button"
          onClick={() => {
            setLocalError('');
            dispatch(clearUserError());
            setAuthMode(authMode === 'register' ? 'login' : 'register');
          }}
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
          <form onSubmit={handleAddTodo} className="todo-form">
            <input
              placeholder="What needs to be done?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <button type="submit">Add Task</button>
          </form>

          <div className="nav-tabs" style={{ marginBottom: '1rem' }}>
            <button type="button" onClick={() => dispatch(setFilter('all'))}>
              All
            </button>
            <button type="button" onClick={() => dispatch(setFilter('active'))}>
              Active
            </button>
            <button type="button" onClick={() => dispatch(setFilter('completed'))}>
              Completed
            </button>
          </div>

          {isLoading ? (
            <p>Loading tasks...</p>
          ) : (
            <ul className="todo-list">
              {filteredTodos.length === 0 ? (
                <li className="empty-state">No tasks available. Add one above!</li>
              ) : (
                filteredTodos.map((todo) => (
                  <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                    <input
                      type="checkbox"
                      checked={Boolean(todo.completed)}
                      onChange={() => handleToggleTodo(todo)}
                    />
                    <span>{todo.title}</span>
                    <button onClick={() => handleDeleteTodo(todo.id)}>Delete</button>
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
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Todo } from '../types';

const API_URL: string = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

interface TodosState {
  items: Todo[];
  loading: boolean;
  error: string | null;
}

const initialState: TodosState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchTodos = createAsyncThunk<Todo[], void, { rejectValue: string }>(
  'todos/fetchTodos',
  async (_, thunkAPI) => {
    const res = await fetch(`${API_URL}/todos`, { credentials: 'include' });
    const data = await res.json();
    if (!res.ok) return thunkAPI.rejectWithValue(data.error || 'Failed to load todos');
    return data;
  }
);

export const addTodo = createAsyncThunk<Todo, string, { rejectValue: string }>(
  'todos/addTodo',
  async (title, thunkAPI) => {
    const res = await fetch(`${API_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title }),
    });
    const data = await res.json();
    if (!res.ok) return thunkAPI.rejectWithValue(data.error || 'Failed to create todo');
    return data;
  }
);

export const toggleTodo = createAsyncThunk<Todo, Todo, { rejectValue: string }>(
  'todos/toggleTodo',
  async (todo, thunkAPI) => {
    const res = await fetch(`${API_URL}/todos/${todo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ completed: !todo.completed }),
    });
    const data = await res.json();
    if (!res.ok) return thunkAPI.rejectWithValue(data.error || 'Failed to update todo');
    return data;
  }
);

export const deleteTodo = createAsyncThunk<number, number, { rejectValue: string }>(
  'todos/deleteTodo',
  async (id, thunkAPI) => {
    const res = await fetch(`${API_URL}/todos/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) return thunkAPI.rejectWithValue('Failed to delete todo');
    return id;
  }
);

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    clearTodos(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load todos';
      })
      .addCase(addTodo.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(toggleTodo.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteTodo.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      });
  },
});

export const { clearTodos } = todosSlice.actions;
export default todosSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../config';
import type { Todo } from '../types';

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
    try {
      const res = await fetch(`${API_URL}/todos`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) return thunkAPI.rejectWithValue(data.error || 'Failed to load todos');
      return data;
    } catch {
      return thunkAPI.rejectWithValue('Network error while fetching todos');
    }
  }
);

export const addTodo = createAsyncThunk<Todo, string, { rejectValue: string }>(
  'todos/addTodo',
  async (title, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!res.ok) return thunkAPI.rejectWithValue(data.error || 'Failed to create todo');
      return data;
    } catch {
      return thunkAPI.rejectWithValue('Network error while creating todo');
    }
  }
);

export const toggleTodo = createAsyncThunk<Todo, Todo, { rejectValue: string }>(
  'todos/toggleTodo',
  async (todo, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/todos/${todo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ completed: !todo.completed }),
      });
      const data = await res.json();
      if (!res.ok) return thunkAPI.rejectWithValue(data.error || 'Failed to update todo');
      return data;
    } catch {
      return thunkAPI.rejectWithValue('Network error while updating todo');
    }
  }
);

export const deleteTodo = createAsyncThunk<number, number, { rejectValue: string }>(
  'todos/deleteTodo',
  async (id, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) return thunkAPI.rejectWithValue('Failed to delete todo');
      return id;
    } catch {
      return thunkAPI.rejectWithValue('Network error while deleting todo');
    }
  }
);

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    clearTodos(state) {
      state.items = [];
      state.error = null;
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
        state.error = null;
        state.items.push(action.payload);
      })
      .addCase(toggleTodo.fulfilled, (state, action) => {
        state.error = null;
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
      })
      .addCase(deleteTodo.fulfilled, (state, action) => {
        state.error = null;
        state.items = state.items.filter((t) => t.id !== action.payload);
      });
  },
});

export const { clearTodos } = todosSlice.actions;
export default todosSlice.reducer;
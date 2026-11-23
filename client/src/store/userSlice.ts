import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../types';

const API_URL: string = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

interface UserState {
  currentUser: User | null;
  authToken: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  authToken: null,
  status: 'idle',
  error: null,
};

export const fetchCurrentUser = createAsyncThunk<User, void, { rejectValue: string }>(
  'user/fetchCurrentUser',
  async (_, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/me`, { credentials: 'include' });
      if (!res.ok) return thunkAPI.rejectWithValue('Not authenticated');
      return res.json();
    } catch {
      return thunkAPI.rejectWithValue('Network error checking session');
    }
  }
);

export const registerUser = createAsyncThunk<
  User & { token?: string },
  { username: string; password: string },
  { rejectValue: string }
>('user/registerUser', async (credentials, thunkAPI) => {
  try {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) return thunkAPI.rejectWithValue(data.error || 'Registration failed');
    return data;
  } catch {
    return thunkAPI.rejectWithValue('Network error during registration');
  }
});

export const loginUser = createAsyncThunk<
  User & { token?: string },
  { username: string; password: string },
  { rejectValue: string }
>('user/loginUser', async (credentials, thunkAPI) => {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) return thunkAPI.rejectWithValue(data.error || 'Login failed');
    return data;
  } catch {
    return thunkAPI.rejectWithValue('Network error during login');
  }
});

export const logoutUser = createAsyncThunk<void, void>('user/logoutUser', async () => {
  await fetch(`${API_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuthToken(state, action: PayloadAction<string | null>) {
      state.authToken = action.payload;
    },
    clearUserError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.currentUser = null;
        state.status = 'idle';
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.currentUser = { id: action.payload.id, username: action.payload.username };
        if (action.payload.token) {
          state.authToken = action.payload.token;
        }
        state.status = 'succeeded';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Registration failed';
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.currentUser = { id: action.payload.id, username: action.payload.username };
        if (action.payload.token) {
          state.authToken = action.payload.token;
        }
        state.status = 'succeeded';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Login failed';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.currentUser = null;
        state.authToken = null;
        state.status = 'idle';
      });
  },
});

export const { setAuthToken, clearUserError } = userSlice.actions;
export default userSlice.reducer;
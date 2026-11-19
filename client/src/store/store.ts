import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import todosReducer from './todosSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    todos: todosReducer,
    ui: uiReducer,
  },
});
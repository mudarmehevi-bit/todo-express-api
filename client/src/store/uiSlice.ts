import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    filter: 'all',
    isSubmitting: false,
    toastMessage: null,
  },
  reducers: {
    setFilter(state, action) {
      state.filter = action.payload;
    },
    setSubmitting(state, action) {
      state.isSubmitting = action.payload;
    },
    setToastMessage(state, action) {
      state.toastMessage = action.payload;
    },
    clearToastMessage(state) {
      state.toastMessage = null;
    },
  },
});

export const { setFilter, setSubmitting, setToastMessage, clearToastMessage } = uiSlice.actions;
export default uiSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/axios';

const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

export const login = createAsyncThunk('auth/login', async (payload) => {
  const res = await API.post('/auth/login', payload);
  return res.data;
});

export const register = createAsyncThunk('auth/register', async (payload) => {
  const res = await API.post('/auth/register', payload);
  return res.data;
});

const slice = createSlice({
  name: 'auth',
  initialState: {
    token: token || null,
    user: user ? JSON.parse(user) : null,
    status: 'idle'
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(register.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      });
  }
});

export const { logout } = slice.actions;
export default slice.reducer;

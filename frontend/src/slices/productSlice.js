import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/axios';

export const fetchProducts = createAsyncThunk('products/fetch', async (params = {}) => {
  const res = await API.get('/products', { params });
  return res.data;
});

export const createProduct = createAsyncThunk('products/create', async (payload) => {
  const res = await API.post('/products', payload);
  return res.data;
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, data }) => {
  const res = await API.put(`/products/${id}`, data);
  return res.data;
});

export const deleteProduct = createAsyncThunk('products/delete', async (id) => {
  await API.delete(`/products/${id}`);
  return id;
});

const slice = createSlice({
  name: 'products',
  initialState: { list: [], page: 1, total: 0, totalPages: 1, status: 'idle' },
  reducers: {
    setPage: (state, action) => { state.page = action.payload; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        const payload = action.payload.items ? action.payload : { items: action.payload, page: 1, total: action.payload.length, totalPages: 1 };
        state.list = payload.items;
        state.page = payload.page;
        state.total = payload.total;
        state.totalPages = payload.totalPages;
        state.status = 'succeeded';
      })
      .addCase(fetchProducts.rejected, (state) => { state.status = 'failed'; })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const idx = state.list.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.list = state.list.filter(p => p.id !== action.payload);
      });
  }
});

export const { setPage } = slice.actions;
export default slice.reducer;

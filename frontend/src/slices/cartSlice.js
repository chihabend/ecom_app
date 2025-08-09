import { createSlice } from '@reduxjs/toolkit';

const initial = {
  items: JSON.parse(localStorage.getItem('cart') || '[]')
};

const slice = createSlice({
  name: 'cart',
  initialState: initial,
  reducers: {
    addItem: (state, action) => {
      const it = state.items.find(i => i.productId === action.payload.productId);
      if (it) it.quantity += action.payload.quantity;
      else state.items.push(action.payload);
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(i => i.productId !== action.payload);
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    updateQty: (state, action) => {
      const it = state.items.find(i => i.productId === action.payload.productId);
      if (it) it.quantity = action.payload.quantity;
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cart');
    }
  }
});

export const { addItem, removeItem, updateQty, clearCart } = slice.actions;
export default slice.reducer;

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ProductDetails from './pages/ProductDetails';

export default function App(){
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/cart" element={<CartPage/>} />
        <Route path="/product/:productId" element={<ProductDetails/>} />
        <Route path="/checkout" element={
          <ProtectedRoute><Checkout/></ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute><Orders/></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}><AdminDashboard/></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
